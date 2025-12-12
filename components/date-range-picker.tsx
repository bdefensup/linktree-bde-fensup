"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CalendarDateRangePickerProps {
  date?: DateRange
  setDate: (date: DateRange | undefined) => void
  className?: string
  label?: string
  placeholder?: string
}

export function CalendarDateRangePicker({
  date,
  setDate,
  className,
  label = "Période",
  placeholder = "Sélectionner une date",
}: CalendarDateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const formattedDate = React.useMemo(() => {
    if (!date?.from) return ""
    if (!date.to) return format(date.from, "dd MMMM yyyy", { locale: fr })
    return `${format(date.from, "dd MMM yyyy", { locale: fr })} - ${format(date.to, "dd MMM yyyy", { locale: fr })}`
  }, [date])

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Label htmlFor="date-range" className="px-1 text-xs text-muted-foreground">{label}</Label>}
      <div className="relative flex gap-2">
        <Input
          id="date-range"
          value={formattedDate}
          placeholder={placeholder}
          className="bg-[#1B1B1B]/50 border-white/10 backdrop-blur-sm pr-10 cursor-pointer"
          readOnly
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker-trigger"
              variant="ghost"
              className="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(true)}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="sr-only">Ouvrir le calendrier</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0 bg-[#1C1C1E] border-white/10"
            align="end"
            alignOffset={0}
            sideOffset={10}
          >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
