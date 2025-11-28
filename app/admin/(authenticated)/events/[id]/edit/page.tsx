import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/admin/event-form";
import { notFound } from "next/navigation";
import { format } from "date-fns";

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
      <h1 className="text-3xl font-bold mb-2">Modifier l'événement</h1>
      <p className="text-muted-foreground mb-8">
        Modification de :{" "}
        <span className="font-medium text-foreground">{event.title}</span>
      </p>
      <EventForm
        initialData={{
          ...event,
          date: event.date,
          memberPrice: event.memberPrice || undefined,
          externalPrice: event.externalPrice || undefined,
          image: event.image || undefined,
          capacity: event.maxSeats,
          time: format(event.date, "HH:mm"),
        }}
      />
    </div>
  );
}
