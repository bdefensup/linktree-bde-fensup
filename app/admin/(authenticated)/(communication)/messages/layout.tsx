import { ConversationList } from "@/components/admin/messages/conversation-list";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-white/10 bg-[#1B1B1B]/50 backdrop-blur-sm shadow-2xl">
      <ConversationList />
      <main className="flex-1 min-w-0 flex flex-col bg-black/20">{children}</main>
    </div>
  );
}
