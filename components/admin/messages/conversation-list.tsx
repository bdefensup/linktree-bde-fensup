"use client";

import * as React from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { NewConversationDialog } from "./new-conversation-dialog";

import { Pin, Crown, Landmark, PenLine } from "lucide-react";
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
    <div className="w-80 max-w-full border-r bg-muted/10 flex flex-col h-full min-h-0">
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
                const isPinnedA = myA?.isPinned;

                const otherB = b.participants.find((p) => p.user.id !== session?.user?.id)?.user;
                const myB = b.participants.find((p) => p.user.id === session?.user?.id);
                const isPinnedB = myB?.isPinned;

                // Strict priority map
                const rolePriority: Record<string, number> = {
                  President: 1,
                  Tresorier: 2,
                  Secretaire: 3,
                };

                const priorityA = rolePriority[otherA?.position || ""] || 999;
                const priorityB = rolePriority[otherB?.position || ""] || 999;

                // 1. Strict Role Priority (President > Tresorier > Secretaire)
                if (priorityA !== priorityB) {
                  return priorityA - priorityB;
                }

                // 2. Pinned conversations (for non-mandatory roles)
                if (isPinnedA && !isPinnedB) return -1;
                if (!isPinnedA && isPinnedB) return 1;

                // 3. Last message date
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
                const position = otherParticipant?.position;
                const isMandatory = ["President", "Tresorier", "Secretaire"].includes(
                  position || ""
                );

                const positionConfig: Record<
                  string,
                  { icon: React.ReactNode; className: string; label: string }
                > = {
                  President: {
                    icon: <Crown className="w-3 h-3" />,
                    className:
                      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
                    label: "Président",
                  },
                  Tresorier: {
                    icon: <Landmark className="w-3 h-3" />,
                    className:
                      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
                    label: "Trésorier",
                  },
                  Secretaire: {
                    icon: <PenLine className="w-3 h-3" />,
                    className:
                      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
                    label: "Secrétaire",
                  },
                };

                const lastMessage = conversation.messages[0];
                const isActive = currentChatId === conversation.id;

                // Truncate name logic
                const displayName =
                  otherParticipant?.name || otherParticipant?.email || "Utilisateur";
                const truncatedName =
                  displayName.length > 20 ? displayName.substring(0, 20) + "..." : displayName;

                return (
                  <Link
                    key={conversation.id}
                    href={`/admin/messages?chatId=${conversation.id}`}
                    className={cn(
                      "group flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                      "hover:bg-primary/5 border border-transparent hover:border-primary/10",
                      isActive ? "bg-primary/10 border-primary/20" : ""
                    )}
                  >
                    <Avatar className="h-10 w-10 border border-border/50">
                      <AvatarImage src={otherParticipant?.image || undefined} />
                      <AvatarFallback>
                        {otherParticipant?.name?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-sm truncate" title={displayName}>
                            {truncatedName}
                          </span>
                          {isMandatory && position && positionConfig[position] && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "p-0 h-5 w-5 flex items-center justify-center",
                                positionConfig[position].className
                              )}
                              title={positionConfig[position].label}
                            >
                              {positionConfig[position].icon}
                            </Badge>
                          )}
                        </div>
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

                      {lastMessage && (
                        <div className="text-[10px] text-muted-foreground mb-1">
                          {formatDistanceToNow(new Date(lastMessage.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </div>
                      )}

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
