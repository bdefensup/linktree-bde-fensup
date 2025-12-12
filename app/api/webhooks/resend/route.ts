import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Webhook } from "svix";
import { Resend } from "resend";
import { uploadFile } from "@/lib/upload-file";

// Resend Webhook Event Types
type ResendEvent = {
  type: 
    | "email.sent" 
    | "email.delivered" 
    | "email.bounced" 
    | "email.complained" 
    | "email.opened" 
    | "email.clicked" 
    | "email.delivery_delayed" 
    | "email.received"
    | "email.failed"
    | "contact.created"
    | "contact.updated"
    | "contact.deleted"
    | "domain.created"
    | "domain.updated"
    | "domain.deleted";
  created_at: string;
  data: {
    created_at: string;
    email_id?: string; // Optional for contact/domain events
    message_id?: string; // RFC Message-ID
    from?: string;
    to?: string[];
    subject?: string;
    tags?: { name: string; value: string }[];
    
    // Specific fields depending on event
    click?: {
        link: string;
        ipAddress: string;
        userAgent: string;
    };
    bounce?: {
        message: string;
        subType: string;
        type: string;
    };
    failed?: {
        reason: string;
    };
    attachments?: any[]; // For email.received
    
    // Contact/Domain events have different data structures, but we might not process them deeply here yet
    id?: string; // For contact/domain
    name?: string; // For domain
    status?: string; // For domain
  };
};

