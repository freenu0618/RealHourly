"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { HeroCarousel } from "./HeroCarousel";
import { FadeIn } from "@/components/ui/fade-in";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { NumberTicker } from "@/components/ui/number-ticker";

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
            {/* Shiny badge */}
            <FadeIn delay={0.1}>
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
                <AnimatedShinyText className="text-xs font-medium text-primary">
                  {t("heroTag")}
                </AnimatedShinyText>
              </div>
            </FadeIn>

            {/* Headline */}
            <FadeIn delay={0.2} blur>
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                {t("heroTitle1")}
                <br />
                <span className="text-primary">{t("heroTitle2")}</span>
              </h1>
            </FadeIn>

            {/* Anchoring Effect: Contract rate → Real rate */}
            <FadeIn delay={0.3}>
              <div className="mb-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
                {/* Contract rate (neutral/muted) */}
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm text-muted-foreground">
                      {t("heroAnchorCurrency")}
                    </span>
                    <NumberTicker
                      value={parseInt(t("heroAnchorRate"))}
                      className="text-3xl font-bold text-muted-foreground md:text-4xl"
                    />
                    <span className="text-sm text-muted-foreground">
                      {t("heroAnchorUnit")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground/80">
                    {t("heroAnchorLabel")}
                  </span>
                </div>

                {/* Arrow separator */}
                <ArrowRight className="h-5 w-5 text-muted-foreground" />

                {/* Real rate (destructive/red) */}
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm text-destructive">
                      {t("heroAnchorCurrency")}
                    </span>
                    <NumberTicker
                      value={parseInt(t("heroAnchorRealRate"))}
                      className="text-3xl font-bold text-destructive md:text-4xl"
                    />
                    <span className="text-sm text-destructive">
                      {t("heroAnchorUnit")}
                    </span>
                  </div>
                  <span className="text-xs text-destructive/80">
                    {t("heroAnchorRealLabel")}
                  </span>
                </div>
              </div>
            </FadeIn>

            {/* Description */}
            <FadeIn delay={0.4}>
              <p className="mb-8 text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("heroDesc")}
              </p>
            </FadeIn>

            {/* CTA with ShimmerButton + Sub CTA text */}
            <FadeIn delay={0.6}>
              <div className="flex flex-col items-center justify-center gap-3">
                <Link href="/login">
                  <ShimmerButton
                    background="var(--primary)"
                    shimmerColor="#ffffff"
                    borderRadius="12px"
                    className="px-8 py-3.5 text-base font-medium"
                  >
                    <span className="flex items-center gap-2">
                      {t("heroCta")} <ArrowRight className="h-4 w-4" />
                    </span>
                  </ShimmerButton>
                </Link>
                <p className="text-sm text-muted-foreground">
                  {t("heroCtaSub")}
                </p>
              </div>

              {/* Trust signals */}
              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {t("heroNoCreditCard")}
                </span>
                <span>{t("heroFreeCredits")}</span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
