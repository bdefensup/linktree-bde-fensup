import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { Plus, Search, Upload } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface PageProps {
  searchParams: Promise<{ query?: string; page?: string }>;
}

export default async function ContactsPage({ searchParams }: PageProps) {
  const { query, page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const where: any = {};
  if (query) {
    where.OR = [
      { email: { contains: query, mode: "insensitive" } },
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
    ];
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contact.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <div className="flex gap-2">
          <Link href="/admin/audience/contacts/import">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importer
            </Button>
          </Link>
          <Link href="/admin/audience/contacts/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un contact
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              name="query"
              placeholder="Rechercher..."
              defaultValue={query}
              className="pl-9 bg-white/5 border-white/10 text-white"
            />
          </form>
        </div>
      </div>

      <div className="rounded-md border border-white/10 bg-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Prénom</TableHead>
              <TableHead className="text-muted-foreground">Nom</TableHead>
              <TableHead className="text-muted-foreground">Statut</TableHead>
              <TableHead className="text-muted-foreground">Ajouté le</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Aucun contact trouvé.
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{contact.email}</TableCell>
                  <TableCell className="text-muted-foreground">{contact.firstName || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{contact.lastName || "-"}</TableCell>
                  <TableCell>
                    {contact.unsubscribed ? (
                      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500 ring-1 ring-inset ring-red-500/20">
                        Désinscrit
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500 ring-1 ring-inset ring-green-500/20">
                        Actif
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(contact.createdAt), "d MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/audience/contacts/${contact.id}`}>
                      <Button variant="ghost" size="sm">
                        Voir
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            asChild
          >
            <Link href={`?page=${currentPage - 1}&query=${query || ""}`}>Précédent</Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            asChild
          >
            <Link href={`?page=${currentPage + 1}&query=${query || ""}`}>Suivant</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
