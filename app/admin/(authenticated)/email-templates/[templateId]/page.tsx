import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ClientTemplateEditorWrapper } from "./client-wrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const template = await prisma.emailTemplate.findUnique({
    where: { id },
  });

  if (!template || template.userId !== session.user.id) {
    notFound();
  }

  return <ClientTemplateEditorWrapper template={template} />;
}
