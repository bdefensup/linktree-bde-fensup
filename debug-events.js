const { PrismaClient } = require("./lib/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  try {
    const events = await prisma.event.findMany();
    console.log(`Found ${events.length} events:`);
    events.forEach((e) => {
      console.log(`ID: ${e.id}`);
      console.log(`Title: ${e.title}`);
      console.log(`Price: ${e.price}`);
      console.log(`Member Price: ${e.memberPrice}`);
      console.log(`External Link: ${e.externalPaymentLink}`);
      console.log(`Member Link: ${e.externalMemberPaymentLink}`);
      console.log("---");
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
