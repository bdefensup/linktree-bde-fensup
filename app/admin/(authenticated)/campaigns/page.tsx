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

import { createTemplate } from "@/app/admin/campaigns/actions";
import { toast } from "sonner";

// ...

export default function CampaignsPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

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
    <div className="flex h-full bg-black">
      <CampaignsSidebar
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateTemplate={handleCreateTemplate}
      />
      <TemplateList
        selectedFolderId={selectedFolderId}
        onSelectTemplate={(template) => setSelectedTemplate(template as EmailTemplate)}
      />
    </div>
  );
}
