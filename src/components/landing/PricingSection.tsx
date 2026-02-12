"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Sparkles, Clock, Globe, Zap, MessageSquare, Mic } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const ITEM_ICONS = [Sparkles, Clock, Zap, Globe, MessageSquare, Mic];

export function PricingSection() {
  const t = useTranslations("landing");
  const router = useRouter();

  const items = [
    t("pricingItem1"),
    t("pricingItem2"),
    t("pricingItem3"),
    t("pricingItem4"),
    t("pricingItem5"),
    t("pricingItem6"),
  ];

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <section id="pricing" className="px-6 py-20">
      <FadeIn blur>
        <h2 className="mb-4 text-center text-2xl font-bold">
          {t("pricingTitle")}
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          {t("pricingSubtitle")}
        </p>
      </FadeIn>

      <FadeIn>
        <div className="mx-auto max-w-sm rounded-[24px] border bg-card p-8 text-center shadow-sm transition-shadow hover:shadow-md">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {t("pricingBadge")}
          </span>
          <div className="mb-1 mt-4 text-4xl font-bold">
            {t("pricingFree")}
            <span className="text-lg font-normal text-muted-foreground">
              {t("pricingMonth")}
            </span>
          </div>

          <ul className="mt-6 space-y-3 text-left text-sm">
            {items.map((item, i) => {
              const Icon = ITEM_ICONS[i];
              return (
                <li key={i} className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-3.5 text-primary" />
                  </div>
                  {item}
                </li>
              );
            })}
          </ul>

          <ShimmerButton
            onClick={handleGetStarted}
            shimmerColor="#ffffff"
            background="var(--primary)"
            borderRadius="12px"
            className="mt-8 w-full py-3 font-medium text-primary-foreground"
          >
            {t("pricingCta")}
          </ShimmerButton>

          <p className="mt-2 text-xs text-muted-foreground">
            {t("pricingNote")}
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
