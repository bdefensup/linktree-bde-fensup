"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { CampaignEmail } from "@/components/emails/campaigns/campaign-template";
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
    include: {
      segment: true,
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

export async function createCampaign(name: string, eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Create segment for the event
  const segment = await prisma.segment.create({
    data: {
      name: `Segment for ${name}`,
      query: {
        reservedEventId: eventId
      }
    }
  });

  const campaign = await prisma.campaign.create({
    data: {
      name,
      subject: "Nouvelle campagne",
      status: "DRAFT",
      userId: session.user.id,
      segmentId: segment.id
    },
  });

  revalidatePath("/admin/campaigns");
  return campaign;
}

export async function getEventsForCampaign() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      date: true,
    },
    orderBy: {
      date: "asc",
    },
  });
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

export async function archiveCampaign(id: string) {
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

  await prisma.campaign.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/admin/campaigns");
}

export async function bulkDeleteCampaigns(ids: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await prisma.campaign.deleteMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
    },
  });

  revalidatePath("/admin/campaigns");
}

export async function bulkArchiveCampaigns(ids: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await prisma.campaign.updateMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
    },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/admin/campaigns");
}


export async function getCampaignAudience(campaignId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || campaign.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  let recipients: string[] = [];
  
  if (campaign.segmentId) {
    const segment = await prisma.segment.findUnique({
      where: { id: campaign.segmentId },
    });
    
    if (segment) {
      const where: any = {};
      const query = segment.query as any;
      
      if (query?.unsubscribed === false) {
        where.unsubscribed = false;
      }
      
      if (Array.isArray(query?.topicIds) && query.topicIds.length > 0) {
        where.topics = {
          some: {
            topicId: { in: query.topicIds }
          }
        };
      }

      if (query?.properties && typeof query.properties === 'object') {
        const propertyFilters: any[] = [];
        Object.entries(query.properties).forEach(([key, value]) => {
          propertyFilters.push({
            properties: {
              path: [key],
              equals: value
            }
          });
        });

        if (propertyFilters.length > 0) {
          where.AND = propertyFilters;
        }
      }

      const contacts = await prisma.contact.findMany({
        where,
        select: { email: true },
      });
      recipients = contacts.map(c => c.email);

      if (query?.reservedEventId) {
        const bookings = await prisma.booking.findMany({
          where: {
            eventId: query.reservedEventId,
            status: "CONFIRMED",
          },
          select: { email: true },
        });
        
        const bookingEmails = bookings.map(b => b.email);
        recipients = Array.from(new Set([...recipients, ...bookingEmails]));
      }
    }
  } else {
    recipients = campaign.recipients as string[];
  }

  // Filter out unsubscribed recipients (Global check)
  const unsubscribed = await (prisma as any).unsubscribedRecipient.findMany({
    where: { email: { in: recipients } },
    select: { email: true },
  });
  const unsubscribedEmails = new Set(unsubscribed.map((u: { email: string }) => u.email));
  recipients = recipients.filter(email => !unsubscribedEmails.has(email));

  return recipients;
}

