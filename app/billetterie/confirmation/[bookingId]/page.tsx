"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Booking {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  event: {
    title: string;
    date: string;
    location: string;
  };
  status: string;
}

export default function ConfirmationPage() {
  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bookings?id=${params.bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        setBooking(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching booking:", error);
        setLoading(false);
      });
  }, [params.bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h1 className="text-2xl font-bold mb-4">Réservation introuvable</h1>
        <Link href="/billetterie">
          <Button>Retour à la billetterie</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-primary/20 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-green-100 dark:bg-green-900/20 p-3 rounded-full w-fit mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Félicitations !
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Place réservée pour{" "}
              <span className="text-primary">{booking.event.title}</span>
            </p>
            <p className="text-muted-foreground">
              Votre demande de réservation a bien été prise en compte.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2 text-left">
            <p>
              <span className="font-semibold">Nom :</span> {booking.firstName}{" "}
              {booking.lastName}
            </p>
            <p>
              <span className="font-semibold">Email :</span> {booking.email}
            </p>
            <p>
              <span className="font-semibold">Date :</span>{" "}
              {new Date(booking.event.date).toLocaleDateString("fr-FR")}
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg">
            <p className="text-sm text-primary font-medium">
              ℹ️ Nous revenons vers vous sous 48h par email et SMS pour
              confirmer votre paiement et valider définitivement votre place.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/">
              <Button className="w-full" size="lg">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
