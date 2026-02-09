"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const DAY_HEADERS_KO = ["\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0", "\uC77C"];
const DAY_HEADERS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getHeatmapClass(hours: number): string {
  if (hours === 0) return "";
  if (hours < 2) return "bg-primary/10";
  if (hours < 4) return "bg-primary/25";
  if (hours < 6) return "bg-primary/40";
  return "bg-primary/60";
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
  const dayHeaders = locale === "ko" ? DAY_HEADERS_KO : DAY_HEADERS_EN;

  const monthDisplay = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    if (locale === "ko") return `${year}\uB144 ${month + 1}\uC6D4`;
    return `${MONTH_NAMES_EN[month]} ${year}`;
  }, [currentMonth, locale]);

  const entriesByDate = useMemo(() => {
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

    const days: { date: number | null; dateStr: string | null; isToday: boolean; hours: number }[] = [];
    for (let i = 0; i < dow; i++) {
      days.push({ date: null, dateStr: null, isToday: false, hours: 0 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const minutes = entriesByDate.get(dateStr) ?? 0;
      days.push({ date: d, dateStr, isToday: dateStr === todayStr, hours: minutes / 60 });
    }
    return days;
  }, [currentMonth, entriesByDate]);

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

        {calendarDays.map((day, i) => {
          if (day.date === null) return <div key={`e-${i}`} className="aspect-square" />;
          const isSelected = day.dateStr === selectedDate;
          return (
            <button
              key={day.dateStr}
              onClick={() => onDateSelect(isSelected ? null : day.dateStr)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent p-1 transition-all",
                "hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                getHeatmapClass(day.hours),
                day.isToday && !isSelected && "ring-2 ring-primary",
                isSelected && "bg-primary text-primary-foreground ring-2 ring-primary",
              )}
            >
              <span className="text-sm font-medium">{day.date}</span>
              {day.hours > 0 && (
                <span className="text-[10px] opacity-90">{day.hours.toFixed(1)}h</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