export async function sendCampaign(id: string, scheduledAt?: string) {
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

  // Validation: Cannot schedule if attachments are present
  const hasAttachments = Array.isArray((campaign as any).attachments) && ((campaign as any).attachments as any[]).length > 0;
  if (scheduledAt && hasAttachments) {
    throw new Error("Cannot schedule emails with attachments (Resend limitation)");
  }

  // Implement actual sending logic using Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || "BDE FENELON <onboarding@resend.dev>";

  // Ensure content is a string
  const contentString = typeof campaign.content === 'string' 
    ? campaign.content 
    : JSON.stringify(campaign.content);

  // Determine recipients using helper
  let recipients = await getCampaignAudience(id);

  
  // Fetch contact details for personalization
  const contacts = await prisma.contact.findMany({
    where: { email: { in: recipients } },
  });
  const contactMap = new Map(contacts.map(c => [c.email, c]));

  let sentCount = 0;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Helper function for variable substitution
  const replaceVariables = (text: string, contact: any, email: string) => {
    if (!text) return text;
    let result = text;
    
    // Standard fields
    result = result.replace(/{{\s*email\s*}}/g, email);
    result = result.replace(/{{\s*firstName\s*}}/g, contact?.firstName || "");
    result = result.replace(/{{\s*lastName\s*}}/g, contact?.lastName || "");
    
    // Custom properties
    if (contact?.properties && typeof contact.properties === 'object') {
      Object.entries(contact.properties).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*properties\\.${key}\\s*}}`, 'g');
        result = result.replace(regex, String(value || ""));
      });
    }
    
    return result;
  };

  if (recipients.length > 0) {
    // Prepare email payloads (rendering per recipient for unique unsubscribe link AND personalization)
    
    const emailPayloads = await Promise.all(recipients.map(async (email) => {
      const contact = contactMap.get(email);
      const unsubscribeUrl = `${APP_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
      const unsubscribeHeaderUrl = `<${APP_URL}/api/unsubscribe?email=${encodeURIComponent(email)}>`;

      // Personalize content
      const personalizedSubject = replaceVariables(campaign.subject || "Sans objet", contact, email);
      const personalizedContent = replaceVariables(contentString, contact, email);

      const emailHtml = await render(
        React.createElement(CampaignEmail, {
          content: personalizedContent,
          subject: personalizedSubject,
          unsubscribeUrl,
        })
      );

      const emailText = await render(
        React.createElement(CampaignEmail, {
          content: personalizedContent,
          subject: personalizedSubject,
          unsubscribeUrl,
        }),
        { plainText: true }
      );

      return {
        from,
        to: [email], // Batch API expects array for 'to'
        subject: personalizedSubject,
        html: emailHtml,
        text: emailText,
        headers: {
          "List-Unsubscribe": unsubscribeHeaderUrl,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        tags: [{ name: "campaignId", value: campaign.id }],
        attachments: Array.isArray((campaign as any).attachments) 
          ? ((campaign as any).attachments as any[]).map(att => ({
              path: att.url,
              filename: att.name,
            }))
          : undefined,
        scheduledAt: scheduledAt,
      };
    }));

    // UNITARY SENDING (Optimized for reliability)
    // We send emails in parallel using Promise.allSettled to ensure one failure doesn't stop the rest.
    // For ~350 recipients, this is efficient enough and provides better error tracking.
    
    const results = await Promise.allSettled(
      emailPayloads.map((payload) => 
        resend.emails.send({
          ...payload,
          to: payload.to[0], // Convert back to string for consistency
        })
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled");
    sentCount = successful.length;

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error(`Failed to send ${failed.length} emails`, failed);
    }
  }

  await prisma.campaign.update({
    where: { id },
    data: {
      status: scheduledAt ? "SCHEDULED" : "SENT",
      sentAt: scheduledAt ? undefined : new Date(),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      sentCount: sentCount,
    } as any,
  });
}

export async function getCampaignStats(campaignId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { segment: true },
  });

  if (!campaign || campaign.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const query = campaign.segment?.query as any;
  const eventId = query?.reservedEventId;

  if (!eventId) {
    return {
      confirmed: 0,
      checkedIn: 0,
      checkedOut: 0,
      pending: 0,
      cancelled: 0,
      total: 0,
    };
  }

  const stats = await prisma.booking.groupBy({
    by: ['status'],
    where: {
      eventId: eventId,
    },
    _count: {
      _all: true,
    },
  });

  const result = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    checkedIn: 0,
    checkedOut: 0,
    total: 0,
  };

  stats.forEach((stat) => {
    if (stat.status === 'PENDING') result.pending = stat._count._all;
    if (stat.status === 'CONFIRMED') result.confirmed = stat._count._all;
    if (stat.status === 'CANCELLED') result.cancelled = stat._count._all;
    if (stat.status === 'CHECKED_IN') result.checkedIn = stat._count._all;
    if (stat.status === 'CHECKED_OUT') result.checkedOut = stat._count._all;
  });
  
  result.total = result.pending + result.confirmed + result.cancelled + result.checkedIn + result.checkedOut;

  return result;
}

