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
    <div className="space-y-6 pb-24">
      {/* Search Bar - Floating Glass */}
      <div className="sticky top-0 z-20 px-4 pt-4 pb-2">
        <div className="relative group">
          <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl transition-opacity opacity-0 group-focus-within:opacity-100" />
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 group-focus-within:bg-black/80 group-focus-within:border-white/20 group-focus-within:ring-1 group-focus-within:ring-white/20">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 group-focus-within:text-white transition-colors" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-transparent border-none h-14 text-lg text-white placeholder:text-white/30 focus-visible:ring-0 rounded-none"
            />
            {searchQuery && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40 bg-white/5 px-2 py-1 rounded-full">
                {filteredBookings.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 px-4">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
              <User className="h-10 w-10 text-white/20" />
            </div>
            <p className="text-white/40 font-medium">Aucune réservation trouvée</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="group relative bg-[#161618] hover:bg-[#1C1C1E] rounded-3xl p-5 border border-white/5 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-black/20"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-xl text-white tracking-tight leading-none">
                    {booking.firstName} <span className="text-white/60">{booking.lastName}</span>
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-medium text-white/40">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[180px]">{booking.event.title}</span>
                  </div>
                </div>
                <div className="scale-90 origin-top-right">
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex items-center gap-3 mt-5">
                <a 
                  href={`mailto:${booking.email}`} 
                  className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white/90 text-sm font-medium transition-colors border border-white/5 active:bg-white/15"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
                
                {booking.phone && (
                  <a 
                    href={`tel:${booking.phone}`} 
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white/90 text-sm font-medium transition-colors border border-white/5 active:bg-white/15"
                  >
                    <Phone className="h-4 w-4" />
                    Appeler
                  </a>
                )}
              </div>
              
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[11px] font-medium text-white/20 uppercase tracking-wider">
                <span>Réservé le</span>
                <span className="font-mono text-white/30">
                  {format(new Date(booking.createdAt), "dd MMM • HH:mm", { locale: fr })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
