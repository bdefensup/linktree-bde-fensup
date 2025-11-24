"use client";

import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function Home() {
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
      name: "Faire un don",
      url: "/don",
      icon: "❤️",
      description: "Soutenez les projets du BDE",
      highlight: false,
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
        <div className="relative mb-9">
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
        <div className="text-center mb-12 space-y-3">
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

        {/* Links Section */}
        <div className="w-full space-y-4">
          {links.map((link) => {
            const isDonation = link.url === "/don";
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
                  } ${
                    isDonation
                      ? "bg-gradient-to-br from-amber-500/5 via-background/50 to-orange-500/5 border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/10"
                      : "bg-card/80 border-border/50 hover:border-primary/50 hover:shadow-primary/5"
                  } ${
                    link.highlight && !isDonation
                      ? "border-primary/50 shadow-md shadow-primary/10"
                      : ""
                  }`}
                >
                  {/* Hover Gradient Effect */}
                  {!link.comingSoon && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-r translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${
                        isDonation
                          ? "from-amber-500/0 via-amber-500/10 to-amber-500/0"
                          : "from-primary/0 via-primary/5 to-primary/0"
                      }`}
                    />
                  )}

                  <CardContent className="flex items-center p-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl text-2xl mr-4 transition-colors ${
                        isDonation
                          ? "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 group-hover:scale-110 transition-transform duration-300"
                          : link.highlight
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary/5 text-secondary group-hover:bg-primary/10 group-hover:text-primary"
                      }`}
                    >
                      {link.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-bold text-lg truncate transition-colors ${
                            isDonation
                              ? "text-foreground group-hover:text-amber-500"
                              : "group-hover:text-primary"
                          }`}
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
                        {link.highlight && !isDonation && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] h-5 px-1.5 animate-pulse">
                            Nouveau
                          </Badge>
                        )}
                        {isDonation && (
                          <Badge
                            variant="outline"
                            className="border-amber-500/50 text-amber-500 text-[10px] h-5 px-1.5 bg-amber-500/5"
                          >
                            Soutien ❤️
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {link.description}
                      </p>
                    </div>

                    {!link.comingSoon && (
                      <ExternalLink
                        className={`w-5 h-5 transition-colors ml-2 ${
                          isDonation
                            ? "text-amber-500/50 group-hover:text-amber-500"
                            : "text-muted-foreground/50 group-hover:text-primary"
                        }`}
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
