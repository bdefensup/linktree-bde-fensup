"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";

export type Ticket = {
  id: string;
  ticketId: string;
  subject: string | null;
  guestName: string | null;
  ticketStatus: string;
  createdAt: Date;
  lastMessageAt: Date;
  messages: { content: string }[];
};

export const columns: ColumnDef<Ticket>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "ticketStatus",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("ticketStatus") as string;
      return (
        <Badge
          variant="outline"
          className={
            status === "OPEN"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800 hover:bg-green-200 hover:border-green-300 dark:hover:bg-green-900/50 transition-colors duration-200"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-800 hover:bg-red-200 hover:border-red-300 dark:hover:bg-red-900/50 transition-colors duration-200"
          }
        >
          {status === "OPEN" ? "Ouvert" : "Résolu"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subject",
    header: "Sujet",
    cell: ({ row }) => {
      const subject = row.getValue("subject") as string;
      return <div className="font-medium">{subject || "Sans sujet"}</div>;
    },
  },
  {
    accessorKey: "guestName",
    header: "Invité",
    cell: ({ row }) => {
      const name = row.getValue("guestName") as string;
      return <div>{name || "Anonyme"}</div>;
    },
  },
  {
    accessorKey: "messages",
    header: "Dernier message",
    cell: ({ row }) => {
      const messages = row.original.messages;
      const lastMessage = messages[0]?.content || "-";
      return (
        <div className="max-w-[200px] truncate text-muted-foreground" title={lastMessage}>
          {lastMessage}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date de création",
    cell: ({ row }) => {
      return format(new Date(row.getValue("createdAt")), "dd/MM/yyyy HH:mm", { locale: fr });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <div className="text-right">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/admin/tickets/${ticket.id}`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Voir
            </Link>
          </Button>
        </div>
      );
    },
  },
];
