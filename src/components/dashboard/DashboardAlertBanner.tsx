"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { ActiveAlert } from "./types";

interface DashboardAlertBannerProps {
  alerts: ActiveAlert[];
  t: (key: string) => string;
}

export function DashboardAlertBanner({ alerts, t }: DashboardAlertBannerProps) {
  return (
    <Card className="rounded-[20px] border-amber-300/50 bg-amber-50/50 dark:border-amber-700/50 dark:bg-amber-950/30">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="size-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-lg font-bold text-amber-800 dark:text-amber-200">{t("alertBanner")}</h2>
        </div>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              href={`/projects/${alert.projectId}`}
              className="flex items-center justify-between rounded-xl bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{"\uD83D\uDCA1"}</span>
                <span className="text-sm font-medium">{alert.projectName}</span>
              </div>
              <Badge className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-xs">
                {alert.alertType.replace("scope_", "Rule ")}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
