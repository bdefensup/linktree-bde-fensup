import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

async function sendRealTestEmail() {
  console.log("🚀 Starting Real Email Test...");

  // 1. Create a Test Event
  const event = await prisma.event.create({
    data: {
      title: "Real Test Event " + Date.now(),
      description: "Event for real email testing.",
      date: new Date(),
      location: "Test Location",
      price: 0,
      maxSeats: 100,
    },
  });
  console.log(`✅ Created Event: ${event.title}`);

  // 2. Create a Confirmed Booking with YOUR email
  // Using the email found in the user's screenshot
  const testEmail = "yanis.amine.harrat@gmail.com"; 

  await prisma.booking.create({
    data: {
      eventId: event.id,
      firstName: "Test",
      lastName: "User",
      email: testEmail,
      phone: "0000000000",
      status: "CONFIRMED",
    },
  });
  console.log(`✅ Created Booking for: ${testEmail}`);

  // 3. Create a Segment
  const segment = await prisma.segment.create({
    data: {
      name: "Segment Test Real " + Date.now(),
      query: { reservedEventId: event.id },
    },
  });
  console.log(`✅ Created Segment: ${segment.name}`);

  // 4. Create a Campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: "Campaign Test Real " + Date.now(),
      subject: "Test Réel - Segmentation Événement",
      content: "Ceci est un test réel. Si vous recevez ceci, la segmentation fonctionne !",
      status: "DRAFT",
      userId: (await prisma.user.findFirst())?.id || "", // Fallback to first user
      segmentId: segment.id,
      recipients: [], // Empty because we use segment
    },
  });
  console.log(`✅ Created Campaign: ${campaign.name}`);

  // 5. Send the Campaign Logic (Replicated)
  console.log("📧 Sending Campaign...");
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  // Fetch recipients using the SAME logic as the app
  const bookings = await prisma.booking.findMany({
    where: {
      eventId: event.id,
      status: "CONFIRMED",
    },
    select: { email: true },
  });
  const recipients = bookings.map(b => b.email);
  
  console.log(`🎯 Target Recipients: ${recipients.join(", ")}`);
  
  if (recipients.length > 0) {
    try {
      const data = await resend.emails.send({
        from: process.env.EMAIL_FROM || "contact@bdefenelon.org",
        to: recipients,
        subject: campaign.subject!,
        html: `<p>${campaign.content}</p>`,
      });
      console.log("✅ Email sent via Resend API!", data);
    } catch (error) {
      console.error("❌ Failed to send email:", error);
    }
  } else {
    console.log("❌ No recipients found.");
  }

  // Cleanup
  // await prisma.campaign.delete({ where: { id: campaign.id } });
  // await prisma.segment.delete({ where: { id: segment.id } });
  // await prisma.booking.deleteMany({ where: { eventId: event.id } });
  // await prisma.event.delete({ where: { id: event.id } });
}

sendRealTestEmail()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
