"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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
