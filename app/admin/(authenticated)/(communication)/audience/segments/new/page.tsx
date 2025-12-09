import { SegmentForm } from "../_components/segment-form";

export default function NewSegmentPage() {
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Créer un segment</h1>
      </div>
      
      <div className="rounded-md border border-white/10 bg-white/5 p-6">
        <SegmentForm />
      </div>
    </div>
  );
}
