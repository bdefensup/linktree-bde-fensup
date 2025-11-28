import { PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const chatId = "cmijfkc8q000b2dohftodp5e4";
  const senderEmail = "admin.test@bdefenelon.org";

  const sender = await prisma.user.findUnique({
    where: { email: senderEmail },
  });
  if (!sender) {
    console.error("Sender not found");
    return;
  }

  console.log(
    `Sending test message to conversation ${chatId} from ${sender.name}...`
  );

  await prisma.message.create({
    data: {
      conversationId: chatId,
      senderId: sender.id,
      content:
        "Message de test CIBLÉ pour vérifier le Realtime ! 🎯 " +
        new Date().toLocaleTimeString(),
    },
  });

  await prisma.conversation.update({
    where: { id: chatId },
    data: { lastMessageAt: new Date() },
  });

  console.log("Message sent!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
