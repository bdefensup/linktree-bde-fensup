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
  Search,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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
  externalPrice?: number;
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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.error("API returned non-array:", data);
          setEvents([]);
        }
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

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !event.title.toLowerCase().includes(query) &&
        !event.location.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Date Filters
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
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative pb-20">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full -ml-2">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Retour</span>
              </Link>
            </Button>
            <h1 className="text-lg font-bold tracking-tight md:text-xl">Billetterie</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Search Input (Desktop) */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="w-[200px] rounded-full pl-8 bg-secondary/50 border-none focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Bar (Scrollable) */}
        <div className="border-t border-border/10">
          <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide max-w-7xl mx-auto">
            {/* Search Input (Mobile) */}
            <div className="md:hidden relative min-w-[40px]">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-border/50 mx-1 hidden md:block" />

            <Button
              variant={filterType === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleFilterChange("all")}
              className="rounded-full text-xs h-8 px-4 whitespace-nowrap"
            >
              Tout
            </Button>
            <Button
              variant={filterType === "week" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleFilterChange("week")}
              className="rounded-full text-xs h-8 px-4 whitespace-nowrap"
            >
              Cette semaine
            </Button>
            <Button
              variant={filterType === "month" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleFilterChange("month")}
              className="rounded-full text-xs h-8 px-4 whitespace-nowrap"
            >
              Ce mois
            </Button>

            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={filterType === "custom" ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-full text-xs h-8 px-4 whitespace-nowrap gap-2",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM")} - {format(dateRange.to, "dd/MM")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM")
                    )
                  ) : (
                    "Date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
                  numberOfMonths={1}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>

            {(filterType !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                className="rounded-full h-8 w-8 ml-auto shrink-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="space-y-2 px-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Aucun événement trouvé</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Essayez de modifier vos filtres ou revenez plus tard.
            </p>
            <Button onClick={clearFilters} variant="outline" className="mt-6 rounded-full">
              Tout effacer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredEvents.map((event) => {
              const availableSeats = event.maxSeats - (event._count?.bookings || 0);
              const isSoldOut = availableSeats <= 0;
              const eventDate = new Date(event.date);

              return (
                <Link
                  key={event.id}
                  href={isSoldOut ? "#" : `/billetterie/${event.id}`}
                  className={cn(
                    "group block transition-all duration-300",
                    isSoldOut && "opacity-75 grayscale pointer-events-none"
                  )}
                >
                  <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                    {/* Image Section */}
                    <div className="relative aspect-4/3 md:aspect-video w-full overflow-hidden">
                      {event.image ? (
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-secondary/10 flex items-center justify-center">
                          <Ticket className="w-12 h-12 text-muted-foreground/20" />
                        </div>
                      )}

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />

                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        {isSoldOut ? (
                          <Badge variant="destructive" className="font-bold shadow-sm">
                            Complet
                          </Badge>
                        ) : (
                          availableSeats < 10 && (
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-sm animate-pulse">
                              Dernières places
                            </Badge>
                          )
                        )}
                      </div>

                      {/* Price Tag & Seats */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        {!isSoldOut && (
                          <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border border-white/10">
                            {availableSeats} places
                          </div>
                        )}
                        <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-sm border border-white/10">
                          {event.memberPrice || event.price}€
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <CardContent className="p-4 flex flex-col gap-3 grow">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                      </div>

                      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                          <span className="capitalize font-medium text-foreground/80">
                            {format(eventDate, "EEEE d MMMM", { locale: fr })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary shrink-0" />
                          <span>{format(eventDate, "HH:mm")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      {/* Detailed Prices */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {event.memberPrice && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-2 h-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                          >
                            Adhérent: {event.memberPrice}€
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2 h-5 text-muted-foreground"
                        >
                          Non Adh: {event.price}€
                        </Badge>
                        {event.externalPrice && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-2 h-5 text-muted-foreground border-dashed"
                          >
                            Ext: {event.externalPrice}€
                          </Badge>
                        )}
                      </div>
                    </CardContent>

                    {/* Footer Action */}
                    <CardFooter className="p-4 pt-0 mt-auto">
                      <Button
                        className={cn(
                          "w-full rounded-xl font-bold",
                          isSoldOut
                            ? "bg-muted text-muted-foreground"
                            : "group-hover:bg-primary group-hover:text-primary-foreground"
                        )}
                        variant={isSoldOut ? "secondary" : "outline"}
                      >
                        {isSoldOut ? "Événement Complet" : "Réserver ma place"}
                        {!isSoldOut && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
