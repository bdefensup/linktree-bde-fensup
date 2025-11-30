import { prisma } from "@/lib/prisma";
import { LandingPageContent } from "@/components/landing-page-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const latestEvent = await prisma.event.findFirst({
    where: {
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return <LandingPageContent latestEvent={latestEvent} />;
}
