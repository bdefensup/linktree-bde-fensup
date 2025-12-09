"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { sendCampaign } from "@/app/admin/(authenticated)/campaigns/actions";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CampaignSendPageProps {
  campaign: any;
}

export function CampaignSendPage({ campaign }: CampaignSendPageProps) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const hasAttachments = Array.isArray(campaign.attachments) && campaign.attachments.length > 0;

  const handleSend = async () => {
    const isScheduled = !!scheduledAt;
    const confirmMessage = isScheduled 
      ? `Êtes-vous sûr de vouloir planifier cette campagne pour le ${new Date(scheduledAt).toLocaleString()} ?`
      : "Êtes-vous sûr de vouloir envoyer cette campagne maintenant ?";

    if (!confirm(confirmMessage)) return;

    setIsSending(true);
    try {
      await sendCampaign(campaign.id, scheduledAt || undefined);
      toast.success(isScheduled ? "Campagne planifiée !" : "Campagne envoyée avec succès !");
      router.push("/admin/campaigns");
    } catch (error) {
      console.error("Failed to send campaign:", error);
      toast.error("Erreur lors de l'envoi (Vérifiez les limitations)");
    } finally {
      setIsSending(false);
    }
  };

  const isReady = campaign.subject && campaign.recipients.length > 0;

  return (
    <div className="flex h-screen flex-col bg-black p-4">
      <div className="supports-backdrop-filter:bg-[#1B1B1B]/50 flex flex-1 flex-col overflow-hidden rounded-2xl border bg-[#1B1B1B]/70 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#1B1B1B]/50 p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/campaigns/${campaign.id}/audience`)}
              className="rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{campaign.name}</h1>
              <p className="text-muted-foreground text-sm">Étape 4 : Validation & Envoi</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {hasAttachments ? (
               <div className="text-xs text-yellow-500 flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                 <AlertCircle className="h-3 w-3" />
                 Planification impossible avec pièces jointes
               </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Planifier :</span>
                <input
                  type="datetime-local"
                  className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
            
            <Button
              onClick={handleSend}
              disabled={isSending || !isReady || campaign.status === "SENT"}
              className="bg-white text-black hover:bg-white/90"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {scheduledAt ? "Planifier l'envoi" : "Envoyer maintenant"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-2xl space-y-8">
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {campaign.subject ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Objet</h3>
                    <p className="text-muted-foreground text-sm">
                      {campaign.subject || "Non défini"}
                    </p>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {campaign.recipients.length > 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Audience</h3>
                    <p className="text-muted-foreground text-sm">
                      {campaign.recipients.length} destinataire(s)
                    </p>
                    {campaign.recipients.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {campaign.recipients.slice(0, 5).map((email: string) => (
                          <span
                            key={email}
                            className="rounded-full bg-white/10 px-2 py-0.5 text-xs"
                          >
                            {email}
                          </span>
                        ))}
                        {campaign.recipients.length > 5 && (
                          <span className="text-muted-foreground text-xs">
                            +{campaign.recipients.length - 5} autres
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {campaign.content ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Contenu</h3>
                    <p className="text-muted-foreground text-sm">
                      {campaign.content ? "Contenu défini" : "Aucun contenu"}
                    </p>
                    {hasAttachments && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                         <AlertCircle className="h-3 w-3" />
                         {campaign.attachments.length} pièce(s) jointe(s) (Planification désactivée)
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isReady && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-500">
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Veuillez compléter tous les champs requis avant d'envoyer.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
