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
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Contacts</h1>
        <div className="flex gap-2">
          <Link href="/admin/audience/contacts/import">
            <Button variant="outline" className="gap-2 bg-transparent border-white/10 text-white hover:bg-white/5">
              <Upload className="h-4 w-4" />
              Importer
            </Button>
          </Link>
          <Link href="/admin/audience/contacts/new">
            <Button className="gap-2 bg-white text-black hover:bg-white/90">
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
              className="pl-9 bg-[#1B1B1B]/50 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-white/20"
            />
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1B1B1B]/50 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
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
                <TableRow key={contact.id} className="border-white/5 transition-colors hover:bg-white/5">
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
                      <Button variant="ghost" size="sm" className="hover:bg-white/10 text-white">
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
            className="border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-50"
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
            className="border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-50"
          >
            <Link href={`?page=${currentPage + 1}&query=${query || ""}`}>Suivant</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
