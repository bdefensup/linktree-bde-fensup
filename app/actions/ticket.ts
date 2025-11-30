"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ConversationParticipant } from "@prisma/client";

export async function createTicket(subject: string, name: string) {
  if (!subject || !name) {
    throw new Error("Subject and name are required");
  }

  // Create a Guest User
  // We use a random email for the guest user since it's required by the schema
  // In a real app, we might want to ask for an email or make it optional in schema
  const guestEmail = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}@ticket.local`;

  const guestUser = await prisma.user.create({
    data: {
      email: guestEmail,
      name: name,
      role: "GUEST",
      emailVerified: true, // Auto-verify guest
    },
  });

  // 2. Create conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: {
          userId: guestUser.id,
        },
      },
      ticket: {
        create: {
          subject,
          guestName: name,
          status: "OPEN",
        },
      },
    },
    include: {
      ticket: true,
    },
  });

  return {
    success: true,
    ticketId: conversation.ticket?.id,
    conversationId: conversation.id,
    guestId: guestUser.id,
  };
}

export async function sendGuestMessage(conversationId: string, guestId: string, content: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: true,
      ticket: true,
    },
  });

  if (!conversation || !conversation.ticket) {
    return { success: false, error: "Conversation not found" };
  }

  if (conversation.ticket.status !== "OPEN") {
    return { success: false, error: "Ticket is closed" };
  }
  // Verify guest is participant
  const isParticipant = conversation.participants.some(
    (p: ConversationParticipant) => p.userId === guestId
  );
  if (!isParticipant) throw new Error("Unauthorized");

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: guestId,
      content,
    },
    include: {
      sender: true,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  return message;
}

export async function getTicketMessages(conversationId: string, guestId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: true, ticket: true },
  });

  if (!conversation) throw new Error("Conversation not found");

  // Verify guest is participant
  const isParticipant = conversation.participants.some(
    (p: ConversationParticipant) => p.userId === guestId
  );
  if (!isParticipant) throw new Error("Unauthorized");

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });

  return {
    messages,
    ticketStatus: conversation.ticket?.status || null,
  };
}

export async function toggleTicketStatus(conversationId: string, newStatus: "OPEN" | "RESOLVED") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify user has permission (admin/staff)
  // TODO: Add proper role check

  await prisma.ticket.update({
    where: { conversationId: conversationId },
    data: {
      status: newStatus,
    },
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/tickets/${conversationId}`);
  return { success: true };
}

export async function deleteTickets(conversationIds: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify user has permission (admin/staff)
  // TODO: Add proper role check if needed

  try {
    await prisma.conversation.deleteMany({
      where: {
        id: {
          in: conversationIds,
        },
      },
    });

    revalidatePath("/admin/tickets");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete tickets:", error);
    return { success: false, error: "Failed to delete tickets" };
  }
}
