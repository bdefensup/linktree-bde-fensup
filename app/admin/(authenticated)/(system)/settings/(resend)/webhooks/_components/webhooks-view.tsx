"use client";

import dynamic from "next/dynamic";
import { Webhook } from "./webhook-list";

const WebhookList = dynamic(() => import("./webhook-list").then((mod) => mod.WebhookList), { ssr: false });
const AddWebhookDialog = dynamic(() => import("./add-webhook-dialog").then((mod) => mod.AddWebhookDialog), { ssr: false });

interface WebhooksViewProps {
  webhooks: Webhook[];
}

export function WebhooksView({ webhooks }: WebhooksViewProps) {
  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Webhooks</h1>
          <p className="text-muted-foreground mt-2">
            Recevez des notifications HTTP en temps réel pour les événements d'emailing.
          </p>
        </div>
        <AddWebhookDialog />
      </div>

      <WebhookList webhooks={webhooks} />
    </div>
  );
}
