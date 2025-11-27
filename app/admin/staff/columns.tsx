"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  ArrowUpDown,
  Shield,
  ShieldAlert,
  User,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  phoneNumber: string | null;
  role: string;
  createdAt: string; // Serialized date
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "image",
    header: "Avatar",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Avatar className="h-10 w-10 border border-border/50">
          <AvatarImage src={user.image || ""} alt={user.name || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return <span className="font-medium">{user.name || "Sans nom"}</span>;
    },
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
    accessorKey: "phoneNumber",
    header: "Téléphone",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">
          {row.getValue("phoneNumber") || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      switch (role) {
        case "admin":
          return (
            <Badge
              variant="default"
              className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border-red-500/20 gap-1"
            >
              <ShieldAlert className="w-3 h-3" />
              Admin
            </Badge>
          );
        case "staff":
          return (
            <Badge
              variant="default"
              className="bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border-blue-500/20 gap-1"
            >
              <Shield className="w-3 h-3" />
              Staff
            </Badge>
          );
        default:
          return (
            <Badge variant="secondary" className="gap-1">
              <User className="w-3 h-3" />
              Adhérent
            </Badge>
          );
      }
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date d'inscription",
    cell: ({ row }) => {
      return format(new Date(row.getValue("createdAt")), "dd MMMM yyyy", {
        locale: fr,
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

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
              onClick={() => navigator.clipboard.writeText(user.email)}
            >
              Copier l'email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Modifier le rôle</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
              Bannir l'utilisateur
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
