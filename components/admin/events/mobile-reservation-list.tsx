"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Mail, Calendar, User, CheckCircle2, XCircle, Clock, LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";


type Booking = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT";
  createdAt: string;
  event: {
    title: string;
    date: string;
  };
};

interface MobileReservationListProps {
  bookings: Booking[];
}

export function MobileReservationList({ bookings }: MobileReservationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = useMemo(() => {
    if (!searchQuery) return bookings;
    const lowerQuery = searchQuery.toLowerCase();
    return bookings.filter((booking) =>
      booking.firstName.toLowerCase().includes(lowerQuery) ||
      booking.lastName.toLowerCase().includes(lowerQuery) ||
      booking.email.toLowerCase().includes(lowerQuery) ||
      booking.phone.toLowerCase().includes(lowerQuery)
    );
  }, [bookings, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-500/15 text-green-500 border-green-500/20 hover:bg-green-500/25"><CheckCircle2 className="w-3 h-3 mr-1" /> Validé</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500/15 text-red-500 border-red-500/20 hover:bg-red-500/25"><XCircle className="w-3 h-3 mr-1" /> Refusé</Badge>;
      case "CHECKED_IN":
        return <Badge className="bg-blue-500/15 text-blue-500 border-blue-500/20 hover:bg-blue-500/25"><LogIn className="w-3 h-3 mr-1" /> Check-in</Badge>;
      case "CHECKED_OUT":
        return <Badge className="bg-indigo-500/15 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/25"><LogOut className="w-3 h-3 mr-1" /> Check-out</Badge>;
      default:
        return <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/20 hover:bg-orange-500/25"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Search Bar - Sticky Top */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md pb-4 pt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher (nom, email, tel...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-white/10 h-12 text-base rounded-xl focus-visible:ring-primary/50"
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground px-1">
          {filteredBookings.length} résultat{filteredBookings.length > 1 ? "s" : ""} trouvé{filteredBookings.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Aucune réservation trouvée.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/5 active:scale-[0.98] transition-transform duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-white leading-tight">
                    {booking.firstName} {booking.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {booking.event.title}
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="space-y-2 mt-4 pt-3 border-t border-white/5">
                <a href={`mailto:${booking.email}`} className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors p-2 -mx-2 rounded-lg hover:bg-white/5">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="truncate">{booking.email}</span>
                </a>
                
                {booking.phone && (
                  <a href={`tel:${booking.phone}`} className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors p-2 -mx-2 rounded-lg hover:bg-white/5">
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span>{booking.phone}</span>
                  </a>
                )}
              </div>
              
              <div className="mt-3 text-[10px] text-right text-muted-foreground/50 font-mono">
                {format(new Date(booking.createdAt), "dd MMM yyyy • HH:mm", { locale: fr })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
