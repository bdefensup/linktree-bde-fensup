"use client";

import { useState } from "react";
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

// Mock Data
const conversations = [
  {
    id: 1,
    name: "Ambre FENELON",
    status: "En ligne",
    avatar: "",
    initials: "AF",
    color: "bg-blue-500/20 text-blue-500",
    lastMessage: "Un avec le...",
    time: "21:43",
    unread: 2,
    messages: [
      {
        id: 1,
        sender: "them",
        content: "Salut ! Tu as le dossier pour l'event ?",
        time: "21:40",
      },
      {
        id: 2,
        sender: "me",
        content: "Oui je t'envoie ça tout de suite.",
        time: "21:41",
        status: "read",
      },
      {
        id: 3,
        sender: "them",
        content: "Super merci ! Un avec le logo stp.",
        time: "21:43",
      },
    ],
  },
  {
    id: 2,
    name: "BDE",
    status: "Vu à 21:20",
    avatar: "/logo.png",
    initials: "BD",
    color: "bg-orange-500/20 text-orange-500",
    lastMessage: "Vous: Ta parler...",
    time: "21:25",
    unread: 0,
    messages: [
      {
        id: 1,
        sender: "them",
        content: "On fait quoi pour la réunion de demain ?",
        time: "21:00",
      },
      {
        id: 2,
        sender: "me",
        content: "Ta parler avec le directeur ?",
        time: "21:25",
        status: "sent",
      },
    ],
  },
  {
    id: 3,
    name: "Precieux",
    status: "En ligne",
    avatar: "",
    initials: "PR",
    color: "bg-red-500/20 text-red-500",
    lastMessage: "le tien tu l'as avec...",
    time: "20:16",
    unread: 0,
    messages: [],
  },
  {
    id: 4,
    name: "Général",
    status: "32 participants",
    avatar: "",
    initials: "GN",
    color: "bg-violet-500/20 text-violet-500",
    lastMessage: "Ines: J'trouve il e...",
    time: "20:15",
    unread: 0,
    messages: [],
  },
];

export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<number>(1);
  const [messageInput, setMessageInput] = useState("");

  const selectedChat = conversations.find((c) => c.id === selectedChatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    // Mock send logic
    console.log("Sending:", messageInput);
    setMessageInput("");
  };

  return (
    <TooltipProvider>
      <div className="h-[calc(100vh-6rem)] rounded-xl border bg-background shadow-sm overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar List */}
          <ResizablePanel
            defaultSize={30}
            minSize={25}
            maxSize={40}
            className="border-r bg-muted/10"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold tracking-tight mb-4">
                  Messagerie
                </h2>
                <Command className="rounded-lg border shadow-sm bg-background">
                  <CommandInput placeholder="Rechercher une conversation..." />
                  <CommandList className="max-h-[calc(100vh-16rem)]">
                    <CommandEmpty>Aucune conversation trouvée.</CommandEmpty>
                    <CommandGroup heading="Discussions récentes">
                      {conversations.map((chat) => (
                        <CommandItem
                          key={chat.id}
                          onSelect={() => setSelectedChatId(chat.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 cursor-pointer aria-selected:bg-accent",
                            selectedChatId === chat.id && "bg-accent"
                          )}
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10 border border-border/50">
                              <AvatarImage src={chat.avatar} />
                              <AvatarFallback className={chat.color}>
                                {chat.initials}
                              </AvatarFallback>
                            </Avatar>
                            {chat.status === "En ligne" && (
                              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold truncate">
                                {chat.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {chat.time}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-sm text-muted-foreground truncate max-w-[140px]">
                                {chat.lastMessage}
                              </span>
                              {chat.unread > 0 && (
                                <Badge
                                  variant="default"
                                  className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]"
                                >
                                  {chat.unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Chat Area */}
          <ResizablePanel defaultSize={70}>
            <div className="flex flex-col h-full bg-background">
              {selectedChat ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b h-16">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarImage src={selectedChat.avatar} />
                        <AvatarFallback className={selectedChat.color}>
                          {selectedChat.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-semibold text-sm">
                          {selectedChat.name}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {selectedChat.status}
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
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Appel vocal</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Appel vidéo</TooltipContent>
                      </Tooltip>

                      <Separator orientation="vertical" className="h-6 mx-1" />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
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
                      {selectedChat.messages &&
                      selectedChat.messages.length > 0 ? (
                        selectedChat.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex gap-2 max-w-[80%]",
                              msg.sender === "me"
                                ? "ml-auto flex-row-reverse"
                                : ""
                            )}
                          >
                            <Avatar className="h-8 w-8 mt-1 border border-border/50">
                              {msg.sender === "me" ? (
                                <>
                                  <AvatarImage src="/logo.png" />
                                  <AvatarFallback>ME</AvatarFallback>
                                </>
                              ) : (
                                <>
                                  <AvatarImage src={selectedChat.avatar} />
                                  <AvatarFallback
                                    className={selectedChat.color}
                                  >
                                    {selectedChat.initials}
                                  </AvatarFallback>
                                </>
                              )}
                            </Avatar>
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                msg.sender === "me"
                                  ? "bg-primary text-primary-foreground rounded-tr-none"
                                  : "bg-card border rounded-tl-none"
                              )}
                            >
                              <p>{msg.content}</p>
                              <div
                                className={cn(
                                  "flex items-center justify-end gap-1 mt-1 text-[10px]",
                                  msg.sender === "me"
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                )}
                              >
                                <span>{msg.time}</span>
                                {msg.sender === "me" && (
                                  <span>
                                    {msg.status === "read" ? (
                                      <CheckCheck className="h-3 w-3" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
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
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <Card className="max-w-md w-full p-8 flex flex-col items-center text-center bg-muted/10 border-dashed">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Choisissez une discussion dans la liste de gauche pour
                      commencer à échanger.
                    </p>
                  </Card>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
}
