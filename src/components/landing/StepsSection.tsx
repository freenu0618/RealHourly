"use client";

import { useTranslations } from "next-intl";

export function StepsSection() {
  const t = useTranslations("landing");

  const steps = [
    { step: 1, titleKey: "step1Title", descKey: "step1Desc" },
    { step: 2, titleKey: "step2Title", descKey: "step2Desc" },
    { step: 3, titleKey: "step3Title", descKey: "step3Desc" },
  ] as const;

  return (
    <section className="px-6 py-20" data-animate>
      <h2 className="mb-16 text-center text-2xl font-bold md:text-3xl">
        {t("stepsTitle")}
      </h2>

      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
        {steps.map((item) => (
          <div key={item.step} className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {item.step}
            </div>
            <h3 className="mb-2 font-bold">{t(item.titleKey)}</h3>
            <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
