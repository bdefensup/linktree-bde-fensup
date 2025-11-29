import { TicketList } from "@/components/admin/tickets/ticket-list";

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Tickets</h1>
        <p className="text-muted-foreground">
          Gérez les demandes de support et les tickets ouverts.
        </p>
      </div>
      <TicketList />
    </div>
  );
}
