"use client";

import {
  createTemplate,
  deleteTemplate,
  getDeletedTemplates,
  getTemplates,
  permanentDeleteTemplate,
  restoreTemplate,
} from "@/app/admin/campaigns/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Copy, FileText, MoreVertical, Plus, Trash, Trash2, Undo } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: unknown;
  updatedAt: Date;
  deletedAt?: Date | null;
}

interface TemplateListProps {
  selectedFolderId: string | null;
  onSelectTemplate: (template: EmailTemplate) => void;
}

export function TemplateList({ selectedFolderId, onSelectTemplate }: TemplateListProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isTrash = selectedFolderId === "trash";

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = isTrash ? await getDeletedTemplates() : await getTemplates(selectedFolderId);
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error("Erreur lors du chargement des templates");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFolderId, isTrash]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreateTemplate = async () => {
    const name = "Nouveau template";
    try {
      const newTemplate = await createTemplate(
        name,
        selectedFolderId === "trash" ? null : selectedFolderId
      );
      loadTemplates();
      onSelectTemplate(newTemplate);
      toast.success("Template créé");
    } catch (error) {
      console.error("Failed to create template:", error);
      toast.error("Erreur lors de la création du template");
    }
  };

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) return;

    try {
      if (isTrash) {
        await permanentDeleteTemplate(id);
        toast.success("Template supprimé définitivement");
      } else {
        await deleteTemplate(id);
        toast.success("Template déplacé dans la corbeille");
      }
      loadTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Erreur lors de la suppression du template");
    }
  };

  const handleRestoreTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await restoreTemplate(id);
      loadTemplates();
      toast.success("Template restauré");
    } catch (error) {
      console.error("Failed to restore template:", error);
      toast.error("Erreur lors de la restauration du template");
    }
  };

  const handleDuplicateTemplate = async (_template: EmailTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // For now, we just create a new one. Ideally we'd copy content.
      // Since we don't fetch content in list, we might need a specific duplicate action or fetch full content first.
      // Let's keep it simple: just create new for now, or implement duplicate action later.
      // Actually, let's just create a new one with "Copie de ..." name.
      // But we need the content to duplicate it properly.
      // I'll skip duplication logic for now to keep it simple or add a TODO.
      toast.info("Fonctionnalité de duplication à venir");
    } catch (error) {
      console.error("Failed to duplicate template:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100%-2rem)] m-4 ml-0 overflow-hidden rounded-2xl border bg-[#1B1B1B]/70 backdrop-blur-2xl supports-backdrop-filter:bg-[#1B1B1B]/50 shadow-2xl ring-1 ring-white/10">
      <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {isTrash ? "Corbeille" : "Templates"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 ">
            {templates.length} template{templates.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Chargement des templates...</p>
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-muted/10 ">
            {isTrash ? (
              <>
                <Trash2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Corbeille vide</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Les templates supprimés apparaîtront ici.
                </p>
              </>
            ) : (
              <>
                <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50 bg-primary/10 rounded-full p-2" />
                <h3 className="text-lg font-semibold mb-2">Aucun template</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Ce dossier est vide. Créez votre premier template pour commencer.
                </p>
                <Button onClick={handleCreateTemplate} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un template
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="group cursor-pointer hover:scale-[1.02] transition-all duration-300 border-white/5 bg-[#252525]/50 hover:bg-[#252525] hover:border-white/10 hover:shadow-2xl relative overflow-hidden rounded-xl backdrop-blur-sm flex flex-col aspect-3/4"
                onClick={() => !isTrash && onSelectTemplate(template)}
              >
                {/* Hover Action Button */}
                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-lg bg-white/10 hover:bg-[#252525] text-white backdrop-blur-md border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#1B1B1B] border-white/10 text-white z-50 backdrop-blur-none"
                    >
                      {isTrash ? (
                        <>
                          <DropdownMenuItem
                            onClick={(e) => handleRestoreTemplate(template.id, e)}
                            className="focus:bg-[#252525] focus:text-white cursor-pointer"
                          >
                            <Undo className="mr-2 h-4 w-4" />
                            Restaurer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteTemplate(template.id, e)}
                            className="text-red-600 focus:text-red-600 focus:bg-[#252525] cursor-pointer"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer définitivement
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem
                            onClick={(e) => handleDuplicateTemplate(template, e)}
                            className="focus:bg-[#252525] focus:text-white cursor-pointer"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteTemplate(template.id, e)}
                            className="text-red-600 focus:text-red-600 focus:bg-[#252525] cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Header: Title & Date */}
                <div className="px-4 py-2 z-10 relative shrink-0">
                  <h3 className="font-semibold text-xl truncate text-foreground transition-colors duration-300">
                    {template.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground truncate mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {isTrash ? "Supprimé " : "Mis à jour "}
                      {formatDistanceToNow(
                        new Date(isTrash ? template.deletedAt! : template.updatedAt),
                        {
                          addSuffix: true,
                          locale: fr,
                        }
                      )}
                    </span>
                  </p>
                </div>

                {/* Body: Preview */}
                <div className="flex-1 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                  <div
                    className="text-3xl text-muted-foreground leading-relaxed opacity-70 select-none pointer-events-none pl-8 w-[200%] transform scale-50 origin-top-left h-[200%]"
                    dangerouslySetInnerHTML={{
                      __html:
                        typeof template.content === "string"
                          ? template.content
                          : JSON.stringify(template.content),
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
