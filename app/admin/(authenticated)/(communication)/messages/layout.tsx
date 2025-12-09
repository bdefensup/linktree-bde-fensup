import { ConversationList } from "@/components/admin/messages/conversation-list";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-lg border bg-background shadow-sm">
      <ConversationList />
      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}
