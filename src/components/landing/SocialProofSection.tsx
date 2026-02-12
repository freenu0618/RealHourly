"use client";

import { useTranslations } from "next-intl";
import { Marquee } from "@/components/ui/marquee";
import { FadeIn } from "@/components/ui/fade-in";

interface Platform {
  name: string;
  color: string;
}

const platforms: Platform[] = [
  { name: "Upwork", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  { name: "Fiverr", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { name: "크몽", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  { name: "숨고", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { name: "Freelancer", color: "bg-sky-500/10 text-sky-700 dark:text-sky-400" },
  { name: "Toptal", color: "bg-violet-500/10 text-violet-700 dark:text-violet-400" },
  { name: "99designs", color: "bg-red-500/10 text-red-700 dark:text-red-400" },
  { name: "독립 프리랜서", color: "bg-primary/10 text-primary" },
];

const PlatformBadge = ({ platform }: { platform: Platform }) => {
  return (
    <div
      className={`
        rounded-full px-4 py-2 text-sm font-medium border
        ${platform.color}
        transition-transform hover:scale-105
      `}
    >
      {platform.name}
    </div>
  );
};

export function SocialProofSection() {
  const t = useTranslations("landing");

  // Split platforms into two rows for visual depth
  const firstRow = platforms.slice(0, 4);
  const secondRow = platforms.slice(4);

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Title */}
        <FadeIn className="text-center mb-8">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("socialTitle")}
          </h2>
        </FadeIn>

        {/* First Marquee Row (Left to Right) */}
        <div className="mb-4">
          <Marquee pauseOnHover className="[--duration:20s]">
            {firstRow.map((platform) => (
              <PlatformBadge key={platform.name} platform={platform} />
            ))}
          </Marquee>
        </div>

        {/* Second Marquee Row (Right to Left) */}
        <div className="mb-8">
          <Marquee reverse pauseOnHover className="[--duration:20s]">
            {secondRow.map((platform) => (
              <PlatformBadge key={platform.name} platform={platform} />
            ))}
          </Marquee>
        </div>

        {/* Subtitle */}
        <FadeIn className="text-center" delay={0.1}>
          <p className="text-xs text-muted-foreground">
            {t("socialSubtitle")}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
