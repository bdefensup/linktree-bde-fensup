"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { CampaignEmail } from "@/components/email/campaign-template";
import * as React from "react";

// --- Folders ---

export async function getFolders() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await prisma.templateFolder.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      templates: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
      _count: {
        select: { templates: true },
      },
    },
  });
}

export async function createFolder(name: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const folder = await prisma.templateFolder.create({
    data: {
      name,
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/campaigns");
  return folder;
}

export async function updateFolder(id: string, name: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existing = await prisma.templateFolder.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const folder = await prisma.templateFolder.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/admin/campaigns");
  return folder;
}

export async function deleteFolder(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existing = await prisma.templateFolder.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.templateFolder.delete({
    where: { id },
  });

  revalidatePath("/admin/campaigns");
}

// --- Templates ---

export async function getTemplates(folderId?: string | null) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const where: Prisma.EmailTemplateWhereInput = {
    userId: session.user.id,
    deletedAt: null,
  };

  if (folderId) {
    where.folderId = folderId;
  }

  return await prisma.emailTemplate.findMany({
    where,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getDeletedTemplates() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await prisma.emailTemplate.findMany({
    where: {
      userId: session.user.id,
      deletedAt: { not: null },
    },
    orderBy: {
      deletedAt: "desc",
    },
  });
}

export async function createTemplate(name: string, folderId?: string | null) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const template = await prisma.emailTemplate.create({
    data: {
      name,
      subject: "Nouvel e-mail",
      content: {}, // Empty JSON content
      userId: session.user.id,
      folderId: folderId || null,
    },
  });

  revalidatePath("/admin/campaigns");
  return template;
}

export async function importTemplate(name: string, content: string, folderId?: string | null) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const template = await prisma.emailTemplate.create({
    data: {
      name,
      subject: name,
      content: content, // Store MD content directly or convert to JSON structure if needed
      userId: session.user.id,
      folderId: folderId || null,
    },
  });

  revalidatePath("/admin/campaigns");
  return template;
}

export async function updateTemplate(
  id: string,
  data: {
    name?: string;
    subject?: string;
    content?: Prisma.InputJsonValue;
    folderId?: string | null;
  }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existing = await prisma.emailTemplate.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const template = await prisma.emailTemplate.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/campaigns");
  return template;
}

export async function deleteTemplate(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existing = await prisma.emailTemplate.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.emailTemplate.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/admin/campaigns");
}

export async function restoreTemplate(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existing = await prisma.emailTemplate.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.emailTemplate.update({
    where: { id },
    data: { deletedAt: null },
  });

  revalidatePath("/admin/campaigns");
}

export async function permanentDeleteTemplate(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existing = await prisma.emailTemplate.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.emailTemplate.delete({
    where: { id },
  });

  revalidatePath("/admin/campaigns");
}

export async function moveTemplate(templateId: string, folderId: string | null) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existing = await prisma.emailTemplate.findUnique({
    where: { id: templateId },
  });

  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const template = await prisma.emailTemplate.update({
    where: { id: templateId },
    data: { folderId },
  });

  revalidatePath("/admin/campaigns");
  return template;
}

export async function sendEmail({
  subject,
  content,
  recipients,
}: {
  subject: string;
  content: string;
  recipients: string[];
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // TODO: Implement actual email sending logic (e.g., Resend, SendGrid, SMTP)
  console.log("Sending email:", { subject, recipients, contentLength: content.length });

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: true };
}

// --- Campaigns ---

export async function getCampaigns() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await prisma.campaign.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getCampaign(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaign || campaign.userId !== session.user.id) {
    return null;
  }

  return campaign;
}

export async function createCampaign(name: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      subject: "Nouvelle campagne",
      status: "DRAFT",
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/campaigns");
  return campaign;
}

export async function updateCampaign(id: string, data: Prisma.CampaignUpdateInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/campaigns");
  return campaign;
}

export async function deleteCampaign(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.campaign.delete({
    where: { id },
  });

  revalidatePath("/admin/campaigns");
}

export async function sendCampaign(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaign || campaign.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (campaign.status === "SENT") {
    throw new Error("Campaign already sent");
  }

  // Implement actual sending logic using Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || "BDE Fensup <onboarding@resend.dev>";

  // Ensure content is a string
  const contentString = typeof campaign.content === 'string' 
    ? campaign.content 
    : JSON.stringify(campaign.content);

  // Render the email template
  const emailHtml = await render(
    React.createElement(CampaignEmail, {
      content: contentString,
      subject: campaign.subject || "Sans objet",
    })
  );

  // Send emails (using Promise.all for now, consider batching for large lists)
  // Assuming campaign.recipients is string[]
  const recipients = campaign.recipients as string[];

  if (recipients.length > 0) {
    const results = await Promise.allSettled(
      recipients.map((email) =>
        resend.emails.send({
          from,
          to: email,
          subject: campaign.subject || "Sans objet",
          html: emailHtml,
        })
      )
    );

    // Log results or handle errors if needed
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error(`Failed to send ${failed.length} emails`, failed);
    }
  }

  await prisma.campaign.update({
    where: { id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      sentCount: recipients.length,
    },
  });

  revalidatePath("/admin/campaigns");
  return { success: true };
}
