import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CampaignSendPage } from "./client-wrapper";
import { getCampaignAudience } from "../../actions";

interface PageProps {
  params: Promise<{ campaignId: string }>;
}

export default async function CampaignSendRoute({ params }: PageProps) {
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

  // Calculate dynamic audience if segment is used
  const recipients = await getCampaignAudience(campaignId);
  
  // Create a campaign object with the calculated recipients for the UI
  const campaignWithAudience = {
    ...campaign,
    recipients: recipients,
  };

  return <CampaignSendPage campaign={campaignWithAudience} />;
}
