import { prisma } from "@/lib/prisma";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { MobileReservationList } from "@/components/admin/events/mobile-reservation-list";

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
    <div className="flex h-full flex-col space-y-8 bg-black p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          <span className="hidden md:inline">Gestion des Réservations</span>
          <span className="md:hidden">Réservations</span>
        </h1>
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block">
        <DataTable columns={columns} data={bookings} />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileReservationList bookings={bookings} />
      </div>
    </div>
  );
}
