"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
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

const PRESET_AMOUNTS = [5, 10, 15, 20, 50, 80, 100, 150];

function DonationForm() {
  const searchParams = useSearchParams();
  const initialAmount = searchParams.get("amount");

  const [amount, setAmount] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [donorName, setDonorName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialAmount) {
      const parsed = parseFloat(initialAmount);
      if (!isNaN(parsed) && PRESET_AMOUNTS.includes(parsed)) {
        setAmount(parsed);
      }
    }
  }, [initialAmount]);

  const handlePresetClick = (value: number) => {
    setAmount(value);
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

        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 mb-2 animate-pulse">
            <Heart className="w-6 h-6 text-primary fill-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
            Soutenir le BDE
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Votre soutien nous aide à améliorer la vie étudiante. Merci ! ❤️
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl max-w-2xl mx-auto">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Faire un don
            </CardTitle>
            <CardDescription>
              Choisissez un montant pour soutenir le BDE.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Preset Amounts */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Montant
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant={amount === val ? "default" : "outline"}
                      className={`h-9 text-sm font-medium transition-all ${
                        amount === val
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                          : "hover:border-primary/50 hover:text-primary"
                      }`}
                      onClick={() => handlePresetClick(val)}
                    >
                      {val}€
                    </Button>
                  ))}
                </div>
              </div>

              {/* Donor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="donorName"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Nom (Optionnel)
                  </Label>
                  <Input
                    id="donorName"
                    placeholder="Anonyme"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="bg-background/50 h-9"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label
                    htmlFor="message"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Message (Optionnel)
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Un petit mot ?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-background/50 min-h-[60px] h-16 resize-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="default"
                className="w-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
                disabled={!amount || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    Faire un don de {amount ? amount : "..."}€
                    <Heart className="ml-2 h-4 w-4 fill-current" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-border/50 pt-4 pb-4">
            <p className="text-[10px] text-muted-foreground text-center">
              Paiement sécurisé via Revolut.me.
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
