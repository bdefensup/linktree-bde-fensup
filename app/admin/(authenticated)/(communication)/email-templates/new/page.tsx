"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTemplate } from "../../campaigns/actions";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewTemplatePage() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const template = await createTemplate(name);
      toast.success("Template créé");
      router.push(`/admin/email-templates/${template.id}`);
    } catch (error) {
      console.error("Failed to create template:", error);
      toast.error("Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-black p-4">
      <div className="supports-backdrop-filter:bg-[#1B1B1B]/50 flex flex-1 flex-col items-center justify-center rounded-2xl border bg-[#1B1B1B]/70 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
        <div className="w-full max-w-md space-y-8 p-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Nouveau template</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Nom du template
              </label>
              <Input
                id="name"
                placeholder="Ex: Newsletter Mensuelle"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-foreground placeholder:text-muted-foreground/50 border-white/10 bg-white/5 focus-visible:ring-white/20"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-white/90"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le template"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
