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
  console.log("Fixing permissions for 'anon' role...");

  try {
    // Grant usage on public schema
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO anon;`);
    console.log("Granted USAGE on SCHEMA public to anon.");

    // Grant select on message table (needed for Realtime to read/subscribe)
    await prisma.$executeRawUnsafe(`GRANT SELECT ON TABLE message TO anon;`);
    console.log("Granted SELECT on TABLE message to anon.");

    // Grant select on conversation table (might be needed if we subscribe to it later)
    await prisma.$executeRawUnsafe(
      `GRANT SELECT ON TABLE conversation TO anon;`
    );
    console.log("Granted SELECT on TABLE conversation to anon.");

    console.log("Permissions fixed successfully!");
  } catch (error) {
    console.error("Error fixing permissions:", error);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
