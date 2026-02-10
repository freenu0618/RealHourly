"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  MockDashboardCard, MockRateCard, MockChartCard, MockProjectCard,
  MockKPICard, MockTimeCard, MockParseCard, MockCalendarCell,
  MockCategoryBadge, MockTimelineCard, MockHistoryCard, MockAlertCard,
  MockCostPieChart, MockRateCompare, MockProgressBar, MockInvoiceCard,
  MockMessageCard, MockWeekChart, MockToneSelector, MockStatsCard,
} from "./MockCards";

const COLUMNS: ReactNode[][] = [
  [
    <MockDashboardCard key="d1" />,
    <MockRateCard key="r1" rate="$36.68" nominal="$50.00" />,
    <MockChartCard key="c1" />,
    <MockProjectCard key="p1" name="UI Redesign" progress={65} />,
    <MockKPICard key="k1" label="Net Income" value="$1,830" trend="+12%" />,
    <MockTimeCard key="t1" hours="5h 30m" />,
  ],
  [
    <MockParseCard key="pa1" input="Design 3hrs" />,
    <MockCalendarCell key="ca1" date={8} hours="5h" />,
    <MockCategoryBadge key="cb1" category="planning" />,
    <MockTimelineCard key="tl1" />,
    <MockParseCard key="pa2" input="Meeting 30m" />,
    <MockHistoryCard key="h1" />,
  ],
  [
    <MockAlertCard key="a1" message="Scope warning" />,
    <MockCostPieChart key="cp1" />,
    <MockProjectCard key="p2" name="App Dev" progress={30} />,
    <MockRateCompare key="rc1" before="$50" after="$32" />,
    <MockProgressBar key="pb1" percent={75} />,
    <MockInvoiceCard key="i1" />,
  ],
  [
    <MockMessageCard key="m1" tone="polite" />,
    <MockMessageCard key="m2" tone="firm" />,
    <MockWeekChart key="w1" />,
    <MockToneSelector key="ts1" />,
    <MockMessageCard key="m3" tone="neutral" />,
    <MockStatsCard key="s1" />,
  ],
];

function CarouselColumn({ children, direction }: { children: ReactNode[]; direction: "up" | "down" }) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <div className={cn("carousel-column", direction === "up" ? "carousel-up" : "carousel-down")}>
        {children.map((card, i) => (
          <div key={i} className="min-h-[100px] rounded-2xl border border-border/30 bg-card/80 p-1 shadow-sm backdrop-blur-sm">
            {card}
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {children.map((card, i) => (
          <div key={`d-${i}`} className="min-h-[100px] rounded-2xl border border-border/30 bg-card/80 p-1 shadow-sm backdrop-blur-sm">
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroCarousel() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-40 dark:opacity-25">
      {/* Mobile: 2 columns */}
      <div className="flex h-full gap-3 px-3 md:hidden">
        {COLUMNS.slice(0, 2).map((col, i) => (
          <CarouselColumn key={i} direction={i % 2 === 0 ? "up" : "down"}>{col}</CarouselColumn>
        ))}
      </div>
      {/* Desktop: 4 columns */}
      <div className="hidden h-full gap-4 px-4 md:flex">
        {COLUMNS.map((col, i) => (
          <CarouselColumn key={i} direction={i % 2 === 0 ? "up" : "down"}>{col}</CarouselColumn>
        ))}
      </div>

      {/* Top/bottom gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
