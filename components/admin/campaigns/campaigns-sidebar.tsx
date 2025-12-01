"use client";

import { useState, useEffect } from "react";
import { Folder, Plus, MoreVertical, Pencil, Trash2, FolderOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  createFolder,
  deleteFolder,
  getFolders,
  updateFolder,
} from "@/app/admin/campaigns/actions";
import { toast } from "sonner";

interface TemplateFolder {
  id: string;
  name: string;
  _count: {
    templates: number;
  };
}

interface CampaignsSidebarProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function CampaignsSidebar({ selectedFolderId, onSelectFolder }: CampaignsSidebarProps) {
  const [folders, setFolders] = useState<TemplateFolder[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<TemplateFolder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const data = await getFolders();
      setFolders(data);
    } catch (error) {
      console.error("Failed to load folders:", error);
      toast.error("Erreur lors du chargement des dossiers");
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    setIsLoading(true);
    try {
      await createFolder(folderName);
      setFolderName("");
      setIsCreateOpen(false);
      loadFolders();
      toast.success("Dossier créé");
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Erreur lors de la création du dossier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameFolder = async () => {
    if (!selectedFolder || !folderName.trim()) return;
    setIsLoading(true);
    try {
      await updateFolder(selectedFolder.id, folderName);
      setFolderName("");
      setIsRenameOpen(false);
      setSelectedFolder(null);
      loadFolders();
      toast.success("Dossier renommé");
    } catch (error) {
      console.error("Failed to rename folder:", error);
      toast.error("Erreur lors du renommage du dossier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;
    setIsLoading(true);
    try {
      await deleteFolder(selectedFolder.id);
      setIsDeleteOpen(false);
      setSelectedFolder(null);
      if (selectedFolderId === selectedFolder.id) {
        onSelectFolder(null);
      }
      loadFolders();
      toast.success("Dossier supprimé");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      toast.error("Erreur lors de la suppression du dossier");
    } finally {
      setIsLoading(false);
    }
  };

  const openRenameDialog = (folder: TemplateFolder) => {
    setSelectedFolder(folder);
    setFolderName(folder.name);
    setIsRenameOpen(true);
  };

  const openDeleteDialog = (folder: TemplateFolder) => {
    setSelectedFolder(folder);
    setIsDeleteOpen(true);
  };

  return (
    <div className="w-64 border-r bg-muted/10 flex flex-col h-full">
      <div className="p-4 border-b">
        <Button className="w-full justify-start gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouveau dossier
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2">
          <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">Favoris</h3>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 mb-1",
              selectedFolderId === null && "bg-accent text-accent-foreground"
            )}
            onClick={() => onSelectFolder(null)}
          >
            <FolderOpen className="h-4 w-4" />
            Tous les templates
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 mb-1 opacity-50 cursor-not-allowed"
            disabled
          >
            <Star className="h-4 w-4" />
            Favoris (Bientôt)
          </Button>
        </div>

        <div className="px-3 mt-6">
          <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2">Dossiers</h3>
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={cn(
                "group flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors mb-1",
                selectedFolderId === folder.id && "bg-accent text-accent-foreground"
              )}
            >
              <button
                className="flex items-center gap-2 flex-1 text-left truncate"
                onClick={() => onSelectFolder(folder.id)}
              >
                <Folder className="h-4 w-4 shrink-0" />
                <span className="truncate">{folder.name}</span>
                {folder._count.templates > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {folder._count.templates}
                  </span>
                )}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openRenameDialog(folder)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Renommer
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openDeleteDialog(folder)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
            <DialogDescription>Créez un dossier pour organiser vos templates.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Nom du dossier"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateFolder} disabled={isLoading}>
              {isLoading ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer le dossier</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nom du dossier"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleRenameFolder} disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le dossier</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce dossier ? Les templates à l'intérieur ne seront
              pas supprimés mais déplacés vers "Tous les templates".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder} disabled={isLoading}>
              {isLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
