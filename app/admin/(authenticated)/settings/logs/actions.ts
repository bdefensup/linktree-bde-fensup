"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function syncEmailLogs() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  try {
    let syncedCount = 0;
    
    // Resend API currently limits to 100 emails and does not provide public cursor pagination in the SDK.
    // We fetch the maximum allowed (100).
    const response = await resend.emails.list({ limit: 100 });

    if (response.error) {
      throw new Error(response.error.message);
    }

    const emails = response.data?.data || [];

    for (const email of emails) {
      await prisma.emailLog.upsert({
        where: {
          emailId: email.id,
        } as any,
        create: {
          emailId: email.id,
          recipient: email.to[0],
          status: email.last_event || "sent",
          eventType: email.last_event || "sent",
          createdAt: new Date(email.created_at),
        } as any,
        update: {
          status: email.last_event || "sent",
          eventType: email.last_event || "sent",
        },
      });
      syncedCount++;
    }

    return { success: true, count: syncedCount };
  } catch (error) {
    console.error("Failed to sync email logs:", error);
    return { success: false, error: (error as Error).message };
  }
}
