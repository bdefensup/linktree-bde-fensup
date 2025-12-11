"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, ExternalLink, CheckCircle, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Domain {
  id: string;
  name: string;
  status: string;
  region: string;
  created_at: string;
}

interface DomainListProps {
  domains: Domain[];
}

export function DomainList({ domains }: DomainListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce domaine ?")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/domains/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete domain");

      toast.success("Domaine supprimé");
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la suppression du domaine");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 gap-1">
            <CheckCircle className="h-3 w-3" /> Vérifié
          </Badge>
        );
      case "failed":
      case "temporary_failure":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Échec
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" /> En attente
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#1B1B1B]/50 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-muted-foreground">Nom</TableHead>
            <TableHead className="text-muted-foreground">Statut</TableHead>
            <TableHead className="text-muted-foreground">Région</TableHead>
            <TableHead className="text-muted-foreground">Créé le</TableHead>
            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {domains.length === 0 ? (
            <TableRow className="border-white/5 hover:bg-white/5">
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Aucun domaine trouvé. Ajoutez-en un pour commencer.
              </TableCell>
            </TableRow>
          ) : (
            domains.map((domain) => (
              <TableRow key={domain.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-medium text-white">{domain.name}</TableCell>
                <TableCell>{getStatusBadge(domain.status)}</TableCell>
                <TableCell className="text-muted-foreground uppercase">{domain.region}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(domain.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild className="hover:bg-white/10">
                      <Link href={`/admin/settings/domains/${domain.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => handleDelete(domain.id)}
                      disabled={deletingId === domain.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
