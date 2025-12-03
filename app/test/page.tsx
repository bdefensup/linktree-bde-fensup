import { AdvancedEditor } from "@/components/editor/advanced-editor";

export default function TestPage() {
  return (
    <div className="bg-muted/20 flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl space-y-4">
        <h1 className="mb-8 text-center text-3xl font-bold">Test Éditeur Tiptap</h1>
        <AdvancedEditor />
      </div>
    </div>
  );
}
