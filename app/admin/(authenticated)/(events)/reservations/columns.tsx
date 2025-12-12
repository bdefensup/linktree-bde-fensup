"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Check, X, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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

export type Booking = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
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

    const data = await response.json();

    if (data.emailSent === false && (status === "CONFIRMED" || status === "CANCELLED")) {
      toast.warning(`Statut mis à jour, mais l'envoi de l'email a échoué: ${data.emailError || "Erreur inconnue"}`);
    } else {
      toast.success("Le statut de la réservation a été mis à jour avec succès.");
    }
    
    // We need to refresh the data. Since this is a client component,
    // we might need a way to trigger a refresh in the parent or use router.refresh()
    window.location.reload(); // Simple reload for now, or use router.refresh() if in a server component context
  } catch {
    toast.error("Impossible de mettre à jour le statut de la réservation.");
  }
};

export const columns: ColumnDef<Booking>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let badgeClass = "";
      let label = "";

      switch (status) {
        case "CONFIRMED":
          badgeClass =
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800 hover:bg-green-200 hover:border-green-300 dark:hover:bg-green-900/50 transition-colors duration-200";
          label = "Validé";
          break;
        case "CANCELLED":
          badgeClass =
            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-800 hover:bg-red-200 hover:border-red-300 dark:hover:bg-red-900/50 transition-colors duration-200";
          label = "Refusé";
          break;
        case "CHECKED_IN":
          badgeClass =
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800 hover:bg-blue-200 hover:border-blue-300 dark:hover:bg-blue-900/50 transition-colors duration-200";
          label = "Check-in";
          break;
        case "CHECKED_OUT":
          badgeClass =
            "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 hover:border-indigo-300 dark:hover:bg-indigo-900/50 transition-colors duration-200";
          label = "Parti";
          break;
        case "NO_SHOW":
          badgeClass =
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:bg-gray-200 hover:border-gray-300 dark:hover:bg-gray-900/50 transition-colors duration-200";
          label = "No Show";
          break;
        default:
          badgeClass =
            "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border-orange-200 dark:border-orange-800 hover:bg-orange-200 hover:border-orange-300 dark:hover:bg-orange-900/50 transition-colors duration-200";
          label = "En attente";
          break;
      }

      return (
        <Badge variant="outline" className={badgeClass}>
          {label}
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
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return (
        <a
          href={`mailto:${email}`}
          className="hover:underline hover:text-primary transition-colors"
        >
          {email}
        </a>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      if (!phone) return <span className="text-muted-foreground">-</span>;

      return (
        <a href={`tel:${phone}`} className="hover:underline hover:text-primary transition-colors">
          {phone}
        </a>
      );
    },
  },
  {
    accessorKey: "event.title",
    id: "event_title",
    header: "Événement",
    cell: ({ row }) => {
      const title = row.original.event.title;
      return (
        <div className="max-w-[200px] truncate font-medium" title={title}>
          {title}
        </div>
      );
    },
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
            <Button variant="ghost" className="h-8 w-8 p-0" suppressHydrationWarning={true}>
              <span className="sr-only">Ouvrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(booking.email)}>
              Copier l&apos;email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => updateStatus(booking.id, "CONFIRMED")}>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Valider
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus(booking.id, "PENDING")}>
              <Clock className="mr-2 h-4 w-4 text-orange-500" />
              Mettre en attente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus(booking.id, "CANCELLED")}>
              <X className="mr-2 h-4 w-4 text-red-500" />
              Annuler / Refuser
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
