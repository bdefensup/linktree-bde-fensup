"use client";

import { useState } from "react";
import { CampaignsSidebar } from "@/components/admin/campaigns/campaigns-sidebar";
import { TemplateList } from "@/components/admin/campaigns/template-list";
import { TemplateEditor } from "@/components/admin/campaigns/template-editor";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;

  content: unknown;
  updatedAt: Date;
}

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { createTemplate, moveTemplate } from "@/app/admin/campaigns/actions";
import { toast } from "sonner";

// ...

export default function CampaignsPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleCreateTemplate = async () => {
    const name = "Nouveau template";
    try {
      const newTemplate = await createTemplate(
        name,
        selectedFolderId === "trash" ? null : selectedFolderId
      );
      setSelectedTemplate(newTemplate as EmailTemplate);
      toast.success("Template créé");
    } catch (error) {
      console.error("Failed to create template:", error);
      toast.error("Erreur lors de la création du template");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const templateId = active.id as string;
    const folderId = over.id as string; // "unsorted" or folder ID

    if (folderId === "dossiers") return; // Can't drop on the header

    try {
      await moveTemplate(templateId, folderId === "unsorted" ? null : folderId);
      toast.success("Template déplacé");
    } catch (error) {
      console.error("Failed to move template:", error);
      toast.error("Erreur lors du déplacement du template");
    }
  };

  if (selectedTemplate) {
    return (
      <TemplateEditor
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
        onUpdate={(updated) => setSelectedTemplate(updated)}
      />
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full bg-black">
        <CampaignsSidebar
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onSelectTemplate={setSelectedTemplate}
          onCreateTemplate={handleCreateTemplate}
        />
        <TemplateList
          selectedFolderId={selectedFolderId}
          onSelectTemplate={(template) => setSelectedTemplate(template as EmailTemplate)}
        />
      </div>
    </DndContext>
  );
}
