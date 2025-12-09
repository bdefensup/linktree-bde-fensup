import { prisma } from "@/lib/prisma";
import { MembersTableWrapper } from "./members-table-wrapper";

export const dynamic = "force-dynamic";

async function getUsers() {
  const users = await prisma.user.findMany({
    where: {
      role: "adherent",
      NOT: {
        email: {
          endsWith: "@ticket.local",
        },
      },
    },
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

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminMembersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const users = await getUsers();
  const userRole = session?.user?.role || "adherent";

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Adhérents</h1>
          <p className="text-muted-foreground mt-2">
            Consultez la liste des adhérents de l'association.
          </p>
        </div>
      </div>

      <MembersTableWrapper
        data={users}
        userRole={userRole}
        currentUserEmail={session?.user?.email}
      />
    </div>
  );
}
