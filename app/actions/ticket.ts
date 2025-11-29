"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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

  // Create Conversation
  const conversation = await prisma.conversation.create({
    data: {
      subject: subject,
      isTicket: true,
      ticketStatus: "OPEN",
      guestName: name,
      participants: {
        create: [{ userId: guestUser.id }],
      },
    },
  });

  // We don't add admins automatically to avoid notification spam
  // Admins will see the ticket in a "Unassigned" or "Tickets" list

  return {
    conversationId: conversation.id,
    guestId: guestUser.id,
  };
}

export async function sendGuestMessage(conversationId: string, guestId: string, content: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: true },
  });

  if (!conversation) throw new Error("Conversation not found");
  if (conversation.ticketStatus !== "OPEN") throw new Error("Ticket is closed");

  // Verify guest is participant
  const isParticipant = conversation.participants.some((p) => p.userId === guestId);
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
    include: { participants: true },
  });

  if (!conversation) throw new Error("Conversation not found");

  // Verify guest is participant
  const isParticipant = conversation.participants.some((p) => p.userId === guestId);
  if (!isParticipant) throw new Error("Unauthorized");

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });

  return {
    messages,
    ticketStatus: conversation.ticketStatus,
  };
}

export async function resolveTicket(conversationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  // Only admins/staff can resolve
  // Assuming any logged in user (who is not the guest) can resolve for now,
  // or check role if needed.

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { ticketStatus: "RESOLVED" },
  });

  revalidatePath("/admin/messages");
}
