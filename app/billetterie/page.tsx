"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  maxSeats: number;
  image: string | null;
  _count?: {
    bookings: number;
  };
}

export default function BilletteriePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Chargement des événements...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo.png"
              alt="BDE FEN'SUP"
              width={100}
              height={100}
              className="mx-auto"
            />
          </Link>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
            Billetterie
          </h1>
          <p className="text-lg text-muted-foreground">
            Réservez vos places pour les événements du BDE FEN'SUP
          </p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              Aucun événement disponible pour le moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const availableSeats =
                event.maxSeats - (event._count?.bookings || 0);
              const isSoldOut = availableSeats <= 0;

              return (
                <Link
                  key={event.id}
                  href={`/billetterie/${event.id}`}
                  className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Event Image */}
                  {event.image ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-6xl">🎉</span>
                    </div>
                  )}

                  {/* Sold Out Badge */}
                  {isSoldOut && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Complet
                    </div>
                  )}

                  {/* Event Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📅</span>
                        <span>
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎫</span>
                        <span
                          className={isSoldOut ? "text-red-500" : "text-accent"}
                        >
                          {availableSeats} place{availableSeats > 1 ? "s" : ""}{" "}
                          disponible{availableSeats > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {event.price}€
                      </span>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Voir détails →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
