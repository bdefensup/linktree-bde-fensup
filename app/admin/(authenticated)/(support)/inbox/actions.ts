"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function replyToEmail(
  originalMessageId: string,
  message: string,
  subject: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const originalEmail = await prisma.inboxMessage.findUnique({
    where: { id: originalMessageId },
  });

  if (!originalEmail) {
    throw new Error("Message not found");
  }

  const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;
  
  // Extract email from "Name <email@domain.com>" or just "email@domain.com"
  const fromMatch = originalEmail.from.match(/<(.+)>/);
  const replyToEmail = fromMatch ? fromMatch[1] : originalEmail.from;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "BDE FENELON <contact@bdefenelon.fr>",
      to: replyToEmail,
      subject: replySubject,
      html: message, // We assume message is HTML or plain text wrapped in HTML
      headers: originalEmail.messageId ? {
        "In-Reply-To": originalEmail.messageId,
        "References": originalEmail.messageId, // Simple threading
      } : undefined,
    });

    if (error) {
      console.error("Error sending reply:", error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to reply:", err);
    throw err;
  }
}
