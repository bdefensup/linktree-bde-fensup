"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Reply } from "lucide-react";
import { toast } from "sonner";
import { replyToEmail } from "../actions";

interface ReplyButtonProps {
  messageId: string;
  subject: string;
}

export function ReplyButton({ messageId, subject }: ReplyButtonProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleReply = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await replyToEmail(messageId, message, subject);
      toast.success("Réponse envoyée !");
      setOpen(false);
      setMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi de la réponse");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Reply className="h-4 w-4" />
          Répondre
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-[#1B1B1B] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Répondre</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Votre réponse sera envoyée par email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrivez votre réponse ici..."
            className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-white/20"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSending}>
            Annuler
          </Button>
          <Button onClick={handleReply} disabled={isSending || !message.trim()}>
            {isSending ? "Envoi..." : "Envoyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
