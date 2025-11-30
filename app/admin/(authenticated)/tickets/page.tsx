import { TicketList } from "@/components/admin/tickets/ticket-list";

export default function TicketsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Gestion des Tickets</h1>
      <TicketList />
    </div>
  );
}
