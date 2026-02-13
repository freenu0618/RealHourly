"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCategoryEmoji } from "@/lib/utils/category-emoji";
import { Link } from "@/i18n/navigation";

interface TimeEntry {
  id: string;
  date: string;
  minutes: number;
  category: string;
  taskDescription: string;
  intent: string;
}

interface TimeEntriesSectionProps {
  projectId: string;
}

export function TimeEntriesSection({ projectId }: TimeEntriesSectionProps) {
  const t = useTranslations("projectDetail");
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const from = yearAgo.toISOString().split("T")[0];
    const to = today.toISOString().split("T")[0];
    fetch(`/api/time/history?projectId=${projectId}&from=${from}&to=${to}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          const list = Array.isArray(json.data) ? json.data : json.data.entries;
          if (Array.isArray(list)) {
            setEntries((list as TimeEntry[]).slice(0, 10));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="size-4" />
          {t("recentEntries")}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/time-log/history?projectId=${projectId}`}
            className="gap-1 text-xs"
          >
            {t("viewAll")}
            <ExternalLink className="size-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
            >
              <span className="text-base">{getCategoryEmoji(entry.category)}</span>
              <span className="text-xs text-muted-foreground">{entry.date}</span>
              <span className="flex-1 truncate">{entry.taskDescription}</span>
              <span className="whitespace-nowrap font-medium">
                {entry.minutes}m
              </span>
              {entry.intent === "planned" && (
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {t("planned")}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
