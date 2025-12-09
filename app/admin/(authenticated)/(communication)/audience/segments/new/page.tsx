import { SegmentForm } from "../_components/segment-form";

export default function NewSegmentPage() {
  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Créer un segment</h1>
      </div>
      
      <div className="rounded-xl border border-white/10 bg-[#1B1B1B]/50 p-6 backdrop-blur-sm">
        <SegmentForm />
      </div>
    </div>
  );
}
