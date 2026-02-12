"use client";

import { useTranslations } from "next-intl";
import { Safari } from "@/components/ui/safari";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "@/i18n/navigation";

export function ProductDemoSection() {
  const t = useTranslations("landing");

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        {/* Title + Subtitle */}
        <FadeIn className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("demoTitle")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("demoSubtitle")}
          </p>
        </FadeIn>

        {/* Safari Browser Mockup */}
        <FadeIn delay={0.2} className="mb-12">
          <div className="max-w-5xl mx-auto relative">
            {/* Safari component with screenshot */}
            <Safari
              url="realhourly.ai/dashboard"
              imageSrc="/images/screenshots/dashboard.png"
              className="w-full shadow-2xl"
            />

            {/* Subtle gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </FadeIn>

        {/* CTA Link */}
        <FadeIn delay={0.4} className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-lg font-medium text-[#2B6B93] hover:text-[#E8882D] transition-colors"
          >
            {t("demoCta")}
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
