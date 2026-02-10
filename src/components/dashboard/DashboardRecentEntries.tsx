"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { getCategoryEmoji } from "@/lib/utils/category-emoji";
import type { RecentEntry } from "./types";

interface DashboardRecentEntriesProps {
  entries: RecentEntry[];
  t: (key: string) => string;
  tTimeLog: (key: string) => string;
}

export function DashboardRecentEntries({ entries, t, tTimeLog }: DashboardRecentEntriesProps) {
  if (entries.length === 0) {
    return (
      <Card className="rounded-[20px] border-warm-border">
        <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <span className="text-4xl">{"\u270D\uFE0F"}</span>
          <p className="text-sm text-muted-foreground">{t("noRecentEntries")}</p>
          <Link
            href="/time-log"
            className="text-sm font-medium text-primary underline"
          >
            {tTimeLog("title")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[20px] border-warm-border">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{"\uD83D\uDCDD"} {t("recentEntries")}</h2>
          <Link href="/time-log" className="text-xs font-medium text-primary hover:underline">
            {tTimeLog("title")} {"\u2192"}
          </Link>
        </div>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 transition-colors hover:bg-muted/60"
            >
              <span className="text-lg">{getCategoryEmoji(entry.category)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entry.taskDescription || entry.projectName}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.projectName} · {entry.date}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 rounded-full text-xs">
                {entry.minutes}{t("minutesShort")}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
