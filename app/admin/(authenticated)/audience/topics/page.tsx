import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tag } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TopicForm } from "./_components/topic-form";

export default async function TopicsPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { contacts: true },
      },
    },
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Topics</h1>
        <TopicForm />
      </div>

      <div className="rounded-md border border-white/10 bg-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-muted-foreground">Nom</TableHead>
              <TableHead className="text-muted-foreground">Abonnés</TableHead>
              <TableHead className="text-muted-foreground">Créé le</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Aucun topic trouvé.
                </TableCell>
              </TableRow>
            ) : (
              topics.map((topic) => (
                <TableRow key={topic.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {topic.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {topic._count.contacts}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(topic.createdAt), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled>
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
