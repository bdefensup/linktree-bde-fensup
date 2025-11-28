import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  console.log("AdminLayout Session Check:", {
    hasSession: !!session,
    role: session?.user?.role,
    path: "/admin",
  });

  if (!session) {
    redirect("/admin/login");
  }

  if (session.user.role !== "admin" && session.user.role !== "staff") {
    redirect("/admin/login");
  }

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
