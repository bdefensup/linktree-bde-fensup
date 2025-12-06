"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  MapPin,
  Ticket,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Check,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  memberPrice?: number;
  externalPrice?: number;
  maxSeats: number;
  manualRemainingSeats?: number | null;
  image: string | null;
  _count?: {
    bookings: number;
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isMember: false,
    isExternal: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [isStudentEmail, setIsStudentEmail] = useState(true);

  const checkEmailDomain = (email: string) => {
    if (!email) return true;
    return email.endsWith("@bdefenelon.org") || email.endsWith("@edufenelon.org");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;

    // Check if event is globally free (Standard is 0 AND External is 0 or undefined)
    const isGlobalFree = event
      ? event.price === 0 && (!event.externalPrice || event.externalPrice === 0)
      : false;

    // If free, always valid. Otherwise check domain.
    const isValid = isGlobalFree || checkEmailDomain(email);

    setIsStudentEmail(isValid);

    setFormData((prev) => ({
      ...prev,
      email,
      // If invalid email, force external price and uncheck member
      isExternal: !isValid ? true : prev.isExternal,
      isMember: !isValid ? false : prev.isMember,
    }));
  };

  useEffect(() => {
    fetch(`/api/events/${params.eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching event:", error);
        setLoading(false);
      });
  }, [params.eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: params.eventId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/billetterie/confirmation/${data.bookingId}`);
      } else {
        alert(data.error || "Une erreur est survenue");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Une erreur est survenue");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">Chargement de l'événement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Événement introuvable</h1>
        <p className="text-muted-foreground mb-6">
          L'événement que vous cherchez n'existe pas ou a été supprimé.
        </p>
        <Button asChild>
          <Link href="/billetterie">Retour à la billetterie</Link>
        </Button>
      </div>
    );
  }

  const availableSeats =
    event.manualRemainingSeats !== null && event.manualRemainingSeats !== undefined
      ? event.manualRemainingSeats
      : event.maxSeats - (event._count?.bookings || 0);
  const isSoldOut = availableSeats <= 0;
  const currentPrice = formData.isMember && event.memberPrice ? event.memberPrice : event.price;
  const eventDate = new Date(event.date);

  return (
    <div className="min-h-screen bg-background text-foreground relative pb-20">
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        {event.image ? (
          <Image src={event.image} alt={event.title} fill className="object-cover" priority />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
            <Ticket className="w-32 h-32 text-primary/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />

        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="rounded-full bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/70 hover:scale-105 transition-all duration-300 h-7 pl-2 pr-5"
          >
            <Link href="/billetterie" className="gap-3">
              <div className="bg-white/10 p-0.5 rounded-full">
                <ArrowLeft className="h-2 w-2 text-white" />
              </div>
              <span className="font-bold text-white text-xs">Retour</span>
            </Link>
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
              <div className="space-y-3 md:space-y-4 max-w-3xl">
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1 text-xs md:text-sm font-bold shadow-lg">
                  {format(eventDate, "yyyy")}
                </Badge>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground drop-shadow-sm leading-tight line-clamp-2 md:line-clamp-none">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-1.5 md:gap-2 bg-orange-500/10 text-orange-600 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full backdrop-blur-md border border-orange-500/20">
                    <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                    <span className="capitalize">
                      {format(eventDate, "EEE d MMM", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 bg-orange-500/10 text-orange-600 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full backdrop-blur-md border border-orange-500/20">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                    <span>{format(eventDate, "HH:mm")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 bg-orange-500/10 text-orange-600 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full backdrop-blur-md border border-orange-500/20">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                    <span className="line-clamp-1 max-w-[150px] md:max-w-none">
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 absolute top-4 right-4 md:static">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 md:h-12 md:w-12 bg-background/50 backdrop-blur-md border-white/10 hover:bg-background/80"
                >
                  <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold">À propos de l'événement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
                    {event.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info Section (Placeholder for future content) */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:bg-card/50 transition-colors">
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-1">
                  <Ticket className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Billetterie officielle</h3>
                <p className="text-sm text-muted-foreground">
                  Réservation sécurisée directement via le BDE
                </p>
              </Card>
              <Card className="border-border/40 bg-card/30 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:bg-card/50 transition-colors">
                <div className="p-3 rounded-full bg-green-500/10 text-green-500 mb-1">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Confirmation immédiate</h3>
                <p className="text-sm text-muted-foreground">
                  Recevez vos billets par email instantanément
                </p>
              </Card>
            </div>
          </div>

          {/* Sidebar / Booking Card */}
          <div className="lg:col-span-1 order-first lg:order-0">
            <div className="sticky top-24">
              <Card className="border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/5">
                <CardHeader className="p-0 border-b border-white/10 bg-[#2a2a4a]">
                  <div className="p-6 flex flex-col gap-4">
                    <p className="text-sm font-bold text-white/80 uppercase tracking-wider text-center">
                      Tarifs Billetterie
                    </p>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {/* Prix Adhérent (Cyan) */}
                      {event.memberPrice !== undefined && event.memberPrice !== null && (
                        <div className="flex flex-col items-center p-1.5 sm:p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
                          <span className="text-[9px] sm:text-[10px] font-bold text-cyan-400 uppercase mb-0.5 text-center leading-tight">
                            Adhérent
                          </span>
                          <span className="text-lg sm:text-xl font-black text-white">
                            {event.memberPrice}€
                          </span>
                        </div>
                      )}

                      {/* Prix Standard (Orange) */}
                      <div
                        className={cn(
                          "flex flex-col items-center p-1.5 sm:p-2.5 rounded-xl border relative overflow-hidden group hover:scale-105 transition-transform duration-300",
                          "bg-orange-500/10 border-orange-500/20"
                        )}
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-orange-400 uppercase mb-0.5 text-center leading-tight">
                          Étudiant
                        </span>
                        <span className="text-lg sm:text-xl font-black text-white">
                          {event.price}€
                        </span>
                      </div>

                      {/* Prix Extérieur (Blue) */}
                      {event.externalPrice !== undefined && event.externalPrice !== null && (
                        <div className="flex flex-col items-center p-1.5 sm:p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
                          <span className="text-[9px] sm:text-[10px] font-bold text-blue-400 uppercase mb-0.5 text-center leading-tight">
                            Extérieur
                          </span>
                          <span className="text-lg sm:text-xl font-black text-white">
                            {event.externalPrice}€
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-8 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Date et heure</p>
                        <p className="text-muted-foreground text-sm mt-0.5">
                          {format(eventDate, "EEEE d MMMM yyyy", { locale: fr })}
                          <br />à {format(eventDate, "HH:mm")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Lieu</p>
                        <p className="text-muted-foreground text-sm mt-0.5">{event.location}</p>
                      </div>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="flex items-center justify-between text-sm bg-secondary/20 p-3 rounded-xl">
                      <span className="text-muted-foreground font-medium">Places restantes</span>
                      <span
                        className={cn(
                          "font-bold px-2 py-0.5 rounded-md",
                          isSoldOut
                            ? "bg-destructive/10 text-destructive"
                            : "bg-green-500/10 text-green-500"
                        )}
                      >
                        {availableSeats} / {event.maxSeats}
                      </span>
                    </div>
                  </div>

                  <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className={cn(
                          "w-full text-lg font-bold h-14 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]",
                          isSoldOut && "opacity-80"
                        )}
                        disabled={isSoldOut}
                      >
                        {isSoldOut ? "Complet" : "Réserver ma place"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-3xl border-primary/10 bg-card/95 backdrop-blur-xl max-h-[70vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Réserver pour {event.title}</DialogTitle>
                        <DialogDescription>
                          Remplissez le formulaire ci-dessous pour procéder au paiement.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Prénom</Label>
                            <Input
                              id="firstName"
                              required
                              value={formData.firstName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  firstName: e.target.value,
                                })
                              }
                              placeholder="Jean"
                              className="rounded-xl bg-secondary/30 border-transparent focus:bg-background transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Nom</Label>
                            <Input
                              id="lastName"
                              required
                              value={formData.lastName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  lastName: e.target.value,
                                })
                              }
                              placeholder="Dupont"
                              className="rounded-xl bg-secondary/30 border-transparent focus:bg-background transition-colors"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleEmailChange}
                            placeholder="jean.dupont@edufenelon.org"
                            className={cn(
                              "rounded-xl bg-secondary/30 border-transparent focus:bg-background transition-colors",
                              !isStudentEmail && "border-destructive/50 focus:border-destructive"
                            )}
                          />
                        </div>

                        {!isStudentEmail && (
                          <Alert
                            variant="destructive"
                            className="bg-destructive/10 border-destructive/20 text-destructive"
                          >
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Tarif étudiant non applicable</AlertTitle>
                            <AlertDescription>
                              Vous n'êtes pas étudiant de la fac. Seul le tarif extérieur est
                              disponible pour vous.
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="06 12 34 56 78"
                            className="rounded-xl bg-secondary/30 border-transparent focus:bg-background transition-colors"
                          />
                        </div>

                        {event.memberPrice !== undefined && event.memberPrice !== null && (
                          <div className="flex items-start space-x-3 p-4 border border-cyan-500/20 rounded-xl bg-cyan-500/5">
                            <Checkbox
                              id="isMember"
                              checked={formData.isMember}
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  isMember: checked as boolean,
                                  isExternal: false, // Mutually exclusive
                                })
                              }
                              disabled={!isStudentEmail}
                              className="mt-1 border-cyan-500 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-white disabled:opacity-50"
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor="isMember"
                                className={cn(
                                  "text-sm font-bold leading-none cursor-pointer text-cyan-500",
                                  !isStudentEmail && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                Je suis membre cotisant FEN'SUP
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Bénéficiez du tarif réduit à{" "}
                                <span className="font-bold text-foreground">
                                  {event.memberPrice}€
                                </span>{" "}
                                au lieu de {event.price}€.
                              </p>
                            </div>
                          </div>
                        )}

                        {event.externalPrice !== undefined && event.externalPrice !== null && (
                          <div className="flex items-start space-x-3 p-4 border border-blue-500/20 rounded-xl bg-blue-500/5">
                            <Checkbox
                              id="isExternal"
                              checked={formData.isExternal}
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  isExternal: checked as boolean,
                                  isMember: false, // Mutually exclusive
                                })
                              }
                              disabled={!isStudentEmail} // If not student, forced to true (so disabled to uncheck)
                              className="mt-1 border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white disabled:opacity-50"
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor="isExternal"
                                className={cn(
                                  "text-sm font-bold leading-none cursor-pointer text-blue-500",
                                  !isStudentEmail && "opacity-100" // Keep label visible even if forced
                                )}
                              >
                                Je suis un extérieur de la fac
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Tarif extérieur applicable :{" "}
                                <span className="font-bold text-foreground">
                                  {event.externalPrice}€
                                </span>
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="pt-4">
                          <Button
                            type="submit"
                            className="w-full rounded-xl h-12 text-lg font-bold"
                            size="lg"
                            disabled={submitting}
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin font-bold" />
                                Réservation...
                              </>
                            ) : (
                              `Réserver ${currentPrice}€`
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
