import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const mandatoryRoles = ["President", "Tresorier", "Secretaire"];

  const officials = await prisma.user.findMany({
    where: {
      position: { in: mandatoryRoles },
    },
  });

  console.log(
    "Officials found:",
    officials.map((u) => `${u.name} (${u.position})`)
  );

  // We want to ensure that for a target user (e.g. the one logged in), these conversations exist.
  // Let's assume we want to seed them for ALL users? No, that's too many.
  // Let's seed them for the user with email 'admin.test@bdefenelon.org' (if it's not one of them? It is Secretaire).
  // Let's seed them for 'staff.test@bdefenelon.org' (Tresorier).
  // Actually, let's just ensure they all talk to each other.

  // Also, let's pick a random "Adherent" user to simulate a normal user.
  const normalUser = await prisma.user.findFirst({
    where: { position: null },
  });

  if (!normalUser) {
    console.log("No normal user found.");
    return;
  }

  console.log(`Seeding chats for normal user: ${normalUser.name}`);

  for (const official of officials) {
    if (official.id === normalUser.id) continue;

    const exists = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: normalUser.id } } },
          { participants: { some: { userId: official.id } } },
        ],
      },
    });

    if (!exists) {
      console.log(
        `Creating conversation between ${normalUser.name} and ${official.position} (${official.name})`
      );
      await prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: normalUser.id }, { userId: official.id }],
          },
          messages: {
            create: {
              senderId: official.id,
              content: `Bonjour, je suis le ${official.position}. Comment puis-je vous aider ?`,
            },
          },
          lastMessageAt: new Date(),
        },
      });
    } else {
      console.log(
        `Conversation already exists between ${normalUser.name} and ${official.position}`
      );
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
