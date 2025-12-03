"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MousePointerClick, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CampaignDashboardProps {
  campaign: any;
}

export function CampaignDashboard({ campaign }: CampaignDashboardProps) {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col bg-black p-4">
      <div className="supports-backdrop-filter:bg-[#1B1B1B]/50 flex flex-1 flex-col overflow-hidden rounded-2xl border bg-[#1B1B1B]/70 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#1B1B1B]/50 p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/campaigns")}
              className="rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{campaign.name}</h1>
              <p className="text-muted-foreground text-sm">Rapport de campagne</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Envoyés</CardTitle>
                  <Mail className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaign.sentCount}</div>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ouvertures</CardTitle>
                  <Eye className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaign.openCount}</div>
                  <p className="text-muted-foreground text-xs">
                    {campaign.sentCount > 0
                      ? Math.round((campaign.openCount / campaign.sentCount) * 100)
                      : 0}
                    % taux d'ouverture
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clics</CardTitle>
                  <MousePointerClick className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaign.clickCount}</div>
                  <p className="text-muted-foreground text-xs">
                    {campaign.openCount > 0
                      ? Math.round((campaign.clickCount / campaign.openCount) * 100)
                      : 0}
                    % taux de clic
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Placeholder for more detailed stats */}
            <div className="text-muted-foreground rounded-xl border border-dashed border-white/10 p-12 text-center">
              <p>Graphiques détaillés et liste des destinataires à venir.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
