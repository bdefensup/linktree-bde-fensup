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
import { Plus, Copy, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { createApiKey } from "../actions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Domain {
  id: string;
  name: string;
}

interface AddApiKeyDialogProps {
  domains: Domain[];
}

export function AddApiKeyDialog({ domains }: AddApiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [permission, setPermission] = useState<"full_access" | "sending_access">("full_access");
  const [domainId, setDomainId] = useState<string>("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createApiKey(
        name, 
        permission, 
        permission === "sending_access" ? domainId : undefined
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || "Une erreur est survenue");
      }

      toast.success("Clé API créée avec succès");
      setCreatedKey(result.data.token); // Assuming 'token' is the key value
      // Don't close immediately, let user copy key
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      toast.success("Clé copiée !");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedKey(null);
    setName("");
    setPermission("full_access");
    setDomainId("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-white text-black hover:bg-white/90" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Créer une clé API
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#1B1B1B] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Créer une clé API</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Les clés API permettent d'authentifier vos requêtes vers l'API Resend.
          </DialogDescription>
        </DialogHeader>

        {createdKey ? (
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-4">
              <p className="text-sm text-yellow-500 font-medium mb-2">
                Attention : Cette clé ne sera affichée qu'une seule fois.
              </p>
              <p className="text-xs text-yellow-500/80">
                Copiez-la maintenant et stockez-la en lieu sûr. Si vous la perdez, vous devrez en générer une nouvelle.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Input 
                value={createdKey} 
                readOnly 
                type={isVisible ? "text" : "password"}
                className="font-mono bg-black/50 border-white/10 text-white"
              />
              <Button size="icon" variant="outline" onClick={() => setIsVisible(!isVisible)} className="border-white/10 hover:bg-white/10">
                {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="outline" onClick={handleCopy} className="border-white/10 hover:bg-white/10">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full bg-white text-black hover:bg-white/90">
                J'ai copié ma clé
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-white">Nom</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Production, Staging..."
                  className="bg-[#1B1B1B]/50 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-white/20"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label className="text-white">Permissions</Label>
                <RadioGroup 
                  value={permission} 
                  onValueChange={(v) => setPermission(v as "full_access" | "sending_access")}
                  className="grid gap-4"
                >
                  <div className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value="full_access" id="full_access" className="border-white/20 text-white" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="full_access" className="text-white font-medium cursor-pointer">
                        Accès complet
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Peut créer, supprimer, lire et mettre à jour n'importe quelle ressource.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value="sending_access" id="sending_access" className="border-white/20 text-white" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="sending_access" className="text-white font-medium cursor-pointer">
                        Accès envoi uniquement
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Peut uniquement envoyer des emails.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {permission === "sending_access" && (
                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="domain" className="text-white">Domaine (Optionnel)</Label>
                  <Select value={domainId} onValueChange={setDomainId}>
                    <SelectTrigger className="bg-[#1B1B1B]/50 border-white/10 text-white focus:ring-white/20">
                      <SelectValue placeholder="Tous les domaines" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1E] border-white/10 text-white">
                      <SelectItem value="all">Tous les domaines</SelectItem>
                      {domains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          {domain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Restreindre cette clé à un domaine spécifique.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-white/90">
                {loading ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
