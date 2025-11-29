"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import Link from "next/link";
import { ArrowLeft, Heart, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PRESET_AMOUNTS = [5, 10, 15, 20, 50, 80, 100];

function DonationForm() {
  const searchParams = useSearchParams();
  const initialAmount = searchParams.get("amount");

  const [amount, setAmount] = useState<number | "">("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [donorName, setDonorName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialAmount) {
      const parsed = parseFloat(initialAmount);
      if (!isNaN(parsed)) {
        setAmount(parsed);
        if (!PRESET_AMOUNTS.includes(parsed)) {
          setCustomAmount(parsed.toString());
        }
      }
    }
  }, [initialAmount]);

  const handlePresetClick = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      setAmount(parseFloat(value));
    } else {
      setAmount("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    setLoading(true);

    // Open new tab immediately
    const paymentWindow = window.open("", "_blank");

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          message,
          donorName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (paymentWindow) {
          paymentWindow.location.href = data.revolutLink;
        } else {
          window.location.href = data.revolutLink;
        }
        // Optional: Redirect to a thank you page or show success message
        // router.push("/don/merci");
      } else {
        if (paymentWindow) paymentWindow.close();
        alert(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      if (paymentWindow) paymentWindow.close();
      console.error("Error creating donation:", error);
      alert("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10 w-full flex-grow">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-full bg-background/50 backdrop-blur-md border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300 group"
          >
            <Link href="/" className="gap-2 pl-2 pr-4">
              <div className="bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-colors">
                <ArrowLeft className="h-3 w-3 text-primary" />
              </div>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                Retour à l'accueil
              </span>
            </Link>
          </Button>
        </div>

        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-primary fill-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
            Soutenir le BDE FEN'SUP
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Votre soutien nous aide à organiser des événements inoubliables et à améliorer la vie
            étudiante. Merci pour votre générosité ! ❤️
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Faire un don
            </CardTitle>
            <CardDescription>Choisissez un montant ou saisissez une somme libre.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Preset Amounts */}
              <div className="space-y-3">
                <Label>Montant du don</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {PRESET_AMOUNTS.map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant={amount === val && !customAmount ? "default" : "outline"}
                      className={`h-12 text-lg font-medium transition-all ${
                        amount === val && !customAmount
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                          : "hover:border-primary/50 hover:text-primary"
                      }`}
                      onClick={() => handlePresetClick(val)}
                    >
                      {val}€
                    </Button>
                  ))}
                  <div className="relative col-span-2 md:col-span-1">
                    <Input
                      type="number"
                      placeholder="Autre"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className={`h-12 text-center text-lg transition-all ${
                        customAmount ? "border-primary ring-2 ring-primary/20" : ""
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      €
                    </span>
                  </div>
                </div>
              </div>

              {/* Donor Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="donorName">Votre nom (optionnel)</Label>
                  <Input
                    id="donorName"
                    placeholder="Anonyme ou votre nom"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Un petit message ? (optionnel)</Label>
                  <Textarea
                    id="message"
                    placeholder="Force à vous pour l'orga ! 💪"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                disabled={!amount || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    Faire un don de {amount ? amount : "..."}€
                    <Heart className="ml-2 h-5 w-5 fill-current" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-border/50 pt-6">
            <p className="text-xs text-muted-foreground text-center">
              Paiement sécurisé via Revolut.me. Aucun frais caché.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function DonationPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <DonationForm />
    </Suspense>
  );
}
