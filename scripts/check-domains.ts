import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const response = await resend.domains.list();
    console.log("Domains configuration:");
    if (response.data) {
      response.data.forEach((d) => {
        console.log(`- ${d.name}: ${d.status} (Region: ${d.region})`);
      });
    } else {
      console.log("No domains found or failed to list.");
    }
  } catch (error) {
    console.error("Error listing domains:", error);
  }
}

main();
