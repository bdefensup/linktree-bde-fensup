import { prisma } from "@/lib/prisma";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export const dynamic = "force-dynamic";

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize dates
  return users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));
}

export default async function AdminStaffPage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion du Staff
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les membres, leurs rôles et les accès à la plateforme.
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={users} />
    </div>
  );
}
