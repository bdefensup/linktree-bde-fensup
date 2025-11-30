"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getAdminTickets } from "@/app/messaging";

import { columns, Ticket } from "./columns";
import { DataTable } from "./data-table";

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getAdminTickets();
        setTickets(data);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
    // Poll every 3 seconds
    const interval = setInterval(fetchTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={tickets} />
    </div>
  );
}
