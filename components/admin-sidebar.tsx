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
} from "lucide-react";
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
import { useState, useEffect } from "react";

// Menu items.
const items = [
  {
    title: "Staff",
    url: "/admin/staff",
    icon: Users,
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
];

interface Conversation {
  id: string;
  lastMessageAt: Date;
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

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const { searchUsers } = await import("@/app/messaging");
          const results = await searchUsers(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleStartConversation = async (userId: string) => {
    try {
      setIsSearchOpen(false);
      const { createConversation } = await import("@/app/messaging");
      const conversation = await createConversation(userId);
      router.push(`/admin/messages?chatId=${conversation.id}`);

      // Refresh conversations list
      const { getPinnedConversations } = await import("@/app/messaging");
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
        const { getPinnedConversations } = await import("@/app/messaging");
        const data = await getPinnedConversations();
        setConversations(data as unknown as Conversation[]);
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
    console.log("Setting up subscription for user:", session?.user?.id);
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
        (payload) => {
          console.log("Realtime update received:", payload);
          fetchConversations();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    // Custom event listener for instant updates
    const handleConversationUpdate = () => {
      console.log("Custom event received: conversation:updated");
      fetchConversations();
    };

    window.addEventListener("conversation:updated", handleConversationUpdate);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      window.removeEventListener("conversation:updated", handleConversationUpdate);
    };
  }, [session?.user?.id]);

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
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    {session?.user ? (
                      <>
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage
                            src={session.user.image || undefined}
                            alt={session.user.name || "User"}
                          />
                          <AvatarFallback className="rounded-lg">
                            {session.user.name?.slice(0, 2).toUpperCase() || "AD"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">{session.user.name}</span>
                          <span className="truncate text-xs">{session.user.email}</span>
                        </div>
                        <ChevronDown className="ml-auto size-4" />
                      </>
                    ) : (
                      <>
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src="/logo-full.png" alt="BDE FEN'SUP" />
                          <AvatarFallback className="rounded-lg">BDE</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">BDE FEN'SUP</span>
                          <span className="truncate text-xs">Administration</span>
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
                  {conversations
                    .sort((a, b) => {
                      const otherA = a.participants.find(
                        (p) => p.userId !== session?.user?.id
                      )?.user;
                      const myA = a.participants.find((p) => p.userId === session?.user?.id);
                      const isMandatoryA = ["President", "Tresorier", "Secretaire"].includes(
                        otherA?.position || ""
                      );
                      const isPinnedA = myA?.isPinned;

                      const otherB = b.participants.find(
                        (p) => p.userId !== session?.user?.id
                      )?.user;
                      const myB = b.participants.find((p) => p.userId === session?.user?.id);
                      const isMandatoryB = ["President", "Tresorier", "Secretaire"].includes(
                        otherB?.position || ""
                      );
                      const isPinnedB = myB?.isPinned;

                      if (isMandatoryA && !isMandatoryB) return -1;
                      if (!isMandatoryA && isMandatoryB) return 1;
                      if (isPinnedA && !isPinnedB) return -1;
                      if (!isPinnedA && isPinnedB) return 1;
                      return (
                        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
                      );
                    })
                    .map((chat) => {
                      const otherParticipant = chat.participants.find(
                        (p) => p.userId !== session?.user?.id
                      )?.user;
                      const myParticipant = chat.participants.find(
                        (p) => p.userId === session?.user?.id
                      );
                      const isPinned = myParticipant?.isPinned;
                      const isMandatory = ["President", "Tresorier", "Secretaire"].includes(
                        otherParticipant?.position || ""
                      );
                      const lastMessage = chat.messages[0];

                      return (
                        <SidebarMenuItem key={chat.id}>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname === `/admin/messages`}
                            className="h-14"
                          >
                            <Link
                              href={`/admin/messages?chatId=${chat.id}`}
                              className="flex items-center gap-3"
                            >
                              <Avatar className="h-8 w-8 border border-border/50">
                                <AvatarImage src={otherParticipant?.image || undefined} />
                                <AvatarFallback>
                                  {otherParticipant?.name?.slice(0, 2).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col overflow-hidden flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm truncate">
                                    {otherParticipant?.name || "Utilisateur"}
                                  </span>
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
