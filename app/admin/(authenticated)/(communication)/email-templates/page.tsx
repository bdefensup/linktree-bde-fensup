"use client";

import { useState } from "react";
import { CampaignsSidebar } from "@/components/admin/campaigns/campaigns-sidebar";
import { TemplateList } from "@/components/admin/campaigns/template-list";
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { moveTemplate } from "@/app/admin/(authenticated)/campaigns/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CampaignsPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const templateId = active.id as string;
    const targetFolderId = over.id as string;

    // Handle "unsorted" folder case
    const folderId = targetFolderId === "unsorted" ? null : targetFolderId;

    try {
      await moveTemplate(templateId, folderId);
      toast.success("Template déplacé");
      // Force refresh to update lists
      router.refresh();
    } catch (error) {
      console.error("Failed to move template:", error);
      toast.error("Erreur lors du déplacement");
    }
  };

  const handleSelectTemplate = (template: any) => {
    router.push(`/admin/email-templates/${template.id}`);
  };

  const handleCreateTemplate = () => {
    router.push("/admin/email-templates/new");
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-full overflow-hidden bg-black">
        <CampaignsSidebar
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onSelectTemplate={handleSelectTemplate}
          onCreateTemplate={handleCreateTemplate}
        />
        <TemplateList selectedFolderId={selectedFolderId} onSelectTemplate={handleSelectTemplate} />
      </div>
    </DndContext>
  );
}
