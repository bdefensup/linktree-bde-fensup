import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldBan, ArrowLeft, Smartphone, Laptop } from "lucide-react";
import Link from "next/link";

export default function AdminMobileRestrictionPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0a0a] overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <Card className="max-w-md w-full border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl relative z-10 overflow-hidden">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500" />

        <CardHeader className="text-center space-y-6 pt-10 pb-2">
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
            <div className="relative bg-black/50 p-4 rounded-full border border-red-500/30 backdrop-blur-sm">
              <ShieldBan className="w-10 h-10 text-red-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-black/80 p-2 rounded-full border border-white/10">
              <Smartphone className="w-4 h-4 text-white/60" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight text-white">
              Accès Restreint
            </CardTitle>
            <CardDescription className="text-base text-zinc-400">
              L'interface administrateur n'est pas disponible sur mobile.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pb-10 px-6 sm:px-8">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                <Laptop className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-white text-sm">Version Desktop Requise</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Pour garantir la sécurité et l'ergonomie des outils de gestion, veuillez vous
                  connecter depuis un ordinateur.
                </p>
              </div>
            </div>
          </div>

          <Button
            asChild
            className="w-full h-12 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour à l'accueil
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
