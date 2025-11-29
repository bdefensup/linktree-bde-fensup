"use client";

import * as React from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { NewConversationDialog } from "./new-conversation-dialog";

import { Pin } from "lucide-react";
import { togglePinConversation } from "@/app/messaging";

interface Conversation {
  id: string;
  lastMessageAt: Date;
  participants: {
    isPinned: boolean;
    user: {
      id: string;
      name: string | null;
      image: string | null;
      email: string;
      position: string | null;
    };
  }[];
  messages: {
    content: string;
    createdAt: Date;
    senderId: string;
  }[];
}

export function ConversationList() {
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("chatId");
  const { data: session } = useSession();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchConversations = React.useCallback(async () => {
    try {
      const { getConversations } = await import("@/app/messaging");
      const data = await getConversations();
      setConversations(data as unknown as Conversation[]);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchConversations();

    // Polling fallback (every 1 second)
    const interval = setInterval(() => {
      fetchConversations();
    }, 1000);

    // Subscribe to new messages and conversation updates
    const channel = supabase
      .channel("public:conversation_list")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation",
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

  const handleTogglePin = async (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    try {
      await togglePinConversation(conversationId);
      fetchConversations();
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

  if (loading) {
    return (
      <div className="w-80 border-r bg-muted/10 flex flex-col">
        <div className="p-4 border-b h-16 flex items-center">
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-muted/10 flex flex-col h-full">
      <div className="p-4 border-b h-16 flex items-center justify-between">
        <h2 className="font-semibold">Messages</h2>
      </div>

      <div className="p-4 pb-2">
        <NewConversationDialog />
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col p-2 gap-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucune conversation épinglée
            </div>
          ) : (
            conversations
              .sort((a, b) => {
                const otherA = a.participants.find((p) => p.user.id !== session?.user?.id)?.user;
                const myA = a.participants.find((p) => p.user.id === session?.user?.id);
                const isMandatoryA = ["President", "Tresorier", "Secretaire"].includes(
                  otherA?.position || ""
                );
                const isPinnedA = myA?.isPinned;

                const otherB = b.participants.find((p) => p.user.id !== session?.user?.id)?.user;
                const myB = b.participants.find((p) => p.user.id === session?.user?.id);
                const isMandatoryB = ["President", "Tresorier", "Secretaire"].includes(
                  otherB?.position || ""
                );
                const isPinnedB = myB?.isPinned;

                if (isMandatoryA && !isMandatoryB) return -1;
                if (!isMandatoryA && isMandatoryB) return 1;
                if (isPinnedA && !isPinnedB) return -1;
                if (!isPinnedA && isPinnedB) return 1;
                return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
              })
              .map((conversation) => {
                const otherParticipant = conversation.participants.find(
                  (p) => p.user.id !== session?.user?.id
                )?.user;

                const myParticipant = conversation.participants.find(
                  (p) => p.user.id === session?.user?.id
                );

                const isPinned = myParticipant?.isPinned;
                const isMandatory = ["President", "Tresorier", "Secretaire"].includes(
                  otherParticipant?.position || ""
                );

                const lastMessage = conversation.messages[0];
                const isActive = currentChatId === conversation.id;

                return (
                  <Link
                    key={conversation.id}
                    href={`/admin/messages?chatId=${conversation.id}`}
                    className={cn(
                      "group flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-accent/50",
                      isActive && "bg-accent"
                    )}
                  >
                    <Avatar className="h-10 w-10 border border-border/50">
                      <AvatarImage src={otherParticipant?.image || undefined} />
                      <AvatarFallback>
                        {otherParticipant?.name?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">
                          {otherParticipant?.name || otherParticipant?.email || "Utilisateur"}
                        </span>
                        {lastMessage && (
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(lastMessage.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate flex-1">
                          {lastMessage ? (
                            <>
                              {lastMessage.senderId === session?.user?.id && "Vous: "}
                              {lastMessage.content}
                            </>
                          ) : (
                            "Nouvelle conversation"
                          )}
                        </p>
                        {/* Pin Button */}
                        {(isPinned || isMandatory) && (
                          <button
                            onClick={(e) => !isMandatory && handleTogglePin(e, conversation.id)}
                            className={cn(
                              "ml-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100",
                              (isPinned || isMandatory) && "opacity-100"
                            )}
                            title={isMandatory ? "Conversation obligatoire" : "Désépingler"}
                            disabled={isMandatory}
                          >
                            <Pin
                              className={cn(
                                "h-3.5 w-3.5 transform rotate-45",
                                isMandatory
                                  ? "text-red-500 fill-red-500"
                                  : "text-primary fill-primary"
                              )}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
