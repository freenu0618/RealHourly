"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function HeroSection() {
  const t = useTranslations("landing");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-ghibli-warm px-6 pb-20 pt-32 dark:to-background">
      {/* Background blobs */}
      <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        {/* Left: Copy */}
        <div>
          <span className="mb-6 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            {t("heroTag")}
          </span>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl">
            {t("heroTitle1")}
            <br />
            <span className="text-primary">{t("heroTitle2")}</span>
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            {t("heroDesc")}
          </p>

          <div className="mb-4 flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {t("heroCta")} →
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">{t("heroCtaSub")}</p>
        </div>

        {/* Right: App mockup */}
        <div className="relative">
          <div className="rounded-[24px] border border-border bg-card p-6 shadow-lg transition-transform duration-500 [transform:rotate(1deg)] hover:[transform:rotate(0deg)]">
            <div className="mb-1 text-sm text-muted-foreground">
              {t("nominalRate")}
            </div>
            <div className="mb-3 text-lg text-muted-foreground line-through">
              $50.00/hr
            </div>

            <div className="mb-4 rounded-xl bg-primary/10 p-4">
              <div className="mb-1 text-xs font-medium uppercase text-primary">
                {t("actualRate")}
              </div>
              <div className="text-3xl font-bold text-primary">
                $32.15<span className="text-lg">/hr</span>
              </div>
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{t("mockPlatformFee")} -$5.00</span>
              <span>{t("mockTax")} -$7.50</span>
              <span>{t("mockToolCost")} -$2.35</span>
            </div>
          </div>

          {/* Floating mini cards */}
          <div className="animate-float absolute -right-4 -top-4 rounded-xl border bg-card px-3 py-2 text-xs shadow-md">
            +$450.00
          </div>
          <div className="animate-float absolute -bottom-3 -left-3 rounded-xl border bg-card px-3 py-2 text-xs shadow-md [animation-delay:1.5s]">
            12.5h logged
          </div>
        </div>
      </div>
    </section>
  );
}
