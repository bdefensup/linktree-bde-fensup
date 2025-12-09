import { prisma } from "@/lib/prisma";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

async function getBookings() {
  const bookings = await prisma.booking.findMany({
    include: {
      event: {
        select: {
          title: true,
          date: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize dates to strings to avoid "Date object cannot be passed to Client Component" error
  return bookings.map((booking) => ({
    ...booking,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    event: {
      ...booking.event,
      date: booking.event.date.toISOString(),
    },
  }));
}

export default async function AdminReservationsPage() {
  const bookings = await getBookings();

  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">Gestion des Réservations</h1>
      <DataTable columns={columns} data={bookings} />
    </div>
  );
}
