"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

function CountUp({ end, suffix }: { end: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let startTs = 0;
          const duration = 1500;
          const step = (ts: number) => {
            startTs = startTs || ts;
            const progress = Math.min((ts - startTs) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-3xl font-bold text-foreground md:text-4xl">
      {count}
      {suffix}
    </div>
  );
}

export function CountUpSection() {
  const t = useTranslations("landing");

  const stats = [
    { icon: "\u26A1", value: 2, suffix: t("statMinSuffix"), labelKey: "stat1Label" },
    { icon: "\uD83C\uDFAF", value: 100, suffix: "%", labelKey: "stat2Label" },
    { icon: "\u23F1", value: 5, suffix: t("statSecSuffix"), labelKey: "stat3Label" },
    { icon: "\uD83C\uDF0D", value: 2, suffix: t("statLangSuffix"), labelKey: "stat4Label" },
  ] as const;

  return (
    <section className="bg-card/50 px-6 py-16" data-animate>
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center md:grid-cols-4">
        {stats.map((item, i) => (
          <div key={i}>
            <div className="mb-2 text-2xl">{item.icon}</div>
            <CountUp end={item.value} suffix={item.suffix} />
            <div className="mt-1 text-xs text-muted-foreground">{t(item.labelKey)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
