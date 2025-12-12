"use client";

import { useEffect, useState } from "react";
import { getStatisticsData } from "@/app/admin/(authenticated)/(communication)/campaigns/actions";
import { ShotgunVelocityChart } from "@/components/admin/stats/shotgun-velocity";
import { toast } from "sonner";
import { ImpactCard } from "@/components/admin/dashboard/impact-card";
import { Coins, Ticket, Send, Activity } from "lucide-react";
import { SoldOutGauge } from "@/components/admin/stats/sold-out-gauge";
import { ReactivityChart } from "@/components/admin/stats/reactivity-chart";
import { ConversionFunnel } from "@/components/admin/stats/conversion-funnel";
import { RevenueGrowthChart } from "@/components/admin/stats/revenue-growth";
import { CostComparisonChart } from "@/components/admin/stats/cost-comparison";

export default function StatisticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [range, setRange] = useState<'week' | 'month' | '90days' | undefined>(undefined);
  const [reactivityCampaignId, setReactivityCampaignId] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, [date, range, reactivityCampaignId]);

  async function loadData() {
    try {
      // Only show full page loader on initial load
      if (!data) setIsLoading(true);
      
      const statsData = await getStatisticsData(date, range, reactivityCampaignId);
      setData(statsData);

      // Sync local state with backend default if not set
      if (!reactivityCampaignId && statsData.currentReactivityCampaignId) {
        setReactivityCampaignId(statsData.currentReactivityCampaignId);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Statistiques</h1>
          <p className="text-gray-400 mt-1">Vue d'ensemble des performances de la billetterie.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ImpactCard 
          title="Revenu Total (30j)" 
          value={`${data.kpiData.revenue.value.toLocaleString('fr-FR')} €`}
          icon={Coins}
          trend={{ value: data.kpiData.revenue.trend, label: "vs mois dernier", positive: data.kpiData.revenue.positive }}
        />
        <ImpactCard 
          title="Billets Vendus (30j)" 
          value={data.kpiData.bookings.value.toString()}
          icon={Ticket}
          trend={{ value: data.kpiData.bookings.trend, label: "vs mois dernier", positive: data.kpiData.bookings.positive }}
        />
        <ImpactCard 
          title="Emails Envoyés (30j)" 
          value={data.kpiData.emailsSent.value.toString()}
          icon={Send}
          trend={{ value: data.kpiData.emailsSent.trend, label: "vs mois dernier", positive: data.kpiData.emailsSent.positive }}
        />
        <ImpactCard 
          title="Campagnes Actives" 
          value={data.kpiData.activeCampaigns.value.toString()}
          icon={Activity}
          trend={{ value: 0, label: "Ce mois-ci", positive: true }} // Pas de trend pour l'instant
        />
      </div>

      {/* Top Row: Gauge & Velocity & Funnel */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SoldOutGauge 
          sold={data.soldOutData.sold} 
          capacity={data.soldOutData.capacity} 
          eventName={data.soldOutData.eventName} 
        />
        <div className="col-span-1 lg:col-span-2">
             <ShotgunVelocityChart 
               data={data.velocityData} 
               date={date}
               onDateChange={setDate}
               range={range}
               onRangeChange={setRange}
               label={data.periodLabel}
             />
        </div>
        <ConversionFunnel data={data.funnelData} />
      </div>

      {/* Reactivity Row */}
      <div className="w-full">
        <ReactivityChart 
          data={data.reactivityData} 
          campaigns={data.campaignsInRange}
          selectedCampaignId={reactivityCampaignId}
          onSelectCampaign={setReactivityCampaignId}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueGrowthChart data={data.revenueData} />
        <CostComparisonChart data={data.costData} />
      </div>
    </div>
  );
}
