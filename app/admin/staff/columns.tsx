"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  banned?: boolean;
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
              variant="outline"
              className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-800 gap-1 hover:bg-red-100/80"
            >
              <ShieldAlert className="w-3 h-3" />
              Admin
            </Badge>
          );
        case "staff":
          return (
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800 gap-1 hover:bg-blue-100/80"
            >
              <Shield className="w-3 h-3" />
              Staff
            </Badge>
          );
        default:
          return (
            <Badge
              variant="outline"
              className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 gap-1 hover:bg-emerald-100/80"
            >
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
      const router = useRouter();

      const handleCopyEmail = () => {
        navigator.clipboard.writeText(user.email);
        toast.success("Email copié dans le presse-papier.");
      };

      const handleRoleChange = async (newRole: string) => {
        try {
          const response = await fetch(`/api/admin/users/${user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
          });

          if (!response.ok) throw new Error("Failed to update role");

          toast.success(
            "Le rôle de l'utilisateur a été mis à jour avec succès."
          );
          router.refresh();
        } catch (error) {
          toast.error("Impossible de modifier le rôle de l'utilisateur.");
        }
      };

      const handleBanToggle = async () => {
        try {
          const response = await fetch(`/api/admin/users/${user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ banned: !user.banned }),
          });

          if (!response.ok) throw new Error("Failed to ban");

          toast.success(
            user.banned
              ? "L'utilisateur a été débanni avec succès."
              : "L'utilisateur a été banni avec succès."
          );
          router.refresh();
        } catch (error) {
          toast.error("Impossible de modifier le statut de bannissement.");
        }
      };

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
            <DropdownMenuItem onClick={handleCopyEmail}>
              Copier l'email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Changer le rôle</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleRoleChange("adherent")}>
              Adhérent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange("staff")}>
              Staff
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange("admin")}>
              Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={handleBanToggle}
            >
              {user.banned ? "Débannir l'utilisateur" : "Bannir l'utilisateur"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
