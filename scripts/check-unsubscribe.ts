import { prisma } from "@/lib/prisma";

async function checkUnsubscribe() {
  const email = "yanis.amine.harrat@gmail.com";
  console.log(`🔍 Checking unsubscribe status for: ${email}`);

  const unsubscribed = await (prisma as any).unsubscribedRecipient.findFirst({
    where: { email },
  });

  if (unsubscribed) {
    console.log("❌ Email IS unsubscribed!");
    console.log(unsubscribed);
  } else {
    console.log("✅ Email is NOT unsubscribed.");
  }
}

checkUnsubscribe()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
