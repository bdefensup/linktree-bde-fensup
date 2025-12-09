"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Pencil, Trash2, BarChart2 } from "lucide-react";
import { getCampaigns, deleteCampaign } from "./actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
      toast.error("Erreur lors du chargement des campagnes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette campagne ?")) return;
    try {
      await deleteCampaign(id);
      toast.success("Campagne supprimée");
      loadCampaigns();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary">Brouillon</Badge>;
      case "SENT":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Envoyé</Badge>
        );
      case "SCHEDULED":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Planifié</Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campagnes</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos campagnes d'e-mails et suivez leurs performances.
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/campaigns/new")}
          className="bg-white text-black hover:bg-white/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle campagne
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1B1B1B]/50 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Nom</TableHead>
              <TableHead className="text-muted-foreground">Statut</TableHead>
              <TableHead className="text-muted-foreground">Envoyé</TableHead>
              <TableHead className="text-muted-foreground">Ouvertures</TableHead>
              <TableHead className="text-muted-foreground">Clics</TableHead>
              <TableHead className="text-muted-foreground">Dernière modif.</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground h-32 text-center">
                  Aucune campagne trouvée. Créez votre première campagne !
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  className="border-white/5 transition-colors hover:bg-white/5"
                >
                  <TableCell className="text-foreground font-medium">
                    {campaign.name}
                    <div className="text-muted-foreground mt-0.5 text-xs">{campaign.subject}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{campaign.sentCount}</TableCell>
                  <TableCell className="text-muted-foreground">{campaign.openCount}</TableCell>
                  <TableCell className="text-muted-foreground">{campaign.clickCount}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(campaign.updatedAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-white/10 bg-[#1C1C1E]">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                          className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                        >
                          {campaign.status === "SENT" ? (
                            <>
                              <BarChart2 className="mr-2 h-4 w-4" />
                              Stats
                            </>
                          ) : (
                            <>
                              <Pencil className="mr-2 h-4 w-4" />
                              Éditer
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(campaign.id)}
                          className="cursor-pointer text-red-500 hover:bg-red-500/10 focus:bg-red-500/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
