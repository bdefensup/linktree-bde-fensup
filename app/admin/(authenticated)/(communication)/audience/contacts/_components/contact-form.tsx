"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface ContactFormProps {
  initialData?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    unsubscribed: boolean;
    properties?: Record<string, string>;
  };
}

export function ContactForm({ initialData }: ContactFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(initialData?.unsubscribed || false);
  
  // Properties state
  const [properties, setProperties] = useState<{ key: string; value: string }[]>(
    initialData?.properties 
      ? Object.entries(initialData.properties as Record<string, string>).map(([key, value]) => ({ key, value }))
      : []
  );

  const addProperty = () => {
    setProperties([...properties, { key: "", value: "" }]);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const updateProperty = (index: number, field: "key" | "value", newValue: string) => {
    const newProperties = [...properties];
    newProperties[index][field] = newValue;
    setProperties(newProperties);
  };

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      unsubscribed,
      properties: properties.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>),
    };

    try {
      const url = isEditing
        ? `/api/admin/contacts/${initialData.id}`
        : "/api/admin/contacts";
      
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      toast.success(isEditing ? "Contact mis à jour" : "Contact créé");
      router.push("/admin/audience/contacts");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initialData?.email}
            className="col-span-3 bg-white/5 border-white/10 text-white"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="firstName" className="text-right">
            Prénom
          </Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={initialData?.firstName || ""}
            className="col-span-3 bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="lastName" className="text-right">
            Nom
          </Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={initialData?.lastName || ""}
            className="col-span-3 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="unsubscribed"
          checked={unsubscribed}
          onCheckedChange={setUnsubscribed}
        />
        <Label htmlFor="unsubscribed">Désinscrit (Ne recevra pas de campagnes)</Label>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Propriétés personnalisées</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addProperty}
            className="h-8"
          >
            <Plus className="mr-2 h-3 w-3" />
            Ajouter
          </Button>
        </div>
        
        {properties.map((prop, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Clé (ex: ville)"
              value={prop.key}
              onChange={(e) => updateProperty(index, "key", e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              placeholder="Valeur (ex: Paris)"
              value={prop.value}
              onChange={(e) => updateProperty(index, "value", e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeProperty(index)}
              className="h-10 w-10 text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {properties.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Aucune propriété définie.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
