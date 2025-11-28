"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  ArrowUpDown,
  Shield,
  ShieldAlert,
  User as UserIcon,
  Trash2,
  Check,
  X,
  TriangleAlert,
  UserCog,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
  emailVerified: boolean;
};

interface StaffActionsCellProps {
  user: User;
  currentUserRole: string;
}

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function StaffActionsCell({ user, currentUserRole }: StaffActionsCellProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roleToChange, setRoleToChange] = useState<string | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email);
    toast.success("Email copié dans le presse-papier.");
  };

  const confirmRoleChange = async () => {
    if (!roleToChange) return;

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleToChange }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      toast.success("Le rôle de l'utilisateur a été mis à jour avec succès.");
      router.refresh();
    } catch {
      toast.error("Impossible de modifier le rôle de l'utilisateur.");
    } finally {
      setRoleToChange(null);
    }
  };

  const confirmDeleteUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("L'utilisateur a été supprimé avec succès.");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Impossible de supprimer l'utilisateur.";
      toast.error(errorMessage);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteClick = () => {
    if (currentUserRole === "adherent") {
      toast.error(
        "Vous n'avez pas la permission de supprimer des utilisateurs."
      );
      return;
    }

    if (currentUserRole === "staff" && user.role === "admin") {
      toast.error(
        "Les membres du staff ne peuvent pas supprimer un administrateur."
      );
      return;
    }

    if (user.role === "admin" && currentUserRole !== "admin") {
      toast.warning("Impossible de supprimer un administrateur.");
      return;
    }

    setShowDeleteDialog(true);
  };

  const canDelete =
    currentUserRole === "admin" ||
    (currentUserRole === "staff" && user.role !== "admin");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-[140px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCopyEmail}>
            Copier l'email
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Changer le rôle</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-auto min-w-[120px]">
              <DropdownMenuItem onSelect={() => setRoleToChange("adherent")}>
                <div className="flex items-center gap-2 w-full">
                  <UserIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>Adhérent</span>
                  {user.role === "adherent" && (
                    <Check className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRoleToChange("staff")}>
                <div className="flex items-center gap-2 w-full">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Staff</span>
                  {user.role === "staff" && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRoleToChange("admin")}>
                <div className="flex items-center gap-2 w-full">
                  <ShieldAlert className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span>Admin</span>
                  {user.role === "admin" && (
                    <Check className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          {canDelete && (
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
              onSelect={handleDeleteClick}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-destructive" />
              Suppression de compte
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 mt-2">
                <Alert className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800 gap-1 hover:bg-red-100 dark:hover:bg-red-900/60">
                  <TriangleAlert className="h-4 w-4 !text-red-700 dark:!text-red-300" />
                  <AlertTitle className="font-bold">
                    Attention : Irréversible
                  </AlertTitle>
                  <AlertDescription className="text-red-700/90 dark:text-red-300/90">
                    Cette action ne peut pas être annulée.
                  </AlertDescription>
                </Alert>

                <div className="text-base text-foreground/80">
                  Vous êtes sur le point de supprimer définitivement le compte
                  de :
                  <span className="font-bold text-foreground text-lg block mt-2 p-2 bg-muted rounded-md border border-border text-center">
                    {user.name || user.email}
                  </span>
                  <p className="mt-2">
                    Toutes les données associées seront{" "}
                    <span className="font-bold text-destructive">effacées</span>
                    .
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Confirmer la suppression
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!roleToChange}
        onOpenChange={(open) => !open && setRoleToChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Changement de rôle
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 mt-2">
                <Alert
                  className={
                    roleToChange === "admin"
                      ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800"
                      : roleToChange === "staff"
                        ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800"
                        : "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800"
                  }
                >
                  <UserCog
                    className={`h-4 w-4 ${
                      roleToChange === "admin"
                        ? "!text-orange-700 dark:!text-orange-300"
                        : roleToChange === "staff"
                          ? "!text-blue-700 dark:!text-blue-300"
                          : "!text-violet-700 dark:!text-violet-300"
                    }`}
                  />
                  <AlertTitle className="font-bold">
                    Modification des permissions
                  </AlertTitle>
                  <AlertDescription
                    className={
                      roleToChange === "admin"
                        ? "text-orange-700/90 dark:text-orange-300/90"
                        : roleToChange === "staff"
                          ? "text-blue-700/90 dark:text-blue-300/90"
                          : "text-violet-700/90 dark:text-violet-300/90"
                    }
                  >
                    Le rôle de l'utilisateur va être modifié.
                  </AlertDescription>
                </Alert>

                <div className="text-base text-foreground/80">
                  Le rôle de{" "}
                  <span className="font-bold text-foreground">
                    {user.name || user.email}
                  </span>{" "}
                  passera de :
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="font-bold line-through text-muted-foreground">
                      {user.role}
                    </span>
                    <ArrowUpDown className="h-4 w-4 rotate-90" />
                    <span
                      className={`font-black text-lg p-1 px-3 rounded-md border capitalize ${
                        roleToChange === "admin"
                          ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800"
                          : roleToChange === "staff"
                            ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800"
                            : "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800"
                      }`}
                    >
                      {roleToChange}
                    </span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              className="font-bold"
            >
              Confirmer le changement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const getColumns = (currentUserRole: string): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
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
    accessorKey: "image",
    header: "Avatar",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Avatar className="h-10 w-10 border border-border/50">
          <AvatarImage src={user.image || undefined} alt={user.name || ""} />
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
    accessorKey: "phoneNumber",
    header: "Téléphone",
    cell: ({ row }) => {
      const phone = row.getValue("phoneNumber") as string;
      if (!phone) return <span className="text-muted-foreground">-</span>;

      return (
        <a
          href={`tel:${phone}`}
          className="hover:underline hover:text-primary transition-colors"
        >
          {phone}
        </a>
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
              className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800 gap-1 hover:bg-orange-100 dark:hover:bg-orange-900/60"
            >
              <ShieldAlert className="w-3 h-3" />
              Admin
            </Badge>
          );
        case "staff":
          return (
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/60"
            >
              <Shield className="w-3 h-3" />
              Staff
            </Badge>
          );
        default:
          return (
            <Badge
              variant="outline"
              className="bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800 gap-1 hover:bg-violet-100 dark:hover:bg-violet-900/60"
            >
              <UserIcon className="w-3 h-3" />
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
    accessorKey: "emailVerified",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Statut
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isVerified = row.getValue("emailVerified") as boolean;
      return isVerified ? (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800 gap-1 hover:bg-green-100 dark:hover:bg-green-900/60"
        >
          <Check className="w-3 h-3" />
          Vérifié
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800 gap-1 hover:bg-red-100 dark:hover:bg-red-900/60"
        >
          <X className="w-3 h-3" />
          Non vérifié
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <StaffActionsCell user={row.original} currentUserRole={currentUserRole} />
    ),
  },
];
