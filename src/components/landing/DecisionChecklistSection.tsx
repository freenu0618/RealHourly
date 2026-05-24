"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const checklistItems = [
  "quoteChecklistItem1",
  "quoteChecklistItem2",
  "quoteChecklistItem3",
  "quoteChecklistItem4",
] as const;

const routes = [
  { titleKey: "quoteRouteCalculatorTitle", bodyKey: "quoteRouteCalculatorBody", href: "/calculator" },
  { titleKey: "quoteRouteFeaturesTitle", bodyKey: "quoteRouteFeaturesBody", href: "/features" },
] as const;

export function DecisionChecklistSection() {
  const t = useTranslations("landing");

  return (
    <section className="px-6 py-20" aria-labelledby="quote-checklist-title">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <FadeIn blur>
          <div className="rounded-[24px] border bg-card p-6 shadow-sm md:p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {t("quoteChecklistEyebrow")}
            </p>
            <h2 id="quote-checklist-title" className="text-2xl font-bold md:text-3xl">
              {t("quoteChecklistTitle")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("quoteChecklistSubtitle")}
            </p>

            <ul className="mt-6 space-y-3">
              {checklistItems.map((key) => (
                <li key={key} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="grid h-full gap-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="group rounded-[24px] border bg-background/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold">{t(route.titleKey)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(route.bodyKey)}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
