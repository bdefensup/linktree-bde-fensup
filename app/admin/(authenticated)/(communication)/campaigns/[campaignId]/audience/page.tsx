import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CampaignAudienceEditor } from "./client-wrapper";

interface PageProps {
  params: Promise<{ campaignId: string }>;
}

export default async function CampaignAudiencePage({ params }: PageProps) {
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

  const segments = await prisma.segment.findMany({
    orderBy: { name: "asc" },
  });

  return <CampaignAudienceEditor campaign={campaign} segments={segments} />;
}
