"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCampaign } from "../../actions";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save, FileText, Loader2, Paperclip, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { AdvancedEditor } from "@/components/editor/advanced-editor";
import { supabase } from "@/lib/supabase";

interface Attachment {
  url: string;
  name: string;
  size: number;
}

interface CampaignContentEditorProps {
  campaign: any;
  templates: any[];
}

export function CampaignContentEditor({ campaign, templates }: CampaignContentEditorProps) {
  const [subject, setSubject] = useState(campaign.subject || "");
  const [content, setContent] = useState(
    typeof campaign.content === "string" ? campaign.content : (campaign.content ? JSON.stringify(campaign.content) : "")
  );
  const [attachments, setAttachments] = useState<Attachment[]>((campaign.attachments as Attachment[]) || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const router = useRouter();

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("campaign-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("campaign-attachments")
        .getPublicUrl(filePath);

      setAttachments([...attachments, { url: data.publicUrl, name: file.name, size: file.size }]);
      toast.success("Fichier ajouté");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erreur lors de l'upload (Vérifiez que le bucket 'campaign-attachments' existe)");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleSave = async (redirectUrl?: string) => {
    setIsSaving(true);
    try {
      await updateCampaign(campaign.id, {
        subject,
        content: content,
        attachments: attachments,
      } as any);
      toast.success("Sauvegardé");
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save campaign:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTemplate = (template: any) => {
    if (!confirm("Le contenu actuel sera remplacé. Continuer ?")) return;

    const templateContent =
      typeof template.content === "string" ? template.content : JSON.stringify(template.content);

    setContent(templateContent);
    setIsTemplateDialogOpen(false);
    toast.success("Template chargé");
  };

  return (
    <div className="flex h-full flex-col bg-black p-4">
      <div className="supports-backdrop-filter:bg-[#1B1B1B]/50 flex flex-1 flex-col overflow-hidden rounded-2xl border bg-[#1B1B1B]/70 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#1B1B1B]/50 p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/campaigns")}
              className="rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{campaign.name}</h1>
              <p className="text-muted-foreground text-sm">Étape 2 : Contenu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>

            <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 hover:bg-white/10"
                      suppressHydrationWarning
                    >
                      <FileText className="mr-2 h-3 w-3" />
                      Charger un template
                    </Button>
                  </DialogTrigger>
                  </Dialog>
                  <Button
              variant="outline"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="text-foreground border-white/10 bg-transparent hover:bg-white/5"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Sauvegarder
            </Button>
            <Button
              onClick={() => handleSave(`/admin/campaigns/${campaign.id}/send`)}
              disabled={isSaving}
              className="bg-white text-black hover:bg-white/90"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="mx-auto flex h-full w-full max-w-full flex-col gap-4">
            <div className="grid gap-2 shrink-0">
              <label className="text-sm font-medium">Objet de l'e-mail</label>
              <Input
                placeholder="Ex: Découvrez nos nouveautés !"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-white/10 bg-white/5"
              />
            </div>

            <div className="grid gap-2 shrink-0">
              <label className="text-sm font-medium">Pièces jointes</label>
              <div className="flex flex-col gap-2">
                {attachments.map((att, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 p-2 px-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{att.name}</span>
                      <span className="text-xs text-muted-foreground">({(att.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-red-500/10 hover:text-red-500"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    id="attachment-upload"
                    className="hidden"
                    onChange={handleUploadAttachment}
                    disabled={isUploading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed border-white/20 bg-white/5 hover:bg-white/10"
                    onClick={() => document.getElementById("attachment-upload")?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="mr-2 h-4 w-4" />
                    )}
                    Ajouter une pièce jointe
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-2 min-h-0">
              <div className="flex items-center justify-between shrink-0">
                <label className="text-sm font-medium">Contenu</label>
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  
                  <DialogContent className="text-foreground max-w-2xl border-white/10 bg-[#1C1C1E]">
                    <DialogHeader>
                      <DialogTitle>Choisir un template</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="mt-4 h-[400px]">
                      <div className="grid grid-cols-2 gap-4 p-1">
                        {templates.map((t) => (
                          <Card
                            key={t.id}
                            className="cursor-pointer border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                            onClick={() => handleLoadTemplate(t)}
                          >
                            <h3 className="truncate font-semibold">{t.name}</h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {t.subject || "Sans objet"}
                            </p>
                          </Card>
                        ))}
                        {templates.length === 0 && (
                          <div className="text-muted-foreground col-span-2 py-8 text-center">
                            Aucun template disponible.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="h-full overflow-hidden rounded-xl border border-white/10">
                <AdvancedEditor
                  initialContent={content}
                  onChange={setContent}
                  className="border-0 h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
