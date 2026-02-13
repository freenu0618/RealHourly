"use client";

import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Safari } from "@/components/ui/safari";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "@/i18n/navigation";

export function ProductDemoSection() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();

  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const imageSrc = `/images/screenshots/dashboard-${locale}-${theme}.png`;

  return (
    <section className="px-4 py-20">
      <div className="container mx-auto">
        <FadeIn className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t("demoTitle")}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("demoSubtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-12">
          <div className="relative mx-auto max-w-5xl">
            <Safari
              url="real-hourly.com/dashboard"
              imageSrc={imageSrc}
              className="w-full shadow-2xl"
            />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>
        </FadeIn>

        <FadeIn delay={0.4} className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-lg font-medium text-[#2B6B93] transition-colors hover:text-[#E8882D]"
          >
            {t("demoCta")}
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
