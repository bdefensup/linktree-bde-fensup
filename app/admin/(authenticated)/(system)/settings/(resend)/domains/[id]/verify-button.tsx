"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function VerifyButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/domains/${id}/verify`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Verification failed");

      toast.success("Verification triggered");
      router.refresh();
    } catch (error) {
      toast.error("Error triggering verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleVerify} disabled={loading} variant="outline">
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      Verify DNS Records
    </Button>
  );
}