export async function syncCampaignStats(campaignId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || campaign.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let hasMore = true;
  let cursor: string | undefined = undefined;
  
  let sentCount = 0;
  let openCount = 0;
  let clickCount = 0;

  // Fetch all emails (paginated)
  while (hasMore) {
    const response = await resend.emails.list({
      limit: 100,
      after: cursor,
    });

    if (response.error) {
      console.error("Resend API error:", response.error);
      break;
    }

    const emails = response.data?.data || [];
    
    // Filter emails for this campaign
    // Note: Resend list endpoint doesn't return tags in the list view, so we filter by subject as a proxy.
    // For perfect accuracy, webhooks are preferred, but this allows for a manual sync.
    
    for (const email of emails) {
      if (email.subject === campaign.subject) {
        sentCount++;
        // Check status/last_event
        // Resend "last_event" can be 'delivered', 'opened', 'clicked', 'bounced', 'complained'
        // But one email can be opened multiple times.
        // Here we just count unique emails that have *at least* reached that state?
        // Or we trust the `last_event`.
        // If last_event is 'opened' or 'clicked', it was opened.
        // If last_event is 'clicked', it was clicked (and implicitly opened).
        
        // Note: This is an approximation.
        if (['opened', 'clicked'].includes(email.last_event)) {
          openCount++;
        }
        if (email.last_event === 'clicked') {
          clickCount++;
        }
      }
    }

    if (response.data?.has_more) {
      cursor = emails[emails.length - 1].id;
    } else {
      hasMore = false;
    }
  }

  // Update campaign
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      sentCount,
      openCount,
      clickCount,
    },
  });

  revalidatePath(`/admin/campaigns/${campaignId}`);
  return { sentCount, openCount, clickCount };
}

