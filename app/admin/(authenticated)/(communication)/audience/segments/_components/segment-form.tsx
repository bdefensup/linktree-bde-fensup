"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function SegmentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const queryStr = formData.get("query") as string;

    let query = {};
    try {
      if (queryStr) {
        query = JSON.parse(queryStr);
      }
    } catch (e) {
      toast.error("Le format JSON des critères est invalide");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, query }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      toast.success("Segment créé");
      router.push("/admin/audience/segments");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du segment</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Ex: Abonnés Newsletter"
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="query">Critères (JSON)</Label>
        <Textarea
          id="query"
          name="query"
          placeholder='{"unsubscribed": false}'
          className="bg-white/5 border-white/10 text-white font-mono min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          Pour l'instant, entrez les critères au format JSON.
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Création..." : "Créer"}
        </Button>
      </div>
    </form>
  );
}
