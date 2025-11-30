"use client";

import {
  Calendar,
  ChevronDown,
  LogOut,
  Ticket,
  User,
  Users,
  KeyRound,
  Home,
  Plus,
  Loader2,
  Pin,
  MessageSquare,
  Crown,
  Landmark,
  PenLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfileModal } from "@/components/admin/profile-modal";
import { useState, useEffect, useCallback } from "react";

// ... imports

import {
  getConversations,
  getPinnedConversations,
  searchUsers,
  createConversation,
} from "@/app/messaging";

// Menu items.
const items = [
  {
    title: "Staff",
    url: "/admin/staff",
    icon: Users,
  },
  {
    title: "Adhérents",
    url: "/admin/members",
    icon: User,
  },
  {
    title: "Événements",
    url: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Réservations",
    url: "/admin/reservations",
    icon: Ticket,
  },
  {
    title: "Tickets Support",
    url: "/admin/tickets",
    icon: MessageSquare,
  },
];

interface Conversation {
  id: string;
  lastMessageAt: Date;
  subject?: string | null;
  isTicket?: boolean;
  ticketStatus?: string;
  guestName?: string | null;
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
  messages: {
    content: string;
    createdAt: Date;
  }[];
}

interface SearchResult {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const [convs] = await Promise.all([getConversations()]);
      setConversations(convs);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Initial fetch and polling
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Poll every 5s

