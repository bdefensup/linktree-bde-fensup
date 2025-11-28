"use client";

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
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

// Mock Data removed

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

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const chatIdParam = searchParams.get("chatId");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!chatIdParam) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { getMessages } = await import("@/app/actions/messaging");
        const data = await getMessages(chatIdParam);
        setMessages(data as unknown as Message[]);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

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
          console.log("Realtime event received:", payload);
          const { getMessages } = await import("@/app/actions/messaging");
          const data = await getMessages(chatIdParam);
          console.log("Fetched updated messages:", data.length);
          setMessages(data as unknown as Message[]);
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatIdParam]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !chatIdParam) return;

    try {
      const { sendMessage, getMessages } = await import(
        "@/app/actions/messaging"
      );
      await sendMessage(chatIdParam, messageInput);
      setMessageInput("");

      // Immediate update for the sender
      const data = await getMessages(chatIdParam);
      setMessages(data as unknown as Message[]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!chatIdParam) {
    return (
      <div className="h-[calc(100vh-6rem)] rounded-xl border bg-background shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Card className="max-w-md w-full p-8 flex flex-col items-center text-center bg-muted/10 border-dashed">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Sélectionnez une conversation
            </h3>
            <p className="text-muted-foreground text-sm">
              Choisissez une discussion dans la barre latérale pour commencer à
              échanger.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-[calc(100vh-6rem)] rounded-xl border bg-background shadow-sm overflow-hidden flex flex-col">
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b h-16">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-border/50">
                {/* Placeholder for chat info - ideally fetched or passed */}
                <AvatarImage src="" />
                <AvatarFallback>CH</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-sm">Discussion</h2>
                <p className="text-xs text-muted-foreground">En ligne</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
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
          <ScrollArea className="flex-1 p-4 bg-muted/5">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              {loading ? (
                <div className="flex justify-center py-4">Chargement...</div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2 ",
                      msg.senderId === session?.user?.id
                        ? "ml-auto flex-row-reverse"
                        : ""
                    )}
                  >
                    <Avatar className="h-8 w-8 mt-1 border border-border/50">
                      <AvatarImage src={msg.sender?.image || ""} />
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
                  <p className="text-sm">
                    Envoyez un message pour démarrer la discussion.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <form
              onSubmit={handleSendMessage}
              className="flex items-end gap-2 max-w-3xl mx-auto"
            >
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
