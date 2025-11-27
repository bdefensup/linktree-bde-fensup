"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type Booking = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  event: {
    title: string;
    date: string;
  };
};

const updateStatus = async (id: string, status: string) => {
  try {
    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error("Failed to update status");

    toast.success("Le statut de la réservation a été mis à jour avec succès.");
    // We need to refresh the data. Since this is a client component,
    // we might need a way to trigger a refresh in the parent or use router.refresh()
    window.location.reload(); // Simple reload for now, or use router.refresh() if in a server component context
  } catch (error) {
    toast.error("Impossible de mettre à jour le statut de la réservation.");
  }
};

export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "CONFIRMED"
              ? "default"
              : status === "CANCELLED"
                ? "destructive"
                : "secondary"
          }
        >
          {status === "CONFIRMED"
            ? "Validé"
            : status === "CANCELLED"
              ? "Annulé"
              : "En attente"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "firstName",
    header: "Prénom",
  },
  {
    accessorKey: "lastName",
    header: "Nom",
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "event.title",
    header: "Événement",
  },
  {
    accessorKey: "createdAt",
    header: "Date de résa",
    cell: ({ row }) => {
      return format(new Date(row.getValue("createdAt")), "dd/MM/yyyy HH:mm", {
        locale: fr,
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const booking = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(booking.email)}
            >
              Copier l'email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => updateStatus(booking.id, "CONFIRMED")}
            >
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Valider
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateStatus(booking.id, "PENDING")}
            >
              <Clock className="mr-2 h-4 w-4 text-orange-500" />
              Mettre en attente
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateStatus(booking.id, "CANCELLED")}
            >
              <X className="mr-2 h-4 w-4 text-red-500" />
              Annuler / Refuser
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
