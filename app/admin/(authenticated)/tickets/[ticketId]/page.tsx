"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, CheckCheck, Paperclip, Smile, ArrowLeft, Loader2, Lock, Unlock } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { toggleTicketStatus } from "@/app/actions/ticket";
import { getMessages, getConversation, sendMessage } from "@/app/messaging";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  sender?: {
    name: string | null;
    image: string | null;
  };
}

interface Ticket {
  id: string;
  subject?: string | null;
  guestName?: string | null;
  ticketStatus?: string;
  createdAt: Date;
  participants: {
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
}

export default function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const router = useRouter();
  const { ticketId } = use(params);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  const mapConversationToTicket = (conv: any): Ticket => {
    return {
      id: conv.id,
      subject: conv.ticket?.subject || "Ticket Support",
      guestName: conv.ticket?.guestName,
      ticketStatus: conv.ticket?.status,
      createdAt: conv.createdAt,
      participants: conv.participants,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [msgs, conv] = await Promise.all([getMessages(ticketId), getConversation(ticketId)]);
        setMessages(msgs as unknown as Message[]);
        if (conv) {
          setTicket(mapConversationToTicket(conv));
        }
      } catch (error) {
        console.error("Failed to fetch ticket data:", error);
        toast.error("Erreur lors du chargement du ticket");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel(`ticket:${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `conversationId=eq.${ticketId}`,
        },
        async (payload) => {
          const newMsg = payload.new as { id: string; conversationId: string };
          if (newMsg.conversationId === ticketId) {
            const msgs = await getMessages(ticketId);
            setMessages(msgs as unknown as Message[]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(ticketId, messageInput);
      setMessageInput("");
      const msgs = await getMessages(ticketId);
      setMessages(msgs as unknown as Message[]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async (newStatus: "OPEN" | "RESOLVED") => {
    try {
      await toggleTicketStatus(ticketId, newStatus);
      toast.success(newStatus === "RESOLVED" ? "Ticket fermé" : "Ticket rouvert");
      const conv = await getConversation(ticketId);
      if (conv) {
        setTicket(mapConversationToTicket(conv));
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return <div>Ticket introuvable</div>;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarFallback>{ticket.guestName?.slice(0, 2).toUpperCase() || "AN"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-sm flex items-center gap-2">
                {ticket.guestName || "Anonyme"}
                <span className="text-muted-foreground font-normal">•</span>
                <span className="font-normal">{ticket.subject}</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {format(new Date(ticket.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
          </div>

          <div>
            {ticket.ticketStatus === "OPEN" ? (
              <Badge
                variant="destructive"
                className="cursor-pointer hover:bg-red-600 px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors"
                onClick={() => handleToggleStatus("RESOLVED")}
              >
                <Lock className="h-3 w-3 mr-1.5" />
                Fermer le ticket
              </Badge>
            ) : (
              <Badge
                className="bg-green-600 hover:bg-green-700 cursor-pointer px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors text-white"
                onClick={() => handleToggleStatus("OPEN")}
              >
                <Unlock className="h-3 w-3 mr-1.5" />
                Rouvrir le ticket
              </Badge>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-hidden bg-muted/5">
          <ScrollArea className="h-full p-4">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <p>Aucun message pour le moment.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      msg.senderId === session?.user?.id ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <Avatar className="h-8 w-8 mt-1 border border-border/50">
                      <AvatarImage src={msg.sender?.image || undefined} />
                      <AvatarFallback>
                        {msg.sender?.name?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 text-sm shadow-sm max-w-[80%]",
                        msg.senderId === session?.user?.id
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-card border rounded-tl-none"
                      )}
                    >
                      <p>{msg.content}</p>
                      <div
                        className={cn(
                          "flex items-center justify-end gap-1 mt-1 text-[10px]",
                          msg.senderId === session?.user?.id
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        <span>{format(new Date(msg.createdAt), "HH:mm")}</span>
                        {msg.senderId === session?.user?.id && <CheckCheck className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        {ticket.ticketStatus === "OPEN" ? (
          <div className="p-4 border-t bg-background">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-3xl mx-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                  >
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Joindre un fichier</TooltipContent>
              </Tooltip>

              <div className="flex-1 relative">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  className="pr-10 py-6 rounded-full bg-muted/30 border-muted-foreground/20 focus-visible:ring-1"
                  disabled={sending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1.5 h-8 w-8 rounded-full hover:bg-transparent"
                >
                  <Smile className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 rounded-full"
                disabled={!messageInput.trim() || sending}
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div className="p-4 border-t bg-muted/50 text-center text-muted-foreground text-sm">
            Ce ticket est fermé. Rouvrez-le pour répondre.
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
