"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  if (session) {
    router.push("/admin");
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn.email({
        email,
        password,
        callbackURL: "/admin",
        fetchOptions: {
          onResponse: () => {
            setLoading(false);
          },
          onRequest: () => {
            setLoading(true);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setLoading(false);
          },
          onSuccess: () => {
            router.push("/admin");
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      toast.error("Échec de la connexion. Veuillez vérifier vos identifiants.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000" />

      <Card className="w-full max-w-md mx-4 border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-4 flex flex-col items-center text-center pb-2">
          <div className="relative w-32 h-32">
            <Image
              src="/logo-full.png"
              alt="Logo BDE FEN'SUP"
              fill
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Administration
            </CardTitle>
            <CardDescription>
              Connectez-vous pour accéder au backoffice.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleLogin}
            className="space-y-4"
            suppressHydrationWarning
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@bdefensup.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50"
                suppressHydrationWarning
              />
            </div>
            <Button
              type="submit"
              className="w-full font-bold shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/50 pt-4 flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Pas encore de compte ?{" "}
            <Link
              href="/admin/signup"
              className="text-primary hover:underline font-medium"
            >
              S'inscrire
            </Link>
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Accès réservé aux membres du bureau.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
