"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroCarousel } from "./HeroCarousel";

export function HeroSection() {
  const t = useTranslations("landing");

  return (
    <section className="relative min-h-[600px] overflow-hidden md:h-[85vh]">
      {/* Background: 4-column carousel */}
      <HeroCarousel />

      {/* Center overlay — glassmorphism */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="max-w-2xl px-6 text-center">
          <div className="rounded-[32px] border border-border/30 bg-background/60 p-10 shadow-2xl backdrop-blur-xl md:p-14">
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
              {t("heroTag")}
            </span>

            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              {t("heroTitle1")}
              <br />
              <span className="text-primary">{t("heroTitle2")}</span>
            </h1>

            <p className="mb-8 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("heroDesc")}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                {t("heroCta")} <span>→</span>
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {t("heroNoCreditCard")}
              </span>
              <span>{t("heroFreeCredits")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
