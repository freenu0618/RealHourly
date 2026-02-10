"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";

interface CalendarViewProps {
  entries: {
    id: string;
    date: string;
    minutes: number;
    category: string;
    intent: string;
    taskDescription: string;
    projectId: string;
    projectName: string;
    clientName: string | null;
  }[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  locale: string;
}

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function getHeatmapClass(minutes: number): string {
  if (minutes === 0) return "";
  if (minutes < 60) return "bg-primary/10";
  if (minutes < 120) return "bg-primary/20";
  if (minutes < 240) return "bg-primary/30";
  if (minutes < 360) return "bg-primary/40";
  return "bg-primary/50";
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = minutes / 60;
    return `${h % 1 === 0 ? h : h.toFixed(1)}h`;
  }
  return `${minutes}m`;
}

export default function CalendarView({
  entries,
  currentMonth,
  onMonthChange,
  selectedDate,
  onDateSelect,
  locale,
}: CalendarViewProps) {
  const t = useTranslations("history");
  const tReports = useTranslations("reports");
  const dayHeaders = DAY_KEYS.map((key) => tReports(key));
  const todayLabel = t("todayLabel");

  const monthDisplay = useMemo(() => {
    const fmt = locale === "ko" ? "yyyy\uB144 M\uC6D4" : "MMMM yyyy";
    return formatDate(currentMonth, fmt, locale);
  }, [currentMonth, locale]);

  const dailyMinutes = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      map.set(e.date, (map.get(e.date) ?? 0) + e.minutes);
    }
    return map;
  }, [entries]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    let dow = firstDay.getDay();
    dow = dow === 0 ? 6 : dow - 1; // Monday start
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const days: { day: number | null; dateStr: string | null; isToday: boolean; minutes: number }[] = [];
    for (let i = 0; i < dow; i++) {
      days.push({ day: null, dateStr: null, isToday: false, minutes: 0 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const minutes = dailyMinutes.get(dateStr) ?? 0;
      days.push({ day: d, dateStr, isToday: dateStr === todayStr, minutes });
    }
    return days;
  }, [currentMonth, dailyMinutes]);

  const handlePrev = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    onMonthChange(d);
  };
  const handleNext = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    onMonthChange(d);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrev} aria-label={t("prevMonth")}>
          <ChevronLeft className="size-4" />
        </Button>
        <h2 className="text-lg font-semibold">{monthDisplay}</h2>
        <Button variant="ghost" size="icon" onClick={handleNext} aria-label={t("nextMonth")}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayHeaders.map((day, i) => (
          <div key={i} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {calendarDays.map((cell, i) => {
          if (cell.day === null) return <div key={`e-${i}`} className="min-h-[72px] md:min-h-[80px]" />;
          const isSelected = cell.dateStr === selectedDate;
          return (
            <button
              key={cell.dateStr}
              onClick={() => onDateSelect(isSelected ? null : cell.dateStr)}
              className={cn(
                "flex min-h-[72px] flex-col items-center justify-start gap-1 rounded-xl border p-1.5 transition-all md:min-h-[80px] md:p-2",
                "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                getHeatmapClass(cell.minutes),
                !cell.isToday && !isSelected && "border-border",
                cell.isToday && !isSelected && "border-2 border-primary ring-2 ring-primary/20",
                isSelected && "border-2 border-primary bg-primary/10 ring-2 ring-primary/30",
              )}
            >
              <div className="flex items-center gap-0.5">
                <span className={cn(
                  "text-sm font-medium",
                  cell.isToday && "font-bold text-primary",
                  isSelected && "text-primary",
                )}>
                  {cell.day}
                </span>
                {cell.isToday && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">{todayLabel}</span>
                )}
              </div>
              {cell.minutes > 0 && (
                <span className={cn(
                  "text-[10px] font-medium rounded-full px-1.5 py-0.5",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/20 text-primary",
                )}>
                  {formatDuration(cell.minutes)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
