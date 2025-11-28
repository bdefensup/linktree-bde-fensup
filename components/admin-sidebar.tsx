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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const mockConversations = [
  {
    id: 1,
    name: "Ambre FENELON",
    lastMessage: "Un avec le...",
    time: "21:43",
    avatar: "",
    initials: "AF",
    color: "bg-blue-500/20 text-blue-500",
    unread: true,
  },
  {
    id: 2,
    name: "BDE",
    lastMessage: "Vous: Ta parler...",
    time: "21:25",
    avatar: "/logo.png",
    initials: "BD",
    color: "bg-orange-500/20 text-orange-500",
    unread: false,
  },
  {
    id: 3,
    name: "Precieux",
    lastMessage: "le tien tu l'as avec...",
    time: "20:16",
    avatar: "",
    initials: "PR",
    color: "bg-red-500/20 text-red-500",
    unread: false,
  },
  {
    id: 4,
    name: "Général",
    lastMessage: "Ines: J'trouve il e...",
    time: "20:15",
    avatar: "",
    initials: "GN",
    color: "bg-violet-500/20 text-violet-500",
    unread: false,
  },
  {
    id: 5,
    name: "TEAM COM",
    lastMessage: "Vous: Bientôt l...",
    time: "19:07",
    avatar: "",
    initials: "TC",
    color: "bg-yellow-500/20 text-yellow-500",
    unread: true,
  },
];

import { ProfileModal } from "@/components/admin/profile-modal";
import { useState } from "react";

// ... (imports)

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
                        <AvatarImage src="/logo.png" alt="BDE FEN'SUP" />
                        <AvatarFallback className="rounded-lg">
                          BDE
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          BDE FEN'SUP
                        </span>
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
          <SidebarGroupLabel>Messagerie</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="max-h-[300px]">
              <SidebarMenu>
                {[...mockConversations]
                  .sort((a, b) => b.time.localeCompare(a.time))
                  .map((chat) => (
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
                            <AvatarImage src={chat.avatar} />
                            <AvatarFallback className={chat.color}>
                              {chat.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-semibold text-sm truncate">
                              {chat.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {chat.lastMessage}
                            </span>
                          </div>
                          {chat.unread && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
  );
}
