"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCampaignStats, getCampaignEmailStats } from "@/app/admin/(authenticated)/(communication)/campaigns/actions"

const reservationChartConfig = {
  visitors: {
    label: "Réservations",
  },
  confirmed: {
    label: "Validée",
    color: "#F97316", // Orange 500
  },
  checkedIn: {
    label: "Check-in",
    color: "#3B82F6", // Blue 500
  },
  checkedOut: {
    label: "Check-out",
    color: "#1D4ED8", // Blue 700
  },
  pending: {
    label: "En attente",
    color: "#FDBA74", // Orange 300
  },
  cancelled: {
    label: "Annulée",
    color: "#94A3B8", // Slate 400
  },
} satisfies ChartConfig

const emailChartConfig = {
  sent: {
    label: "Envoyé",
    color: "#3B82F6", // Blue
  },
  delivered: {
    label: "Délivré",
    color: "#22C55E", // Green
  },
  opened: {
    label: "Ouvert",
    color: "#EAB308", // Yellow
  },
  clicked: {
    label: "Cliqué",
    color: "#A855F7", // Purple
  },
  bounced: {
    label: "Rebondi",
    color: "#EF4444", // Red
  },
  complained: {
    label: "Plainte",
    color: "#991B1B", // Dark Red
  },
  failed: {
    label: "Échoué",
    color: "#64748B", // Slate
  },
} satisfies ChartConfig

interface Campaign {
  id: string
  name: string
  segment?: {
    query: any
  } | null
}

interface Event {
  id: string
  title: string
  date: Date | string
}

interface CampaignStatsChartProps {
  campaigns: Campaign[]
  events: Event[]
}