export async function POST(req: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("Missing RESEND_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Get headers
    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: "Error occured -- no svix headers" }, { status: 400 });
    }

    // Get the body
    // Get the raw body - essential for signature verification
    const body = await req.text();

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: ResendEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as ResendEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return NextResponse.json({ error: "Error occured" }, { status: 400 });
    }

    // Handle "email.received" separately
    if (evt.type === "email.received") {
        try {
          // Ensure email_id exists for email events
          if (!evt.data.email_id) throw new Error("No email_id in email.received event");

          const resend = new Resend(process.env.RESEND_API_KEY);
          const { data: emailData, error: emailError } = await (resend as any).emails.receiving.get(evt.data.email_id);

          if (emailError) {
            console.error("Error fetching received email content:", emailError);
            // We still return 200 to acknowledge the webhook, otherwise Resend retries
            return NextResponse.json({ success: true }, { status: 200 });
          }

          // Fetch attachments list
          const { data: attachmentsList, error: attachmentsError } = await (resend as any).attachments.receiving.list({
            emailId: evt.data.email_id,
          });

          if (attachmentsError) {
             console.error("Error fetching attachments list:", attachmentsError);
          }

          const processedAttachments = [];
          const forwardAttachments = [];

          if (attachmentsList && attachmentsList.length > 0) {
            for (const attachment of attachmentsList) {
              try {
                const response = await fetch(attachment.download_url);
                if (!response.ok) {
                  console.error(`Failed to download ${attachment.filename}`);
                  continue;
                }
                const buffer = await response.arrayBuffer();
                
                // Upload to Supabase
                // We use a folder structure: inbox/{email_id}/{filename}
                const filePath = `inbox/${evt.data.email_id}/${attachment.filename}`;
                const publicUrl = await uploadFile(
                  buffer, 
                  filePath, 
                  "inbox-attachments", 
                  attachment.content_type
                );

                processedAttachments.push({
                  id: attachment.id,
                  filename: attachment.filename,
                  content_type: attachment.content_type,
                  size: attachment.size,
                  url: publicUrl,
                });

                // Prepare for forwarding
                forwardAttachments.push({
                  filename: attachment.filename,
                  content: Buffer.from(buffer),
                });

              } catch (attErr) {
                console.error(`Error processing attachment ${attachment.filename}:`, attErr);
              }
            }
          }

          if (emailData) {
            await (prisma as any).inboxMessage.create({
              data: {
                emailId: evt.data.email_id,
                messageId: evt.data.message_id,
                from: evt.data.from,
                to: evt.data.to || [],
                subject: evt.data.subject,
                text: emailData.text,
                html: emailData.html,
                receivedAt: new Date(evt.created_at),
                attachments: processedAttachments,
              },
            });

            // Forward Email
            const forwardTo = process.env.EMAIL_FORWARD_TO;
            if (forwardTo) {
              try {
                await (resend as any).emails.send({
                  from: process.env.EMAIL_FROM || "BDE FENELON <onboarding@resend.dev>",
                  to: forwardTo,
                  replyTo: evt.data.from,
                  subject: `Fwd: ${evt.data.subject}`,
                  html: `
                    <p><strong>De:</strong> ${evt.data.from}</p>
                    <p><strong>À:</strong> ${(evt.data.to || []).join(", ")}</p>
                    <p><strong>Sujet:</strong> ${evt.data.subject}</p>
                    <hr />
                    ${emailData.html || `<pre>${emailData.text}</pre>`}
                  `,
                  attachments: forwardAttachments,
                });
                console.log(`Email forwarded to ${forwardTo}`);
              } catch (fwdErr) {
                console.error("Error forwarding email:", fwdErr);
              }
            }
          }
        } catch (err) {
          console.error("Error processing received email:", err);
        }
        
        return NextResponse.json({ success: true }, { status: 200 });
    }

    // Ignore non-email events for now (Contact/Domain)
    if (evt.type.startsWith("contact.") || evt.type.startsWith("domain.")) {
        return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }
    
    // For other events, we look for campaignId
    // For other events, we look for campaignId
    const tags = evt.data.tags || [];
    const campaignIdTag = tags.find(t => t.name.toLowerCase() === "campaignid");
    const campaignId = campaignIdTag?.value;
    
    if (!campaignId) {
      console.warn("No campaignId tag found in webhook event", { type: evt.type, email_id: evt.data.email_id, tags: evt.data.tags });
    }
    
    const userIdTag = evt.data.tags?.find(t => t.name === "userId");
    let userId = userIdTag?.value;

    // If no userId tag, try to find it via campaign
    if (!userId && campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { userId: true },
      });
      if (campaign) {
        userId = campaign.userId;
      }
    }

    const emailId = evt.data.email_id;
    const recipient = evt.data.to?.[0] || "unknown"; 

    if (!emailId) {
        return NextResponse.json({ message: "Ignored (no email_id)" }, { status: 200 });
    }

    // 1. Log the event
    // Idempotency check: prevent duplicate logs
    const existingLog = await prisma.emailLog.findFirst({
      where: {
        emailId,
        eventType: evt.type,
        createdAt: new Date(evt.created_at),
      },
    });

    if (existingLog) {
      return NextResponse.json({ message: "Duplicate event ignored" }, { status: 200 });
    }

    await prisma.emailLog.create({
      data: {
        campaignId: campaignId || null,
        userId: userId || null,
        emailId,
        recipient,
        eventType: evt.type,
        status: evt.type.replace("email.", ""),
        ipAddress: evt.data.click?.ipAddress,
        userAgent: evt.data.click?.userAgent,
        linkClicked: evt.data.click?.link,
        bounceType: evt.data.bounce?.type,
        bounceSubType: evt.data.bounce?.subType,
        bounceMessage: evt.data.bounce?.message || evt.data.failed?.reason,
        createdAt: new Date(evt.created_at),
      } as any,
    });

    // 2. Update Campaign Counters
    const updateData: any = {};

    switch (evt.type) {
      case "email.sent":
        break;
      case "email.delivered":
        updateData.deliveredCount = { increment: 1 };
        break;
      case "email.bounced":
        updateData.bounceCount = { increment: 1 };
        break;
      case "email.complained":
        updateData.complaintCount = { increment: 1 };
        break;
      case "email.opened":
        updateData.openCount = { increment: 1 };
        break;
      case "email.clicked":
        updateData.clickCount = { increment: 1 };
        break;
      case "email.delivery_delayed":
        // We could log this or have a specific counter, but for now just logging the event is enough
        break;
      case "email.failed":
        // Treat failed as bounced for stats or just ignore if no specific counter
        updateData.bounceCount = { increment: 1 }; // Increment bounce count for failures too? Or maybe just log it.
        break;
    }

    if (campaignId && Object.keys(updateData).length > 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
