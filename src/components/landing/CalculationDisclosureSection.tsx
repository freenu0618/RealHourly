"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, ListChecks } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const columns = [
  {
    titleKey: "calcDisclosureInputTitle",
    items: ["calcDisclosureInput1", "calcDisclosureInput2", "calcDisclosureInput3"],
    icon: ListChecks,
  },
  {
    titleKey: "calcDisclosureOutputTitle",
    items: ["calcDisclosureOutput1", "calcDisclosureOutput2", "calcDisclosureOutput3"],
    icon: CheckCircle2,
  },
  {
    titleKey: "calcDisclosureLimitTitle",
    items: ["calcDisclosureLimit1", "calcDisclosureLimit2", "calcDisclosureLimit3"],
    icon: AlertTriangle,
  },
] as const;

export function CalculationDisclosureSection() {
  const t = useTranslations("landing");

  return (
    <section className="px-6 py-20" aria-labelledby="calculation-disclosure-title">
      <FadeIn blur>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {t("calcDisclosureEyebrow")}
          </p>
          <h2 id="calculation-disclosure-title" className="text-2xl font-bold md:text-3xl">
            {t("calcDisclosureTitle")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("calcDisclosureSubtitle")}
          </p>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {columns.map(({ titleKey, items, icon: Icon }) => (
            <article key={titleKey} className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mb-4 text-base font-bold">{t(titleKey)}</h3>
              <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {items.map((itemKey) => (
                  <li key={itemKey} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <span>{t(itemKey)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
