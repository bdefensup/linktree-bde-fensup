"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ConversationParticipant } from "@prisma/client";

import { Resend } from "resend";
import TicketConfirmationEmail from "@/components/emails/support/ticket-confirmation";

export async function createTicket(subject: string, name: string, email: string) {
  if (!subject || !name || !email) {
    throw new Error("Subject, name, and email are required");
  }

  // 1. Check if user exists or create Guest User
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email,
        name: name,
        role: "GUEST",
        emailVerified: false, // Email provided by user, not verified yet
      },
    });
  }

  // 2. Generate Ticket Reference
  // Format: TICKET-{RANDOM}-{DATE_TIME}
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  const dateStr = new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 12); // YYYYMMDDHHMM
  const reference = `TICKET-${random}-${dateStr}`;

  // 3. Create conversation and ticket
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: {
          userId: user.id,
        },
      },
      ticket: {
        create: {
          subject,
          guestName: name,
          guestEmail: email, // We might need to add this field to schema if we want to store it explicitly on ticket, but we have it on user.
          // Wait, previous step added guestEmail to Ticket type in columns but not schema?
          // Ah, schema has guestEmail field! I saw it in the file view earlier.
          // Let me double check schema view from step 3169.
          // Line 165: guestEmail String?
          // Yes, it exists.
          status: "OPEN",
          reference: reference,
        },
      },
    },
    include: {
      ticket: true,
    },
  });

  // 4. Send Confirmation Email
  const resend = new Resend(process.env.RESEND_API_KEY);
  if (process.env.RESEND_API_KEY) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.bdefenelon.org";
    const ticketLink = `${baseUrl}/?conversationId=${conversation.id}&guestId=${user.id}`;

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "BDE FENELON <onboarding@resend.dev>",
        to: email,
        subject: `Confirmation de votre ticket ${reference}`,
        react: TicketConfirmationEmail({
          name: name,
          subject: subject,
          reference: reference,
          ticketLink: ticketLink,
        }),
      });
    } catch (error) {
      console.error("Failed to send ticket confirmation email:", error);
      // Don't fail the request if email fails
    }
  }

  return {
    success: true,
    ticketId: conversation.ticket?.id,
    conversationId: conversation.id,
    guestId: user.id,
    reference: reference,
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
