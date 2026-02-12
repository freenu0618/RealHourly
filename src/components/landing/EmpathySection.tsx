"use client";

import { useTranslations } from "next-intl";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { BorderBeam } from "@/components/ui/border-beam";

export function EmpathySection() {
  const t = useTranslations("landing");

  const items = [
    { emoji: "\u{1F624}", quoteKey: "empathy1Quote", descKey: "empathy1Desc", ringColor: "ring-orange-500/20" },
    { emoji: "\u{1F635}", quoteKey: "empathy2Quote", descKey: "empathy2Desc", ringColor: "ring-red-500/20" },
    { emoji: "\u{1F914}", quoteKey: "empathy3Quote", descKey: "empathy3Desc", ringColor: "ring-yellow-500/20" },
  ] as const;

  return (
    <section className="relative bg-gradient-to-b from-background to-muted/30 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <FadeIn blur>
          <h2 className="mb-4 text-center text-2xl font-bold md:text-3xl">
            {t("empathyTitle")}
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            {t("empathySubtitle")}
          </p>
        </FadeIn>

        <StaggerContainer className="grid gap-8 md:grid-cols-3">
          {items.map((item, i) => (
            <StaggerItem key={i} className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl shadow-sm">
                {item.emoji}
              </div>

              <div className={`relative w-full overflow-hidden rounded-[20px] bg-card p-5 shadow-sm ring-1 ring-border/50 ${item.ringColor} transition-transform hover:-translate-y-1`}>
                <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-card ring-1 ring-border/50 [clip-path:polygon(0_0,100%_0,0_100%)]" />

                <p className="relative z-10 mb-2 text-sm font-medium leading-relaxed text-foreground">
                  {t(item.quoteKey)}
                </p>
                <p className="relative z-10 text-xs text-muted-foreground">
                  {t(item.descKey)}
                </p>

                <BorderBeam size={100} duration={8} delay={i * 2} borderWidth={1.5} />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
