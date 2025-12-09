import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Tag, Filter } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AudiencePage() {
  const contactCount = await prisma.contact.count();
  const segmentCount = await prisma.segment.count(); 
  const topicCount = await prisma.topic.count(); 

  return (
    <div className="flex h-full flex-col space-y-8 bg-black p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Audience</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/audience/contacts">
          <Card className="hover:bg-white/10 transition-colors cursor-pointer border-white/10 bg-[#1B1B1B]/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{contactCount}</div>
              <p className="text-xs text-muted-foreground">
                Total contacts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/audience/topics">
          <Card className="hover:bg-white/10 transition-colors cursor-pointer border-white/10 bg-[#1B1B1B]/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Topics</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{topicCount}</div>
              <p className="text-xs text-muted-foreground">
                Préférences
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/audience/segments">
          <Card className="hover:bg-white/10 transition-colors cursor-pointer border-white/10 bg-[#1B1B1B]/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Segments</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{segmentCount}</div>
              <p className="text-xs text-muted-foreground">
                Groupes de contacts
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
