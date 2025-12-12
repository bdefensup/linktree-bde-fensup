"use strict";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function CampusRadarChart({ data }: { data: any[] }) {
  return (
    <Card className="bg-[#1C1C1E] border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-white">Campus Domination 🕸️</CardTitle>
        <CardDescription>Pénétration par Promo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#888888", fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Taux de Pénétration"
                dataKey="A"
                stroke="#ec4899"
                fill="#ec4899"
                fillOpacity={0.6}
              />
              <Tooltip 
                 contentStyle={{ backgroundColor: "#1C1C1E", border: "none", color: "#fff" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
