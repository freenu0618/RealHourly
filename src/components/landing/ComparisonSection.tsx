"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";

export function ComparisonSection() {
  const t = useTranslations("landing");

  const rows = [
    { labelKey: "comp1Label", oldKey: "comp1Old", newKey: "comp1New" },
    { labelKey: "comp2Label", oldKey: "comp2Old", newKey: "comp2New" },
    { labelKey: "comp3Label", oldKey: "comp3Old", newKey: "comp3New" },
    { labelKey: "comp4Label", oldKey: "comp4Old", newKey: "comp4New" },
  ] as const;

  return (
    <section className="bg-card/50 px-6 py-20" data-animate>
      <h2 className="mb-12 text-center text-2xl font-bold">
        {t("comparisonTitle")}
      </h2>

      <div className="mx-auto grid max-w-3xl gap-y-0 text-center text-sm md:grid-cols-3">
        {/* Header row */}
        <div />
        <div className="py-3 font-bold text-muted-foreground">
          {t("compHeaderOld")}
        </div>
        <div className="py-3 font-bold text-primary">{t("compHeaderNew")}</div>

        {/* Data rows */}
        {rows.map((row) => (
          <Fragment key={row.labelKey}>
            <div className="border-t py-3 font-medium text-foreground">
              {t(row.labelKey)}
            </div>
            <div className="border-t py-3 text-muted-foreground">
              {t(row.oldKey)}
            </div>
            <div className="border-t py-3 font-medium text-primary">
              {t(row.newKey)}
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
