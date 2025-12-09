import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerifyButton } from "./verify-button";
import { getDomain } from "../actions";

export default async function DomainDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const domain = await getDomain(id);

  if (!domain) return notFound();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
            <CheckCircle className="h-3 w-3" /> Verified
          </Badge>
        );
      case "failed":
      case "temporary_failure":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/settings/domains">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            {domain.name}
            {getStatusBadge(domain.status)}
          </h1>
          <p className="text-muted-foreground">
            {domain.region} • Created on {new Date(domain.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-auto">
            <VerifyButton id={domain.id} />
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-[#1B1B1B] border-white/10 text-white">
          <CardHeader>
            <CardTitle>DNS Records</CardTitle>
            <CardDescription>
              Add these records to your DNS provider to verify your domain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {domain.records?.map((record: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-muted-foreground uppercase">
                    {record.record} Record ({record.type})
                  </span>
                  {record.status === "verified" ? (
                    <Badge variant="outline" className="text-green-500 border-green-500/20">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">Pending</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Name</label>
                        <div className="flex items-center gap-2 p-2 rounded bg-black/50 border border-white/10 font-mono text-sm">
                            <span className="truncate">{record.name}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Value</label>
                        <div className="flex items-center gap-2 p-2 rounded bg-black/50 border border-white/10 font-mono text-sm">
                            <span className="truncate">{record.value}</span>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
