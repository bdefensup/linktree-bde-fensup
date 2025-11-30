"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Send, X, Loader2, Ticket, Trash2 } from "lucide-react";
import { createTicket, sendGuestMessage, getTicketMessages } from "@/app/actions/ticket";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ViewState = "IDLE" | "FORM" | "CHAT";

const SUBJECTS = ["Question générale", "Problème billetterie", "Partenariat", "Événement", "Autre"];

interface MessageWithSender {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  sender: {
    image: string | null;
    name: string | null;
  };
}

import { useSearchParams, useRouter } from "next/navigation";

// ... imports

export function SupportCard() {
  const [view, setView] = useState<ViewState>("IDLE");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [ticketStatus, setTicketStatus] = useState<string | null>("OPEN");
  const scrollRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Restore session from localStorage or URL
  useEffect(() => {
    const urlConversationId = searchParams.get("conversationId");
    const urlGuestId = searchParams.get("guestId");

    if (urlConversationId && urlGuestId) {
      // Restore from URL (Magic Link)
      setConversationId(urlConversationId);
      setGuestId(urlGuestId);
      setView("CHAT");

      // Persist to localStorage
      localStorage.setItem("bde_support_conversationId", urlConversationId);
      localStorage.setItem("bde_support_guestId", urlGuestId);

      // Clean URL
      router.replace("/", { scroll: false });
    } else {
      // Restore from localStorage
      const savedConversationId = localStorage.getItem("bde_support_conversationId");
      const savedGuestId = localStorage.getItem("bde_support_guestId");
      const savedSubject = localStorage.getItem("bde_support_subject");
      const savedEmail = localStorage.getItem("bde_support_email");

      if (savedConversationId && savedGuestId) {
        setConversationId(savedConversationId);
        setGuestId(savedGuestId);
        if (savedSubject) setSubject(savedSubject);
        if (savedEmail) setEmail(savedEmail);
        setView("CHAT");
      }
    }
  }, [searchParams, router]);

  // Polling for messages
  useEffect(() => {
    if (view === "CHAT" && conversationId && guestId) {
      const fetchMessages = async () => {
        try {
          const data = await getTicketMessages(conversationId, guestId);
          setMessages(data.messages as unknown as MessageWithSender[]);
          setTicketStatus(data.ticketStatus);
        } catch (error) {
          console.error("Polling error:", error);
        }
      };

      fetchMessages(); // Initial fetch
      const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
    return;
  }, [view, conversationId, guestId]);

  // Scroll to bottom on new messages
  const prevMessagesLength = useRef(0);
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      prevMessagesLength.current = messages.length;
    }
  }, [messages.length]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject || !email) return;

    setLoading(true);
    try {
      const result = await createTicket(subject, name, email);
      if (result.success && result.conversationId && result.guestId) {
        setConversationId(result.conversationId);
        setGuestId(result.guestId);

        // Save to localStorage
        localStorage.setItem("bde_support_conversationId", result.conversationId);
        localStorage.setItem("bde_support_guestId", result.guestId);
        localStorage.setItem("bde_support_subject", subject);
        localStorage.setItem("bde_support_email", email);

        setView("CHAT");
      } else {
        throw new Error("Invalid response from createTicket");
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
      alert("Erreur lors de la création du ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !guestId) return;

    const content = newMessage;
    setNewMessage(""); // Optimistic clear

    try {
      await sendGuestMessage(conversationId, guestId, content);
      // Immediate fetch to show message
      const data = await getTicketMessages(conversationId, guestId);
      setMessages(data.messages as unknown as MessageWithSender[]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(content); // Restore on error
    }
  };

  const handleEndSession = () => {
    if (
      confirm("Voulez-vous vraiment quitter cette conversation ? Vous ne pourrez plus y accéder.")
    ) {
      localStorage.removeItem("bde_support_conversationId");
      localStorage.removeItem("bde_support_guestId");
      localStorage.removeItem("bde_support_subject");
      setConversationId(null);
      setGuestId(null);
      setMessages([]);
      setView("IDLE");
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);

  if (view === "IDLE") {
    return (
      <div className="col-span-1 md:col-span-1">
        {/* Mobile Compact View */}
        <div className={cn("md:hidden", isExpanded ? "hidden" : "block")}>
          <Card
            className="relative h-full overflow-hidden border border-border/50 bg-card/80 hover:border-primary/50 hover:shadow-primary/5 transition-all duration-300 rounded-3xl"
            onClick={() => setIsExpanded(true)}
          >
            <CardContent className="flex items-center p-2 h-full justify-between">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 text-lg">
                <MessageCircle className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 text-left ml-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm truncate group-hover:text-primary">
                    Support BDE
                  </h3>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0">
                  Une question ? Discutez avec nous !
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop / Expanded Mobile View */}
        <div className={cn("w-full h-full relative group", !isExpanded && "hidden md:block")}>
          <div className="absolute -inset-1 bg-linear-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          <Card className="relative h-[450px] border-blue-500/30 bg-card/80 backdrop-blur-sm overflow-hidden rounded-3xl flex flex-col justify-center">
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 md:hidden z-10"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>

            <CardContent className="p-4 md:p-6 flex flex-col items-center text-center space-y-4">
              <div className="mb-2">
                <MessageCircle className="w-12 h-12 text-blue-500" />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground">Support BDE</h3>
                <p className="text-xs text-muted-foreground">Une question ? Discutez avec nous !</p>
              </div>

              <div className="flex flex-col w-full gap-2">
                <Button
                  size="sm"
                  className="w-full bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-md shadow-blue-500/20"
                  onClick={() => setView("FORM")}
                >
                  Démarrer la discussion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (view === "FORM") {
    return (
      <div className="col-span-1 md:col-span-1">
        <Card className="relative h-[450px] border-blue-500/30 bg-card/95 backdrop-blur-md overflow-hidden rounded-3xl flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm">Nouveau Ticket</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setView("IDLE")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form
              onSubmit={handleStartChat}
              className="space-y-4 flex-1 flex flex-col justify-center"
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs">
                  Votre nom complet
                </Label>
                <Input
                  id="name"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-8 text-base md:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs">
                  Votre email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-8 text-base md:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs">
                  Sujet
                </Label>
                <Select value={subject} onValueChange={setSubject} required>
                  <SelectTrigger className="h-8 text-base md:text-sm">
                    <SelectValue placeholder="Choisir un sujet" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-auto"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lancer le chat"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // CHAT VIEW
  return (
    <div className="col-span-1 md:col-span-1">
      <Card className="relative h-[450px] border-blue-500/30 bg-card/95 backdrop-blur-md overflow-hidden rounded-3xl flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-3 border-b border-border/50 bg-muted/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/10 p-1.5 rounded-full">
              <Ticket className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold truncate max-w-[120px]">{subject}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                {ticketStatus === "OPEN" ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    En ligne
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    Résolu
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={handleEndSession}
              title="Quitter la conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setView("IDLE")}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0 p-3">
          <div className="space-y-3 pb-2">
            {messages.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-4">
                Un membre du staff va vous répondre bientôt.
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === guestId;
              return (
                <div
                  key={msg.id}
                  className={cn("flex w-full gap-2", isMe ? "justify-end" : "justify-start")}
                >
                  {!isMe && (
                    <Avatar className="h-6 w-6 mt-1 shrink-0">
                      <AvatarImage src={msg.sender.image || undefined} />
                      <AvatarFallback className="text-[10px]">ST</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 text-xs max-w-[80%] wrap-break-word",
                      isMe
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none"
                    )}
                  >
                    {msg.content}
                    <div
                      className={cn(
                        "text-[9px] mt-1 opacity-70",
                        isMe ? "text-blue-100" : "text-muted-foreground"
                      )}
                    >
                      {format(new Date(msg.createdAt), "HH:mm", { locale: fr })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t border-border/50 bg-background/50 shrink-0">
          {ticketStatus === "OPEN" ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="h-9 text-base md:text-xs rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-blue-500"
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white shrink-0"
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="text-center text-xs text-muted-foreground py-2">
              Ce ticket est résolu.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
