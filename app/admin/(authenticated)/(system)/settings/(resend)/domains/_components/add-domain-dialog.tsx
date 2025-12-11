"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AddDomainDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, region }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create domain");
      }

      toast.success("Domain created successfully");
      setOpen(false);
      setName("");
      setRegion("us-east-1");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un domaine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1B1B1B] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Ajouter un domaine</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ajoutez un nouveau domaine pour l'envoi d'e-mails.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-white">Nom de domaine</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="exemple.com"
                className="bg-[#1B1B1B]/50 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-white/20"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region" className="text-white">Région</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="bg-[#1B1B1B]/50 border-white/10 text-white focus:ring-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1E] border-white/10 text-white">
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                  <SelectItem value="sa-east-1">SA East (Sao Paulo)</SelectItem>
                  <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-white/90">
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
