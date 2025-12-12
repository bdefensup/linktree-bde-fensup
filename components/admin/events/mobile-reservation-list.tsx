"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Mail, Calendar, User, CheckCircle2, XCircle, Clock, LogIn, LogOut, Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const updateStatus = async (id: string, status: string) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      const data = await response.json();

      if (data.emailSent === false && (status === "CONFIRMED" || status === "CANCELLED")) {
        toast.warning(`Statut mis à jour, mais l'envoi de l'email a échoué: ${data.emailError || "Erreur inconnue"}`);
      } else {
        toast.success("Statut mis à jour avec succès.");
      }
      
      window.location.reload();
    } catch {
      toast.error("Impossible de mettre à jour le statut.");
    } finally {
      setProcessingId(null);
    }
  };

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
          <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl transition-opacity opacity-0 group-focus-within:opacity-100" />
          <div className="relative bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 group-focus-within:bg-[#1C1C1E] group-focus-within:border-white/20 group-focus-within:ring-1 group-focus-within:ring-white/20">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 group-focus-within:text-white transition-colors" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-transparent border-none h-11 text-base text-white placeholder:text-white/30 focus-visible:ring-0 rounded-none"
            />
            {searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
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
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
              <User className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/40 font-medium text-sm">Aucune réservation trouvée</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="group relative bg-[#121212] hover:bg-[#181818] rounded-3xl p-5 border border-white/10 active:scale-[0.98] transition-all duration-300 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-white tracking-tight leading-none">
                    {booking.firstName} <span className="text-white/60">{booking.lastName}</span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-white/40">
                    <Calendar className="h-3 w-3" />
                    <span className="truncate max-w-[180px]">{booking.event.title}</span>
                  </div>
                </div>
                <div className="scale-90 origin-top-right">
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex items-center gap-2 mt-5">
                {booking.status === "PENDING" ? (
                  <>
                    <Button 
                      onClick={() => updateStatus(booking.id, "CONFIRMED")}
                      disabled={processingId === booking.id}
                      className="flex-1 h-10 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20"
                    >
                      {processingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                      Valider
                    </Button>
                    <Button 
                      onClick={() => updateStatus(booking.id, "CANCELLED")}
                      disabled={processingId === booking.id}
                      className="flex-1 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                    >
                      {processingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                      Refuser
                    </Button>
                  </>
                ) : booking.status === "CONFIRMED" ? (
                  <>
                    <Button 
                      onClick={() => updateStatus(booking.id, "CHECKED_IN")}
                      disabled={processingId === booking.id}
                      className="flex-1 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20"
                    >
                      {processingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                      Check-in
                    </Button>
                    <a 
                      href={`tel:${booking.phone}`} 
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#1C1C1E] hover:bg-[#252525] text-white/80 hover:text-white transition-colors border border-white/5 active:bg-white/10"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </>
                ) : booking.status === "CHECKED_IN" ? (
                  <Button 
                    onClick={() => updateStatus(booking.id, "CHECKED_OUT")}
                    disabled={processingId === booking.id}
                    className="flex-1 h-10 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20"
                  >
                    {processingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                    Check-out
                  </Button>
                ) : (
                  <>
                    <a 
                      href={`mailto:${booking.email}`} 
                      className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-[#1C1C1E] hover:bg-[#252525] text-white/80 hover:text-white text-xs font-medium transition-colors border border-white/5 active:bg-white/10"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </a>
                    
                    {booking.phone && (
                      <a 
                        href={`tel:${booking.phone}`} 
                        className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-[#1C1C1E] hover:bg-[#252525] text-white/80 hover:text-white text-xs font-medium transition-colors border border-white/5 active:bg-white/10"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Appeler
                      </a>
                    )}
                  </>
                )}
              </div>
              
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(244,114,49,0.5)]" />
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-medium text-white/20 uppercase tracking-wider">
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
