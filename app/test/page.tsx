"use client";

import { useState } from "react";
import { AdvancedEditor } from "@/components/editor/advanced-editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export default function TestPage() {
  const [content, setContent] = useState("");
  const [to, setTo] = useState("bdefensup@gmail.com");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !content) {
      toast.error("Veuillez remplir tous les champs (destinataire, sujet, contenu).");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject,
          html: content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.error || "Erreur lors de l'envoi");
      }

      toast.success("Email envoyé avec succès !");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-muted/20 flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-[1400px] space-y-6">
        <div className="grid gap-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="grid gap-2">
            <Label htmlFor="to">Destinataire</Label>
            <Input
              id="to"
              placeholder="exemple@email.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Sujet</Label>
            <Input
              id="subject"
              placeholder="Sujet de l'email"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>

        <AdvancedEditor
          placeholder="Rédigez votre email ici..."
          initialContent={`
            <h2>Bonjour,</h2>
            <p>Ceci est un email de test envoyé depuis l'éditeur avancé.</p>
          `}
          onChange={setContent}
        />

        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={sending} className="w-full md:w-auto">
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Envoyer l'email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
