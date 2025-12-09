import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { Mail, Paperclip } from "lucide-react";

export default async function InboxPage() {
  const messages = await prisma.inboxMessage.findMany({
    orderBy: { receivedAt: "desc" },
  });

  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Boîte de réception</h1>
        <div className="text-sm text-muted-foreground">
          {messages.length} message{messages.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <Card className="bg-[#1B1B1B]/50 border-white/10 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mb-4 opacity-50" />
              <p>Aucun message reçu pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          messages.map((msg) => (
            <Link key={msg.id} href={`/admin/inbox/${msg.id}`}>
              <Card className="bg-[#1B1B1B]/50 border-white/10 hover:bg-white/5 transition-colors cursor-pointer backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`h-2 w-2 rounded-full ${msg.isRead ? "bg-transparent" : "bg-blue-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{msg.from}</span>
                        {Array.isArray(msg.attachments) && (msg.attachments as any[]).length > 0 && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{msg.subject}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {format(new Date(msg.receivedAt), "d MMM HH:mm", { locale: fr })}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