export function CampaignStatsChart({ campaigns, events }: CampaignStatsChartProps) {
  const [selectedEventId, setSelectedEventId] = React.useState<string>("")
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<string>("")
  
  const [stats, setStats] = React.useState<{
    confirmed: number
    checkedIn: number
    checkedOut: number
    pending: number
    cancelled: number
    total: number
  } | null>(null)

  const [emailStats, setEmailStats] = React.useState<any[]>([])
  const [timeRange, setTimeRange] = React.useState("7d")

  const [isLoading, setIsLoading] = React.useState(false)

  // Initialize default event (closest future event)
  React.useEffect(() => {
    if (events.length > 0) {
      const now = new Date()
      // Sort events by date
      const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      // Find first event in the future
      const futureEvent = sortedEvents.find(e => new Date(e.date) >= now)
      
      // Default to future event, or last event if no future event
      const defaultEvent = futureEvent || sortedEvents[sortedEvents.length - 1]
      
      if (defaultEvent) {
        setSelectedEventId(defaultEvent.id)
      }
    }
  }, [events])

  // Filter campaigns based on selected event
  const filteredCampaigns = React.useMemo(() => {
    if (!selectedEventId) return []
    return campaigns.filter(c => {
      const reservedEventId = c.segment?.query?.reservedEventId
      return reservedEventId === selectedEventId
    })
  }, [campaigns, selectedEventId])

  // Select first campaign when filtered list changes
  React.useEffect(() => {
    if (filteredCampaigns.length > 0) {
      // Try to keep current selection if valid, otherwise select first
      const currentIsValid = filteredCampaigns.some(c => c.id === selectedCampaignId)
      if (!currentIsValid) {
        setSelectedCampaignId(filteredCampaigns[0].id)
      }
    } else {
      setSelectedCampaignId("")
      setStats(null)
      setEmailStats([])
    }
  }, [filteredCampaigns, selectedCampaignId])

  React.useEffect(() => {
    if (selectedCampaignId) {
      loadStats(selectedCampaignId)
    }
  }, [selectedCampaignId])

  const loadStats = async (campaignId: string) => {
    setIsLoading(true)
    try {
      const [data, emailData] = await Promise.all([
        getCampaignStats(campaignId),
        getCampaignEmailStats(campaignId)
      ])
      setStats(data)
      setEmailStats(emailData)
    } catch (error) {
      console.error("Failed to load stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const chartData = React.useMemo(() => {
    if (!stats) return []
    return [
      { status: "confirmed", visitors: stats.confirmed, fill: "#F97316" }, // Orange 500
      { status: "checkedIn", visitors: stats.checkedIn, fill: "#3B82F6" }, // Blue 500
      { status: "checkedOut", visitors: stats.checkedOut, fill: "#1D4ED8" }, // Blue 700
      { status: "pending", visitors: stats.pending, fill: "#FDBA74" }, // Orange 300
      { status: "cancelled", visitors: stats.cancelled, fill: "#94A3B8" }, // Slate 400
    ].filter(item => item.visitors > 0)
  }, [stats])

  const totalDisplayed = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [chartData])

  const filteredEmailData = React.useMemo(() => {
    const now = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    // Generate all dates in range
    const allDates: any[] = []
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      allDates.push({
        date: dateStr,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        complained: 0,
        failed: 0,
      })
    }

    // Merge with actual data
    return allDates.map(day => {
      const existing = emailStats.find(item => item.date === day.date)
      return existing || day
    })
  }, [emailStats, timeRange])

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Reservation Stats */}
      <Card className="flex flex-col bg-[#1C1C1E] border-none text-white rounded-2xl shadow-none flex-2 min-w-[300px]">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-xl font-bold">Statistiques de Réservation</CardTitle>
          <CardDescription className="text-muted-foreground">Sélectionnez un événement et une campagne</CardDescription>
          
          <div className="mt-4 w-full max-w-xs space-y-2">
            {/* Event Selector */}
            <Select
              value={selectedEventId}
              onValueChange={setSelectedEventId}
            >
              <SelectTrigger className="bg-[#1B1B1B]/50 border-white/10 text-white focus:ring-white/20">
                <SelectValue placeholder="Choisir un événement" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1E] border-white/10 text-white">
                {events.map((event) => (
                  <SelectItem 
                    key={event.id} 
                    value={event.id}
                    className="focus:bg-white/10 focus:text-white cursor-pointer"
                  >
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Campaign Selector */}
            <Select
              value={selectedCampaignId}
              onValueChange={setSelectedCampaignId}
              disabled={isLoading || !selectedEventId || filteredCampaigns.length === 0}
            >
              <SelectTrigger className="bg-[#1B1B1B]/50 border-white/10 text-white focus:ring-white/20">
                <SelectValue placeholder={filteredCampaigns.length === 0 ? "Aucune campagne liée" : "Choisir une campagne"} />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1E] border-white/10 text-white">
                {filteredCampaigns.map((campaign) => (
                  <SelectItem 
                    key={campaign.id} 
                    value={campaign.id}
                    className="focus:bg-white/10 focus:text-white cursor-pointer"
                  >
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 items-center pb-0 justify-center">
          {stats && totalDisplayed > 0 ? (
            <div className="flex flex-col sm:flex-row w-full items-center justify-center gap-8">
              <ChartContainer
                config={reservationChartConfig}
                className="aspect-square max-h-[200px] w-[200px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel className="bg-[#1C1C1E] border-white/10 text-white" />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="visitors"
                    nameKey="status"
                    innerRadius={50}
                    strokeWidth={5}
                    stroke="#1C1C1E" 
                  >
                    <Label
                      content={({ viewBox }: any) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-white text-3xl font-bold"
                              >
                                {totalDisplayed.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Réservations
                              </tspan>
                            </text>
                          )
                        }
                        return null
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="flex flex-col justify-center gap-6">
                 <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#F97316]" />
                  <span className="text-sm text-muted-foreground">Validée</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                  <span className="text-sm text-muted-foreground">Check-in</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#1D4ED8]" />
                  <span className="text-sm text-muted-foreground">Check-out</span>
                </div>
                 {stats.pending > 0 && (
                   <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#FDBA74]" />
                    <span className="text-sm text-muted-foreground">En attente</span>
                  </div>
                 )}
                 {stats.cancelled > 0 && (
                   <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#94A3B8]" />
                    <span className="text-sm text-muted-foreground">Annulée</span>
                  </div>
                 )}
              </div>
            </div>
          ) : (
            <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
              {isLoading ? "Chargement..." : "Aucune donnée disponible"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Stats */}
      <Card className="bg-[#1C1C1E] border-none text-white rounded-2xl shadow-none flex-3">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b border-white/10 py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-xl font-bold">Logs E-mails</CardTitle>
            <CardDescription className="text-muted-foreground">
              Statistiques d'envoi pour la période sélectionnée
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg bg-[#1B1B1B]/50 border-white/10 text-white focus:ring-white/20"
              aria-label="Select a value"
            >
              <SelectValue placeholder="7 derniers jours" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1E] border-white/10 text-white rounded-xl">
              <SelectItem value="90d" className="rounded-lg focus:bg-white/10 focus:text-white cursor-pointer">
                3 derniers mois
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg focus:bg-white/10 focus:text-white cursor-pointer">
                30 derniers jours
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg focus:bg-white/10 focus:text-white cursor-pointer">
                7 derniers jours
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={emailChartConfig}
            className="aspect-auto h-[200px] w-full"
          >
            <AreaChart data={filteredEmailData}>
              <defs>
                {Object.entries(emailChartConfig).map(([key, config]) => (
                  <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={config.color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={config.color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })
                }}
                stroke="#9CA3AF"
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("fr-FR", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                    indicator="dot"
                    className="bg-[#1C1C1E] border-white/10 text-white"
                  />
                }
              />
              <Area dataKey="sent" type="monotone" fill="url(#fillsent)" stroke={emailChartConfig.sent.color} />
              <Area dataKey="delivered" type="monotone" fill="url(#filldelivered)" stroke={emailChartConfig.delivered.color} />
              <Area dataKey="opened" type="monotone" fill="url(#fillopened)" stroke={emailChartConfig.opened.color} />
              <Area dataKey="clicked" type="monotone" fill="url(#fillclicked)" stroke={emailChartConfig.clicked.color} />
              <Area dataKey="bounced" type="monotone" fill="url(#fillbounced)" stroke={emailChartConfig.bounced.color} />
              <Area dataKey="complained" type="monotone" fill="url(#fillcomplained)" stroke={emailChartConfig.complained.color} />
              <Area dataKey="failed" type="monotone" fill="url(#fillfailed)" stroke={emailChartConfig.failed.color} />
              <ChartLegend content={<ChartLegendContent className="text-white" />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
