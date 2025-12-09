"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function ImportContactsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/contacts/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'import");
      }

      const data = await res.json();
      toast.success(`Import terminé : ${data.successCount} succès, ${data.errorCount} erreurs`);
      router.push("/admin/audience/contacts");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Importer des contacts</h1>
      </div>
      
      <div className="rounded-md border border-white/10 bg-white/5 p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">Fichier CSV</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-white/5 border-white/10 text-white cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Format attendu : email, firstName, lastName
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
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? (
                "Importation..."
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
