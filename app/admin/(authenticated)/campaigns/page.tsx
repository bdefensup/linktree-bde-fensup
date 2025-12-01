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

export default function CampaignsPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

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
    <div className="flex h-full">
      <CampaignsSidebar selectedFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} />
      <TemplateList
        selectedFolderId={selectedFolderId}
        onSelectTemplate={(template) => setSelectedTemplate(template as EmailTemplate)}
      />
    </div>
  );
}
