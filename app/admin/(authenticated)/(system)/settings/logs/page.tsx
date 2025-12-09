"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Search, RefreshCw, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { syncEmailLogs } from "./actions";

interface EmailLog {
  id: string;
  recipient: string;
  status: string;
  eventType: string;
  bounceMessage?: string;
  createdAt: string;
  campaign?: { name: string };
  booking?: { event: { title: string } };
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const autoSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoSync = useCallback(() => {
    if (autoSyncIntervalRef.current) clearInterval(autoSyncIntervalRef.current);
    autoSyncIntervalRef.current = setInterval(() => {
      if (!syncing) {
        handleSync(true); // Pass flag to indicate auto-sync
      }
    }, 10 * 60 * 1000); // 10 minutes
  }, [syncing]);

  useEffect(() => {
    startAutoSync();
    return () => {
      if (autoSyncIntervalRef.current) clearInterval(autoSyncIntervalRef.current);
    };
  }, [startAutoSync]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "18",
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (debouncedSearch) params.append("recipient", debouncedSearch);

      const res = await fetch(`/api/admin/logs/emails?${params}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error("Erreur lors du chargement des logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, statusFilter, debouncedSearch]);

  const handleSync = async (isAuto = false) => {
    setSyncing(true);
    try {
      const result = await syncEmailLogs();
      if (result.success) {
        toast.success(
          isAuto 
            ? `Auto-sync: ${result.count} emails synchronisés` 
            : `${result.count} emails synchronisés`
        );
        fetchLogs();
      } else {
        toast.error(`Erreur de synchronisation: ${result.error}`);
      }
    } catch (error) {
      toast.error("Erreur lors de la synchronisation");
    } finally {
      setSyncing(false);
      if (!isAuto) startAutoSync(); // Reset timer on manual sync
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Délivré
          </Badge>
        );
      case "sent":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Envoyé
          </Badge>
        );
      case "opened":
        return (
          <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Ouvert
          </Badge>
        );
      case "clicked":
        return (
          <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Cliqué
          </Badge>
        );
      case "failed":
      case "bounced":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {status === "bounced" ? "Rejeté" : "Échec"}
          </Badge>
        );
      case "complained":
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 gap-1">
            <AlertCircle className="h-3 w-3" />
            Plainte
          </Badge>
        );
      case "delivery_delayed":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20 gap-1">
            <AlertCircle className="h-3 w-3" />
            Retardé
          </Badge>
        );
      default:
        return <Badge variant="outline" className="border-white/10 text-muted-foreground">{status}</Badge>;
    }
  };

  const getSource = (log: EmailLog) => {
    if (log.campaign) return <span className="text-blue-400">Campagne: {log.campaign.name}</span>;
    if (log.booking) return <span className="text-purple-400">Réservation: {log.booking.event.title}</span>;
    return <span className="text-muted-foreground">Système</span>;
  };

  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Logs Emails</h1>
          <p className="text-muted-foreground mt-2">
            Historique complet et synchronisé de tous les emails envoyés.
          </p>
        </div>
        <Button 
          onClick={() => handleSync()} 
          disabled={syncing || loading}
          className="bg-white text-black hover:bg-white/90"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Synchronisation..." : "Synchroniser l'historique"}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1B1B1B]/50 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-white/20"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[200px] bg-[#1B1B1B]/50 border-white/10 text-white focus:ring-white/20">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="bg-[#1C1C1E] border-white/10 text-white">
            <SelectItem value="ALL" className="focus:bg-white/10 focus:text-white">Tous les statuts</SelectItem>
            <SelectItem value="sent" className="focus:bg-white/10 focus:text-white">Envoyé</SelectItem>
            <SelectItem value="delivered" className="focus:bg-white/10 focus:text-white">Délivré</SelectItem>
            <SelectItem value="delivery_delayed" className="focus:bg-white/10 focus:text-white">Retardé</SelectItem>
            <SelectItem value="complained" className="focus:bg-white/10 focus:text-white">Plainte</SelectItem>
            <SelectItem value="bounced" className="focus:bg-white/10 focus:text-white">Bounce</SelectItem>
            <SelectItem value="opened" className="focus:bg-white/10 focus:text-white">Ouvert</SelectItem>
            <SelectItem value="clicked" className="focus:bg-white/10 focus:text-white">Cliqué</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1B1B1B]/50 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground w-[180px]">Date</TableHead>
              <TableHead className="text-muted-foreground">Destinataire</TableHead>
              <TableHead className="text-muted-foreground">Source</TableHead>
              <TableHead className="text-muted-foreground w-[150px]">Statut</TableHead>
              <TableHead className="text-muted-foreground text-right">Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <p>Chargement des logs...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Mail className="h-8 w-8 opacity-50" />
                    <p>Aucun email trouvé pour le moment.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-white/5 transition-colors hover:bg-white/5">
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium text-white">{log.recipient}</TableCell>
                  <TableCell className="text-sm">{getSource(log)}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground max-w-[200px] truncate" title={log.bounceMessage || log.eventType}>
                    {log.bounceMessage ? (
                      <span className="text-red-400 font-medium">{log.bounceMessage}</span>
                    ) : (
                      <span className="capitalize">{log.eventType}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-50"
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground min-w-[100px] text-center">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-50"
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