export async function getCampaignEmailStats(campaignId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || campaign.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Fetch logs for the campaign
  const logs = await prisma.emailLog.findMany({
    where: {
      campaignId: campaignId,
    },
    select: {
      eventType: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group by date and eventType
  const groupedData: Record<string, Record<string, number>> = {};

  logs.forEach(log => {
    const date = log.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!groupedData[date]) {
      groupedData[date] = {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        complained: 0,
        failed: 0,
      };
    }
    
    // Map eventType to keys
    const type = log.eventType.toLowerCase();
    if (type === 'sent') groupedData[date].sent++;
    else if (type === 'delivered') groupedData[date].delivered++;
    else if (type === 'open' || type === 'opened') groupedData[date].opened++;
    else if (type === 'click' || type === 'clicked') groupedData[date].clicked++;
    else if (type === 'bounce' || type === 'bounced') groupedData[date].bounced++;
    else if (type === 'complaint' || type === 'complained') groupedData[date].complained++;
    else if (type === 'delivery_delayed' || type === 'failed') groupedData[date].failed++;
  });

  // Convert to array
  const chartData = Object.entries(groupedData).map(([date, counts]) => ({
    date,
    ...counts,
  })).sort((a, b) => a.date.localeCompare(b.date));

  return chartData;
}

export async function getGlobalEmailStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Calculate total unique emails (Sent)
  // We count unique emailIds to get the total volume of emails processed, 
  // regardless of their current status (sent, delivered, bounced, etc.)
  const uniqueEmails = await prisma.emailLog.groupBy({
    by: ['emailId'],
  });
  const sent = uniqueEmails.length;

  const [
    delivered,
    opened,
    clicked,
    bounced,
    failed,
    complained,
    totalCampaigns
  ] = await Promise.all([
    prisma.emailLog.count({ where: { status: "delivered" } }),
    prisma.emailLog.count({ where: { status: "opened" } }),
    prisma.emailLog.count({ where: { status: "clicked" } }),
    prisma.emailLog.count({ where: { status: "bounced" } }),
    prisma.emailLog.count({ where: { status: "failed" } }),
    prisma.emailLog.count({ where: { status: "complained" } }),
    prisma.campaign.count({ where: { userId: session.user.id } })
  ]);

  return {
    sent,
    delivered,
    opened,
    clicked,
    failed: bounced + failed,
    complained,
    totalCampaigns
  };
}

export async function getAdvancedStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // 1. Hype (Velocity) - Analyse de la dernière campagne envoyée
  const lastCampaign = await prisma.campaign.findFirst({
    where: { 
      status: "SENT", 
      sentAt: { not: null },
      userId: session.user.id
    },
    orderBy: { sentAt: "desc" },
    include: { bookings: true }
  });

  let velocity = 0;
  if (lastCampaign && lastCampaign.sentAt) {
    const sentAt = lastCampaign.sentAt;
    const oneHourLater = new Date(sentAt.getTime() + 60 * 60 * 1000);
    
    // Compter les réservations dans la première heure
    const firstHourBookings = lastCampaign.bookings.filter(b => 
      b.createdAt >= sentAt && b.createdAt <= oneHourLater
    ).length;
    
    // Vitesse moyenne en billets/minute sur la première heure (si > 0)
    velocity = firstHourBookings > 0 ? Math.round((firstHourBookings / 60) * 10) / 10 : 0;
  }

  // 2. Money (Revenue) - Revenu total généré par les campagnes
  const bookingsWithCampaign = await prisma.booking.findMany({
    where: { 
      sourceCampaignId: { not: null }, 
      status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } 
    },
    include: { event: true }
  });
  
  const totalRevenue = bookingsWithCampaign.reduce((acc, b) => acc + b.event.price, 0);

  // 3. Reach (Campus Domination) - Taux de pénétration
  const totalContacts = await prisma.contact.count();
  const activeContacts = await prisma.emailLog.findMany({
    where: { eventType: "open" },
    distinct: ["recipient"],
    select: { recipient: true }
  });
  
  // Si pas de contacts (début), on évite la division par zéro
  const reachRate = totalContacts > 0 ? Math.round((activeContacts.length / totalContacts) * 100) : 0;

  // 4. Quality (Engagement & Tech)
  const logs = await prisma.emailLog.findMany({
    where: { 
      eventType: { in: ["open", "click", "complaint", "sent"] },
      userId: session.user.id
    },
    select: { eventType: true, userAgent: true }
  });

  const openCount = logs.filter(l => l.eventType === "open").length;
  const clickCount = logs.filter(l => l.eventType === "click").length;
  const totalSent = logs.filter(l => l.eventType === "sent").length;

  // Score d'engagement pondéré (Ouverture = 1pt, Clic = 3pts) / Envoyés
  // Normalisé sur 100 (un score de 100 serait exceptionnel, ex: 50% open + 16% click)
  let rawScore = 0;
  if (totalSent > 0) {
    rawScore = ((openCount * 1) + (clickCount * 3)) / totalSent * 100;
  }
  // On plafonne à 100 ou on le laisse "A+" style
  const engagementScore = Math.min(Math.round(rawScore), 100);
  
  // Mobile Rate
  const mobileOpens = logs.filter(l => 
    l.eventType === "open" && 
    /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(l.userAgent || "")
  ).length;
  
  const mobileRate = openCount > 0 ? Math.round((mobileOpens / openCount) * 100) : 0;

  return {
    velocity, // Billets / min
    revenue: totalRevenue, // €
    reach: reachRate, // %
    engagement: engagementScore, // Score 0-100
    mobileRate, // %
    lastCampaignName: lastCampaign?.name || "Aucune campagne"
  };
}

