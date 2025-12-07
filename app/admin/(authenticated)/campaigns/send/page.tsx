"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdvancedEditor } from "@/components/editor/advanced-editor";
import { sendEmail, getTemplates } from "@/app/admin/(authenticated)/campaigns/actions";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SendCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipients, setRecipients] = useState(""); // Comma separated emails for now
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSubject(template.subject);
        setContent(
          typeof template.content === "string" ? template.content : JSON.stringify(template.content)
        );
      }
    }
  }, [templateId, templates]);

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !content.trim() || !recipients.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      await sendEmail({
        subject,
        content,
        recipients: recipients.split(",").map((e) => e.trim()),
      });
      toast.success("Campagne envoyée avec succès !");
      router.push("/admin/campaigns");
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-black p-4">
      <div className="supports-backdrop-filter:bg-[#1B1B1B]/50 flex flex-1 flex-col overflow-hidden rounded-2xl border bg-[#1B1B1B]/70 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#1B1B1B]/50 p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-bold tracking-tight">Envoyer une campagne</h2>
          </div>
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="min-w-[140px] bg-white text-black hover:bg-white/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </>
            )}
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Template (Optionnel)</label>
                <Select
                  onValueChange={(value) => {
                    const template = templates.find((t) => t.id === value);
                    if (template) {
                      setSubject(template.subject);
                      setContent(
                        typeof template.content === "string"
                          ? template.content
                          : JSON.stringify(template.content)
                      );
                    }
                  }}
                  defaultValue={templateId || undefined}
                >
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue placeholder="Choisir un template..." />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#1C1C1E]">
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Destinataires</label>
                <Input
                  placeholder="email1@example.com, email2@example.com"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="border-white/10 bg-white/5"
                />
                <p className="text-muted-foreground text-xs">Séparez les emails par des virgules</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Objet</label>
                <Input
                  placeholder="Objet de l'email"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border-white/10 bg-white/5"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Contenu</label>
                <div className="min-h-[400px] overflow-hidden rounded-xl border border-white/10">
                  <AdvancedEditor
                    initialContent={content}
                    onChange={setContent}
                    className="min-h-[400px] rounded-none border-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
