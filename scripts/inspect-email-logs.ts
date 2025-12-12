
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("--- EmailLog Stats ---");
  
  const statusCounts = await prisma.emailLog.groupBy({
    by: ['status'],
    _count: {
      _all: true
    }
  });
  console.log("Counts by status:", statusCounts);

  const eventTypeCounts = await prisma.emailLog.groupBy({
    by: ['eventType'],
    _count: {
      _all: true
    }
  });
  console.log("Counts by eventType:", eventTypeCounts);

  const totalLogs = await prisma.emailLog.count();
  console.log("Total logs:", totalLogs);
  
  const uniqueEmails = await prisma.emailLog.groupBy({
    by: ['emailId'],
  });
  console.log("Total unique emailIds:", uniqueEmails.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
