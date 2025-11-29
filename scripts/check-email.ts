import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Checking environment variables...");

  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is missing!");
  } else {
    console.log(
      "✅ RESEND_API_KEY is present (starts with " +
        apiKey.substring(0, 4) +
        "...)"
    );
  }

  if (!emailFrom) {
    console.warn(
      "⚠️ EMAIL_FROM is missing, defaulting to 'onboarding@resend.dev'"
    );
  } else {
    console.log("✅ EMAIL_FROM is set to:", emailFrom);
  }

  if (apiKey) {
    console.log("Attempting to send a test email...");
    const resend = new Resend(apiKey);
    try {
      const data = await resend.emails.send({
        from: emailFrom || "onboarding@resend.dev",
        to: "delivered@resend.dev", // Special test address
        subject: "Test Email from Debug Script",
        html: "<p>It works!</p>",
      });
      console.log("✅ Test email sent successfully:", data);
    } catch (error) {
      console.error("❌ Failed to send test email:", error);
    }
  }
}

main();
