"use client";

import { useTranslations } from "next-intl";

export function EmpathySection() {
  const t = useTranslations("landing");

  const items = [
    { emoji: "\uD83D\uDE24", quoteKey: "empathy1Quote", descKey: "empathy1Desc" },
    { emoji: "\uD83D\uDE35", quoteKey: "empathy2Quote", descKey: "empathy2Desc" },
    { emoji: "\uD83E\uDD14", quoteKey: "empathy3Quote", descKey: "empathy3Desc" },
  ] as const;

  return (
    <section className="px-6 py-20" data-animate>
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-center text-2xl font-bold md:text-3xl">
          {t("empathyTitle")}
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          {t("empathySubtitle")}
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-[20px] border-l-4 border-accent bg-card p-6 transition-transform hover:-translate-y-1"
            >
              <div className="mb-3 text-3xl">{item.emoji}</div>
              <p className="mb-2 font-medium text-foreground">
                {t(item.quoteKey)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(item.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
