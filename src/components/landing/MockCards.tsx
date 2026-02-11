"use client";

/* ── Mini mock cards for hero carousel ── */

export function MockKPICard({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="p-3">
      <div className="mb-1 text-[10px] text-muted-foreground">{label}</div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      {trend && (
        <div className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-600">
          <span className="size-1 rounded-full bg-green-500" />
          {trend}
        </div>
      )}
    </div>
  );
}

export function MockRateCard({ rate, nominal }: { rate: string; nominal: string }) {
  return (
    <div className="p-3">
      <div className="text-[10px] text-muted-foreground">Nominal Rate</div>
      <div className="text-sm text-muted-foreground line-through">{nominal}/hr</div>
      <div className="mt-2 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 p-2">
        <div className="text-[9px] font-medium text-primary">ACTUAL RATE</div>
        <div className="text-lg font-bold text-primary">{rate}/hr</div>
      </div>
    </div>
  );
}

export function MockChartCard() {
  const bars = [30, 55, 70, 25, 85, 45, 60];
  return (
    <div className="p-3">
      <div className="mb-2 text-[10px] text-muted-foreground">Weekly Hours</div>
      <div className="flex items-end gap-1 h-12">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary/80"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[8px] text-muted-foreground">
        <span>Mon</span><span>Sun</span>
      </div>
    </div>
  );
}

export function MockProjectCard({ name, progress }: { name: string; progress: number }) {
  return (
    <div className="p-3">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-[10px] font-bold text-primary">{progress}%</div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function MockTimeCard({ hours }: { hours: string }) {
  return (
    <div className="p-3">
      <div className="mb-1 text-[10px] text-muted-foreground">Today</div>
      <div className="text-lg font-bold text-primary">{hours}</div>
      <div className="mt-1.5 flex gap-1">
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">design</span>
        <span className="rounded-full bg-chart-3/10 px-1.5 py-0.5 text-[9px] text-chart-3">meeting</span>
      </div>
    </div>
  );
}

export function MockParseCard({ input }: { input: string }) {
  return (
    <div className="p-3">
      <div className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">
        <span className="size-1.5 animate-pulse rounded-full bg-primary" />
        AI Parse
      </div>
      <div className="rounded-lg bg-muted/50 p-2 text-xs italic">&quot;{input}&quot;</div>
      <div className="mt-2 flex gap-1">
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">design</span>
        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] text-accent-foreground">3h</span>
      </div>
    </div>
  );
}

export function MockCalendarCell({ date, hours }: { date: number; hours: string }) {
  return (
    <div className="p-3 text-center">
      <div className="text-lg font-bold">{date}</div>
      <div className="mt-1 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary">{hours}</div>
    </div>
  );
}

export function MockCategoryBadge({ category }: { category: string }) {
  return (
    <div className="flex flex-wrap gap-1.5 p-3">
      {[category, "revision", "admin", "email"].map((c) => (
        <span key={c} className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium">{c}</span>
      ))}
    </div>
  );
}

export function MockTimelineCard() {
  return (
    <div className="space-y-2 p-3">
      {[{ t: "09:00", l: "Design", d: "2h", w: "60%" }, { t: "11:00", l: "Meeting", d: "30m", w: "20%" }, { t: "14:00", l: "Dev", d: "3h", w: "80%" }].map((e) => (
        <div key={e.t} className="flex items-center gap-2 text-[10px]">
          <span className="w-8 text-muted-foreground">{e.t}</span>
          <div className="h-1.5 flex-1 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary/50" style={{ width: e.w }} />
          </div>
          <span className="font-medium">{e.l}</span>
          <span className="text-muted-foreground">{e.d}</span>
        </div>
      ))}
    </div>
  );
}

export function MockHistoryCard() {
  return (
    <div className="space-y-1.5 p-3">
      <div className="text-[10px] font-medium text-muted-foreground">Recent Logs</div>
      {["UI \uBAA9\uC5C5 \uC791\uC5C5 - 3h", "\uCF54\uB4DC \uB9AC\uBDF0 - 1h", "\uC774\uBA54\uC77C - 30m"].map((l) => (
        <div key={l} className="rounded-lg bg-muted/40 px-2 py-1 text-[10px]">{l}</div>
      ))}
    </div>
  );
}

