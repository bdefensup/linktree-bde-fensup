import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ContactForm } from "../_components/contact-form";
import { DeleteContactButton } from "./delete-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContactPage({ params }: PageProps) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
  });

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Modifier le contact</h1>
        <DeleteContactButton id={contact.id} />
      </div>
      
      <div className="rounded-md border border-white/10 bg-white/5 p-6">
        <ContactForm      initialData={{
        ...contact,
        properties: (contact.properties as Record<string, string>) || {},
      }} />
      </div>
    </div>
  );
}
