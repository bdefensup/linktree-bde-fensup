"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { getConversations } from "@/app/actions/messaging";
import { NewConversationDialog } from "./new-conversation-dialog";

interface Conversation {
  id: string;
  lastMessageAt: Date;
  participants: {
    user: {
      id: string;
      name: string | null;
      image: string | null;
      email: string;
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
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

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
            <div className="p-4 text-center text-sm text-muted-foreground">Aucune conversation</div>
          ) : (
            conversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(
                (p) => p.user.id !== session?.user?.id
              )?.user;

              const lastMessage = conversation.messages[0];
              const isActive = currentChatId === conversation.id;

              return (
                <Link
                  key={conversation.id}
                  href={`/admin/messages?chatId=${conversation.id}`}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-accent/50",
                    isActive && "bg-accent"
                  )}
                >
                  <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarImage src={otherParticipant?.image || ""} />
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
                    <p className="text-xs text-muted-foreground truncate">
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
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
