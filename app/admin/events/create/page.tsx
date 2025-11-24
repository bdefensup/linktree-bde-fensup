import { EventForm } from "@/components/admin/event-form";

export default function CreateEventPage() {
  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Créer un événement</h1>
      <EventForm />
    </div>
  );
}
