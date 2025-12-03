"use client";

import { TemplateEditor } from "@/components/admin/campaigns/template-editor";
import { useRouter } from "next/navigation";

export function ClientTemplateEditorWrapper({ template }: { template: any }) {
  const router = useRouter();

  return (
    <TemplateEditor
      template={template}
      onBack={() => router.push("/admin/email-templates")}
      onUpdate={() => {
        // Optional: update local state or just rely on router.refresh() if needed
        router.refresh();
      }}
    />
  );
}
