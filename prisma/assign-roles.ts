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
  const users = await prisma.user.findMany({
    take: 3,
    where: {
      position: null,
    },
  });

  if (users.length < 3) {
    console.log("Not enough users to assign roles. Creating new ones...");
    // Create users if needed (omitted for brevity, assuming simulation ran)
  }

  const roles = ["President", "Tresorier", "Secretaire"];

  for (let i = 0; i < roles.length; i++) {
    if (users[i]) {
      await prisma.user.update({
        where: { id: users[i].id },
        data: { position: roles[i] },
      });
      console.log(`Assigned ${roles[i]} to ${users[i].name} (${users[i].email})`);
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