export async function getStatisticsData(date?: Date, range?: 'week' | 'month' | '90days', reactivityCampaignId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // 1. Shotgun Velocity
  const velocityData = [];
  let viewType: 'intraday' | 'daily' = 'intraday';
  let currentPeriodLabel = "";

  // Helper pour trouver le meilleur jour de vente
  const findBestSalesDay = async () => {
    const bookings = await prisma.booking.findMany({
      where: { status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } },
      select: { createdAt: true }
    });

    if (bookings.length === 0) return new Date();

    const bookingsByDay = bookings.reduce((acc, booking) => {
      const day = booking.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bestDayIso = Object.keys(bookingsByDay).reduce((a, b) => bookingsByDay[a] > bookingsByDay[b] ? a : b);
    return new Date(bestDayIso);
  };

  let startRange: Date;
  let endRange: Date;

  if (range) {
    // Cas 3 : Range sélectionné (Semaine, Mois, 3 Mois)
    viewType = 'daily';
    endRange = new Date();
    endOfDay(endRange);
    startRange = new Date();
    startOfDay(startRange);

    if (range === 'week') {
      // Début de semaine (Lundi)
      const day = startRange.getDay();
      const diff = startRange.getDate() - day + (day === 0 ? -6 : 1); 
      startRange.setDate(diff);
      currentPeriodLabel = "Cette Semaine";
    } else if (range === 'month') {
      startRange.setDate(1);
      currentPeriodLabel = "Ce Mois";
    } else if (range === '90days') {
      startRange.setDate(startRange.getDate() - 90);
      currentPeriodLabel = "3 Derniers Mois";
    }
  } else if (date) {
    // Cas 1 : Jour spécifique sélectionné
    startRange = new Date(date);
    startOfDay(startRange);
    endRange = new Date(date);
    endOfDay(endRange);
    viewType = 'intraday';
    currentPeriodLabel = startRange.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } else {
    // Cas 2 : Défaut (Best Day)
    const bestDay = await findBestSalesDay();
    startRange = new Date(bestDay);
    startOfDay(startRange);
    endRange = new Date(bestDay);
    endOfDay(endRange);
    viewType = 'intraday';
    currentPeriodLabel = `Record : ${startRange.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }

  // Récupération des données selon le viewType
  if (viewType === 'intraday') {
    const dayBookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startRange, lte: endRange },
        status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Centrage intelligent
    let startTime;
    if (dayBookings.length > 0) {
      startTime = new Date(dayBookings[0].createdAt.getTime() - 30 * 60 * 1000);
    } else {
      startTime = new Date(startRange);
      startTime.setHours(17, 0, 0, 0);
    }

    for (let i = 0; i < 12; i++) {
      const start = new Date(startTime.getTime() + i * 15 * 60 * 1000);
      const end = new Date(startTime.getTime() + (i + 1) * 15 * 60 * 1000);
      const count = dayBookings.filter(b => b.createdAt >= start && b.createdAt < end).length;
      
      velocityData.push({
        time: start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        ventes: count
      });
    }
  } else {
    // ViewType === 'daily' (Pour les ranges)
    const rangeBookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startRange, lte: endRange },
        status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] }
      }
    });

    // Grouper par jour
    const bookingsByDay = rangeBookings.reduce((acc, booking) => {
      const day = booking.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Générer tous les jours de la range pour éviter les trous
    for (let d = new Date(startRange); d <= endRange; d.setDate(d.getDate() + 1)) {
      const dayLabel = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      velocityData.push({
        time: dayLabel,
        ventes: bookingsByDay[dayLabel] || 0
      });
    }
  }

  // Helper local pour reset les heures
  function startOfDay(d: Date) { d.setHours(0,0,0,0); }
  function endOfDay(d: Date) { d.setHours(23,59,59,999); }

  // 2. Conversion Funnel (Global)
  // Note: getGlobalEmailStats n'est pas exporté ou n'existe pas dans ce fichier, on va le calculer ici ou utiliser une autre méthode.
  // Pour l'instant on fait une requête directe.
  const emailLogs = await prisma.emailLog.groupBy({
    by: ['eventType'],
    _count: {
      eventType: true
    },
    where: {
      userId: session.user.id
    }
  });
  
  const sentCount = emailLogs.find(l => l.eventType === 'sent')?._count.eventType || 0;
  const openCount = emailLogs.find(l => l.eventType === 'open')?._count.eventType || 0;
  const clickCount = emailLogs.find(l => l.eventType === 'click')?._count.eventType || 0;

  const totalBookings = await prisma.booking.count({
    where: { sourceCampaignId: { not: null } }
  });

  let funnelData = [
    { 
      stage: "1. Mails Envoyés", 
      value: sentCount, 
      fill: "#52525b", // Zinc 600 (Base solide)
      label: "100%" 
    },
    { 
      stage: "2. Mails Ouverts", 
      value: openCount, 
      fill: "#3b82f6", // Blue 500 (Engagement)
      label: sentCount > 0 ? `${Math.round((openCount / sentCount) * 100)}%` : "0%" 
    },
    { 
      stage: "3. Visiteurs Billetterie", 
      value: clickCount, 
      fill: "#8b5cf6", // Violet 500 (Intention)
      label: sentCount > 0 ? `${Math.round((clickCount / sentCount) * 100)}%` : "0%" 
    },
    { 
      stage: "4. BILLETS ACHETÉS", 
      value: totalBookings, 
      fill: "#10b981", // Emerald 500 (Conversion / Cash)
      label: `🏆 ${totalBookings} Ventes` 
    },
  ];

  // Fallback Demo Data for Funnel if empty
  if (sentCount === 0 && openCount === 0 && clickCount === 0 && totalBookings === 0) {
    funnelData = [
      { stage: "1. Mails Envoyés", value: 250, fill: "#52525b", label: "100%" },
      { stage: "2. Mails Ouverts", value: 150, fill: "#3b82f6", label: "60%" },
      { stage: "3. Visiteurs Billetterie", value: 80, fill: "#8b5cf6", label: "32%" },
      { stage: "4. BILLETS ACHETÉS", value: 32, fill: "#10b981", label: "🏆 32 Ventes" },
    ];
  }

  // 3. Campus Radar (Simulé pour l'instant si pas de données Promo)
  const radarData = [
    { subject: "SIO 1", A: 85, fullMark: 100 },
    { subject: "SIO 2", A: 65, fullMark: 100 },
    { subject: "CIEL 1", A: 65, fullMark: 100 },
    { subject: "CIEL 2", A: 65, fullMark: 100 },
    { subject: "ATI 1", A: 45, fullMark: 100 },
    { subject: "ATI 2", A: 55, fullMark: 100 },
    { subject: "ESF 1", A: 30, fullMark: 100 },
    { subject: "ESF 2", A: 15, fullMark: 100 },
    { subject: "DE CSF 1", A: 15, fullMark: 100 },
  ];

  // 4. Sold Out Gauge (Prochain événement)
  const nextEvent = await prisma.event.findFirst({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: { bookings: true }
  });

  const soldOutData = nextEvent ? [
    {
      name: "Vendus",
      value: nextEvent.bookings.filter(b => b.status === "CONFIRMED" || b.status === "CHECKED_IN").length,
      fill: "#8884d8"
    },
    {
      name: "Restants",
      value: Math.max(0, nextEvent.maxSeats - nextEvent.bookings.length),
      fill: "#333"
    }
  ] : [];
  
  const capacity = nextEvent ? nextEvent.maxSeats : 100;
  const sold = nextEvent ? nextEvent.bookings.filter(b => b.status === "CONFIRMED" || b.status === "CHECKED_IN").length : 0;

  // 5. Revenue Growth (30 derniers jours)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const revenueBookings = await prisma.booking.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] }
    },
    include: { event: true },
    orderBy: { createdAt: "asc" }
  });

  // Aggréger par jour
  const revenueMap = new Map<string, number>();
  let cumulativeRevenue = 0;

  revenueBookings.forEach(booking => {
    const date = booking.createdAt.toISOString().split('T')[0];
    cumulativeRevenue += booking.event.price;
    revenueMap.set(date, cumulativeRevenue);
  });

  const revenueData = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
    date,
    revenue
  }));

  // Fallback Demo Data for Revenue if empty
  if (revenueData.length === 0) {
    let demoRevenue = 0;
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      // Simulation d'une croissance organique avec quelques pics
      const dailyGain = Math.floor(Math.random() * 300) + 50; 
      demoRevenue += dailyGain;
      revenueData.push({
        date: d.toISOString().split('T')[0],
        revenue: demoRevenue
      });
    }
  }

  // 6. KPI Cards Data (Global Stats with Trends)
  // Comparaison 30 derniers jours vs 30 jours précédents
  const now = new Date();
  const kpiThirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const kpiSixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Revenue Trend
  const currentRevenueBookings = await prisma.booking.findMany({
    where: {
      createdAt: { gte: kpiThirtyDaysAgo },
      status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] }
    },
    include: { event: true }
  });
  const previousRevenueBookings = await prisma.booking.findMany({
    where: {
      createdAt: { gte: kpiSixtyDaysAgo, lt: kpiThirtyDaysAgo },
      status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] }
    },
    include: { event: true }
  });

  const currentRevenue = currentRevenueBookings.reduce((acc, b) => acc + b.event.price, 0);
  const previousRevenue = previousRevenueBookings.reduce((acc, b) => acc + b.event.price, 0);
  const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  // Bookings Trend
  const currentBookingsCount = currentRevenueBookings.length;
  const previousBookingsCount = previousRevenueBookings.length;
  const bookingsGrowth = previousBookingsCount > 0 ? ((currentBookingsCount - previousBookingsCount) / previousBookingsCount) * 100 : 0;

  // Emails Sent Trend
  const currentSent = await prisma.emailLog.count({
    where: {
      createdAt: { gte: kpiThirtyDaysAgo },
      eventType: "sent",
      userId: session.user.id
    }
  });
  const previousSent = await prisma.emailLog.count({
    where: {
      createdAt: { gte: kpiSixtyDaysAgo, lt: kpiThirtyDaysAgo },
      eventType: "sent",
      userId: session.user.id
    }
  });
  const sentGrowth = previousSent > 0 ? ((currentSent - previousSent) / previousSent) * 100 : 0;

  // Active Campaigns (This month)
  const activeCampaignsCount = await prisma.campaign.count({
    where: {
      updatedAt: { gte: kpiThirtyDaysAgo },
      status: { not: "DRAFT" },
      userId: session.user.id
    }
  });

  const kpiData = {
    revenue: {
      value: currentRevenue,
      trend: Math.round(revenueGrowth * 10) / 10,
      positive: revenueGrowth >= 0
    },
    bookings: {
      value: currentBookingsCount,
      trend: Math.round(bookingsGrowth * 10) / 10,
      positive: bookingsGrowth >= 0
    },
    emailsSent: {
      value: currentSent,
      trend: Math.round(sentGrowth * 10) / 10,
      positive: sentGrowth >= 0
    },
    activeCampaigns: {
      value: activeCampaignsCount,
      label: "Campagnes actives (30j)"
    }
  };

  // 7. Reactivity Data (Pocket Buzz)
  // Nouvelle Logique : On se focalise sur une campagne précise (ou la dernière par défaut).
  // On ne dépend plus du filtre de date global pour ce graphique.

  // 1. Récupérer les dernières campagnes pour le sélecteur
  const recentCampaigns = await prisma.campaign.findMany({
    where: {
      status: "SENT",
      userId: session.user.id
    },
    select: { id: true, name: true, sentAt: true },
    orderBy: { sentAt: 'desc' },
    take: 20
  });

  // 2. Déterminer quelle campagne analyser
  // Soit celle demandée, soit la toute dernière envoyée
  let targetCampaignId = reactivityCampaignId;
  
  if (!targetCampaignId && recentCampaigns.length > 0) {
    targetCampaignId = recentCampaigns[0].id;
  }

  // 3. Récupérer les logs de cette campagne spécifique
  let reactivityLogs: any[] = [];
  
  if (targetCampaignId) {
    reactivityLogs = await prisma.emailLog.findMany({
      where: {
        eventType: "open",
        campaignId: targetCampaignId,
        userId: session.user.id
      },
      include: {
        campaign: {
          select: { sentAt: true }
        }
      }
    });
  }

  // 4. Calculer les buckets (0-15min, etc.)
  let reactivityData = [
    { range: "0-15 min", percentage: 0, fill: "#3b82f6" },
    { range: "15-30 min", percentage: 0, fill: "#60a5fa" },
    { range: "30-45 min", percentage: 0, fill: "#93c5fd" },
    { range: "45-60 min", percentage: 0, fill: "#bfdbfe" },
    { range: "Après 1h", percentage: 0, fill: "#374151" },
  ];

  if (reactivityLogs.length > 0) {
    const buckets = [0, 0, 0, 0, 0]; // 0-15, 15-30, 30-45, 45-60, >60

    reactivityLogs.forEach(log => {
      if (!log.campaign?.sentAt) return;
      
      const sentTime = new Date(log.campaign.sentAt).getTime();
      const openTime = new Date(log.createdAt).getTime();
      const diffMinutes = (openTime - sentTime) / (1000 * 60);

      if (diffMinutes < 0) return; // Should not happen but safety check

      if (diffMinutes <= 15) buckets[0]++;
      else if (diffMinutes <= 30) buckets[1]++;
      else if (diffMinutes <= 45) buckets[2]++;
      else if (diffMinutes <= 60) buckets[3]++;
      else buckets[4]++;
    });

    const totalOpens = reactivityLogs.length;
    reactivityData = [
      { range: "0-15 min", percentage: Math.round((buckets[0] / totalOpens) * 100), fill: "#3b82f6" },
      { range: "15-30 min", percentage: Math.round((buckets[1] / totalOpens) * 100), fill: "#60a5fa" },
      { range: "30-45 min", percentage: Math.round((buckets[2] / totalOpens) * 100), fill: "#93c5fd" },
      { range: "45-60 min", percentage: Math.round((buckets[3] / totalOpens) * 100), fill: "#bfdbfe" },
      { range: "Après 1h", percentage: Math.round((buckets[4] / totalOpens) * 100), fill: "#374151" },
    ];
  } else {
    // Fallback Demo Data if no logs (e.g. new account)
    // Simulation d'un "Pocket Buzz" classique
    reactivityData = [
      { range: "0-15 min", percentage: 28, fill: "#3b82f6" },
      { range: "15-30 min", percentage: 10, fill: "#60a5fa" },
      { range: "30-45 min", percentage: 14, fill: "#93c5fd" },
      { range: "45-60 min", percentage: 19, fill: "#bfdbfe" },
      { range: "Après 1h", percentage: 29, fill: "#374151" },
    ];
  }

  return {
    velocityData,
    periodLabel: currentPeriodLabel,
    funnelData,
    radarData,
    soldOutData: { data: soldOutData, sold: sold, capacity: capacity, eventName: nextEvent?.title || "Aucun événement" },
    revenueData,
    kpiData,
    reactivityData,
    campaignsInRange: recentCampaigns, // Liste pour le dropdown
    currentReactivityCampaignId: targetCampaignId, // Pour que le front sache ce qui est affiché par défaut
    costData: [
      { 
        channel: "Email Marketing", 
        cost: sentCount * 0.001, // Coût technique estimé (0.001€ / mail)
        fill: "#10b981", 
        label: "Email" 
      },
      {
        channel: "Instagram Ads", 
        cost: totalBookings * 1.45, // CPA estimé ~1.45€ (Visuel/Engagement élevé)
        fill: "#f43f5e", 
        label: "Insta" 
      },
      {
        channel: "Twitter Ads", 
        cost: totalBookings * 2.10, // CPA estimé ~2.10€ (Moins ciblé pour événements étudiants)
        fill: "#f43f5e", 
        label: "X" 
      },
      {
        channel: "LinkedIn Ads", 
        cost: totalBookings * 4.50, // CPA estimé ~4.50€ (Cible Pro / B2B très cher)
        fill: "#f43f5e", 
        label: "LinkedIn" 
      },
      {
        channel: "TikTok Ads", 
        cost: totalBookings * 0.85, // CPA estimé ~0.85€ (Portée virale / Jeune audience)
        fill: "#f43f5e", 
        label: "TikTok" 
      }
    ]
  };
}
