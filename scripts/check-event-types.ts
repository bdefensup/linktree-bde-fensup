import { prisma } from "@/lib/prisma";

async function checkEventTypes() {
  console.log("Checking distinct eventTypes...");

  const logs = await prisma.emailLog.groupBy({
    by: ['eventType'],
    _count: {
      eventType: true
    }
  });

  console.log("Event Types found:", JSON.stringify(logs, null, 2));
}

checkEventTypes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
