import { TicketList } from "@/components/admin/tickets/ticket-list";

export default function TicketsPage() {
  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">Gestion des Tickets</h1>
      <TicketList />
    </div>
  );
}
