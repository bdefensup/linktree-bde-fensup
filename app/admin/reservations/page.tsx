"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminReservationsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/admin/login");
        },
      },
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Réservations</h1>
        <Button onClick={handleLogout} variant="outline">
          Déconnexion
        </Button>
      </div>
      <p>Bienvenue sur le backoffice administrateur.</p>
    </div>
  );
}
