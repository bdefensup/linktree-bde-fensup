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
  Crown,
  PenLine,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  position?: string | null;
};

interface StaffActionsCellProps {
  user: User;
  currentUserRole: string;
  currentUserEmail?: string;
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

function StaffActionsCell({ user, currentUserRole, currentUserEmail }: StaffActionsCellProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleToSet, setRoleToSet] = useState<string | null>(null);
  const [showPositionDialog, setShowPositionDialog] = useState(false);
  const [positionToSet, setPositionToSet] = useState<string | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email);
    toast.success("Email copié dans le presse-papier.");
  };

  const confirmRoleChange = async () => {
    if (!roleToSet) return;

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleToSet }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      toast.success("Le rôle de l'utilisateur a été mis à jour avec succès.");
      router.refresh();
    } catch {
      toast.error("Impossible de modifier le rôle de l'utilisateur.");
    } finally {
      setShowRoleDialog(false);
      setRoleToSet(null);
    }
  };

  const confirmPositionChange = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: positionToSet }),
      });

      if (!response.ok) {
        const data = await response.json();

        if (data.code === "POSITION_TAKEN") {
          toast.error(
            <span>
              Cette position est déjà occupée par{" "}
              <span className="font-bold">{data.holderName}</span>. Veuillez d'abord lui retirer.
            </span>
          );
          return;
        }

        throw new Error(data.error || "Failed to update position");
      }

      toast.success("La position a été mise à jour avec succès.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour.");
    } finally {
      setShowPositionDialog(false);
      setPositionToSet(null);
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
        error instanceof Error ? error.message : "Impossible de supprimer l'utilisateur.";
      toast.error(errorMessage);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteClick = () => {
    if (currentUserRole === "adherent") {
      toast.error("Vous n'avez pas la permission de supprimer des utilisateurs.");
      return;
    }

    if (currentUserRole === "staff" && user.role === "admin") {
      toast.error("Les membres du staff ne peuvent pas supprimer un administrateur.");
      return;
    }

    if (user.role === "admin" && currentUserRole !== "admin") {
      toast.warning("Impossible de supprimer un administrateur.");
      return;
    }

    setShowDeleteDialog(true);
  };

  const canDelete =
    currentUserRole === "admin" || (currentUserRole === "staff" && user.role !== "admin");

  const isSuperAdmin = currentUserEmail === "admin@bdefenelon.org";
  const canAssignPosition = isSuperAdmin && user.role === "admin";

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
          <DropdownMenuItem onClick={handleCopyEmail}>Copier l'email</DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setShowRoleDialog(true)}>
            <UserCog className="w-4 h-4 mr-2" />
            Changer le rôle
          </DropdownMenuItem>

          {canAssignPosition && (
            <DropdownMenuItem onSelect={() => setShowPositionDialog(true)}>
              <Crown className="w-4 h-4 mr-2 text-yellow-500" />
              Attribuer une position
            </DropdownMenuItem>
          )}

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
                <div className="text-base text-red-700/90 dark:text-red-300/90">
                  Attention, cette action est{" "}
                  <span className="font-black uppercase">irréversible</span>.
                  <br />
                  <br />
                  Vous êtes sur le point de supprimer définitivement le compte de :
                  <br />
                  <span className="font-bold text-lg block mt-1 p-2 bg-red-200/50 dark:bg-red-900/60 rounded-md border border-red-200 dark:border-red-800 text-center">
                    {user.name || user.email}
                  </span>
                  <br />
                  Toutes les données associées seront <span className="font-bold">effacées</span>.
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

      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Changement de rôle
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sélectionnez un nouveau rôle pour <strong>{user.name || user.email}</strong>.
            </AlertDialogDescription>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {[
                {
                  id: "adherent",
                  label: "Adhérent",
                  icon: <UserIcon className="mr-2 h-4 w-4 text-violet-600 dark:text-violet-400" />,
                },
                {
                  id: "staff",
                  label: "Staff",
                  icon: <Shield className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />,
                },
                {
                  id: "admin",
                  label: "Admin",
                  icon: (
                    <ShieldAlert className="mr-2 h-4 w-4 text-orange-600 dark:text-orange-400" />
                  ),
                },
              ].map((role) => (
                <Button
                  key={role.id}
                  variant={roleToSet === role.id ? "default" : "outline"}
                  className={cn("justify-start", roleToSet === role.id && "border-primary")}
                  onClick={() => setRoleToSet(role.id)}
                >
                  {role.icon}
                  {role.label}
                  {user.role === role.id && (
                    <span className="ml-auto text-xs text-muted-foreground">(Actuel)</span>
                  )}
                </Button>
              ))}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToSet(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} disabled={!roleToSet}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPositionDialog} onOpenChange={setShowPositionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Attribuer une position officielle
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sélectionnez une position pour <strong>{user.name}</strong>.
              <br />
              Seuls les administrateurs peuvent occuper ces postes.
            </AlertDialogDescription>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {["President", "Tresorier", "Secretaire", null].map((pos) => (
                <Button
                  key={pos || "Aucune"}
                  variant={positionToSet === pos ? "default" : "outline"}
                  className={cn("justify-start", positionToSet === pos && "border-primary")}
                  onClick={() => setPositionToSet(pos)}
                >
                  {pos === "President" && (
                    <Crown className="mr-2 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  )}
                  {pos === "Tresorier" && (
                    <Landmark className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {pos === "Secretaire" && (
                    <PenLine className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                  {pos || "Aucune position"}
                  {user.position === pos && (
                    <span className="ml-auto text-xs text-muted-foreground">(Actuel)</span>
                  )}
                </Button>
              ))}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPositionToSet(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPositionChange}
              disabled={positionToSet === undefined}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const getColumns = (
  currentUserRole: string,
  currentUserEmail?: string
): ColumnDef<User>[] => [
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
        <a href={`tel:${phone}`} className="hover:underline hover:text-primary transition-colors">
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
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => {
      const position = row.getValue("position") as string | null;
      if (!position) return <span className="text-muted-foreground">-</span>;

      const config: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
        President: {
          icon: <Crown className="w-3.5 h-3.5" />,
          className:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
          label: "Président",
        },
        Tresorier: {
          icon: <Landmark className="w-3.5 h-3.5" />,
          className:
            "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
          label: "Trésorier",
        },
        Secretaire: {
          icon: <PenLine className="w-3.5 h-3.5" />,
          className:
            "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30",
          label: "Secrétaire",
        },
      };

      const item = config[position];

      if (!item) {
        return <Badge variant="outline">{position}</Badge>;
      }

      return (
        <Badge variant="outline" className={cn("gap-1.5", item.className)}>
          {item.icon}
          {item.label}
        </Badge>
      );
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
    cell: ({ row }) => (
      <StaffActionsCell
        user={row.original}
        currentUserRole={currentUserRole}
        currentUserEmail={currentUserEmail}
      />
    ),
  },
];
