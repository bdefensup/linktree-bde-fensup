import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PreferenceForm } from "./_components/preference-form";

interface PageProps {
  searchParams: Promise<{ email: string }>;
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md border-white/10 bg-[#1B1B1B] text-white">
          <CardHeader>
            <CardTitle>Lien invalide</CardTitle>
            <CardDescription>
              Le lien de désinscription est invalide ou a expiré.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const contact = await prisma.contact.findUnique({
    where: { email },
    include: {
      topics: {
        include: {
          topic: true,
        },
      },
    },
  });

  if (!contact) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md border-white/10 bg-[#1B1B1B] text-white">
          <CardHeader>
            <CardTitle>Contact introuvable</CardTitle>
            <CardDescription>
              Nous n'avons pas trouvé cet email dans notre base de données.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Determine which topics the user is subscribed to
  const subscribedTopicIds = contact.topics.map((ct: any) => ct.topicId);

  const allTopics = await prisma.topic.findMany({
    orderBy: { name: "asc" },
  });

  // Filter topics:
  // - Show PUBLIC topics
  // - Show PRIVATE topics ONLY if the user is already subscribed
  const visibleTopics = allTopics.filter((topic: any) => {
    if (topic.visibility === "PUBLIC") return true;
    return subscribedTopicIds.includes(topic.id);
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-white/10 bg-[#1B1B1B] text-white">
        <CardHeader>
          <CardTitle>Gérer vos préférences</CardTitle>
          <CardDescription>
            {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferenceForm 
            contact={contact} 
            allTopics={visibleTopics} 
            subscribedTopicIds={subscribedTopicIds} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
