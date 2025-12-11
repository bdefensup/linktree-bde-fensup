import Link from "next/link";
import { 
  Globe, 
  Key, 
  Webhook, 
  ScrollText, 
  Mail,
  ChevronRight
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const resendLinks = [
    {
      title: "Domaines",
      description: "Gérez vos domaines d'envoi et enregistrements DNS.",
      href: "/admin/settings/domains",
      icon: Globe,
    },
    {
      title: "Clés API",
      description: "Gérez les clés d'authentification pour vos applications.",
      href: "/admin/settings/api-keys",
      icon: Key,
    },
    {
      title: "Webhooks",
      description: "Configurez les notifications d'événements en temps réel.",
      href: "/admin/settings/webhooks",
      icon: Webhook,
    },
    {
      title: "Logs Email",
      description: "Consultez l'historique et le statut de vos envois.",
      href: "/admin/settings/logs",
      icon: ScrollText,
    },
  ];

  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les configurations globales de votre application.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xl font-semibold text-white">
          <div className="p-2 rounded-lg bg-white/10">
            <Mail className="h-5 w-5" />
          </div>
          <h2>Resend (Emailing)</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resendLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <Card className="h-full bg-[#1B1B1B]/50 border-white/10 hover:bg-white/5 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-black/50 border border-white/10 group-hover:border-white/20 transition-colors">
                      <link.icon className="h-5 w-5 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="mt-4 text-white">{link.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {link.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
