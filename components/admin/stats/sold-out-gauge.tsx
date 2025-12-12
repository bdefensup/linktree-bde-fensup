"use strict";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function SoldOutGauge({ sold, capacity, eventName }: { sold: number, capacity: number, eventName: string }) {
  const percentage = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  
  // Couleur dynamique : Vert -> Jaune -> Rouge (Urgence/Succès)
  // Ou plutôt : Bleu (Froid) -> Violet (Chaud) -> Rouge (Sold Out)
  const getStrokeColor = (percent: number) => {
    if (percent >= 100) return "#ef4444"; // Rouge (Sold Out)
    if (percent >= 80) return "#f59e0b"; // Orange (Presque)
    return "#3b82f6"; // Bleu (En cours)
  };

  return (
    <Card className="bg-[#09090b] border-white/10 shadow-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span className="bg-orange-500/10 p-2 rounded-full text-orange-500">
            🏎️
          </span>
          Jauge Sold-Out
        </CardTitle>
        <CardDescription>
          Remplissage de l'événement : <span className="text-white font-medium">{eventName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="70%" 
              outerRadius="100%" 
              barSize={20} 
              data={[{ name: 'sold', value: percentage, fill: getStrokeColor(percentage) }]} 
              startAngle={225} 
              endAngle={-45}
            >
              <RadialBar
                background={{ fill: '#333' }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-white tracking-tighter">{percentage}%</span>
            <span className="text-sm text-muted-foreground mt-2 font-medium uppercase tracking-widest">Rempli</span>
            <div className="mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
              {sold} / {capacity} places
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
