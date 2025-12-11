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
import { Trash2, Webhook, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteWebhook } from "../actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface Webhook {
  id: string;
  url: string;
  event_types: string[];
  created_at: string;
}

interface WebhookListProps {
  webhooks: Webhook[];
}

export function WebhookList({ webhooks }: WebhookListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce webhook ?")) return;
    setDeletingId(id);

    try {
      const result = await deleteWebhook(id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Webhook supprimé");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#1B1B1B]/50 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-muted-foreground w-[40%]">URL Endpoint</TableHead>
            <TableHead className="text-muted-foreground">Événements</TableHead>
            <TableHead className="text-muted-foreground">Créé le</TableHead>
            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {webhooks.length === 0 ? (
            <TableRow className="border-white/5 hover:bg-white/5">
              <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Webhook className="h-6 w-6 opacity-50" />
                  </div>
                  <p>Aucun webhook configuré.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            webhooks.map((webhook) => (
              <TableRow key={webhook.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-white truncate max-w-[300px]" title={webhook.url}>
                      {webhook.url}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">{webhook.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(webhook.event_types || []).map((event) => (
                      <Badge key={event} variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs font-normal">
                        {event.replace('email.', '')}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(webhook.created_at), "dd MMM yyyy", { locale: fr })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1C1C1E] border-white/10 text-white">
                      <DropdownMenuItem 
                        className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                        onClick={() => handleDelete(webhook.id)}
                        disabled={deletingId === webhook.id}
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
  );
}
