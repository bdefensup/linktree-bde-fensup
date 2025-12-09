"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PreferenceFormProps {
  contact: any;
  allTopics: any[];
  subscribedTopicIds: string[];
}

export function PreferenceForm({ contact, allTopics, subscribedTopicIds }: PreferenceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(contact.unsubscribed);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set(subscribedTopicIds));

  const handleTopicToggle = (topicId: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopics(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contact.email,
          unsubscribed,
          topicIds: Array.from(selectedTopics),
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      toast.success("Préférences mises à jour");
      router.refresh();
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Se désinscrire de tout</Label>
            <p className="text-xs text-muted-foreground">
              Ne plus recevoir aucun email de notre part.
            </p>
          </div>
          <Switch
            checked={unsubscribed}
            onCheckedChange={setUnsubscribed}
          />
        </div>

        {!unsubscribed && (
          <div className="space-y-4">
            <Label className="text-base">Vos abonnements</Label>
            {allTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun sujet disponible.</p>
            ) : (
              allTopics.map((topic) => (
                <div key={topic.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={topic.id}
                    checked={selectedTopics.has(topic.id)}
                    onCheckedChange={() => handleTopicToggle(topic.id)}
                    className="border-white/10 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <Label htmlFor={topic.id} className="cursor-pointer">
                    {topic.name}
                  </Label>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Enregistrement..." : "Enregistrer les préférences"}
      </Button>
    </form>
  );
}
