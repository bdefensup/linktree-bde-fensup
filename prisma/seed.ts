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

  // 2. Create 3 test users
  const testUsers = [
    {
      email: "adherent.test@bdefenelon.org",
      name: "Adhérent Test",
      role: "adherent",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adherent",
      message: "Bonjour, je suis un adhérent !",
    },
    {
      email: "staff.test@bdefenelon.org",
      name: "Staff Test",
      role: "staff",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Staff",
      message: "Salut, je fais partie du staff.",
    },
    {
      email: "admin.test@bdefenelon.org",
      name: "Admin Test",
      role: "admin",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      message: "Hello, je suis un autre admin.",
    },
  ];

  for (const u of testUsers) {
    let user = await prisma.user.findUnique({
      where: { email: u.email },
    });

    if (!user) {
      console.log(`Creating user ${u.name}...`);
      user = await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          role: u.role,
          image: u.image,
        },
      });
    }
    console.log(`Found/Created user: ${user.name} (${user.email})`);

    // 3. Create conversation with admin
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: [admin.id, user.id] },
          },
        },
      },
    });

    if (!existingConversation) {
      console.log(`Creating conversation with ${user.name}...`);
      await prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: admin.id }, { userId: user.id }],
          },
          messages: {
            create: [
              {
                senderId: user.id,
                content: u.message,
              },
            ],
          },
          lastMessageAt: new Date(),
        },
      });
    } else {
      console.log(`Conversation with ${user.name} already exists.`);
    }
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
