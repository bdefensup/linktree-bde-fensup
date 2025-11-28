"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  ArrowUpDown,
  Pencil,
  Trash,
  Star,
  TriangleAlert,
} from "lucide-react";
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
  isFeatured: boolean;
  _count?: {
    bookings: number;
  };
};

const toggleFeatured = async (id: string, currentStatus: boolean) => {
  try {
    const response = await fetch(`/api/admin/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !currentStatus }),
    });

    if (!response.ok) throw new Error("Failed to update event");

    toast.success(
      !currentStatus ? "Événement mis en avant" : "Événement retiré de la une"
    );
    window.location.reload();
  } catch (error) {
    toast.error("Impossible de mettre à jour l'événement.");
  }
};

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function EventActionsCell({ event }: { event: Event }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const confirmDeleteEvent = async () => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");

      toast.success("L'événement a été supprimé avec succès.");
      window.location.reload();
    } catch {
      toast.error("Impossible de supprimer l'événement.");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
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
            onSelect={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
          >
            <Trash className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-red-200 dark:border-red-900/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-xl">
              <TriangleAlert className="h-6 w-6" />
              Suppression d'événement
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-foreground/80 mt-2">
              Attention, cette action est{" "}
              <span className="font-black text-red-600 uppercase">
                irréversible
              </span>
              .
              <br />
              <br />
              Vous êtes sur le point de supprimer définitivement l'événement :
              <br />
              <span className="font-bold text-foreground text-lg block mt-1 p-2 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-100 dark:border-red-900/20 text-center">
                {event.title}
              </span>
              <br />
              Toutes les{" "}
              <span className="font-bold text-red-600">
                réservations associées
              </span>{" "}
              seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-medium">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEvent}
              className="bg-red-600 text-white hover:bg-red-700 font-bold border-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Confirmer la suppression
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

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
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <div className="max-w-[200px] truncate font-medium" title={title}>
          {title}
        </div>
      );
    },
  },
  {
    accessorKey: "isFeatured",
    header: "À la une",
    cell: ({ row }) => {
      const isFeatured = row.getValue("isFeatured") as boolean;
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleFeatured(row.original.id, isFeatured)}
          className={
            isFeatured
              ? "text-yellow-500 hover:text-yellow-600"
              : "text-muted-foreground hover:text-yellow-500"
          }
        >
          <Star className={`h-5 w-5 ${isFeatured ? "fill-current" : ""}`} />
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
    filterFn: (row, id, value) => {
      const rowDate = new Date(row.getValue(id));
      const { from, to } = value as { from?: Date; to?: Date };

      if (!from) return true;
      if (!to) return rowDate >= from;

      return rowDate >= from && rowDate <= to;
    },
  },
  {
    accessorKey: "location",
    header: "Lieu",
    cell: ({ row }) => {
      const location = row.getValue("location") as string;
      return (
        <div className="max-w-[150px] truncate" title={location}>
          {location}
        </div>
      );
    },
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
    cell: ({ row }) => <EventActionsCell event={row.original} />,
  },
];
