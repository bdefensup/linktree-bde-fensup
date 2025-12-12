"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, MoreVertical, Pencil, Trash2, Archive, Search, X, CalendarIcon } from "lucide-react";
import { getCampaigns, deleteCampaign, archiveCampaign, bulkDeleteCampaigns, bulkArchiveCampaigns } from "./actions";
import { toast } from "sonner";
import { formatDistanceToNow, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const campaignsData = await getCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };



  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette campagne ?")) return;
    try {
      await deleteCampaign(id);
      toast.success("Campagne supprimée");
      loadData();
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveCampaign(id);
      toast.success("Campagne archivée");
      loadData();
    } catch (error) {
      console.error("Failed to archive campaign:", error);
      toast.error("Erreur lors de l'archivage");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.size} campagnes ?`)) return;
    try {
      await bulkDeleteCampaigns(Array.from(selectedIds));
      toast.success(`${selectedIds.size} campagnes supprimées`);
      setSelectedIds(new Set());
      loadData();
    } catch (error) {
      console.error("Failed to bulk delete:", error);
      toast.error("Erreur lors de la suppression groupée");
    }
  };

  const handleBulkArchive = async () => {
    try {
      await bulkArchiveCampaigns(Array.from(selectedIds));
      toast.success(`${selectedIds.size} campagnes archivées`);
      setSelectedIds(new Set());
      loadData();
    } catch (error) {
      console.error("Failed to bulk archive:", error);
      toast.error("Erreur lors de l'archivage groupé");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredCampaigns.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCampaigns.map(c => c.id)));
    }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      // Search filter
      const matchesSearch = 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (campaign.subject && campaign.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Date filter
      const matchesDate = dateFilter 
        ? isSameDay(new Date(campaign.updatedAt), dateFilter)
        : true;

      return matchesSearch && matchesDate;
    });
  }, [campaigns, searchQuery, dateFilter]);

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
      case "ARCHIVED":
        return <Badge variant="outline" className="text-muted-foreground">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Campagnes</h1>
          <p className="text-muted-foreground mt-1">Gérez vos communications par e-mail</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/admin/campaigns/new")}
            className="bg-white text-black hover:bg-white/90 font-medium"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Button>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Campagnes</h1>
          <p className="text-muted-foreground mt-1">Gérez vos communications par e-mail</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/admin/campaigns/new")}
            className="bg-white text-black hover:bg-white/90 font-medium"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Button>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[#1C1C1E] p-4 rounded-xl border border-white/5">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une campagne..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-white/20 h-10"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal bg-black/20 border-white/10 h-10 hover:bg-white/5 hover:text-white",
                  !dateFilter && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP", { locale: fr }) : <span>Filtrer par date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1C1C1E] border-white/10 text-white" align="start">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
                className="bg-[#1C1C1E] text-white"
              />
            </PopoverContent>
          </Popover>
          
          {dateFilter && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setDateFilter(undefined)}
              className="h-10 w-10 hover:bg-white/10 text-muted-foreground hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-right-2">
            <span className="text-sm font-medium text-primary mr-2">
              {selectedIds.size} sélectionné(s)
            </span>
            <div className="h-4 w-px bg-primary/20 mx-2" />
            <Button size="sm" variant="ghost" onClick={handleBulkArchive} className="h-8 text-primary hover:text-primary hover:bg-primary/20">
              <Archive className="mr-2 h-3 w-3" />
              Archiver
            </Button>
            <Button size="sm" variant="ghost" onClick={handleBulkDelete} className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <Trash2 className="mr-2 h-3 w-3" />
              Supprimer
            </Button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#1C1C1E] shadow-xl">
        <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[50px] pl-6">
                <Checkbox 
                  checked={filteredCampaigns.length > 0 && selectedIds.size === filteredCampaigns.length}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Campagne</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Statut</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Envoyés</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Ouvertures</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Clics</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mise à jour</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span className="text-sm">Chargement des campagnes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                      <Search className="h-6 w-6 opacity-50" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-medium text-white">Aucune campagne trouvée</span>
                      <span className="text-sm">Essayez de modifier vos filtres ou créez une nouvelle campagne.</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCampaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  className="group border-white/5 transition-all hover:bg-white/2 data-[state=selected]:bg-primary/5"
                  data-state={selectedIds.has(campaign.id) ? "selected" : undefined}
                >
                  <TableCell className="pl-6">
                    <Checkbox 
                      checked={selectedIds.has(campaign.id)}
                      onCheckedChange={() => toggleSelection(campaign.id)}
                      aria-label={`Select ${campaign.name}`}
                      className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 py-1">
                      <span className="font-medium text-white group-hover:text-primary transition-colors">
                        {campaign.name}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                        {campaign.subject || "Sans objet"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground group-hover:text-white transition-colors">
                    {campaign.sentCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground group-hover:text-white transition-colors">
                    {campaign.openCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground group-hover:text-white transition-colors">
                    {campaign.clickCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(campaign.updatedAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-muted-foreground hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 border-white/10 bg-[#1C1C1E] text-white shadow-xl">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                          className="cursor-pointer hover:bg-white/10 focus:bg-white/10 gap-2 py-2.5"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                          <span>Éditer</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleArchive(campaign.id)}
                          className="cursor-pointer hover:bg-white/10 focus:bg-white/10 gap-2 py-2.5"
                        >
                          <Archive className="h-4 w-4 text-muted-foreground" />
                          <span>Archiver</span>
                        </DropdownMenuItem>
                        <div className="h-px bg-white/10 my-1" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(campaign.id)}
                          className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 gap-2 py-2.5"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Supprimer</span>
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
