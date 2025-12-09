import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Webhook } from "svix";
import { Resend } from "resend";
import { uploadFile } from "@/lib/upload-file";

// Resend Webhook Event Types
type ResendEvent = {
  type: "email.sent" | "email.delivered" | "email.bounced" | "email.complained" | "email.opened" | "email.clicked" | "email.delivery_delayed" | "email.received";
  created_at: string;
  data: {
    created_at: string;
    email_id: string;
    message_id?: string; // RFC Message-ID
    from: string;
    to: string[];
    subject: string;
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
    attachments?: any[]; // For email.received
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
    const payload = await req.json();
    const body = JSON.stringify(payload);

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
                to: evt.data.to,
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
                    <p><strong>À:</strong> ${evt.data.to.join(", ")}</p>
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
    
    // For other events, we look for campaignId
    const campaignIdTag = evt.data.tags?.find(t => t.name === "campaignId");
    
    if (!campaignIdTag) {
      // Event not related to a campaign we track via tags
      return NextResponse.json({ message: "Ignored (no campaignId)" }, { status: 200 });
    }

    const campaignId = campaignIdTag.value;
    const emailId = evt.data.email_id;
    const recipient = evt.data.to[0]; 

    // 1. Log the event
    await prisma.emailLog.create({
      data: {
        campaignId,
        emailId,
        recipient,
        eventType: evt.type,
        status: evt.type.replace("email.", ""),
        ipAddress: evt.data.click?.ipAddress,
        userAgent: evt.data.click?.userAgent,
        linkClicked: evt.data.click?.link,
        bounceType: evt.data.bounce?.type,
        bounceSubType: evt.data.bounce?.subType,
        bounceMessage: evt.data.bounce?.message,
        createdAt: new Date(evt.created_at),
      },
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
    }

    if (Object.keys(updateData).length > 0) {
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
