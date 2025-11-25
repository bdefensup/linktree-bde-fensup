import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";

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
          <AdminBreadcrumbs />
        </div>
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
