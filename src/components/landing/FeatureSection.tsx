"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { MagicCard } from "@/components/ui/magic-card";

export function FeatureSection() {
  const t = useTranslations("landing");

  return (
    <section id="features" className="px-6 py-24">
      <FadeIn blur>
        <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
          {t("featureGridTitle")}
        </h2>
        <p className="mb-16 text-center text-muted-foreground">
          {t("featureGridSubtitle")}
        </p>
      </FadeIn>

      <StaggerContainer className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Hero Feature: Real Hourly Rate (spans 2 columns on lg) */}
        <StaggerItem className="sm:col-span-2 lg:col-span-2">
          <Link href="/features#real-rate" className="block h-full">
            <MagicCard
              className="rounded-[20px]"
              gradientColor="var(--primary)"
              gradientOpacity={0.15}
              gradientSize={250}
            >
              <div className="group h-full rounded-[20px] border border-border/50 bg-card p-8 transition-all duration-300">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-3xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  💰
                </div>
                <h3 className="mb-3 text-2xl font-bold transition-colors group-hover:text-primary">
                  {t("featureGrid1Title")}
                </h3>
                <p className="text-base text-muted-foreground">
                  {t("featureGrid1Desc")}
                </p>
              </div>
            </MagicCard>
          </Link>
        </StaggerItem>

        {/* Feature 2: NLP Time Log */}
        <StaggerItem>
          <Link href="/features#nlp-time-log" className="block h-full">
            <MagicCard
              className="rounded-[20px]"
              gradientColor="var(--accent)"
              gradientOpacity={0.2}
              gradientSize={200}
            >
              <div className="group h-full rounded-[20px] border border-border/50 bg-card p-6 transition-all duration-300">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  ✏️
                </div>
                <h3 className="mb-2 font-bold transition-colors group-hover:text-primary">
                  {t("featureGrid2Title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("featureGrid2Desc")}
                </p>
              </div>
            </MagicCard>
          </Link>
        </StaggerItem>

        {/* Feature 3: Scope Creep Alert */}
        <StaggerItem>
          <Link href="/features#scope-creep" className="block h-full">
            <MagicCard
              className="rounded-[20px]"
              gradientColor="var(--destructive)"
              gradientOpacity={0.15}
              gradientSize={200}
            >
              <div className="group h-full rounded-[20px] border border-border/50 bg-card p-6 transition-all duration-300">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  💡
                </div>
                <h3 className="mb-2 font-bold transition-colors group-hover:text-primary">
                  {t("featureGrid3Title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("featureGrid3Desc")}
                </p>
              </div>
            </MagicCard>
          </Link>
        </StaggerItem>

        {/* Feature 4: Analytics */}
        <StaggerItem>
          <Link href="/features#analytics" className="block h-full">
            <MagicCard
              className="rounded-[20px]"
              gradientColor="var(--chart-2)"
              gradientOpacity={0.2}
              gradientSize={200}
            >
              <div className="group h-full rounded-[20px] border border-border/50 bg-card p-6 transition-all duration-300">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-chart-2/20 text-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  📊
                </div>
                <h3 className="mb-2 font-bold transition-colors group-hover:text-primary">
                  {t("featureGrid4Title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("featureGrid4Desc")}
                </p>
              </div>
            </MagicCard>
          </Link>
        </StaggerItem>
      </StaggerContainer>
    </section>
  );
}
