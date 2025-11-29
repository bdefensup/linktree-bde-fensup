/* eslint-disable no-console */
import "dotenv/config";
import { PrismaClient, User } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting messaging simulation...");

  // 1. Create 15 users
  console.log("Creating 15 users...");
  const users: User[] = [];
  for (let i = 0; i < 15; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          image: faker.image.avatar(),
          role: "adherent",
          emailVerified: true,
        },
      });
    }
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users.`);

  // 2. Find the admin user (assuming the first admin found is the target)
  const admin = await prisma.user.findFirst({
    where: { role: "admin" },
  });

  if (!admin) {
    console.error("❌ No admin user found. Please create an admin user first.");
    return;
  }
  console.log(`Targeting admin: ${admin.name} (${admin.email})`);

  // 3. Create initial history (random conversations with admin)
  console.log("Generating initial message history...");
  for (const user of users) {
    // 50% chance to have a conversation
    if (Math.random() > 0.5) {
      let conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: admin.id } } },
            { participants: { some: { userId: user.id } } },
          ],
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participants: {
              create: [{ userId: admin.id }, { userId: user.id }],
            },
          },
        });
      }

      // Create 1-5 random messages
      const numMessages = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < numMessages; j++) {
        const senderId = Math.random() > 0.5 ? admin.id : user.id;
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId,
            content: faker.lorem.sentence(),
            createdAt: faker.date.recent({ days: 7 }),
          },
        });
      }

      // Update lastMessageAt
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });
    }
  }
  console.log("✅ Initial history generated.");

  // 4. Start simulation loop (90s, every 15s)
  console.log("⏱️ Starting 90s simulation (messages every 15s)...");

  const duration = 90 * 1000; // 90 seconds
  const interval = 15 * 1000; // 15 seconds
  const startTime = Date.now();

  const timer = setInterval(async () => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= duration) {
      clearInterval(timer);
      console.log("🏁 Simulation finished.");
      await prisma.$disconnect();
      process.exit(0);
    }

    // Pick a random user to send a message to admin
    const randomUser = users[Math.floor(Math.random() * users.length)];

    // Ensure conversation exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: admin.id } } },
          { participants: { some: { userId: randomUser.id } } },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: admin.id }, { userId: randomUser.id }],
          },
        },
      });
    }

    const content = faker.lorem.sentence();
    console.log(`📩 New message from ${randomUser.name}: "${content}"`);

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: randomUser.id,
        content,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });
  }, interval);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
