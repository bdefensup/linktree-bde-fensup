"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Ticket as TicketIcon, Loader2 } from "lucide-react";
import { getAdminTickets } from "@/app/messaging";

interface Ticket {
  id: string;
  ticketId: string;
  subject: string | null;
  guestName: string | null;
  ticketStatus: string;
  createdAt: Date;
  lastMessageAt: Date;
  messages: { content: string }[];
}

export function TicketList() {
  const router = useRouter();
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
    // Poll every 10 seconds
    const interval = setInterval(fetchTickets, 10000);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TicketIcon className="h-5 w-5" />
          Tickets de Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Aucun ticket en cours.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statut</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Invité</TableHead>
                <TableHead>Dernier message</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Badge
                      variant={ticket.ticketStatus === "OPEN" ? "default" : "secondary"}
                      className={
                        ticket.ticketStatus === "OPEN" ? "bg-green-500 hover:bg-green-600" : ""
                      }
                    >
                      {ticket.ticketStatus === "OPEN" ? "Ouvert" : "Résolu"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{ticket.subject || "Sans sujet"}</TableCell>
                  <TableCell>{ticket.guestName || "Anonyme"}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {ticket.messages[0]?.content || "-"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(ticket.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
