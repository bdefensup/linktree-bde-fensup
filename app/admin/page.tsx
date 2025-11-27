import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Users,
  Ticket,
  Plus,
  ArrowRight,
  MapPin,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Activity,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminDashboard() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect("/admin/login");
  }

  // Fetch Data
  const [
    totalEvents,
    upcomingEventsCount,
    totalBookings,
    pendingBookings,
    totalUsers,
    nextEvent,
    recentBookings,
    recentUsers,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { date: { gte: new Date() } } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.event.findFirst({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { event: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de l'activité du BDE.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="shadow-lg shadow-primary/20">
            <Link href="/admin/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Créer un Événement
            </Link>
          </Button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ROW 1 */}

        {/* 1. Quick Actions (Top Left) */}
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actions Rapides
            </CardTitle>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-full h-10"
                asChild
                title="Créer un événement"
              >
                <Link href="/admin/events/new">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-full h-10"
                asChild
                title="Inviter un staff"
              >
                <Link href="/admin/staff">
                  <UserPlus className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-full h-10"
                asChild
                title="Gérer les billets"
              >
                <Link href="/admin/reservations">
                  <Ticket className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. Reservations (Top Middle-Left) */}
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              en attente ({totalBookings} total)
            </p>
          </CardContent>
        </Card>

        {/* 3. Members (Top Middle-Right) */}
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membres</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              inscrits sur la plateforme
            </p>
          </CardContent>
        </Card>

        {/* 4. Events (Top Right) */}
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEventsCount}</div>
            <p className="text-xs text-muted-foreground">
              à venir ({totalEvents} total)
            </p>
          </CardContent>
        </Card>

        {/* 5. Next Event (Left - Span 2 Cols, Span 2 Rows) */}
        <Card className="col-span-1 md:col-span-1 row-span-2 relative overflow-hidden group border-border/50 shadow-md h-[350px]">
          {nextEvent?.image ? (
            <Image
              src={nextEvent.image}
              alt={nextEvent.title}
              fill
              className="object-contain object-top z-10 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 z-0 bg-linear-to-br from-primary/20 via-card to-card" />
          )}

          <CardHeader className="relative z-30 pb-2 flex flex-row items-start justify-between">
            <div className="inline-flex">
              <CardTitle className="flex items-center gap-2 text-white bg-black/60 backdrop-blur-md rounded-md px-3 py-1.5 text-sm">
                <CalendarIcon className="w-4 h-4 text-primary" />
                Prochain Événement
              </CardTitle>
            </div>
            {nextEvent && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-black/60 backdrop-blur-md text-white hover:bg-black/80 border-none"
                  asChild
                  title="Gérer l'événement"
                >
                  <Link href={`/admin/events/${nextEvent.id}/edit`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-black/60 backdrop-blur-md text-white hover:bg-black/80 border-none"
                  asChild
                  title="Voir la page"
                >
                  <Link href={`/billetterie/${nextEvent.id}`} target="_blank">
                    <Ticket className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="relative z-30 flex flex-col justify-end h-[calc(100%-60px)] pb-6">
            {nextEvent ? (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold tracking-tight line-clamp-2 text-white leading-tight drop-shadow-md">
                  {nextEvent.title}
                </h2>
                <div className="flex flex-col gap-1.5 text-gray-100 text-sm font-medium drop-shadow-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="line-clamp-1">{nextEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                    <span className="capitalize">
                      {format(new Date(nextEvent.date), "EEE dd MMM • HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <CalendarDays className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">Aucun événement à venir.</p>
                <Button
                  variant="link"
                  asChild
                  className="mt-1 h-auto p-0 text-primary"
                >
                  <Link href="/admin/events/new">Créer un événement</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 6. Recent Activity (Right - Span 2 Cols, Row 2) */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activité Récente
            </CardTitle>
            <CardDescription>
              Dernières réservations et inscriptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 h-[180px] divide-y md:divide-y-0 md:divide-x divide-border/50">
              {/* Column 1: Reservations */}
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Ticket className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">
                      Dernières Réservations
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Nom</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBookings.length > 0 ? (
                        recentBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>
                                  {booking.firstName} {booking.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {booking.phone}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {format(new Date(booking.createdAt), "dd MMM", {
                                locale: fr,
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              {booking.status === "CONFIRMED" && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-green-50 text-green-700 border-green-200 px-1 py-0 h-4"
                                >
                                  Validé
                                </Badge>
                              )}
                              {booking.status === "PENDING" && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-orange-50 text-orange-700 border-orange-200 px-1 py-0 h-4"
                                >
                                  En attente
                                </Badge>
                              )}
                              {booking.status === "CANCELLED" && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-red-50 text-red-700 border-red-200 px-1 py-0 h-4"
                                >
                                  Refusé
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-muted-foreground text-xs"
                          >
                            Aucune réservation.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>

              {/* Column 2: New Members */}
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Nouveaux Membres</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead className="text-right">Rôle</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentUsers.length > 0 ? (
                        recentUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user.image || ""} />
                                <AvatarFallback className="text-[10px]">
                                  {user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              <div className="flex flex-col">
                                <span>{user.name}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {format(new Date(user.createdAt), "dd MMM", {
                                    locale: fr,
                                  })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1 py-0 h-4"
                              >
                                {user.role === "admin"
                                  ? "Admin"
                                  : user.role === "staff"
                                    ? "Staff"
                                    : "Adhérent"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-muted-foreground text-xs"
                          >
                            Aucun nouveau membre.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* 7. Calendar (Right - Span 2 Cols, Row 3) */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Calendrier</CardTitle>
            <CardDescription>Aperçu du mois en cours</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-0">
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md border shadow-sm bg-background/50  w-full flex justify-center"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
