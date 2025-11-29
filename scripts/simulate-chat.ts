import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting chat simulation...");

  // 1. Find or create an admin user to receive messages
  let admin = await prisma.user.findFirst({
    where: { role: "admin" },
  });

  if (!admin) {
    console.log("⚠️ No admin found, creating one...");
    admin = await prisma.user.create({
      data: {
        email: "admin-test-sim@example.com",
        name: "Admin Simulation",
        role: "admin",
        emailVerified: true,
      },
    });
  }

  console.log(`✅ Target Admin: ${admin.name} (${admin.id})`);

  // 2. Create 15 random users
  const users = [];
  console.log("👥 Creating 15 users...");
  for (let i = 0; i < 15; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        image: faker.image.avatar(),
        role: "adherent",
        emailVerified: true,
      },
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users.`);

  // 3. Create conversations and history
  console.log("💬 Creating conversations and history...");
  for (const user of users) {
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: admin!.id }, { userId: user.id }],
        },
        lastMessageAt: faker.date.recent({ days: 7 }),
      },
    });

    // Add some random history (1-5 messages)
    const historyCount = faker.number.int({ min: 1, max: 5 });
    for (let j = 0; j < historyCount; j++) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: Math.random() > 0.5 ? admin!.id : user.id,
          content: faker.lorem.sentence(),
          createdAt: faker.date.recent({ days: 7 }),
        },
      });
    }
  }

  // 4. Simulation Loop (90 seconds, every 15s)
  console.log("🟢 Starting live simulation (90s duration, 15s intervals)...");
  const duration = 90 * 1000; // 90 seconds
  const interval = 15 * 1000; // 15 seconds
  const startTime = Date.now();

  const intervalId = setInterval(async () => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= duration) {
      clearInterval(intervalId);
      console.log("🛑 Simulation finished.");
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log(`⏱️  Tick: ${Math.round(elapsed / 1000)}s / 90s`);

    // Pick 1-3 random users to send a message
    const activeUsersCount = faker.number.int({ min: 1, max: 3 });
    for (let k = 0; k < activeUsersCount; k++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Find conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          participants: {
            every: {
              userId: { in: [admin!.id, randomUser.id] },
            },
          },
        },
      });

      if (conversation) {
        const content = faker.lorem.sentence();
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: randomUser.id,
            content: content,
          },
        });

        // Update conversation lastMessageAt to trigger reordering
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        });

        console.log(`📨 Message sent from ${randomUser.name}: "${content.slice(0, 20)}..."`);
      }
    }
  }, interval);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
