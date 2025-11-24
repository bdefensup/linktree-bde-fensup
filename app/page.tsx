"use client";

import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ExternalLink, Heart, HandHeart, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [donationAmount, setDonationAmount] = useState("");

  const handleQuickDonate = (e: React.FormEvent) => {
    e.preventDefault();
    if (donationAmount) {
      router.push(`/don?amount=${donationAmount}`);
    }
  };

  const links = [
    {
      name: "Instagram",
      url: "https://BDE-FENSUP.short.gy/Instagram",
      icon: "📸",
      description: "Suivez notre actualité en direct",
    },
    {
      name: "TikTok",
      url: "https://BDE-FENSUP.short.gy/TikTok",
      icon: "🎵",
      description: "Découvrez nos vidéos exclusives",
    },
    {
      name: "Billetterie",
      url: "/billetterie",
      icon: "🎟️",
      description: "Réservez vos places pour nos événements",
      highlight: true,
    },
    {
      name: "Discord",
      url: "#",
      icon: "💬",
      description: "Rejoignez la communauté",
      comingSoon: true,
    },
    {
      name: "Site Web",
      url: "https://BDE-FENSUP.short.gy/SiteWeb",
      icon: "🌐",
      description: "Toutes les infos sur le BDE",
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center relative overflow-hidden transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000" />

      {/* Top Bar */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <main className="flex-1 flex flex-col items-center w-full max-w-lg px-6 py-16 z-10">
        {/* Logo Section */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 bg-gradient-to-r from-primary via-accent to-secondary rounded-full blur opacity-30"></div>
          <div className="relative bg-card/50 backdrop-blur-xl p-8 rounded-full border border-border/50 shadow-xl">
            <Image
              src="/logo.png"
              alt="Logo BDE FEN'SUP"
              width={200}
              height={200}
              className="object-contain drop-shadow-md translate-y-4"
              priority
            />
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary pb-2">
            FEN'SUP
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Bureau des Étudiants
          </p>
          <div className="pt-2">
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 px-4 py-1 text-sm font-medium rounded-full"
            >
              🎓 Année 2025-2026
            </Badge>
          </div>
        </div>

        {/* Quick Donate Section */}
        <div className="w-full mb-10 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
          <Card className="relative border-amber-500/30 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="relative mt-2 mb-2">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce duration-[1500ms]">
                  <Heart className="w-8 h-8 text-red-500 fill-red-500 drop-shadow-lg" />
                </div>
                <HandHeart className="w-16 h-16 text-amber-500 stroke-[1.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground">
                  Soutenir le BDE
                </h3>
                <p className="text-xs text-muted-foreground">
                  Votre aide est précieuse
                </p>
              </div>

              <form
                onSubmit={handleQuickDonate}
                className="flex w-full max-w-xs items-center space-x-2"
              >
                <div className="relative flex-1">
                  <Input
                    type="number"
                    placeholder="Montant"
                    className="pr-8 text-center font-medium border-amber-500/30 focus-visible:ring-amber-500/50"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    €
                  </span>
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20"
                >
                  Donner
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Links Section */}
        <div className="w-full space-y-4">
          {links.map((link) => {
            return (
              <Link
                key={link.name}
                href={link.url}
                onClick={(e) => link.comingSoon && e.preventDefault()}
                className={`block group ${
                  link.comingSoon ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                <Card
                  className={`relative overflow-hidden border transition-all duration-300 ${
                    link.comingSoon
                      ? "bg-muted/50 border-border/50"
                      : "hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm"
                  } ${"bg-card/80 border-border/50 hover:border-primary/50 hover:shadow-primary/5"} ${
                    link.highlight
                      ? "border-primary/50 shadow-md shadow-primary/10"
                      : ""
                  }`}
                >
                  {/* Hover Gradient Effect */}
                  {!link.comingSoon && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-r translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${"from-primary/0 via-primary/5 to-primary/0"}`}
                    />
                  )}

                  <CardContent className="flex items-center p-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl text-2xl mr-4 transition-colors ${
                        link.highlight
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary/5 text-secondary group-hover:bg-primary/10 group-hover:text-primary"
                      }`}
                    >
                      {link.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-bold text-lg truncate transition-colors ${"group-hover:text-primary"}`}
                        >
                          {link.name}
                        </h3>
                        {link.comingSoon && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 px-1.5"
                          >
                            Bientôt
                          </Badge>
                        )}
                        {link.highlight && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] h-5 px-1.5 animate-pulse">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {link.description}
                      </p>
                    </div>

                    {!link.comingSoon && (
                      <ExternalLink
                        className={`w-5 h-5 transition-colors ml-2 ${"text-muted-foreground/50 group-hover:text-primary"}`}
                      />
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-sm text-muted-foreground z-10 border-t border-border/20 bg-background/50 backdrop-blur-sm mt-auto">
        <p className="mb-2">© {new Date().getFullYear()} BDE FEN'SUP</p>
        <div className="flex justify-center gap-4 text-xs opacity-60">
          <Link href="#" className="hover:text-primary transition-colors">
            Mentions légales
          </Link>
          <span>•</span>
          <Link href="#" className="hover:text-primary transition-colors">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
