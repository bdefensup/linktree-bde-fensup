"use client"

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReactivityChartProps {
  data: { range: string; percentage: number; fill: string }[];
  campaigns: { id: string; name: string; sentAt: Date | null }[];
  selectedCampaignId: string | undefined;
  onSelectCampaign: (id: string | undefined) => void;
}

export function ReactivityChart({ data, campaigns, selectedCampaignId, onSelectCampaign }: ReactivityChartProps) {
  // Calculer le total < 1h (somme des 4 premiers éléments)
  const underOneHour = data.slice(0, 4).reduce((acc, curr) => acc + curr.percentage, 0);

  const selectedCampaignName = campaigns?.find(c => c.id === selectedCampaignId)?.name || "Toutes les campagnes";

  return (
    <Card className="bg-[#09090b] border-white/10 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
        <div className="space-y-1">
          <CardTitle className="text-white flex items-center gap-2">
            <span className="bg-blue-500/10 p-2 rounded-full text-blue-500">
              ⚡
            </span>
            Réactivité de l'Audience
          </CardTitle>
          <CardDescription>
            Vitesse d'ouverture après envoi (Pocket Buzz).
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Campaign Selector */}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-[#1C1C1E] border-white/10 text-white hover:bg-white/10 hover:text-white min-w-[180px] justify-between">
                <span className="truncate max-w-[150px]">{selectedCampaignName}</span>
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1C1C1E] border-white/10 text-white max-h-[300px] overflow-y-auto">
              <DropdownMenuItem onClick={() => onSelectCampaign(undefined)}>
                Toutes les campagnes
              </DropdownMenuItem>
              {campaigns?.map((campaign) => (
                <DropdownMenuItem key={campaign.id} onClick={() => onSelectCampaign(campaign.id)}>
                  {campaign.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-right min-w-[100px]">
            <span className="block text-3xl font-bold text-[#3b82f6]">{underOneHour}%</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Ouvertures <br/>en &lt; 1H</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis 
                dataKey="range" 
                stroke="#888" 
                tickLine={false} 
                axisLine={false} 
                fontSize={12} 
                dy={10} 
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
              />
              <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="percentage" position="top" fill="white" formatter={(val: number) => `${val}%`} />
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
