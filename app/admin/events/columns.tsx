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
import { useRouter } from "next/navigation";

export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  maxSeats: number;
  image: string | null;
  _count?: {
    bookings: number;
  };
};

// ... (keep deleteEvent same)

export const columns: ColumnDef<Event>[] = [
  // ... (keep other columns same)
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
  // ... (keep actions same)
];
