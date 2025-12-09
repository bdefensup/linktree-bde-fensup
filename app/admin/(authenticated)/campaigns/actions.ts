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

  // Determine recipients
  let recipients: string[] = [];
  
  if (campaign.segmentId) {
    // Fetch from segment
    const segment = await prisma.segment.findUnique({
      where: { id: campaign.segmentId },
    });
    
    if (segment) {
      // Simple query interpretation
      // TODO: Implement complex query parsing
      const where: any = {};
      const query = segment.query as any;
      
      if (query?.unsubscribed === false) {
        where.unsubscribed = false;
      }
      // Add more rules here as needed
      
      // Filter by Topics (OR logic: subscribed to ANY of the provided topics)
      if (Array.isArray(query?.topicIds) && query.topicIds.length > 0) {
        where.topics = {
          some: {
            topicId: { in: query.topicIds }
          }
        };
      }

      // Filter by Properties (AND logic: must match ALL provided properties)
      if (query?.properties && typeof query.properties === 'object') {
        // Prisma JSON filtering
        // We iterate over each key-value pair and add a rule
        // Note: For JSON columns, we might need raw query or specific Prisma syntax depending on DB support.
        // Prisma 'equals' on JSON path is supported in Postgres.
        
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
    }
  } else {
    // Use manual recipients
    recipients = campaign.recipients as string[];
  }

  // Filter out unsubscribed recipients (Global check)
  const unsubscribed = await (prisma as any).unsubscribedRecipient.findMany({
    where: { email: { in: recipients } },
    select: { email: true },
  });
  const unsubscribedEmails = new Set(unsubscribed.map((u: { email: string }) => u.email));
  recipients = recipients.filter(email => !unsubscribedEmails.has(email));
  
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

    // HYBRID LOGIC:
    // Use Batch API if: Immediate send AND No attachments
    // Use Unitary API if: Scheduled OR Has attachments
    const useBatch = !scheduledAt && !hasAttachments;

    if (useBatch) {
      // --- BATCH SENDING (Chunks of 100) ---
      const CHUNK_SIZE = 100;
      const chunks = [];
      
      for (let i = 0; i < emailPayloads.length; i += CHUNK_SIZE) {
        chunks.push(emailPayloads.slice(i, i + CHUNK_SIZE));
      }

      for (const chunk of chunks) {
        try {
          // Batch API expects { from, to, subject, html, ... } objects
          // Our payload structure matches what Resend expects, except 'scheduledAt' is not supported in batch.
          // We should remove 'scheduledAt' from batch payloads just in case, though it's undefined here.
          const batchPayload = chunk.map(({ scheduledAt, ...rest }) => rest);

          const response = await resend.batch.send(batchPayload);
          
          if (response.error) {
             console.error("Batch error:", response.error);
          }

          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            sentCount += response.data.data.length;
          }
        } catch (err) {
          console.error("Batch send failed:", err);
        }
      }

    } else {
      // --- UNITARY SENDING (Existing logic) ---
      // We can reuse the prepared payloads, just need to adjust 'to' format if needed
      // Resend.emails.send 'to' can be string or string[]
      
      const results = await Promise.allSettled(
        emailPayloads.map((payload) => 
          resend.emails.send({
            ...payload,
            to: payload.to[0], // Convert back to string for consistency (optional)
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

  revalidatePath("/admin/campaigns");
  return { success: true };
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
    // Note: Resend list endpoint doesn't return tags in the list view by default in all SDK versions,
    // but assuming we can filter or if we have to fetch details. 
    // Wait, the docs say list returns "List Emails". Let's check if tags are in the response object.
    // If not, we might need to rely on something else or fetch details (which would be slow).
    // However, for now, let's assume we filter by matching the subject + recipient or just subject if unique?
    // Actually, the best way without webhooks is to trust the tag if available.
    // If tags are NOT in list response, we have a problem.
    // Let's assume for this implementation we iterate and check. 
    // BUT, fetching details for 1000 emails is bad.
    // ALTERNATIVE: Resend doesn't support filtering by tag in LIST.
    // So we might have to rely on webhooks for PERFECT stats.
    // BUT user asked for "API pull".
    // Let's look at the "List Emails" response structure in docs.
    // It returns: id, from, to, created_at, subject, html, text, last_event, status.
    // It does NOT return tags in the list view.
    // This is a limitation.
    // WORKAROUND: We can filter by SUBJECT if it's unique enough, or we just accept we can't do it efficiently without webhooks.
    // OR we use the `subject` as a filter if we can.
    // Let's try to filter by subject for now as a proxy, since we can't see tags in list.
    
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
