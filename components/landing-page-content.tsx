"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingLogo } from "@/components/landing-logo";
import { SupportCard } from "@/components/support-card";
import { ExternalLink, Heart } from "lucide-react";
import { LuHandHelping } from "react-icons/lu";
import { Event } from "@prisma/client";

interface LandingPageContentProps {
  latestEvent: Event | null;
}

export function LandingPageContent({ latestEvent }: LandingPageContentProps) {
  const links = [
    {
      name: "Billetterie",
      url: "/billetterie",
      icon: "🎟️",
      description: "Réservez vos places pour nos événements",
      highlight: true,
    },
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

      <main className="flex-1 w-full max-w-lg md:max-w-7xl px-6 py-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full">
          {/* Hero Section (Logo + Text) - Spans 2 cols on mobile and desktop */}
          <div className="col-span-1 md:col-span-2 md:row-span-2 md:bg-card/40 md:backdrop-blur-md md:border md:border-white/10 md:rounded-3xl md:p-8 flex flex-col items-center justify-center text-center md:shadow-xl relative overflow-visible md:overflow-hidden group order-1 md:order-0">
            <div className="hidden md:block absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <LandingLogo className="mb-6 md:mb-6" />
            <div className="space-y-3 z-10">
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
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
          </div>

          {/* Quick Donate Section - Spans 1 col */}
          <div className="col-span-1 md:col-span-1 cursor-not-allowed opacity-70 order-3 md:order-0">
            {/* Mobile Version: Instagram-like Link Card */}
            <Link
              href="/don"
              onClick={(e) => e.preventDefault()}
              className="block md:hidden h-full group pointer-events-none"
            >
              <Card className="relative h-full overflow-hidden border transition-all duration-300 rounded-3xl bg-muted/50 border-border/50">
                <CardContent className="flex items-center p-2 h-full flex-row justify-between text-left gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg text-lg transition-colors bg-secondary/5 text-secondary group-hover:bg-primary/10 group-hover:text-primary">
                    <LuHandHelping className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5 justify-start">
                      <h3 className="font-bold text-sm truncate transition-colors group-hover:text-primary">
                        Soutenir le BDE
                      </h3>
                      <Badge variant="secondary" className="text-[9px] h-3.5 px-1">
                        Bientôt
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0">
                      Votre aide est précieuse
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Desktop Version: Original Card with Buttons */}
            <div className="hidden md:block w-full h-full relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 rounded-3xl blur-lg opacity-0 transition-opacity duration-500"></div>
              <Card className="relative h-full border-border/50 bg-muted/50 backdrop-blur-sm overflow-hidden rounded-3xl flex flex-col justify-center">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="relative mt-1 mb-1">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <Heart className="w-6 h-6 text-muted-foreground fill-muted-foreground drop-shadow-md" />
                    </div>
                    <LuHandHelping className="w-12 h-12 text-muted-foreground" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="font-bold text-lg text-foreground">Soutenir le BDE</h3>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                        Bientôt
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Votre aide est précieuse</p>
                  </div>

                  <div className="flex flex-col w-full gap-2 pointer-events-none grayscale">
                    <Button
                      asChild
                      size="sm"
                      className="w-full bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md shadow-amber-500/20"
                    >
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        Faire un don à l'association
                      </a>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full border-amber-500/30 text-foreground"
                    >
                      <Link href="/don">Dons</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Support Chat Card - Spans 1 col */}
          <div className="order-4 md:order-0 col-span-1">
            <SupportCard />
          </div>

          {/* Links Section - Grid Items */}
          {links.map((link) => {
            // Custom spanning for specific links to make the grid interesting
            const isWide = link.name === "Billetterie";
            // Billetterie spans 2 cols on desktop
            // Others span 1 col on desktop
            // All span 1 col on mobile (vertical stack)
            const colSpan = isWide ? "col-span-1 md:col-span-2" : "col-span-1";

            // Mobile Ordering Logic
            let mobileOrder = "order-last"; // Default
            if (link.name === "Instagram") mobileOrder = "order-5";
            if (link.name === "TikTok") mobileOrder = "order-6";
            if (link.name === "Discord") mobileOrder = "order-7";
            if (link.name === "Site Web") mobileOrder = "order-8";

            if (isWide) {
              return (
                <div key={link.name} className={`col-span-1 md:col-span-2 order-2 md:order-0`}>
                  <div className="w-full h-full relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Card className="relative h-full min-h-[300px] border-border/50 overflow-hidden rounded-3xl flex flex-col justify-end transition-all duration-300 hover:-translate-y-1 group/card">
                      {/* Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/card:scale-110"
                        style={{
                          backgroundImage: latestEvent?.image
                            ? `url('${latestEvent.image}')`
                            : "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')",
                        }}
                      />
                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />

                      <CardContent className="relative px-6 md:p-6 flex flex-col h-full justify-between items-start text-left space-y-4 z-10 w-full">
                        <Badge
                          variant="outline"
                          className="bg-orange-950/80 text-orange-400 border-orange-500/50 hover:bg-orange-900/90 backdrop-blur-md font-bold shadow-sm shadow-orange-900/20"
                        >
                          Prochain Événement
                        </Badge>

                        <div className="flex flex-col w-full gap-1">
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg md:text-2xl text-white drop-shadow-md">
                              {latestEvent ? latestEvent.title : "Soirée d'Intégration"}
                            </h3>
                            {latestEvent && (
                              <p className="text-md text-gray-200 font-medium">
                                {new Date(latestEvent.date).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col w-full gap-2">
                            <Button
                              asChild
                              size="sm"
                              className="w-full bg-white text-black hover:bg-gray-200 border-0 font-bold"
                            >
                              <Link
                                href={latestEvent ? `/billetterie/${latestEvent.id}` : link.url}
                              >
                                Réserver prochain event
                              </Link>
                            </Button>

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                            >
                              <Link href="/billetterie">Voir tous les events</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.url}
                onClick={(e) => link.comingSoon && e.preventDefault()}
                className={`block group ${colSpan} ${mobileOrder} md:order-0 ${
                  link.comingSoon ? "cursor-not-allowed opacity-70 pointer-events-none" : ""
                }`}
              >
                <Card
                  className={`relative h-full overflow-hidden border transition-all duration-300 rounded-3xl ${
                    link.comingSoon
                      ? "bg-muted/50 border-border/50"
                      : "hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm"
                  } ${"bg-card/80 border-border/50 hover:border-primary/50 hover:shadow-primary/5"} ${
                    link.highlight ? "border-primary/50 shadow-md shadow-primary/10" : ""
                  }`}
                >
                  {/* Hover Gradient Effect */}
                  {!link.comingSoon && (
                    <div
                      className={`absolute inset-0 bg-linear-to-r -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${"from-primary/0 via-primary/5 to-primary/0"}`}
                    />
                  )}

                  <CardContent
                    className={`flex items-center p-2 md:p-6 h-full ${
                      isWide
                        ? "justify-between"
                        : "flex-row justify-between text-left gap-2 md:flex-col md:justify-center md:text-center md:gap-4"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl text-lg md:text-3xl transition-colors ${
                        link.highlight
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary/5 text-secondary group-hover:bg-primary/10 group-hover:text-primary"
                      }`}
                    >
                      {link.icon}
                    </div>

                    <div
                      className={`flex-1 min-w-0 ${isWide ? "text-left ml-2 md:ml-4" : "text-left md:text-center"}`}
                    >
                      <div
                        className={`flex items-center gap-1.5 md:gap-2 ${isWide ? "" : "justify-start md:justify-center"}`}
                      >
                        <h3
                          className={`font-bold text-sm md:text-xl truncate transition-colors ${"group-hover:text-primary"}`}
                        >
                          {link.name}
                        </h3>
                        {link.comingSoon && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] md:text-[10px] h-3.5 md:h-5 px-1 md:px-1.5"
                          >
                            Bientôt
                          </Badge>
                        )}
                        {link.highlight && (
                          <Badge className="bg-primary text-primary-foreground text-[9px] md:text-[10px] h-3.5 md:h-5 px-1 md:px-1.5 animate-pulse">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] md:text-sm text-muted-foreground mt-0 md:mt-1">
                        {link.description}
                      </p>
                    </div>

                    {!link.comingSoon && (
                      <ExternalLink
                        className={`w-3.5 h-3.5 md:w-6 md:h-6 transition-colors ${isWide ? "ml-2 md:ml-4" : "ml-0 md:mt-2"} ${"text-muted-foreground/50 group-hover:text-primary"}`}
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
