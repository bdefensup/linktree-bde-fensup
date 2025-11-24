import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="w-full">
        <div className="p-4 flex items-center gap-4 border-b">
          <SidebarTrigger />
          <h1 className="font-semibold text-lg">Backoffice</h1>
        </div>
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
