"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
        // Open Revolut payment in new tab
        window.open(data.revolutLink, "_blank");
        // Redirect current tab to confirmation page
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Événement introuvable</h1>
          <Link href="/billetterie" className="text-primary hover:underline">
            Retour à la billetterie
          </Link>
        </div>
      </div>
    );
  }

  const availableSeats = event.maxSeats - (event._count?.bookings || 0);
  const isSoldOut = availableSeats <= 0;
  const currentPrice =
    formData.isMember && event.memberPrice ? event.memberPrice : event.price;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/billetterie"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          ← Retour à la billetterie
        </Link>

        {/* Event Details */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
          {/* Event Image */}
          {event.image ? (
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-64 md:h-96 w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-9xl">🎉</span>
            </div>
          )}

          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {event.title}
            </h1>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">
                      {new Date(event.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Lieu</p>
                    <p className="font-semibold">{event.location}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix</p>
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-primary">
                        {event.price}€
                      </span>
                      {event.memberPrice && (
                        <span className="text-sm text-accent font-medium">
                          {event.memberPrice}€ pour les membres
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎫</span>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Places disponibles
                    </p>
                    <p
                      className={`font-semibold ${
                        isSoldOut ? "text-red-500" : "text-accent"
                      }`}
                    >
                      {availableSeats} / {event.maxSeats}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              disabled={isSoldOut}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                isSoldOut
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-accent hover:scale-[1.02]"
              }`}
            >
              {isSoldOut ? "Complet" : "Réserver ma place"}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6">
              Réserver pour {event.title}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prénom</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {event.memberPrice && (
                <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                  <input
                    type="checkbox"
                    id="isMember"
                    checked={formData.isMember}
                    onChange={(e) =>
                      setFormData({ ...formData, isMember: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="isMember"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Je suis membre cotisant FEN'SUP ({event.memberPrice}€ au
                    lieu de {event.price}€)
                  </label>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Redirection..." : `Payer ${currentPrice}€`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