export function MockAlertCard({ message }: { message: string }) {
  return (
    <div className="border-l-2 border-destructive p-3">
      <div className="flex items-center gap-1 text-xs font-medium">
        <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
        {message}
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">130% over budget</div>
    </div>
  );
}

export function MockCostPieChart() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="relative h-14 w-14">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--muted)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray="58 97" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--chart-3)" strokeWidth="3" strokeDasharray="24 97" strokeDashoffset="-58" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--chart-5)" strokeWidth="3" strokeDasharray="15 97" strokeDashoffset="-82" />
        </svg>
      </div>
      <div className="space-y-0.5 text-[10px]">
        <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Platform 60%</div>
        <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-chart-3" />Tax 25%</div>
        <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-chart-5" />Tools 15%</div>
      </div>
    </div>
  );
}

export function MockRateCompare({ before, after }: { before: string; after: string }) {
  return (
    <div className="p-3 text-center">
      <div className="text-sm text-muted-foreground line-through">{before}/hr</div>
      <div className="my-1 text-[10px] text-muted-foreground">{"\u2193"}</div>
      <div className="text-lg font-bold text-primary">{after}/hr</div>
    </div>
  );
}

export function MockProgressBar({ percent }: { percent: number }) {
  return (
    <div className="p-3">
      <div className="mb-1 flex justify-between text-[10px]"><span>Progress</span><span className="font-bold">{percent}%</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function MockInvoiceCard() {
  return (
    <div className="p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-medium">Invoice #1024</span>
        <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] font-medium text-green-600">Paid</span>
      </div>
      <div className="text-lg font-bold text-primary">$2,400</div>
    </div>
  );
}

export function MockMessageCard({ tone }: { tone: string }) {
  const emoji: Record<string, string> = { polite: "\uD83D\uDD4A\uFE0F", neutral: "\u2696\uFE0F", firm: "\uD83D\uDCAA" };
  return (
    <div className="p-3">
      <div className="mb-1 text-[10px] font-medium">{emoji[tone] || "\uD83D\uDD4A\uFE0F"} {tone}</div>
      <div className="text-[10px] leading-relaxed text-muted-foreground">
        Hi, I&apos;d like to discuss the current project scope...
      </div>
    </div>
  );
}

export function MockWeekChart() {
  return (
    <div className="p-3">
      <div className="mb-2 text-[10px] text-muted-foreground">Revenue Trend</div>
      <svg viewBox="0 0 100 40" className="h-10 w-full">
        <defs>
          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline fill="url(#heroGrad)" stroke="none"
          points="0,40 0,35 15,28 30,32 45,20 60,15 75,18 100,8 100,40" />
        <polyline fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"
          points="0,35 15,28 30,32 45,20 60,15 75,18 100,8" />
      </svg>
    </div>
  );
}

export function MockToneSelector() {
  return (
    <div className="flex gap-1.5 p-3">
      {["\uD83D\uDD4A\uFE0F Polite", "\u2696\uFE0F Neutral", "\uD83D\uDCAA Firm"].map((t, i) => (
        <span key={t} className={`rounded-full px-2 py-1 text-[9px] font-medium ${i === 0 ? "bg-primary/10 text-primary ring-1 ring-primary/20" : "bg-muted"}`}>{t}</span>
      ))}
    </div>
  );
}

export function MockStatsCard() {
  return (
    <div className="grid grid-cols-2 gap-2 p-3">
      {[{ l: "Projects", v: "5" }, { l: "Avg Rate", v: "$38.2" }, { l: "This Week", v: "32.5h" }, { l: "Revenue", v: "$2.4k" }].map((s) => (
        <div key={s.l} className="rounded-lg bg-muted/30 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">{s.l}</div>
          <div className="text-sm font-bold">{s.v}</div>
        </div>
      ))}
    </div>
  );
}

export function MockDashboardCard() {
  return (
    <div className="p-3">
      <div className="mb-2 text-[10px] font-medium text-muted-foreground">Dashboard</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">Rate</div>
          <div className="text-sm font-bold text-primary">$36.7</div>
        </div>
        <div className="rounded-lg bg-muted p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground">Hours</div>
          <div className="text-sm font-bold">142h</div>
        </div>
      </div>
    </div>
  );
}
