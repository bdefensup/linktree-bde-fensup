import { prisma } from "@/lib/prisma";
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
  Shield,
  ShieldAlert,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Fetch Data

  let totalEvents = 0;
  let upcomingEventsCount = 0;
  let totalBookings = 0;
  let pendingBookings = 0;
  let totalUsers = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let nextEvent: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentBookings: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentUsers: any[] = [];

  try {
    // Execute queries sequentially to avoid exhausting the connection pool
    totalEvents = await prisma.event.count();
    upcomingEventsCount = await prisma.event.count({
      where: { date: { gte: new Date() } },
    });
    totalBookings = await prisma.booking.count();
    pendingBookings = await prisma.booking.count({
      where: { status: "PENDING" },
    });
    totalUsers = await prisma.user.count();

    nextEvent = await prisma.event.findFirst({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
    });

    recentBookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { event: true },
    });

    recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } catch (error) {
    console.error("Admin Dashboard Data Fetch Error:", error);
    // Return empty/safe data to prevent crash
    totalEvents = 0;
    upcomingEventsCount = 0;
    totalBookings = 0;
    pendingBookings = 0;
    totalUsers = 0;
    nextEvent = null;
    recentBookings = [];
    recentUsers = [];
  }

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
                <Link href="/admin/events/create">
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

        {/* 5. Next Event (Left - Span 2 Cols, Row 2) */}
        <Card className="col-span-1 md:col-span-2 relative overflow-hidden group border-border/50 shadow-md h-full min-h-[300px]">
          {nextEvent?.image ? (
            <Image
              src={nextEvent.image}
              alt={nextEvent.title}
              fill
              className="object-cover object-top z-10"
            />
          ) : (
            <div className="absolute inset-0 z-0 bg-linear-to-br from-primary/20 via-card to-card min-h-[300px]" />
          )}

          <CardHeader className="absolute top-0 left-0 right-0 z-30 p-4 flex flex-row items-start justify-between">
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
                  title="Voir la page"
                >
                  <Link href={`/billetterie/${nextEvent.id}`} target="_blank">
                    <Ticket className="h-4 w-4" />
                  </Link>
                </Button>
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
              </div>
            )}
          </CardHeader>

          <CardContent className="absolute inset-0 z-30 flex flex-col justify-end pb-4 pointer-events-none">
            <div className="pointer-events-auto px-6">
              {nextEvent ? (
                <div className="space-y-3 bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <h2 className="text-xl font-bold tracking-tight line-clamp-2 text-white leading-tight drop-shadow-md">
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
                        {format(
                          new Date(nextEvent.date),
                          "EEE dd MMM • HH:mm",
                          {
                            locale: fr,
                          }
                        )}
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
            </div>
          </CardContent>
        </Card>

        {/* 6. Recent Activity (Right - Span 2 Cols, Row 2) */}
        <Card className="col-span-1 md:col-span-2 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm h-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
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
                            <TableCell className="text-right align-middle">
                              <div className="flex justify-center items-center h-full">
                                {booking.status === "CONFIRMED" && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800 hover:bg-green-200 hover:border-green-300 dark:hover:bg-green-900/50 transition-colors duration-200 px-2 py-0.5 h-5 flex items-center"
                                  >
                                    Validé
                                  </Badge>
                                )}
                                {booking.status === "PENDING" && (
                                  <Badge
                                    variant="outline"
                                    className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border-orange-200 dark:border-orange-800 hover:bg-orange-200 hover:border-orange-300 dark:hover:bg-orange-900/50 transition-colors duration-200 px-2 py-0.5 h-5 flex items-center"
                                  >
                                    En attente
                                  </Badge>
                                )}
                                {booking.status === "CANCELLED" && (
                                  <Badge
                                    variant="outline"
                                    className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-800 hover:bg-red-200 hover:border-red-300 dark:hover:bg-red-900/50 transition-colors duration-200 px-2 py-0.5 h-5 flex items-center"
                                  >
                                    Refusé
                                  </Badge>
                                )}
                              </div>
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
                            <TableCell className="text-right align-middle">
                              <div className="flex justify-center items-center h-full">
                                {user.role === "admin" && (
                                  <Badge
                                    variant="outline"
                                    className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800 gap-1 hover:bg-orange-100 dark:hover:bg-orange-900/60 px-2 py-0.5 h-5 flex items-center"
                                  >
                                    <ShieldAlert className="w-3 h-3" />
                                    Admin
                                  </Badge>
                                )}
                                {user.role === "staff" && (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2 py-0.5 h-5 flex items-center"
                                  >
                                    <Shield className="w-3 h-3" />
                                    Staff
                                  </Badge>
                                )}
                                {(user.role === "adherent" ||
                                  user.role === "user") && (
                                  <Badge
                                    variant="outline"
                                    className="bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800 gap-1 hover:bg-violet-100 dark:hover:bg-violet-900/60 px-2 py-0.5 h-5 flex items-center"
                                  >
                                    <UserIcon className="w-3 h-3" />
                                    Adhérent
                                  </Badge>
                                )}
                              </div>
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
      </div>
    </div>
  );
}
