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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createWebhook } from "../actions";
import { Checkbox } from "@/components/ui/checkbox";

const EVENT_TYPES = [
  { id: "email.sent", label: "Email Sent" },
  { id: "email.delivered", label: "Email Delivered" },
  { id: "email.delivery_delayed", label: "Email Delivery Delayed" },
  { id: "email.complained", label: "Email Complained" },
  { id: "email.bounced", label: "Email Bounced" },
  { id: "email.opened", label: "Email Opened" },
  { id: "email.clicked", label: "Email Clicked" },
];

export function AddWebhookDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvents.length === 0) {
      toast.error("Veuillez sélectionner au moins un type d'événement");
      return;
    }

    setLoading(true);

    try {
      const result = await createWebhook(url, selectedEvents);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Webhook créé avec succès");
      setOpen(false);
      setUrl("");
      setSelectedEvents([]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 bg-white text-black hover:bg-white/90 h-10 px-4 py-2">
        <Plus className="h-4 w-4" />
        Ajouter un webhook
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#1B1B1B] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Ajouter un webhook</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Recevez des notifications en temps réel pour les événements d'emailing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url" className="text-white">URL du Endpoint</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.votresite.com/webhooks/resend"
                className="bg-[#1B1B1B]/50 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-white/20"
                required
                type="url"
              />
            </div>

            <div className="grid gap-3">
              <Label className="text-white">Événements</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EVENT_TYPES.map((event) => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={event.id} 
                      checked={selectedEvents.includes(event.id)}
                      onCheckedChange={() => toggleEvent(event.id)}
                      className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <label
                      htmlFor={event.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                    >
                      {event.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-white/90">
              {loading ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
