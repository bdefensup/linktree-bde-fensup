"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchUsers, createConversation } from "@/app/actions/messaging";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

export function NewConversationDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Simple debounce implementation if hook doesn't exist
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const results = await searchUsers(query);
          setUsers(results as User[]);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectUser = async (userId: string) => {
    try {
      const conversation = await createConversation(userId);
      setOpen(false);
      router.push(`/admin/messages?chatId=${conversation.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Impossible de créer la conversation");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start gap-2" variant="outline">
          <Plus className="h-4 w-4" />
          Nouveau message
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Nouvelle conversation</DialogTitle>
        </DialogHeader>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher un utilisateur..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="p-4 text-sm text-center text-muted-foreground">Recherche...</div>
            )}
            {!loading && users.length === 0 && query.length >= 2 && (
              <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
            )}
            <CommandGroup heading="Utilisateurs">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => handleSelectUser(user.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>{user.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name || "Utilisateur sans nom"}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  {user.role === "admin" && (
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
