import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/admin/event-form";
import { notFound } from "next/navigation";

export default async function EditEventPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const event = await prisma.event.findUnique({
    where: { id: params.id },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Modifier l'événement</h1>
      <EventForm
        initialData={{
          ...event,
          date: event.date,
          memberPrice: event.memberPrice || undefined,
          image: event.image || undefined,
        }}
      />
    </div>
  );
}
