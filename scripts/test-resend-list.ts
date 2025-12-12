
import "dotenv/config";
import { Resend } from "resend";

async function main() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const response = await resend.emails.list();
    console.log("Full response:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error fetching from Resend:", error);
  }
}

main();
