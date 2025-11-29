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
  const adminEmail = "admin.test@bdefenelon.org";
  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!adminUser) {
    console.log("Admin user not found.");
    return;
  }

  const mandatoryRoles = ["President", "Tresorier", "Secretaire"];
  const officials = await prisma.user.findMany({
    where: {
      position: { in: mandatoryRoles },
      id: { not: adminUser.id }, // Exclude self
    },
  });

  for (const official of officials) {
    const exists = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: adminUser.id } } },
          { participants: { some: { userId: official.id } } },
        ],
      },
    });

    if (!exists) {
      console.log(
        `Creating conversation between Admin (${adminUser.name}) and ${official.position} (${official.name})`
      );
      await prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: adminUser.id }, { userId: official.id }],
          },
          messages: {
            create: {
              senderId: official.id,
              content: `Bonjour Admin, ici le ${official.position}.`,
            },
          },
          lastMessageAt: new Date(),
        },
      });
    } else {
      console.log(`Conversation already exists between Admin and ${official.position}`);
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
