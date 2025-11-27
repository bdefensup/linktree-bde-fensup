"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  MapPin,
  Ticket,
  ArrowRight,
  ArrowLeft,
  Filter,
  X,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  format,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

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
  isFeatured: boolean;
  _count?: {
    bookings: number;
  };
}

type FilterType = "all" | "day" | "week" | "month" | "year" | "custom";

export default function BilletteriePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const now = new Date();

    switch (filterType) {
      case "day":
        return isSameDay(eventDate, now);
      case "week":
        return isSameWeek(eventDate, now, { locale: fr });
      case "month":
        return isSameMonth(eventDate, now);
      case "year":
        return isSameYear(eventDate, now);
      case "custom":
        if (dateRange?.from && dateRange?.to) {
          return isWithinInterval(eventDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        } else if (dateRange?.from) {
          return isSameDay(eventDate, dateRange.from);
        }
        return true;
      default:
        return true;
    }
  });

  const handleFilterChange = (type: FilterType) => {
    if (type === "custom") {
      setIsCalendarOpen(true);
    } else {
      setFilterType(type);
      setDateRange(undefined);
    }
  };

  const clearFilters = () => {
    setFilterType("all");
    setDateRange(undefined);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-4 relative">
          <div className="flex justify-start md:absolute md:left-0 md:top-0 mb-6 md:mb-0 z-20">
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
                <span className="hidden md:inline text-muted-foreground group-hover:text-foreground transition-colors">
                  Retour à l'accueil
                </span>
                <span className="md:hidden text-muted-foreground group-hover:text-foreground transition-colors">
                  Retour
                </span>
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
            Billetterie Officielle
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            Découvrez et réservez vos places pour les événements exclusifs du
            BDE FENELON.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="w-full max-w-4xl overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            <div className="flex items-center gap-2 px-2 md:justify-center min-w-max">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("all")}
                className="rounded-full"
              >
                Tout
              </Button>
              <Button
                variant={filterType === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("day")}
                className="rounded-full"
              >
                Aujourd'hui
              </Button>
              <Button
                variant={filterType === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("week")}
                className="rounded-full"
              >
                Cette semaine
              </Button>
              <Button
                variant={filterType === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("month")}
                className="rounded-full"
              >
                Ce mois
              </Button>
              <Button
                variant={filterType === "year" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("year")}
                className="rounded-full"
              >
                Cette année
              </Button>

              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={filterType === "custom" ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "rounded-full gap-2",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM", { locale: fr })} -{" "}
                          {format(dateRange.to, "dd/MM", { locale: fr })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM", { locale: fr })
                      )
                    ) : (
                      "Période..."
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      if (range?.from) {
                        setFilterType("custom");
                      }
                    }}
                    numberOfMonths={2}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>

              {filterType !== "all" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  className="rounded-full h-8 w-8 ml-2 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="overflow-hidden border-border/50 shadow-sm"
              >
                <Skeleton className="h-48 w-full" />
                <CardHeader className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full rounded-lg" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-muted-foreground mb-6">
              Aucun événement ne correspond à vos filtres.
            </p>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="rounded-full"
            >
              Effacer les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event, index) => {
              const availableSeats =
                event.maxSeats - (event._count?.bookings || 0);
              const isSoldOut = availableSeats <= 0;
              // Only feature the first event if we are viewing ALL events, otherwise standard grid
              const isFeatured = filterType === "all" && event.isFeatured;
              const colSpan = isFeatured
                ? "col-span-1 md:col-span-2 md:row-span-2"
                : "col-span-1";

              return (
                <div
                  key={event.id}
                  className={`group block h-full ${colSpan} ${isSoldOut ? "pointer-events-none opacity-75 grayscale" : ""}`}
                >
                  <Link
                    href={isSoldOut ? "#" : `/billetterie/${event.id}`}
                    className={isSoldOut ? "cursor-not-allowed" : ""}
                    aria-disabled={isSoldOut}
                  >
                    <Card
                      className={`h-full flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 rounded-3xl ${
                        !isSoldOut
                          ? "hover:bg-card hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                          : ""
                      }`}
                    >
                      {/* Image Container */}
                      <div
                        className={`relative w-full overflow-hidden ${isFeatured ? "h-64 md:h-80" : "h-56"}`}
                      >
                        {event.image ? (
                          <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className={`object-cover transition-transform duration-500 ${!isSoldOut ? "group-hover:scale-105" : ""}`}
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
                            <Ticket className="w-16 h-16 text-primary/20" />
                          </div>
                        )}

                        {/* Status Badges */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                          {isSoldOut ? (
                            <Badge
                              variant="destructive"
                              className="font-semibold shadow-lg"
                            >
                              Complet
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-background/80 backdrop-blur-md text-foreground font-medium shadow-sm"
                            >
                              {availableSeats} places restantes
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-4">
                          <h3
                            className={`font-bold leading-tight transition-colors ${isFeatured ? "text-3xl" : "text-xl"} ${!isSoldOut ? "group-hover:text-primary" : ""}`}
                          >
                            {event.title}
                          </h3>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-grow space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {new Date(event.date).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                          <span className="text-border">•</span>
                          <span className="font-medium">
                            {new Date(event.date).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-secondary" />
                          <span>{event.location}</span>
                        </div>

                        <p
                          className={`text-muted-foreground leading-relaxed ${isFeatured ? "text-base line-clamp-3" : "text-sm line-clamp-2"}`}
                        >
                          {event.description}
                        </p>
                      </CardContent>

                      <CardFooter className="pt-2 pb-6 px-6 border-t border-border/50 mt-auto">
                        <div className="w-full flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                              À partir de
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span
                                className={`font-bold text-primary ${isFeatured ? "text-3xl" : "text-2xl"}`}
                              >
                                {event.memberPrice || event.price}€
                              </span>
                              {event.memberPrice && (
                                <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                                  {event.price}€
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            variant={isSoldOut ? "secondary" : "default"}
                            disabled={isSoldOut}
                            className={`rounded-full px-6 transition-all ${
                              !isSoldOut &&
                              "group-hover:bg-primary group-hover:text-primary-foreground shadow-lg shadow-primary/20"
                            }`}
                          >
                            {isSoldOut ? "Complet" : "Réserver"}
                            {!isSoldOut && (
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            )}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
