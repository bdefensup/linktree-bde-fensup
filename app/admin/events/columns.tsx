"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  memberPrice?: number | null;
  externalPrice?: number | null;
  maxSeats: number;
  image: string | null;
  _count?: {
    bookings: number;
  };
};

const deleteEvent = async (id: string) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;

  try {
    const response = await fetch(`/api/admin/events/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete event");

    toast.success("Événement supprimé");
    window.location.reload();
  } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("image") as string;
      return (
        <div className="relative h-10 w-16 overflow-hidden rounded-md">
          {image ? (
            <Image
              src={image}
              alt={row.getValue("title")}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
              No img
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Titre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return format(new Date(row.getValue("date")), "dd/MM/yyyy HH:mm", {
        locale: fr,
      });
    },
  },
  {
    accessorKey: "location",
    header: "Lieu",
  },
  {
    accessorKey: "price",
    header: "Prix",
    cell: ({ row }) => {
      const formatPrice = (price: number) =>
        new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(price);

      const price = row.getValue("price") as number;
      const memberPrice = row.original.memberPrice;
      const externalPrice = row.original.externalPrice;

      return (
        <div className="flex flex-col text-sm">
          <span>Std: {formatPrice(price)}</span>
          {memberPrice && (
            <span className="text-green-600">
              Mbr: {formatPrice(memberPrice)}
            </span>
          )}
          {externalPrice && (
            <span className="text-blue-600">
              Ext: {formatPrice(externalPrice)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "bookings",
    header: "Réservations",
    cell: ({ row }) => {
      const count = row.original._count?.bookings || 0;
      const capacity = row.original.maxSeats;
      return (
        <div className="flex items-center gap-2">
          <span className={count >= capacity ? "text-red-500 font-bold" : ""}>
            {count} / {capacity}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const event = row.original;

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
            <DropdownMenuItem asChild>
              <Link href={`/admin/events/${event.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteEvent(event.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
