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
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
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
          const { searchUsers } = await import("@/app/actions/messaging");
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
      const { createConversation } = await import("@/app/actions/messaging");
      const conversation = await createConversation(userId);
      router.push(`/admin/messages?chatId=${conversation.id}`);

      // Refresh conversations list
      const { getConversations } = await import("@/app/actions/messaging");
      const data = await getConversations();
      setConversations(data as unknown as Conversation[]);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Erreur lors de la création de la conversation");
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { getConversations } = await import("@/app/actions/messaging");
        const data = await getConversations();
        setConversations(data as unknown as Conversation[]);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };
    fetchConversations();
  }, []);

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
                            {session.user.name?.slice(0, 2).toUpperCase() ||
                              "AD"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {session.user.name}
                          </span>
                          <span className="truncate text-xs">
                            {session.user.email}
                          </span>
                        </div>
                        <ChevronDown className="ml-auto size-4" />
                      </>
                    ) : (
                      <>
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src="/logo-full.png" alt="BDE FEN'SUP" />
                          <AvatarFallback className="rounded-lg">
                            BDE
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            BDE FEN'SUP
                          </span>
                          <span className="truncate text-xs">
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
              <SidebarGroupAction
                title="Nouvelle discussion"
                onClick={() => setIsSearchOpen(true)}
              >
                <Plus /> <span className="sr-only">Nouvelle discussion</span>
              </SidebarGroupAction>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-[280px]">
                <SidebarMenu>
                  {conversations.map((chat) => {
                    const otherParticipant = chat.participants.find(
                      (p) => p.userId !== session?.user?.id
                    )?.user;
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
                              <AvatarImage
                                src={otherParticipant?.image || ""}
                              />
                              <AvatarFallback>
                                {otherParticipant?.name
                                  ?.slice(0, 2)
                                  .toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-semibold text-sm truncate">
                                {otherParticipant?.name || "Utilisateur"}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {lastMessage?.content ||
                                  "Nouvelle conversation"}
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

      <CommandDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        shouldFilter={false}
      >
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
                <Loader2 className="h-4 w-4 animate-spin" /> Recherche en
                cours...
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
                    <span className="text-xs font-normal opacity-80">
                      {user.email}
                    </span>
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
