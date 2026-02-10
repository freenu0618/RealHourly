"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type UseCase = {
  emoji: string;
  categoryKey: string;
  titleKey: string;
  descKey: string;
  nominalKey: string;
  actualKey: string;
  filter: string;
};

const USE_CASES: UseCase[] = [
  { emoji: "\uD83C\uDFA8", categoryKey: "uc1Cat", titleKey: "uc1Title", descKey: "uc1Desc", nominalKey: "uc1Nominal", actualKey: "uc1Actual", filter: "designer" },
  { emoji: "\uD83D\uDCBB", categoryKey: "uc2Cat", titleKey: "uc2Title", descKey: "uc2Desc", nominalKey: "uc2Nominal", actualKey: "uc2Actual", filter: "developer" },
  { emoji: "\u270D\uFE0F", categoryKey: "uc3Cat", titleKey: "uc3Title", descKey: "uc3Desc", nominalKey: "uc3Nominal", actualKey: "uc3Actual", filter: "writer" },
  { emoji: "\uD83D\uDCF1", categoryKey: "uc4Cat", titleKey: "uc4Title", descKey: "uc4Desc", nominalKey: "uc4Nominal", actualKey: "uc4Actual", filter: "developer" },
  { emoji: "\uD83C\uDFA5", categoryKey: "uc5Cat", titleKey: "uc5Title", descKey: "uc5Desc", nominalKey: "uc5Nominal", actualKey: "uc5Actual", filter: "designer" },
  { emoji: "\uD83D\uDCDD", categoryKey: "uc6Cat", titleKey: "uc6Title", descKey: "uc6Desc", nominalKey: "uc6Nominal", actualKey: "uc6Actual", filter: "writer" },
  { emoji: "\uD83C\uDF10", categoryKey: "uc7Cat", titleKey: "uc7Title", descKey: "uc7Desc", nominalKey: "uc7Nominal", actualKey: "uc7Actual", filter: "developer" },
  { emoji: "\uD83C\uDFA8", categoryKey: "uc8Cat", titleKey: "uc8Title", descKey: "uc8Desc", nominalKey: "uc8Nominal", actualKey: "uc8Actual", filter: "designer" },
];

export function UseCaseSection() {
  const t = useTranslations("landing");
  const [filter, setFilter] = useState("all");

  const tabs = [
    { key: "all", labelKey: "ucFilterAll" },
    { key: "designer", labelKey: "ucFilterDesigner" },
    { key: "developer", labelKey: "ucFilterDev" },
    { key: "writer", labelKey: "ucFilterWriter" },
  ] as const;

  const filtered = filter === "all" ? USE_CASES : USE_CASES.filter((uc) => uc.filter === filter);

  return (
    <section className="px-6 py-24" data-animate>
      <h2 className="mb-4 text-center text-3xl font-bold">{t("ucTitle")}</h2>
      <p className="mb-8 text-center text-muted-foreground">{t("ucSubtitle")}</p>

      <div className="mb-10 flex justify-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-all",
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-5xl columns-2 gap-4 md:columns-4">
        {filtered.map((item, i) => (
          <div
            key={`${item.titleKey}-${i}`}
            className="mb-4 break-inside-avoid rounded-[16px] border border-border/50 bg-card transition-shadow hover:shadow-lg"
          >
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">{item.emoji}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {t(item.categoryKey)}
                </span>
              </div>
              <h4 className="mb-2 text-sm font-bold">{t(item.titleKey)}</h4>
              <p className="mb-3 text-xs text-muted-foreground">{t(item.descKey)}</p>

              <div className="rounded-xl bg-muted/30 p-3 text-xs">
                <div className="mb-1 flex justify-between">
                  <span className="text-muted-foreground">{t("nominalRate")}</span>
                  <span className="line-through">{t(item.nominalKey)}</span>
                </div>
                <div className="flex justify-between font-bold text-primary">
                  <span>{t("actualRate")}</span>
                  <span>{t(item.actualKey)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
