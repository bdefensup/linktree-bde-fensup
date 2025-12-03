"use client";

import { useState, useEffect } from "react";
import {
  Folder,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  FolderOpen,
  Calendar,
  Users,
  ChevronRight,
  Download,
  Settings,
  HelpCircle,
} from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  createFolder,
  deleteFolder,
  getFolders,
  updateFolder,
} from "@/app/admin/(authenticated)/campaigns/actions";
import { toast } from "sonner";
import { useDroppable } from "@dnd-kit/core";

interface TemplateFolder {
  id: string;
  name: string;
  templates: {
    id: string;
    name: string;
    updatedAt: Date;
  }[];
  _count: {
    templates: number;
  };
}

interface CampaignsSidebarProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onSelectTemplate?: (template: any) => void;
  onCreateTemplate: () => void;
}

function DroppableFolder({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(className, isOver && "bg-white/10 ring-1 ring-white/20 rounded-md")}
    >
      {children}
    </div>
  );
}

export function CampaignsSidebar({
  selectedFolderId,
  onSelectFolder,
  onSelectTemplate,
  onCreateTemplate,
}: CampaignsSidebarProps) {
  const [folders, setFolders] = useState<TemplateFolder[]>([]);
  const [unsortedTemplates, setUnsortedTemplates] = useState<{ id: string; name: string }[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<TemplateFolder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFolders();
    loadUnsortedTemplates();
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

  const loadUnsortedTemplates = async () => {
    try {
      const { getTemplates } = await import("@/app/admin/(authenticated)/campaigns/actions");
      const data = await getTemplates(null);
      setUnsortedTemplates(data);
    } catch (error) {
      console.error("Failed to load unsorted templates:", error);
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
    <div className="w-64 shrink-0 m-4 rounded-2xl border bg-[#1B1B1B]/70 backdrop-blur-2xl supports-backdrop-filter:bg-[#1B1B1B]/50 text-sidebar-foreground flex flex-col h-[calc(100%-2rem)] font-sans text-sm shadow-2xl ring-1 ring-white/10 p-4">
      {/* Top Section */}
      <div className="p-3 space-y-1">
        <Button
          className="w-full justify-start gap-2 bg-white text-black hover:bg-white/90 mb-4 shadow-lg shadow-white/5"
          onClick={onCreateTemplate}
        >
          <Plus className="h-4 w-4" />
          Nouveau template
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          onClick={() => setIsCreateOpen(true)}
        >
          <Folder className="h-4 w-4" />
          Nouveau dossier
        </Button>
        <Button
          variant={selectedFolderId === null ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-2",
            selectedFolderId === null
              ? "bg-white/10 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
          onClick={() => onSelectFolder(null)}
        >
          <FolderOpen className="h-4 w-4" />
          Tous les templates
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Calendrier */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <Calendar className="h-4 w-4" />
            Calendrier
          </Button>
        </div>

        {/* Partagé avec moi */}
        <div>
          <h3 className="px-2 mb-1 text-xs font-medium text-muted-foreground/70 flex items-center gap-2">
            <Users className="h-3 w-3" />
            Partagé avec moi
          </h3>
        </div>

        {/* Favoris */}
        <div>
          <h3 className="px-2 mb-1 text-xs font-medium text-muted-foreground/70">Favoris</h3>
          <p className="px-2 text-xs text-muted-foreground/50 italic">
            Star Docs pour les garder près de vous
          </p>
        </div>

        {/* Dossiers */}
        <Accordion type="multiple" defaultValue={["dossiers"]} className="w-full">
          <AccordionItem value="dossiers" className="border-none">
            <div className="flex items-center justify-between px-2 mb-1 group">
              <AccordionTrigger className="py-1 hover:no-underline text-xs font-medium text-muted-foreground/70 [&>svg]:hidden">
                Dossiers
                <ChevronRight className="h-3 w-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
              </AccordionTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreateOpen(true);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <AccordionContent className="pb-0">
              <div className="space-y-0.5">
                {/* Non trié */}
                <Accordion type="single" collapsible className="w-full">
                  <DroppableFolder id="unsorted" className="w-full">
                    <AccordionItem value="unsorted" className="border-none">
                      <AccordionTrigger className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer hover:bg-white/5 hover:text-foreground hover:no-underline [&>svg]:hidden">
                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                          <ChevronRight className="h-3 w-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                          <FolderOpen className="h-4 w-4 shrink-0" />
                          <span className="truncate">Non trié</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-6 pt-1 pb-1">
                        {unsortedTemplates.map((template) => (
                          <div
                            key={template.id}
                            className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-white/5 cursor-pointer text-muted-foreground hover:text-foreground"
                            onClick={() => onSelectTemplate?.(template)}
                          >
                            <span className="truncate text-xs">{template.name}</span>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </DroppableFolder>
                </Accordion>

                {/* Folders */}
                {folders.map((folder) => (
                  <Accordion type="single" collapsible key={folder.id} className="w-full">
                    <DroppableFolder id={folder.id} className="w-full">
                      <AccordionItem value={folder.id} className="border-none">
                        <div
                          className={cn(
                            "group flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer",
                            selectedFolderId === folder.id
                              ? "bg-white/10 text-foreground"
                              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                          )}
                        >
                          <AccordionTrigger className="flex-1 hover:no-underline py-0 [&>svg]:hidden">
                            <div
                              className="flex items-center gap-2 flex-1 overflow-hidden"
                              onClick={() => {
                                // e.stopPropagation(); // Let accordion trigger
                                onSelectFolder(folder.id);
                              }}
                            >
                              <ChevronRight className="h-3 w-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                              <Folder className="h-4 w-4 shrink-0" />
                              <span className="truncate">{folder.name}</span>
                            </div>
                          </AccordionTrigger>
                          {folder.templates.length > 0 && (
                            <span className="text-[10px] text-muted-foreground/50 ml-2">
                              {folder.templates.length}
                            </span>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-white/10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-40 bg-[#1C1C1E] border-white/10 text-muted-foreground"
                            >
                              <DropdownMenuItem
                                onClick={() => openRenameDialog(folder)}
                                className="hover:bg-white/10 hover:text-foreground focus:bg-white/10 focus:text-foreground"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Renommer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(folder)}
                                className="text-red-500 focus:text-red-500 hover:bg-red-500/10 focus:bg-red-500/10"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <AccordionContent className="pl-6 pt-1 pb-1">
                          {folder.templates.map((template) => (
                            <div
                              key={template.id}
                              className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-white/5 cursor-pointer text-muted-foreground hover:text-foreground"
                              onClick={() => onSelectTemplate?.(template)}
                            >
                              <span className="truncate text-xs">{template.name}</span>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </DroppableFolder>
                  </Accordion>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Tags */}
        <div>
          <h3 className="px-2 mb-1 text-xs font-medium text-muted-foreground/70">Tags</h3>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/5 flex items-center gap-1 mt-auto">
        <Button
          variant={selectedFolderId === "trash" ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "h-8 w-8",
            selectedFolderId === "trash"
              ? "bg-white/10 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
          onClick={() => onSelectFolder("trash")}
          title="Corbeille"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="relative">
          <input
            type="file"
            accept=".md"
            className="hidden"
            id="import-template"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const text = await file.text();
              const name = file.name.replace(".md", "");

              try {
                const { importTemplate } = await import("@/app/admin/(authenticated)/campaigns/actions");
                await importTemplate(
                  name,
                  text,
                  selectedFolderId === "trash" ? null : selectedFolderId
                );
                e.target.value = "";
              } catch (error) {
                console.error("Failed to import template:", error);
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5"
            onClick={() => document.getElementById("import-template")?.click()}
            title="Importer un template (.md)"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5"
          title="Paramètres"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5"
          title="Aide"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1C1C1E] border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Créez un dossier pour organiser vos templates.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Nom du dossier"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="col-span-3 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-white/20"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="bg-transparent border-white/10 text-foreground hover:bg-white/5 hover:text-foreground"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={isLoading}
              className="bg-white text-black hover:bg-white/90"
            >
              {isLoading ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1C1C1E] border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle>Renommer le dossier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Nom du dossier"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="col-span-3 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-white/20"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameOpen(false)}
              className="bg-transparent border-white/10 text-foreground hover:bg-white/5 hover:text-foreground"
            >
              Annuler
            </Button>
            <Button
              onClick={handleRenameFolder}
              disabled={isLoading}
              className="bg-white text-black hover:bg-white/90"
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1C1C1E] border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle>Supprimer le dossier</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer ce dossier ? Les templates à l'intérieur ne seront
              pas supprimés mais déplacés vers "Tous les templates".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="bg-transparent border-white/10 text-foreground hover:bg-white/5 hover:text-foreground"
            >
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
