import { AddDomainDialog } from "./_components/add-domain-dialog";
import { DomainList } from "./_components/domain-list";
import { getDomains } from "./actions";

export default async function DomainsPage() {
  const domains = await getDomains();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Domains</h1>
          <p className="text-muted-foreground">
            Manage your sending domains and DNS records.
          </p>
        </div>
        <AddDomainDialog />
      </div>

      <DomainList domains={domains} />
    </div>
  );
}
