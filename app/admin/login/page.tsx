"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Lock, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.role === "admin" || session?.user?.role === "staff") {
      router.push("/admin");
    }
  }, [session, router]);

  useEffect(() => {
    if (searchParams.get("method") === "password") {
      setShowPasswordLogin(true);
    }
  }, [searchParams]);

  if (
    session &&
    session.user.role !== "admin" &&
    session.user.role !== "staff"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-destructive">Accès Refusé</CardTitle>
            <CardDescription>
              Votre compte n'a pas les droits d'administration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connecté en tant que: {session.user.email} ({session.user.role})
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              className="w-full"
              onClick={async () => {
                await signOut();
                window.location.reload();
              }}
            >
              Se déconnecter
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Calcul dynamique de l'année scolaire (Septembre à Août)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0 = Janvier, 8 = Septembre
  const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
  const schoolYear = `${startYear}-${startYear + 1}`;

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

  const handlePasskeyLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signIn.passkey();
      if (error) {
        toast.error("Erreur Passkey: " + error.message);
        setLoading(false);
      } else {
        // Success is handled by redirect or callback
        router.push("/admin");
      }
    } catch (error) {
      console.error("Passkey login error:", error);
      toast.error("Échec de la connexion par Passkey.");
      setLoading(false);
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
              B D E
            </CardTitle>
            <CardDescription>
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 px-4 py-1 text-sm font-medium rounded-full"
                suppressHydrationWarning
              >
                🎓 Année {schoolYear}
              </Badge>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!showPasswordLogin ? (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Fingerprint className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Connexion Sécurisée</h3>
                <p className="text-sm text-muted-foreground">
                  Utilisez FaceID ou TouchID pour accéder à l'administration.
                </p>
              </div>
              
              <Button
                type="button"
                size="lg"
                className="w-full font-bold shadow-lg shadow-primary/20 h-12 text-md"
                onClick={handlePasskeyLogin}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authentification...
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-5 w-5" />
                    S'identifier avec Passkey
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-primary"
                onClick={() => setShowPasswordLogin(true)}
              >
                Utiliser un mot de passe
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleLogin}
              className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
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
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-primary/20 hover:bg-primary/5"
                onClick={handlePasskeyLogin}
                disabled={loading}
              >
                <Fingerprint className="mr-2 h-4 w-4" />
                Connexion avec Passkey
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center border-t border-border/50 pt-4 flex-col gap-2">
          <p className="text-xs text-muted-foreground text-center">
            Accès réservé aux membres du bureau.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
