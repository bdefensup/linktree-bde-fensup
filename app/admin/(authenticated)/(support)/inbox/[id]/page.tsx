import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Paperclip, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ReplyButton } from "./reply-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InboxDetailPage({ params }: PageProps) {
  const { id } = await params;

  const message = await prisma.inboxMessage.findUnique({
    where: { id },
  });

  if (!message) {
    notFound();
  }

  // Mark as read if not already
  if (!message.isRead) {
    await prisma.inboxMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  return (
    <div className="flex h-screen flex-col bg-black p-4">
      <div className="supports-backdrop-filter:bg-[#1B1B1B]/50 flex flex-1 flex-col overflow-hidden rounded-2xl border bg-[#1B1B1B]/70 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#1B1B1B]/50 p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link href="/admin/inbox">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{message.subject}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Reçu le {format(new Date(message.receivedAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
            </div>
            <ReplyButton messageId={message.id} subject={message.subject} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-3xl space-y-8">
            {/* Metadata Card */}
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{message.from}</div>
                      <div className="text-sm text-muted-foreground">
                        À : {message.to.join(", ")}
                      </div>
                    </div>
                  </div>
                </div>
                
                {Array.isArray(message.attachments) && (message.attachments as any[]).length > 0 && (
                  <>
                    <Separator className="bg-white/10" />
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-muted-foreground">Pièces jointes</h4>
                      <div className="flex flex-wrap gap-2">
                        {(message.attachments as any[]).map((att: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-white">{att.filename}</span>
                            <span className="text-xs text-muted-foreground">({Math.round(att.size / 1024)} KB)</span>
                            {/* Note: We don't have download URLs unless we fetched content via API which returns content, 
                                but Resend webhook only gives metadata. 
                                To download, we'd need to use the Attachments API. 
                                For now, we just list them. */}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Email Body */}
            <Card className="border-white/10 bg-white">
              <CardContent className="p-8 text-black min-h-[400px]">
                {message.html ? (
                  <div dangerouslySetInnerHTML={{ __html: message.html }} className="prose max-w-none" />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans">{message.text}</pre>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


