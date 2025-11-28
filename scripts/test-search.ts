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
  const query = "Test";
  const currentUserId = "J1Sc1QXVUuB0r6k0CkgbQUgtvaiLqhK6"; // Yanis ID from previous list

  console.log(
    `Simulating search for "${query}" excluding user ${currentUserId}...`
  );

  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          id: {
            not: currentUserId,
          },
        },
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phoneNumber: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  console.log(`Found ${users.length} users:`);
  console.table(users);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
