import { getApiKeys } from "./actions";
import { getDomains } from "../domains/actions";
import { ApiKeyList } from "./_components/api-key-list";
import { AddApiKeyDialog } from "./_components/add-api-key-dialog";

export default async function ApiKeysPage() {
  const [apiKeys, domains] = await Promise.all([
    getApiKeys(),
    getDomains(),
  ]);

  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Clés API</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les clés API pour authentifier vos applications avec Resend.
          </p>
        </div>
        <AddApiKeyDialog domains={domains} />
      </div>

      <ApiKeyList apiKeys={apiKeys} />
    </div>
  );
}
