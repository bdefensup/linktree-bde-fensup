"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface RevenueData {
  date: string;
  revenue: number;
}

interface RevenueGrowthChartProps {
  data: RevenueData[];
}

export function RevenueGrowthChart({ data }: RevenueGrowthChartProps) {
  // Calculer le total et la croissance
  const totalRevenue = data.length > 0 ? data[data.length - 1].revenue : 0;
  const startRevenue = data.length > 0 ? data[0].revenue : 0;
  const growth = startRevenue > 0 ? ((totalRevenue - startRevenue) / startRevenue) * 100 : 0;

  return (
    <Card className="col-span-1 bg-[#09090b] border-white/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                <TrendingUp size={16} />
              </span>
              Croissance du Revenu
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Évolution du CA cumulé (30 derniers jours)
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="block text-2xl font-bold text-white">
              {totalRevenue.toLocaleString('fr-FR')} €
            </span>
            <span className={`text-xs font-medium ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {growth >= 0 ? '+' : ''}{Math.round(growth)}% vs début de période
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                }}
                minTickGap={30}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                formatter={(value: number) => [`${value.toLocaleString()} €`, "Revenu Cumulé"]}
                labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
