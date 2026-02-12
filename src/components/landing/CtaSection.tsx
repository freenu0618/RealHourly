"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/fade-in";
import { PulsatingButton } from "@/components/ui/pulsating-button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export function CtaSection() {
  const t = useTranslations("landing");
  const router = useRouter();

  const handleCtaClick = () => {
    router.push("/login");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-primary/10 px-6 py-24 text-center md:py-32">
      {/* Background dot pattern with radial mask for depth */}
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "absolute inset-0 h-full w-full opacity-20",
          "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
        )}
      />

      {/* Content layer */}
      <div className="relative z-10">
        <FadeIn blur>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("ctaDesc")}
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex flex-col items-center gap-4">
            <PulsatingButton
              onClick={handleCtaClick}
              pulseColor="var(--primary)"
              duration="2s"
              className="rounded-xl bg-primary px-10 py-5 text-lg font-semibold text-primary-foreground transition-all hover:-translate-y-1 hover:shadow-2xl md:px-12 md:py-6 md:text-xl"
            >
              {t("ctaCta")} →
            </PulsatingButton>

            <p className="text-sm text-muted-foreground md:text-base">
              {t("heroCtaSub")}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
