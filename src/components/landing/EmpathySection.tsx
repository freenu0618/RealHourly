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
    <section className="px-6 py-20" data-animate data-animation="animate-blurIn">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-center text-2xl font-bold md:text-3xl">
          {t("empathyTitle")}
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          {t("empathySubtitle")}
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              {/* Avatar */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl shadow-sm">
                {item.emoji}
              </div>

              {/* Speech bubble */}
              <div className="relative w-full rounded-[20px] bg-card p-5 shadow-sm ring-1 ring-border/50 transition-transform hover:-translate-y-1">
                {/* Bubble tail */}
                <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-card ring-1 ring-border/50 [clip-path:polygon(0_0,100%_0,0_100%)]" />

                <p className="relative mb-2 text-sm font-medium leading-relaxed text-foreground">
                  &ldquo;{t(item.quoteKey)}&rdquo;
                </p>
                <p className="relative text-xs text-muted-foreground">
                  {t(item.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
