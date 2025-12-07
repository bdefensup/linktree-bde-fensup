"use client";

import { AdvancedEditor } from "@/components/editor/advanced-editor";

export default function TestPage() {
  return (
    <div className="bg-muted/20 flex w-full flex-col items-center justify-center p-8">
      <div className="w-full  space-y-6">
        <AdvancedEditor
          placeholder="Rédigez votre email ici..."
          
        />
      </div>
    </div>
  );
}
