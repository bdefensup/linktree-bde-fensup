import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ShotgunVelocityChartProps {
  data: any[];
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  range: 'week' | 'month' | '90days' | undefined;
  onRangeChange: (range: 'week' | 'month' | '90days' | undefined) => void;
  label: string;
}

export function ShotgunVelocityChart({ data, date, onDateChange, range, onRangeChange, label }: ShotgunVelocityChartProps) {
  // Trouver l'index ou le label où l'email a été envoyé pour placer la ReferenceLine
  const emailSentTime = data.find(d => d.annotation)?.time;

  return (
    <Card className="bg-[#09090b] border-white/10 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle className="text-white flex items-center gap-2">
            <span className="bg-purple-500/10 p-2 rounded-full text-purple-500">
              ⚡
            </span>
            Vélocité des Ventes
          </CardTitle>
          <CardDescription>
            Impact immédiat de la campagne sur la billetterie.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {/* Range Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-[#1C1C1E] border-white/10 text-white hover:bg-white/10 hover:text-white min-w-[140px] justify-between">
                {label || "Chargement..."}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1C1C1E] border-white/10 text-white">
              <DropdownMenuItem onClick={() => { onRangeChange(undefined); onDateChange(undefined); }}>
                🏆 Record (Meilleur Jour)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { onRangeChange('week'); onDateChange(undefined); }}>
                📅 Cette Semaine
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { onRangeChange('month'); onDateChange(undefined); }}>
                📅 Ce Mois
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { onRangeChange('90days'); onDateChange(undefined); }}>
                📅 3 Derniers Mois
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Picker (Custom) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                size="sm"
                className={cn(
                  "w-[40px] px-0 justify-center font-normal bg-[#1C1C1E] border-white/10 text-white hover:bg-white/10 hover:text-white",
                  date && "bg-purple-500/20 border-purple-500/50 text-purple-500"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#09090b] border-white/10" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { onDateChange(d); onRangeChange(undefined); }}
                initialFocus
                className="text-white"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis 
                dataKey="time" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
                interval={1}
              />
              <YAxis 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  borderColor: '#333', 
                  color: '#fff',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#a78bfa' }}
                cursor={{ stroke: 'white', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              
              {/* La preuve de cause à effet */}
              {emailSentTime && (
                <ReferenceLine 
                  x={emailSentTime} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3"
                  label={{ 
                    position: 'top', 
                    value: 'ENVOI MAIL 📩', 
                    fill: '#ef4444', 
                    fontSize: 12,
                    fontWeight: 'bold'
                  }} 
                />
              )}
              
              {/* La Courbe avec remplissage */}
              <Area 
                type="monotone" 
                dataKey="ventes" // On utilise 'ventes' car c'est ce qui est renvoyé par actions.ts
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorSales)" 
                strokeWidth={3}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
