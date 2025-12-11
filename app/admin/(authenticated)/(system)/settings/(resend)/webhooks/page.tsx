import { getWebhooks } from "./actions";
import { WebhooksView } from "./_components/webhooks-view";

export default async function WebhooksPage() {
  const webhooks = await getWebhooks();

  return <WebhooksView webhooks={webhooks} />;
}
