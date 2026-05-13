"use client";

import { useTranslations } from "next-intl";
import { Calculator, Clock, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const signals = [
  { titleKey: "signal1Title", bodyKey: "signal1Body", icon: Calculator },
  { titleKey: "signal2Title", bodyKey: "signal2Body", icon: Clock },
  { titleKey: "signal3Title", bodyKey: "signal3Body", icon: ShieldCheck },
] as const;

export function DecisionSignalsSection() {
  const t = useTranslations("landing");

  return (
    <section className="px-6 py-20" aria-labelledby="decision-signals-title">
      <FadeIn blur>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {t("signalsEyebrow")}
          </p>
          <h2 id="decision-signals-title" className="text-2xl font-bold md:text-3xl">
            {t("signalsTitle")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("signalsSubtitle")}
          </p>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {signals.map(({ titleKey, bodyKey, icon: Icon }) => (
            <article
              key={titleKey}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-base font-bold">{t(titleKey)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(bodyKey)}
              </p>
            </article>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
