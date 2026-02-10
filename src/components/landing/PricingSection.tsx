"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function PricingSection() {
  const t = useTranslations("landing");

  const items = [
    t("pricingItem1"),
    t("pricingItem2"),
    t("pricingItem3"),
    t("pricingItem4"),
  ];

  return (
    <section id="pricing" className="px-6 py-20" data-animate>
      <h2 className="mb-4 text-center text-2xl font-bold">
        {t("pricingTitle")}
      </h2>
      <p className="mb-12 text-center text-muted-foreground">
        {t("pricingSubtitle")}
      </p>

      <div className="mx-auto max-w-sm rounded-[24px] border bg-card p-8 text-center shadow-sm">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
          {t("pricingBadge")}
        </span>
        <div className="mb-1 mt-4 text-4xl font-bold">
          {t("pricingFree")}
          <span className="text-lg font-normal text-muted-foreground">
            {t("pricingMonth")}
          </span>
        </div>

        <ul className="mt-6 space-y-3 text-left text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-primary">{"\u2713"}</span> {item}
            </li>
          ))}
        </ul>

        <Link
          href="/login"
          className="mt-8 block w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          {t("pricingCta")}
        </Link>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("pricingNote")}
        </p>
      </div>
    </section>
  );
}
