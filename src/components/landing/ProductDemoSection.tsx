"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "@/i18n/navigation";

const YOUTUBE_VIDEO_ID = "nADiKqUOpkc";

export function ProductDemoSection() {
  const t = useTranslations("landing");

  return (
    <section id="demo" className="px-4 py-20">
      <div className="container mx-auto">
        <FadeIn className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t("demoTitle")}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("demoSubtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-12">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-border/40 bg-black shadow-2xl">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 size-full"
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
                title="RealHourly Product Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
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