    // Listen for custom event
    const handleUpdate = () => fetchConversations();
    window.addEventListener("conversation:updated", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("conversation:updated", handleUpdate);
    };
  }, [fetchConversations]);

  const handleStartConversation = async (userId: string) => {
    try {
      setIsSearchOpen(false);
      const conversation = await createConversation(userId);
      router.push(`/admin/messages?chatId=${conversation.id}`);

      // Refresh conversations list
      const data = await getPinnedConversations();
      setConversations(data as unknown as Conversation[]);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Erreur lors de la création de la conversation");
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { getPinnedConversations, getMandatoryUsers } = await import("@/app/messaging");
        const [existingConversations, mandatoryUsers] = await Promise.all([
          getPinnedConversations(),
          getMandatoryUsers(),
        ]);

        const conversations = existingConversations as unknown as Conversation[];

        // Merge mandatory users who don't have a conversation yet
        const mergedConversations = [...conversations];

        mandatoryUsers.forEach((user) => {
          const hasConversation = conversations.some((c) =>
            c.participants.some((p) => p.userId === user.id)
          );

          if (!hasConversation) {
            // Create a virtual conversation object
            mergedConversations.push({
              id: `virtual-${user.id}`,
              lastMessageAt: new Date(0), // Old date to put at bottom if not prioritized (but strict sort handles this)
              participants: [
                {
                  userId: session?.user?.id || "",
                  isPinned: true, // Mandatory are pinned by default logic
                  user: {
                    id: session?.user?.id || "",
                    name: session?.user?.name || "",
                    image: session?.user?.image || "",
                    email: session?.user?.email || "",
                    position: null,
                  },
                },
                {
                  userId: user.id,
                  isPinned: true,
                  user: {
                    id: user.id,
                    name: user.name,
                    image: user.image,
                    email: user.email,
                    position: user.position,
                  },
                },
              ],
              messages: [],
            });
          }
        });

        setConversations(mergedConversations);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };

    fetchConversations();

    // Polling fallback (every 3 seconds)
    const interval = setInterval(() => {
      fetchConversations();
    }, 3000);

    // Realtime subscription for pinned status changes
    // Realtime subscription for pinned status changes
    const channel = supabase
      .channel("admin_sidebar_pins")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_participant",
          // filter: session?.user?.id ? `"userId"=eq.${session.user.id}` : undefined,
        },
        (_payload) => {
          fetchConversations();
        }
      )
      .subscribe((_status) => {
        // Subscription status
      });

    // Custom event listener for instant updates
    const handleConversationUpdate = () => {
      fetchConversations();
    };

    window.addEventListener("conversation:updated", handleConversationUpdate);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      window.removeEventListener("conversation:updated", handleConversationUpdate);
    };
  }, [session?.user?.id, session?.user?.name, session?.user?.image, session?.user?.email]);

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/admin/login");
        },
      },
    });
  };

  return (
    <>
      <Sidebar>
        <ProfileModal open={isProfileOpen} onOpenChange={setIsProfileOpen} />
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-16"
                  >
                    {session?.user ? (
                      <>
                        <Avatar className="h-12 w-12 rounded-lg">
                          <AvatarImage
                            src={session.user.image || undefined}
                            alt={session.user.name || "User"}
                          />
                          <AvatarFallback className="rounded-lg text-lg">
                            {session.user.name?.slice(0, 2).toUpperCase() || "AD"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-base leading-tight">
                          <span className="truncate font-bold">{session.user.name}</span>
                          <span className="truncate text-sm text-muted-foreground">
                            {session.user.email}
                          </span>
                        </div>
                        <ChevronDown className="ml-auto size-5" />
                      </>
                    ) : (
                      <>
                        <Avatar className="h-12 w-12 rounded-lg">
                          <AvatarImage src="/logo-full.png" alt="BDE FEN'SUP" />
                          <AvatarFallback className="rounded-lg">BDE</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-base leading-tight">
                          <span className="truncate font-bold">BDE FEN'SUP</span>
                          <span className="truncate text-sm text-muted-foreground">
                            Administration
                          </span>
                        </div>
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    Mon Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/forgot-password">
                      <KeyRound className="mr-2 h-4 w-4" />
                      Mot de passe oublié
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin">
                    <Home className="h-4 w-4" />
                    <span>Retour à l'accueil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Gestion</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>
              Messagerie
              <SidebarGroupAction title="Nouvelle discussion" onClick={() => setIsSearchOpen(true)}>
                <Plus /> <span className="sr-only">Nouvelle discussion</span>
              </SidebarGroupAction>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-[280px]">
                <SidebarMenu>
                  {/* Conversations List */}
                  {session?.user &&
                    conversations
                      .filter((chat) => {
                        // Filter out conversations where I am the only participant (unless I want to see myself, but user requested to hide self-roles)
                        const other = chat.participants.find((p) => p.userId !== session.user.id);
                        return !!other;
                      })
                      .sort((a, b) => {
                        const otherA = a.participants.find(
                          (p) => p.userId !== session.user.id
                        )?.user;
                        const myA = a.participants.find((p) => p.userId === session.user.id);
                        const isPinnedA = myA?.isPinned;

                        const otherB = b.participants.find(
                          (p) => p.userId !== session.user.id
                        )?.user;
                        const myB = b.participants.find((p) => p.userId === session.user.id);
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
                        return (
                          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
                        );
                      })
                      .map((chat) => {
                        const otherParticipant = chat.participants.find(
                          (p) => p.userId !== session.user.id
                        )?.user;
                        const myParticipant = chat.participants.find(
                          (p) => p.userId === session.user.id
                        );
                        const isPinned = myParticipant?.isPinned;
                        const position = otherParticipant?.position;
                        const isMandatory = ["President", "Tresorier", "Secretaire"].includes(
                          position || ""
                        );
                        const lastMessage = chat.messages[0];

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

                        // Truncate name logic
                        const displayName =
                          otherParticipant?.name || otherParticipant?.email || "Utilisateur";
                        const truncatedName =
                          displayName.length > 14
                            ? displayName.substring(0, 14) + "..."
                            : displayName;

                        return (
                          <SidebarMenuItem key={chat.id}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === `/admin/messages`}
                              className="h-14"
                            >
                              <div
                                onClick={(e) => {
                                  if (chat.id.startsWith("virtual-")) {
                                    e.preventDefault();
                                    const userId = chat.id.replace("virtual-", "");
                                    handleStartConversation(userId);
                                  }
                                }}
                              >
                                <Link
                                  href={
                                    chat.id.startsWith("virtual-")
                                      ? "#"
                                      : `/admin/messages?chatId=${chat.id}`
                                  }
                                  className="flex items-center gap-3 w-full"
                                >
                                  <Avatar className="h-8 w-8 border border-border/50">
                                    <AvatarImage src={otherParticipant?.image || undefined} />
                                    <AvatarFallback>
                                      {otherParticipant?.name?.slice(0, 2).toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col overflow-hidden flex-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                          className="font-semibold text-sm truncate"
                                          title={displayName}
                                        >
                                          {truncatedName}
                                        </span>
                                        {isMandatory && position && positionConfig[position] && (
                                          <Badge
                                            variant="outline"
                                            className={cn(
                                              "p-0 h-4 w-4 flex items-center justify-center shrink-0",
                                              positionConfig[position].className
                                            )}
                                            title={positionConfig[position].label}
                                          >
                                            {positionConfig[position].icon}
                                          </Badge>
                                        )}
                                      </div>
                                      {(isPinned || isMandatory) && (
                                        <Pin
                                          className={cn(
                                            "h-3 w-3 transform rotate-45 ml-1 shrink-0",
                                            isMandatory
                                              ? "text-red-500 fill-red-500"
                                              : "text-primary fill-primary"
                                          )}
                                        />
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate">
                                      {lastMessage?.content || "Nouvelle conversation"}
                                    </span>
                                  </div>
                                </Link>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4 text-xs text-muted-foreground text-center">
            BDE FEN'SUP Admin v1.0
          </div>
        </SidebarFooter>
      </Sidebar>

      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Rechercher un utilisateur (nom, email, téléphone)..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>
            {searchQuery.length < 2 ? (
              "Tapez au moins 2 caractères..."
            ) : isSearching ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Recherche en cours...
              </div>
            ) : (
              "Aucun utilisateur trouvé."
            )}
          </CommandEmpty>
          {searchResults.length > 0 && (
            <CommandGroup heading="Utilisateurs">
              {searchResults.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => handleStartConversation(user.id)}
                  className="cursor-pointer data-[selected=true]:bg-orange-600 data-[selected=true]:text-white"
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="text-black">
                      {user.name?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold">{user.name}</span>
                    <span className="text-xs font-normal opacity-80">{user.email}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
