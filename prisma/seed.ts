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
  console.log("Seeding database...");

  // 1. Get or create the main admin user (you)
  // Replace with your actual email if known, or we'll try to find the first admin
  const adminEmail = "yanis.harrat@bdefenelon.org"; // Replace with your email
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.log("Admin user not found, trying to find any admin...");
    admin = await prisma.user.findFirst({
      where: { role: "admin" },
    });
  }

  if (!admin) {
    console.error("No admin user found. Please sign up first.");
    return;
  }

  console.log(`Found admin user: ${admin.name} (${admin.email})`);

  // 2. Create a dummy user to chat with
  const dummyEmail = "membre.test@bdefenelon.org";
  let dummyUser = await prisma.user.findUnique({
    where: { email: dummyEmail },
  });

  if (!dummyUser) {
    console.log("Creating dummy user...");
    dummyUser = await prisma.user.create({
      data: {
        email: dummyEmail,
        name: "Membre Test",
        role: "adherent",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      },
    });
  }

  console.log(
    `Found/Created dummy user: ${dummyUser.name} (${dummyUser.email})`
  );

  // 3. Create a conversation between them
  console.log("Creating conversation...");

  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          userId: { in: [admin.id, dummyUser.id] },
        },
      },
    },
  });

  let conversationId = existingConversation?.id;

  if (!existingConversation) {
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: admin.id }, { userId: dummyUser.id }],
        },
        messages: {
          create: [
            {
              senderId: dummyUser.id,
              content: "Bonjour ! J'ai une question sur le prochain événement.",
            },
            {
              senderId: admin.id,
              content: "Salut ! Je t'écoute, dis-moi tout.",
            },
          ],
        },
        lastMessageAt: new Date(),
      },
    });
    conversationId = conversation.id;
    console.log("Created new conversation.");
  } else {
    console.log("Conversation already exists.");
  }

  console.log("Seeding complete! You can now test messaging.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
