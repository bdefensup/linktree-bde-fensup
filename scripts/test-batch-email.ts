import { Resend } from "resend";

async function testBatchEmail() {
  console.log("🚀 Starting Batch Email Test (Exact App Payload)...");

  const resend = new Resend(process.env.RESEND_API_KEY);
  const testEmail = "yanis.amine.harrat@gmail.com"; 
  const from = process.env.EMAIL_FROM || "contact@bdefenelon.org";
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const unsubscribeHeaderUrl = `<${APP_URL}/api/unsubscribe?email=${encodeURIComponent(testEmail)}>`;

  console.log(`📧 Sending Batch to: ${testEmail}`);

  const payload = [
    {
      from,
      to: [testEmail],
      subject: "Test Batch - Exact Payload",
      html: "<p>Ceci est un test avec le payload exact de l'application.</p>",
      text: "Ceci est un test avec le payload exact de l'application.",
      headers: {
        "List-Unsubscribe": unsubscribeHeaderUrl,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [{ name: "campaignId", value: "test-campaign-id" }],
    }
  ];

  try {
    const response = await resend.batch.send(payload);
    console.log("✅ Batch Response:", JSON.stringify(response, null, 2));

    if (response.error) {
      console.error("❌ Batch Error:", response.error);
    } else {
      console.log("🎉 Batch sent successfully!");
    }
  } catch (error) {
    console.error("❌ Exception during batch send:", error);
  }
}

testBatchEmail();
