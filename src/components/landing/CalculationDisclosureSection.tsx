"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AlertTriangle, CheckCircle2, ListChecks } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const columns = [
  {
    titleKey: "calcDisclosureInputTitle",
    items: ["calcDisclosureInput1", "calcDisclosureInput2", "calcDisclosureInput3", "calcDisclosureInput4"],
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

const answerRoutes = [
  {
    labelKey: "answerRoute1Label",
    titleKey: "answerRoute1Title",
    bodyKey: "answerRoute1Body",
    href: "/calculator",
  },
  {
    labelKey: "answerRoute2Label",
    titleKey: "answerRoute2Title",
    bodyKey: "answerRoute2Body",
    href: "/features",
  },
  {
    labelKey: "answerRoute3Label",
    titleKey: "answerRoute3Title",
    bodyKey: "answerRoute3Body",
    href: "/contact",
  },
  {
    labelKey: "answerRoute4Label",
    titleKey: "answerRoute4Title",
    bodyKey: "answerRoute4Body",
    href: "/privacy",
  },
  {
    labelKey: "answerRoute5Label",
    titleKey: "answerRoute5Title",
    bodyKey: "answerRoute5Body",
    href: "/terms",
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
        <div className="mx-auto mb-6 max-w-5xl rounded-2xl border border-primary/15 bg-primary/5 p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {t("answerSummaryEyebrow")}
              </p>
              <h3 className="mt-2 text-lg font-bold">{t("answerSummaryTitle")}</h3>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t("answerSummarySubtitle")}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {answerRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="group rounded-xl border bg-background/80 p-4 transition hover:border-primary/40 hover:bg-background hover:shadow-md"
                aria-label={`${t(route.labelKey)}: ${t(route.titleKey)}`}
              >
                <p className="text-xs font-semibold text-primary">{t(route.labelKey)}</p>
                <h4 className="mt-2 text-sm font-bold">{t(route.titleKey)}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(route.bodyKey)}
                </p>
                <span className="mt-3 inline-flex text-sm font-semibold text-primary group-hover:underline">
                  {t("answerRouteCta")}
                </span>
              </Link>
            ))}
          </div>
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

      <FadeIn>
        <div className="mx-auto mt-4 max-w-5xl rounded-2xl border border-dashed border-primary/25 bg-background p-5">
          <h3 className="text-sm font-bold">{t("calcDisclosureIncompleteTitle")}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("calcDisclosureIncompleteBody")}
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
