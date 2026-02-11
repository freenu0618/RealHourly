"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

function CountUp({ end, suffix, color }: { end: number; suffix: string; color: string }) {
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

  // SVG ring gauge
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const normalizedEnd = end <= 100 ? end : Math.min(end, 100);
  const strokeDashoffset = circumference - (circumference * (count / normalizedEnd) * (normalizedEnd / 100));

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="6"
          />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-foreground md:text-3xl">
            {count}{suffix}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CountUpSection() {
  const t = useTranslations("landing");

  const stats = [
    { icon: "\u26A1", value: 2, suffix: t("statMinSuffix"), labelKey: "stat1Label", color: "var(--primary)" },
    { icon: "\uD83C\uDFAF", value: 100, suffix: "%", labelKey: "stat2Label", color: "var(--chart-2)" },
    { icon: "\u23F1", value: 5, suffix: t("statSecSuffix"), labelKey: "stat3Label", color: "var(--chart-3)" },
    { icon: "\uD83C\uDF0D", value: 2, suffix: t("statLangSuffix"), labelKey: "stat4Label", color: "var(--chart-1)" },
  ] as const;

  return (
    <section className="bg-card/50 px-6 py-16" data-animate>
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center md:grid-cols-4">
        {stats.map((item, i) => (
          <div key={i}>
            <CountUp end={item.value} suffix={item.suffix} color={item.color} />
            <div className="mt-2 text-lg">{item.icon}</div>
            <div className="mt-1 text-xs text-muted-foreground">{t(item.labelKey)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
