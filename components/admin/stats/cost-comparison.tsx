"use client"

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PiggyBank } from "lucide-react"

interface CostData {
  channel: string;
  cost: number;
  fill: string;
  label: string;
}

interface CostComparisonChartProps {
  data: CostData[];
}

export function CostComparisonChart({ data }: CostComparisonChartProps) {
  // Calculer l'économie réalisée (Ads Cost - Email Cost)
  const emailCost = data.find(d => d.channel.includes("Email"))?.cost || 0;
  const adsCost = data.find(d => d.channel.includes("Ads"))?.cost || 0;
  const savings = adsCost - emailCost;

  return (
    <Card className="col-span-1 bg-[#09090b] border-white/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="bg-green-500/10 p-2 rounded-full text-green-500">
                <PiggyBank size={16} />
              </span>
              Économies Réalisées
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Coût marketing pour remplir cet événement
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="block text-2xl font-bold text-green-500">
              -{savings.toLocaleString('fr-FR')} €
            </span>
            <span className="text-xs text-gray-500">d'économie vs Ads</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEmail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.5} />
              
              <XAxis 
                dataKey="channel" 
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
                formatter={(value) => [`${value} €`, "Coût Estimé"]}
              />

              <Bar dataKey="cost" radius={[8, 8, 0, 0]} barSize={60}>
                <LabelList 
                  dataKey="label" 
                  position="top" 
                  fill="white" 
                  fontSize={14} 
                  fontWeight="bold"
                />
                
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.channel.includes("Email") ? "url(#colorEmail)" : "url(#colorAds)"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 text-xs text-gray-500 text-center italic">
            *Calcul basé sur un CPA (Coût par Acquisition) moyen de 0.60€ sur Meta Ads.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
