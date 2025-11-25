"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Ticket,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  memberPrice?: number;
  maxSeats: number;
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
  });
  const [submitting, setSubmitting] = useState(false);

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

    // Open new tab immediately to avoid popup blockers
    const paymentWindow = window.open("", "_blank");

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
        // Set URL of the already opened tab
        if (paymentWindow) {
          paymentWindow.location.href = data.revolutLink;
        } else {
          // Fallback if window failed to open
          window.location.href = data.revolutLink;
        }

        // Redirect current tab to confirmation page
        router.push(`/billetterie/confirmation/${data.bookingId}`);
      } else {
        if (paymentWindow) paymentWindow.close();
        alert(data.error || "Une erreur est survenue");
        setSubmitting(false);
      }
    } catch (error) {
      if (paymentWindow) paymentWindow.close();
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
          <p className="text-muted-foreground animate-pulse">
            Chargement de l'événement...
          </p>
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

  const availableSeats = event.maxSeats - (event._count?.bookings || 0);
  const isSoldOut = availableSeats <= 0;
  const currentPrice =
    formData.isMember && event.memberPrice ? event.memberPrice : event.price;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-full bg-background/50 backdrop-blur-md border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300 group"
          >
            <Link href="/billetterie" className="gap-2 pl-2 pr-4">
              <div className="bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-colors">
                <ArrowLeft className="h-3 w-3 text-primary" />
              </div>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                Retour aux événements
              </span>
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              {event.image ? (
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
                  <Ticket className="w-32 h-32 text-primary/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 p-4 w-full">
                <Badge className="mb-1.5 bg-primary/90 hover:bg-primary text-primary-foreground border-none text-[10px] px-2 py-0.5 h-auto">
                  {new Date(event.date).getFullYear()}
                </Badge>
                <h1 className="text-lg md:text-xl font-extrabold text-foreground mb-1 drop-shadow-sm leading-tight">
                  {event.title}
                </h1>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">{event.location}</span>
                </div>
              </div>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  À propos de l'événement
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="border-border/50 bg-card/80 backdrop-blur-md shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-6 border-b border-border/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Prix du billet
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary">
                          {event.price}€
                        </span>
                        {event.memberPrice && (
                          <Badge
                            variant="outline"
                            className="border-accent text-accent"
                          >
                            {event.memberPrice}€ Membres
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Date et heure
                        </p>
                        <p className="text-muted-foreground">
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {" à "}
                          {new Date(event.date).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-full bg-secondary/10 text-secondary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Lieu</p>
                        <p className="text-muted-foreground">
                          {event.location}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Places restantes
                      </span>
                      <span
                        className={`font-bold ${isSoldOut ? "text-destructive" : "text-green-500"}`}
                      >
                        {availableSeats} / {event.maxSeats}
                      </span>
                    </div>
                  </div>

                  <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className="w-full text-lg font-semibold shadow-lg shadow-primary/20"
                        disabled={isSoldOut}
                      >
                        {isSoldOut ? "Complet" : "Réserver ma place"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Réserver pour {event.title}</DialogTitle>
                        <DialogDescription>
                          Remplissez le formulaire ci-dessous pour procéder au
                          paiement.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            placeholder="jean.dupont@example.com"
                          />
                        </div>

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
                          />
                        </div>

                        {event.memberPrice && (
                          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/50">
                            <Checkbox
                              id="isMember"
                              checked={formData.isMember}
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  isMember: checked as boolean,
                                })
                              }
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor="isMember"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Je suis membre cotisant FEN'SUP
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Bénéficiez du tarif réduit à{" "}
                                <span className="font-bold text-primary">
                                  {event.memberPrice}€
                                </span>{" "}
                                au lieu de {event.price}€.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="pt-4">
                          <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={submitting}
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Redirection...
                              </>
                            ) : (
                              `Payer ${currentPrice}€`
                            )}
                          </Button>
                          <p className="text-xs text-center text-muted-foreground mt-3">
                            Paiement sécurisé via Revolut.me
                          </p>
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
