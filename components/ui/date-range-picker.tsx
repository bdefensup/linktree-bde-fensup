"use client";

import * as React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  setMonth,
  setYear,
  getYear,
  getMonth,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
}

type PickerMode = "range" | "month" | "year" | "single";

export function DateRangePicker({ date, setDate, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mode, setMode] = React.useState<PickerMode>("range");

  // Helper to generate years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const handlePresetSelect = (preset: "single" | "week" | "month" | "year") => {
    const now = new Date();

    switch (preset) {
      case "single":
        setMode("single");
        setDate(undefined);
        break;
      case "week":
        setMode("range");
        setDate(undefined); // User must pick manually
        break;
      case "month":
        setMode("month");
        // Default to current month if no date selected
        if (!date?.from) {
          setDate({ from: startOfMonth(now), to: endOfMonth(now) });
        }
        break;
      case "year":
        setMode("year");
        // Default to current year if no date selected
        if (!date?.from) {
          setDate({ from: startOfYear(now), to: endOfYear(now) });
        }
        break;
    }
  };

  const handleMonthChange = (monthIndex: string) => {
    const currentFrom = date?.from || new Date();
    const newDate = setMonth(currentFrom, parseInt(monthIndex));
    setDate({ from: startOfMonth(newDate), to: endOfMonth(newDate) });
  };

  const handleYearChange = (yearStr: string) => {
    const currentFrom = date?.from || new Date();
    const newDate = setYear(currentFrom, parseInt(yearStr));

    if (mode === "year") {
      setDate({ from: startOfYear(newDate), to: endOfYear(newDate) });
    } else {
      // In month mode, keep the month but change year
      setDate({ from: startOfMonth(newDate), to: endOfMonth(newDate) });
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to && !isSameDay(date.from, date.to) ? (
                <>
                  {format(date.from, "dd LLL y", { locale: fr })} -{" "}
                  {format(date.to, "dd LLL y", { locale: fr })}
                </>
              ) : (
                format(date.from, "dd LLL y", { locale: fr })
              )
            ) : (
              <span>Filtrer par date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Sidebar */}
            <div className="flex flex-col gap-2 p-3 border-r border-border/50 min-w-[140px]">
              <Button
                variant={mode === "single" ? "secondary" : "ghost"}
                className="justify-start text-left font-normal"
                onClick={() => handlePresetSelect("single")}
              >
                Jour
              </Button>
              <Button
                variant={mode === "range" ? "secondary" : "ghost"}
                className="justify-start text-left font-normal"
                onClick={() => handlePresetSelect("week")}
              >
                Semaine (Période)
              </Button>
              <Button
                variant={mode === "month" ? "secondary" : "ghost"}
                className="justify-start text-left font-normal"
                onClick={() => handlePresetSelect("month")}
              >
                Mois
              </Button>
              <Button
                variant={mode === "year" ? "secondary" : "ghost"}
                className="justify-start text-left font-normal"
                onClick={() => handlePresetSelect("year")}
              >
                Année
              </Button>
              <div className="h-px bg-border/50 my-1" />
              <Button
                variant="ghost"
                className="justify-start text-left font-normal text-destructive hover:text-destructive"
                onClick={() => {
                  setDate(undefined);
                  setMode("range");
                }}
              >
                Effacer
              </Button>
            </div>

            {/* Content Area */}
            <div className="p-3">
              {mode === "single" && (
                <Calendar
                  initialFocus
                  mode="single"
                  defaultMonth={date?.from}
                  selected={date?.from}
                  onSelect={(d) => setDate(d ? { from: d, to: d } : undefined)}
                  locale={fr}
                  showOutsideDays={false}
                />
              )}

              {mode === "range" && (
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  locale={fr}
                  showOutsideDays={false}
                />
              )}

              {mode === "month" && (
                <div className="flex flex-col gap-4 p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mois</label>
                    <Select
                      value={
                        date?.from
                          ? getMonth(date.from).toString()
                          : getMonth(new Date()).toString()
                      }
                      onValueChange={handleMonthChange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sélectionner un mois" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={month} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Année</label>
                    <Select
                      value={date?.from ? getYear(date.from).toString() : currentYear.toString()}
                      onValueChange={handleYearChange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sélectionner une année" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {mode === "year" && (
                <div className="flex flex-col gap-4 p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Année</label>
                    <Select
                      value={date?.from ? getYear(date.from).toString() : currentYear.toString()}
                      onValueChange={handleYearChange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sélectionner une année" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function isSameDay(dateLeft: Date, dateRight: Date) {
  return (
    dateLeft.getDate() === dateRight.getDate() &&
    dateLeft.getMonth() === dateRight.getMonth() &&
    dateLeft.getFullYear() === dateRight.getFullYear()
  );
}
