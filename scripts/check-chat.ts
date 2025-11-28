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
  console.log(`Checking conversation ${chatId}...`);

  const conversation = await prisma.conversation.findUnique({
    where: { id: chatId },
    include: {
      participants: {
        include: { user: true },
      },
    },
  });

  if (!conversation) {
    console.log("Conversation not found!");
    return;
  }

  console.log("Participants:");
  conversation.participants.forEach((p) => {
    console.log(`- ${p.user.name} (${p.user.email})`);
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
