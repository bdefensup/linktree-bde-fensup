"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  CheckCheck,
  Search,
  Pin,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

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

interface Conversation {
  id: string;
  participants: {
    userId: string;
    isPinned: boolean;
    user: {
      id: string;
      name: string | null;
      image: string | null;
      email: string;
      position: string | null;
    };
  }[];
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const chatIdParam = searchParams.get("chatId");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!chatIdParam) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { getMessages, getConversation } = await import("@/app/messaging");
        const [msgs, conv] = await Promise.all([
          getMessages(chatIdParam),
          getConversation(chatIdParam),
        ]);
        setMessages(msgs as unknown as Message[]);
        setConversation(conv as unknown as Conversation);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Polling fallback
    const interval = setInterval(() => {
      const fetchLatest = async () => {
        const { getMessages, getConversation } = await import("@/app/messaging");
        const [msgs, conv] = await Promise.all([
          getMessages(chatIdParam),
          getConversation(chatIdParam),
        ]);
        setMessages(msgs as unknown as Message[]);
        setConversation(conv as unknown as Conversation);
      };
      fetchLatest();
    }, 3000);

    // Realtime subscription
    const channel = supabase
      .channel(`conversation:${chatIdParam}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `conversationId=eq.${chatIdParam}`,
        },
        async (payload) => {
          if ((payload.new as { conversationId: string }).conversationId === chatIdParam) {
            const { getMessages } = await import("@/app/messaging");
            const data = await getMessages(chatIdParam);
            setMessages(data as unknown as Message[]);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [chatIdParam]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !chatIdParam) return;

    try {
      const { sendMessage, getMessages } = await import("@/app/messaging");
      await sendMessage(chatIdParam, messageInput);
      setMessageInput("");

      // Immediate update for the sender
      const data = await getMessages(chatIdParam);
      setMessages(data as unknown as Message[]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTogglePin = async () => {
    if (!chatIdParam) return;
    try {
      const { togglePinConversation, getConversation } = await import("@/app/messaging");
      await togglePinConversation(chatIdParam);
      const updatedConv = await getConversation(chatIdParam);
      setConversation(updatedConv as unknown as Conversation);
      window.dispatchEvent(new Event("conversation:updated"));
      toast.success("Statut de l'épingle mis à jour");
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      if (error instanceof Error && error.message === "Maximum 4 conversations pinned") {
        toast.error("Vous ne pouvez épingler que 4 conversations maximum.");
      } else {
        toast.error("Erreur lors de la mise à jour de l'épingle");
      }
    }
  };

  if (!chatIdParam) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <Card className="max-w-md w-full p-8 flex flex-col items-center text-center bg-muted/10 border-dashed">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
          <p className="text-muted-foreground text-sm">
            Choisissez une discussion dans la liste pour commencer à échanger.
          </p>
        </Card>
      </div>
    );
  }

  const otherParticipant = conversation?.participants.find(
    (p) => p.userId !== session?.user?.id
  )?.user;

  const myParticipant = conversation?.participants.find((p) => p.userId === session?.user?.id);

  const isPinned = myParticipant?.isPinned;
  const isMandatory = ["President", "Tresorier", "Secretaire"].includes(
    otherParticipant?.position || ""
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b h-16">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-border/50">
                <AvatarImage src={otherParticipant?.image || undefined} />
                <AvatarFallback>
                  {otherParticipant?.name?.slice(0, 2).toUpperCase() || "CH"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-sm">
                  {otherParticipant?.name || "Chargement..."}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {otherParticipant?.email || "En ligne"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={!isMandatory ? handleTogglePin : undefined}
                    disabled={isMandatory}
                  >
                    <Pin
                      className={cn(
                        "h-4 w-4 transform rotate-45",
                        (isPinned || isMandatory) && "text-primary fill-primary",
                        isMandatory && "text-red-500 fill-red-500"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isMandatory ? "Conversation obligatoire" : isPinned ? "Désépingler" : "Épingler"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Appel vocal</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Appel vidéo</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Plus d'options</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-hidden bg-muted/5">
            <ScrollArea className="h-full p-4">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center py-4">Chargement...</div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2 ",
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
                          "rounded-2xl px-4 py-2 text-sm shadow-sm",
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
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {msg.senderId === session?.user?.id && (
                            <span>
                              <CheckCheck className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p>Aucun message pour le moment.</p>
                    <p className="text-sm">Envoyez un message pour démarrer la discussion.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input */}
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
                  placeholder="Écrivez votre message..."
                  className="pr-10 py-6 rounded-full bg-muted/30 border-muted-foreground/20 focus-visible:ring-1"
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
                disabled={!messageInput.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </>
      </div>
    </TooltipProvider>
  );
}
