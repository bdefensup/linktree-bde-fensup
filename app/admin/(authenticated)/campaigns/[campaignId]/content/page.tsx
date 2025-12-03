import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CampaignContentEditor } from "./client-wrapper";

interface PageProps {
  params: Promise<{ campaignId: string }>;
}

export default async function CampaignContentPage({ params }: PageProps) {
  const { campaignId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/admin/login");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || campaign.userId !== session.user.id) {
    notFound();
  }

  const templates = await prisma.emailTemplate.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      content: true,
    },
  });

  return <CampaignContentEditor campaign={campaign} templates={templates} />;
}
