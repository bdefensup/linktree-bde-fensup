import { AddDomainDialog } from "./_components/add-domain-dialog";
import { DomainList } from "./_components/domain-list";
import { getDomains } from "./actions";

export default async function DomainsPage() {
  const domains = await getDomains();

  return (
    <div className="space-y-6 bg-black p-8 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Domaines</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos domaines d'envoi et vos enregistrements DNS.
          </p>
        </div>
        <AddDomainDialog />
      </div>

      <DomainList domains={domains} />
    </div>
  );
}
