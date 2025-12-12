"use client"

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Filter } from "lucide-react"

interface FunnelData {
  stage: string;
  value: number;
  fill: string;
  label: string;
}

interface ConversionFunnelProps {
  data: FunnelData[];
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  // Trouver la valeur des ventes pour le résumé
  const salesData = data.find(d => d.stage.includes("ACHETÉS"));
  const salesCount = salesData ? salesData.value : 0;

  return (
    <Card className="col-span-1 bg-[#09090b] border-white/10 shadow-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span className="bg-green-500/10 p-2 rounded-full text-green-500">
            <Filter size={16} />
          </span>
          Entonnoir du "Sold Out"
        </CardTitle>
        <CardDescription className="text-gray-400 mt-1">
          Conversion directe : Email ➔ Achat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[350px] flex flex-col justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical" 
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
            >
              {/* Grille verticale pour aider à lire la proportion */}
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" opacity={0.2} />

              {/* Axe X caché (juste pour l'échelle) */}
              <XAxis type="number" hide />

              {/* Axe Y : Les étapes du funnel */}
              <YAxis 
                dataKey="stage" 
                type="category" 
                width={140} 
                tick={{ fill: '#888888', fontSize: 12, fontWeight: 500 }} 
                axisLine={false}
                tickLine={false}
              />

              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                formatter={(value: number) => [value.toLocaleString(), "Volume"]}
              />

              {/* Les Barres */}
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                {/* Affichage de la valeur exacte à droite de la barre */}
                <LabelList 
                  dataKey="label" 
                  position="right" 
                  fill="white" 
                  fontSize={12} 
                  fontWeight="bold"
                />
                
                {/* Mapping des couleurs */}
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Résumé textuel en bas */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <span className="text-green-500 font-bold text-lg">{salesCount} ventes</span>
            <span className="text-gray-400 text-sm"> générées directement par l'emailing</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
