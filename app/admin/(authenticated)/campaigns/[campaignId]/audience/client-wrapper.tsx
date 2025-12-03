"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCampaign } from "@/app/admin/(authenticated)/campaigns/actions";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save, Loader2, Users } from "lucide-react";

interface CampaignAudienceEditorProps {
  campaign: any;
}

export function CampaignAudienceEditor({ campaign }: CampaignAudienceEditorProps) {
  const [recipients, setRecipients] = useState(campaign.recipients?.join(", ") || "");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (redirectUrl?: string) => {
    setIsSaving(true);
    try {
      const recipientList = recipients
        .split(",")
        .map((e: string) => e.trim())
        .filter((e: string) => e.length > 0);

      await updateCampaign(campaign.id, {
        recipients: recipientList,
      });
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

  return (
    <div className="flex h-screen flex-col bg-black p-4">
      <div className="supports-backdrop-filter:bg-[#1B1B1B]/50 flex flex-1 flex-col overflow-hidden rounded-2xl border bg-[#1B1B1B]/70 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#1B1B1B]/50 p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/campaigns/${campaign.id}/content`)}
              className="rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{campaign.name}</h1>
              <p className="text-muted-foreground text-sm">Étape 3 : Audience</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <Users className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Destinataires</h2>
                  <p className="text-muted-foreground text-sm">
                    Saisissez les adresses e-mail des destinataires.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Emails</label>
                  <Input
                    placeholder="email1@example.com, email2@example.com"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    className="border-white/10 bg-white/5"
                  />
                  <p className="text-muted-foreground text-xs">
                    Séparez les adresses par des virgules.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-muted-foreground rounded-xl border border-dashed border-white/10 p-6 text-center">
              <p>Fonctionnalités avancées (segments, tags) à venir.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
