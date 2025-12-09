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
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function SegmentsPage() {
  const segments = await prisma.segment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { campaigns: true },
      },
    },
  });

  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Segments</h1>
        <Link href="/admin/audience/segments/new">
          <Button className="gap-2 bg-white text-black hover:bg-white/90">
            <Plus className="h-4 w-4" />
            Créer un segment
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1B1B1B]/50 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Nom</TableHead>
              <TableHead className="text-muted-foreground">Critères</TableHead>
              <TableHead className="text-muted-foreground">Campagnes</TableHead>
              <TableHead className="text-muted-foreground">Créé le</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {segments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Aucun segment trouvé.
                </TableCell>
              </TableRow>
            ) : (
              segments.map((segment) => (
                <TableRow key={segment.id} className="border-white/5 transition-colors hover:bg-white/5">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {segment.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <code className="text-xs bg-black/20 px-1 py-0.5 rounded text-white/70">
                      {JSON.stringify(segment.query)}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {segment._count.campaigns}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(segment.createdAt), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled className="text-muted-foreground hover:text-white hover:bg-white/10">
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
