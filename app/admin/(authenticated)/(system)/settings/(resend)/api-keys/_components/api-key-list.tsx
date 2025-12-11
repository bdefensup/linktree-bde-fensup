"use client";


import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Key, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteApiKey, getApiKeys } from "../actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  last_used_at?: string; // Optional as it might not be present on new keys
}

interface ApiKeyListProps {
  apiKeys: ApiKey[];
}

export function ApiKeyList({ apiKeys: initialApiKeys }: ApiKeyListProps) {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Update state when props change (e.g. after router.refresh())
  useEffect(() => {
    setApiKeys(initialApiKeys);
  }, [initialApiKeys]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const keys = await getApiKeys();
        // Ensure we have an array
        if (Array.isArray(keys)) {
          setApiKeys(keys as ApiKey[]);
        } else if ((keys as any)?.data && Array.isArray((keys as any).data)) {
           // Handle potential different return structure
           setApiKeys((keys as any).data);
        }
      } catch (error) {
        console.error("Failed to refresh API keys", error);
      }
    };

    const interval = setInterval(fetchKeys, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette clé API ? Cette action est irréversible.")) return;
    setDeletingId(id);

    try {
      const result = await deleteApiKey(id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Clé API supprimée");
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
            <TableHead className="text-muted-foreground w-[40%]">Nom</TableHead>
            <TableHead className="text-muted-foreground">Créée le</TableHead>
            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!Array.isArray(apiKeys) || apiKeys.length === 0 ? (
            <TableRow className="border-white/5 hover:bg-white/5">
              <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Key className="h-6 w-6 opacity-50" />
                  </div>
                  <p>Aucune clé API trouvée.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            apiKeys.map((key) => (
              <TableRow key={key.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{key.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{key.id}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(key.created_at), "dd MMM yyyy", { locale: fr })}
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
                        onClick={() => handleDelete(key.id)}
                        disabled={deletingId === key.id}
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
