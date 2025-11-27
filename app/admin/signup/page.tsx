"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
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
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp.email({
        email,
        password,
        name,
        callbackURL: "/admin/reservations",
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
            toast.success("Compte créé avec succès !");
            router.push("/admin/reservations");
          },
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false);
      toast.error(
        "Impossible de créer le compte. Veuillez réessayer plus tard."
      );
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
              Inscription Admin
            </CardTitle>
            <CardDescription>
              Créez un compte pour accéder au backoffice.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSignup}
            className="space-y-4"
            suppressHydrationWarning
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background/50"
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@exemple.com"
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
                minLength={8}
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
                  Inscription...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  S'inscrire
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/50 pt-4 flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Déjà un compte ?{" "}
            <Link
              href="/admin/login"
              className="text-primary hover:underline font-medium"
            >
              Se connecter
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
