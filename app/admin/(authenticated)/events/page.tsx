import { prisma } from "@/lib/prisma";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export const dynamic = "force-dynamic";

async function getEvents() {
  const events = await prisma.event.findMany({
    orderBy: {
      date: "asc",
    },
    include: {
      _count: {
        select: {
          bookings: {
            where: {
              status: {
                in: ["PENDING", "CONFIRMED"],
              },
            },
          },
        },
      },
    },
  });

  return events.map((event) => ({
    ...event,
    date: event.date.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }));
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Gestion des Événements</h1>
      <DataTable columns={columns} data={events} />
    </div>
  );
}
