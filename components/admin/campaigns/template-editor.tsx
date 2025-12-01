"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { updateTemplate } from "@/app/admin/campaigns/actions";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: any; // JSON
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
  // Note: RichTextEditor expects HTML string. If content is JSON, we might need to convert it or let Tiptap handle it if configured.
  // For simplicity, let's assume we store HTML string in the JSON field for now, or we rely on Tiptap's ability to parse.
  // Actually, my RichTextEditor implementation expects a string (HTML).
  // If `template.content` is a JSON object (Tiptap JSON), we need to convert it to HTML or modify RichTextEditor to accept JSON.
  // But `RichTextEditor` uses `useEditor` with `content: value`. Tiptap handles JSON or HTML.
  // However, `onChange` returns HTML. So we are storing HTML string in the DB?
  // The schema says `content Json`. So we should probably store the JSON object.
  // But `RichTextEditor` returns HTML string in `onChange`.
  // Let's adjust `RichTextEditor` to return JSON or store HTML string in the JSON field (as a string value).
  // Storing HTML string in a JSON field is fine: `content: "<div>...</div>"`.

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setName(template.name);
    setSubject(template.subject);
    // Ensure content is a string for the editor if possible, or pass object if Tiptap handles it.
    // My RichTextEditor props say `value: string`.
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Éditeur de template</h2>
            <p className="text-sm text-muted-foreground">
              {hasChanges ? "Modifications non enregistrées" : "À jour"}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
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

      {/* Editor Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du template</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Ex: Newsletter Mensuelle"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Objet de l'e-mail</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Ex: Les dernières nouvelles du BDE"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Contenu</Label>
            <RichTextEditor
              value={content as string}
              onChange={(val) => {
                setContent(val);
                setHasChanges(true);
              }}
              className="min-h-[400px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
