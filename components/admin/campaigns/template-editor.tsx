"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AdvancedEditor } from "@/components/editor/advanced-editor";
import { updateTemplate } from "@/app/admin/(authenticated)/(communication)/campaigns/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: unknown; // JSON
  updatedAt: Date;
}

interface TemplateEditorProps {
  template: EmailTemplate;
  onBack: () => void;
  onUpdate: (template: EmailTemplate) => void;
}

export function TemplateEditor({ template, onBack, onUpdate }: TemplateEditorProps) {
  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [content, setContent] = useState(
    typeof template.content === "string" ? template.content : JSON.stringify(template.content) // Tiptap expects HTML string or JSON
  );
  // Note: AdvancedEditor expects HTML string. If content is JSON, we might need to convert it or let Tiptap handle it if configured.
  // For simplicity, let's assume we store HTML string in the JSON field for now, or we rely on Tiptap's ability to parse.
  // Actually, my AdvancedEditor implementation expects a string (HTML).
  // If `template.content` is a JSON object (Tiptap JSON), we need to convert it to HTML or modify AdvancedEditor to accept JSON.
  // But `AdvancedEditor` uses `useEditor` with `content: value`. Tiptap handles JSON or HTML.
  // However, `onChange` returns HTML. So we are storing HTML string in the DB?
  // The schema says `content Json`. So we should probably store the JSON object.
  // But `AdvancedEditor` returns HTML string in `onChange`.
  // Let's adjust `AdvancedEditor` to return JSON or store HTML string in the JSON field (as a string value).
  // Storing HTML string in a JSON field is fine: `content: "<div>...</div>"`.

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setName(template.name);
    setSubject(template.subject);
    // Ensure content is a string for the editor if possible, or pass object if Tiptap handles it.
    // My AdvancedEditor props say `value: string`.
    // If template.content is an object, I might need to convert it.
    // But wait, if I save it as HTML string, it will be a string.
    // If it's empty object `{}` (default), Tiptap might treat it as empty content.
    setContent((template.content as string) || "");
  }, [template]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateTemplate(template.id, {
        name,
        subject,
        content: content, // Saving HTML string into JSON field
      });
      onUpdate(updated as unknown as EmailTemplate);
      setHasChanges(false);
      toast.success("Template enregistré");
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black p-4">
      <div className="flex-1 flex flex-col overflow-hidden rounded-2xl border bg-[#1B1B1B]/70 backdrop-blur-2xl supports-backdrop-filter:bg-[#1B1B1B]/50 shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Éditeur de template</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    hasChanges ? "bg-yellow-500" : "bg-green-500"
                  )}
                />
                {hasChanges ? "Modifications non enregistrées" : "À jour"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="min-w-[140px] shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8 space-y-8">
            <div className="grid gap-6 p-6">
              <div className="grid gap-2">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Nom du template"
                  className="h-14 text-3xl font-bold border-none shadow-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="grid gap-2">
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Objet de l'email"
                  className="h-10 text-xl font-medium border-none shadow-none px-0 focus-visible:ring-0 bg-transparent text-muted-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-semibold text-muted-foreground">Contenu</h3>
              </div>
              <div className="border rounded-xl overflow-hidden shadow-sm bg-card min-h-[500px]">
                <AdvancedEditor
                  initialContent={content}
                  onChange={(newContent: string) => {
                    setContent(newContent);
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
