"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function RateComparisonMockup() {
  const t = useTranslations("landing");
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{t("nominalRate")}</span>
        <span className="text-lg text-muted-foreground line-through">$50,000/hr</span>
      </div>
      <div className="rounded-xl bg-primary/10 p-4">
        <div className="mb-1 text-xs font-medium text-primary">{t("actualRate")}</div>
        <div className="text-2xl font-bold text-primary">$32,500<span className="text-sm">/hr</span></div>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">{t("mockPlatformFee")} (20%)</span><span className="text-destructive">-$10,000</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t("mockTax")} (3.3%)</span><span className="text-destructive">-$1,650</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t("mockToolCost")}</span><span className="text-destructive">-$5,850</span></div>
      </div>
    </div>
  );
}

export function TimeLogMockup() {
  const t = useTranslations("landing");
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground italic">
        &quot;{t("mockTimeInput")}&quot;
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">design</span>
          <span className="flex-1 text-sm">UI Design</span>
          <span className="text-sm font-medium">3h 00m</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <span className="rounded-md bg-chart-3/10 px-2 py-0.5 text-xs font-medium text-chart-3">meeting</span>
          <span className="flex-1 text-sm">Client Meeting</span>
          <span className="text-sm font-medium">0h 30m</span>
        </div>
      </div>
    </div>
  );
}

export function AlertMockup() {
  const t = useTranslations("landing");
  const [tone, setTone] = useState<"polite" | "neutral" | "firm">("polite");
  const tones = [
    { key: "polite" as const, label: t("mockPolite"), icon: "\uD83D\uDD4A\uFE0F" },
    { key: "neutral" as const, label: t("mockNeutral"), icon: "\u2696\uFE0F" },
    { key: "firm" as const, label: t("mockFirm"), icon: "\uD83D\uDCAA" },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center text-xs font-medium text-destructive">
        Scope Warning: Time Selector
      </div>
      <div className="flex justify-center gap-2">
        {tones.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTone(t.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              tone === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
        {t("mockAlertMsg")}
      </div>
    </div>
  );
}

export function DashboardMockup() {
  const t = useTranslations("landing");
  const kpis = [
    { label: t("mockTotalProjects"), value: "5", color: "text-foreground" },
    { label: t("mockAvgRate"), value: "$38.2k", color: "text-primary" },
    { label: t("mockThisWeek"), value: "32.5h", color: "text-foreground" },
    { label: t("mockTotalEarned"), value: "$2.4M", color: "text-primary" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border p-3 text-center">
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
            <div className={cn("text-lg font-bold", kpi.color)}>{kpi.value}</div>
          </div>
        ))}
      </div>
      {/* Mini bar chart mockup */}
      <div className="flex items-end justify-center gap-2 pt-2">
        {[40, 65, 50, 80, 60, 45, 70].map((h, i) => (
          <div
            key={i}
            className="w-6 rounded-t bg-primary/60"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    </div>
  );
}
