import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerifyButton } from "./verify-button";
import { getDomain } from "../actions";

export default async function DomainDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const domain = await getDomain(id);

  if (!domain) return notFound();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
            <CheckCircle className="h-3 w-3" /> Vérifié
          </Badge>
        );
      case "failed":
      case "temporary_failure":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Échec
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" /> En attente
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 bg-black p-8 min-h-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-white/10">
          <Link href="/admin/settings/domains">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            {domain.name}
            {getStatusBadge(domain.status)}
          </h1>
          <p className="text-muted-foreground">
            {domain.region} • Créé le {new Date(domain.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-auto">
            <VerifyButton id={domain.id} />
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-[#1B1B1B]/50 border-white/10 text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Enregistrements DNS</CardTitle>
            <CardDescription className="text-muted-foreground">
              Ajoutez ces enregistrements à votre fournisseur DNS pour vérifier votre domaine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {domain.records?.map((record: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-muted-foreground uppercase">
                    Enregistrement {record.record} ({record.type})
                  </span>
                  {record.status === "verified" ? (
                    <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">Vérifié</Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/20 bg-yellow-500/10">En attente</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Nom</label>
                        <div className="flex items-center gap-2 p-2 rounded bg-black/50 border border-white/10 font-mono text-sm text-white">
                            <span className="truncate">{record.name}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Valeur</label>
                        <div className="flex items-center gap-2 p-2 rounded bg-black/50 border border-white/10 font-mono text-sm text-white">
                            <span className="truncate">{record.value}</span>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#1B1B1B]/50 border-white/10 text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Configuration DMARC</CardTitle>
            <CardDescription className="text-muted-foreground">
              Ajoutez cet enregistrement TXT pour protéger votre domaine contre l'usurpation d'identité.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground uppercase">
                  Enregistrement DMARC (TXT)
                </span>
                <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/10">Recommandé</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Nom</label>
                      <div className="flex items-center gap-2 p-2 rounded bg-black/50 border border-white/10 font-mono text-sm text-white">
                          <span className="truncate">_dmarc</span>
                      </div>
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Valeur</label>
                      <div className="flex items-center gap-2 p-2 rounded bg-black/50 border border-white/10 font-mono text-sm text-white">
                          <span className="truncate">v=DMARC1; p=none; rua=mailto:dmarc-reports@{domain.name};</span>
                      </div>
                  </div>
              </div>
            </div>
            
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-200">
              <p className="font-medium mb-1 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pourquoi DMARC ?
              </p>
              <p className="text-blue-200/80">
                DMARC indique aux serveurs de messagerie quoi faire si un e-mail échoue aux vérifications SPF et DKIM. 
                Cela permet d'empêcher l'usurpation d'identité (spoofing) et renforce la confiance des fournisseurs de messagerie.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1B1B1B]/50 border-white/10 text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Configuration BIMI</CardTitle>
            <CardDescription className="text-muted-foreground">
              Affichez votre logo dans les boîtes de réception pour renforcer la reconnaissance de votre marque.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground uppercase">
                  Enregistrement BIMI (TXT)
                </span>
                <Badge variant="outline" className="text-purple-500 border-purple-500/20 bg-purple-500/10">Avancé</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Nom</label>
                      <div className="flex items-center gap-2 p-2 rounded bg-black/50 border border-white/10 font-mono text-sm text-white">
                          <span className="truncate">default._bimi</span>
                      </div>
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Valeur (Exemple)</label>
                      <div className="flex items-center gap-2 p-2 rounded bg-black/50 border border-white/10 font-mono text-sm text-white">
                          <span className="truncate">v=BIMI1; l=https://.../logo.svg; a=https://.../cert.pem;</span>
                      </div>
                  </div>
              </div>
            </div>
            
            <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4 text-sm text-purple-200">
              <p className="font-medium mb-1 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Prérequis BIMI
              </p>
              <ul className="list-disc list-inside space-y-1 text-purple-200/80">
                <li>DMARC doit être configuré avec <code>p=quarantine</code> ou <code>p=reject</code>.</li>
                <li>Vous devez posséder un certificat VMC (Verified Mark Certificate) ou CMC.</li>
                <li>Le logo doit être au format SVG Tiny P/S.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
