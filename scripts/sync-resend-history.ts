
import "dotenv/config";
import { Resend } from "resend";
import { prisma } from "../lib/prisma";

async function main() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log("Starting sync from Resend...");

  try {
    const response = await resend.emails.list();
    // The structure seems to be response.data.data based on some SDK versions or response.data based on others.
    // Let's check what we got in the test script.
    // Test script output: "Full response: { "data": [ ... ] }"
    // Wait, let's look at the actual output from step 70.
    // It starts with `{ "data": [ ... ] }`.
    // So response.data IS the array.
    // Why did it say "Found undefined emails"?
    // Ah, maybe response IS the object `{ data: [...] }`?
    // If I did `const response = await resend.emails.list()`, response IS the object.
    // So `response.data` should be the array.
    
    // Let's try to be safer.
    const emails = Array.isArray(response.data) ? response.data : (response as any).data?.data || [];
    console.log(`Found ${emails.length} emails in Resend history.`);

    let newCount = 0;
    let skippedCount = 0;

    for (const email of emails) {
      // Check if we already have ANY log for this emailId
      const existingLog = await prisma.emailLog.findFirst({
        where: { emailId: email.id },
      });

      if (existingLog) {
        skippedCount++;
        continue;
      }

      // If not, create a log entry based on last_event
      // We'll create a "sent" event as a baseline if we have no info, 
      // but Resend gives us 'last_event'. 
      // If last_event is 'delivered', we can log that.
      // Ideally we'd want multiple logs (sent, delivered, etc) but we can't reconstruct exact times for all.
      // We will create a single log entry representing the current state to ensure stats count it.
      
      const status = email.last_event || "sent";
      const eventType = `sync.${status}`; // Mark as synced

      await prisma.emailLog.create({
        data: {
          emailId: email.id,
          recipient: email.to[0], // Take first recipient
          eventType: eventType,
          status: status,
          createdAt: new Date(email.created_at),
          // We don't have campaignId or userId easily available here unless we try to match by recipient or something
          // But for global stats, this is enough.
        },
      });
      
      newCount++;
    }

    console.log(`Sync complete. Added ${newCount} new logs. Skipped ${skippedCount} existing logs.`);

  } catch (error) {
    console.error("Error syncing from Resend:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
