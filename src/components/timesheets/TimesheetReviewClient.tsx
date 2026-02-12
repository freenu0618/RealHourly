"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Check,
  X,
  Clock,
  AlertTriangle,
  Shield,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

type EntryFlag = {
  flagType: string;
  severity: string;
};

type Entry = {
  id: string;
  date: string;
  minutes: number;
  category: string;
  taskDescription: string;
  flags: EntryFlag[];
};

type TimesheetData = {
  id: string;
  projectName: string;
  projectCurrency: string;
  freelancerName: string;
  locale: string;
  weekStart: string;
  weekEnd: string;
  status: string;
  totalMinutes: number;
  approvalAction: string;
  entries: Entry[];
};

// i18n for public review page (no next-intl available)
type Translations = Record<string, string>;

const i18n: Record<string, Translations> = {
  en: {
    title: "Timesheet Review",
    categoryBreakdown: "Category Breakdown",
    reviewed: "This timesheet has been reviewed",
    status: "Status",
    yourEmail: "Your Email (optional)",
    comment: "Comment (optional)",
    approve: "Approve",
    reject: "Reject",
    approved: "Timesheet approved",
    rejected: "Timesheet rejected",
    reviewFailed: "Failed to submit review",
    invalidLink: "This review link is invalid or expired.",
    emailPlaceholder: "reviewer@example.com",
    commentPlaceholder: "Add a comment...",
    poweredBy: "Transparent time tracking for freelancers",
    flagWeekend: "Weekend work",
    flagLateNight: "Late night",
    flagLongSession: "Long session (8h+)",
    flagBackdated: "Backdated entry",
    flagRoundNumber: "Round number pattern",
  },
  ko: {
    title: "타임시트 리뷰",
    categoryBreakdown: "카테고리 분석",
    reviewed: "이 타임시트는 리뷰가 완료되었습니다",
    status: "상태",
    yourEmail: "이메일 (선택사항)",
    comment: "코멘트 (선택사항)",
    approve: "승인",
    reject: "거절",
    approved: "타임시트가 승인되었습니다",
    rejected: "타임시트가 거절되었습니다",
    reviewFailed: "리뷰 제출에 실패했습니다",
    invalidLink: "유효하지 않거나 만료된 리뷰 링크입니다.",
    emailPlaceholder: "reviewer@example.com",
    commentPlaceholder: "코멘트를 입력하세요...",
    poweredBy: "프리랜서를 위한 투명한 시간 추적",
    flagWeekend: "주말 작업",
    flagLateNight: "심야 작업",
    flagLongSession: "장시간 작업 (8시간+)",
    flagBackdated: "소급 입력",
    flagRoundNumber: "반올림 패턴",
  },
};

const flagKeyMap: Record<string, string> = {
  weekend_work: "flagWeekend",
  late_night: "flagLateNight",
  long_session: "flagLongSession",
  backdated: "flagBackdated",
  round_number: "flagRoundNumber",
};

export function TimesheetReviewClient({ token }: { token: string }) {
  const [data, setData] = useState<TimesheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const locale = data?.locale ?? "en";
  const t = (key: string) => i18n[locale]?.[key] ?? i18n.en[key] ?? key;

  useEffect(() => {
    fetch(`/api/timesheets/review/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid link");
        return r.json();
      })
      .then(({ data }) => setData(data))
      .catch(() => setError(i18n.en.invalidLink))
      .finally(() => setLoading(false));
  }, [token]);

  const handleReview = async (action: "approved" | "rejected") => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/timesheets/review/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note || undefined, reviewerEmail: email || undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      setReviewed(true);
      toast.success(action === "approved" ? t("approved") : t("rejected"));
    } catch {
      toast.error(t("reviewFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const formatHours = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <Shield className="mx-auto mb-3 size-10 text-destructive/50" />
            <p className="text-lg font-medium">{error ?? "Not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const alreadyReviewed = data.status !== "submitted" || data.approvalAction !== "submitted";

  // Group entries by date
  const byDate = new Map<string, Entry[]>();
  for (const e of data.entries) {
    const arr = byDate.get(e.date) ?? [];
    arr.push(e);
    byDate.set(e.date, arr);
  }
  const sortedDates = [...byDate.keys()].sort();

  // Category summary
  const catSummary = new Map<string, number>();
  for (const e of data.entries) {
    catSummary.set(e.category, (catSummary.get(e.category) ?? 0) + e.minutes);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <User className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{t("title")}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {data.freelancerName} &middot; {data.projectName}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span>{data.weekStart} ~ {data.weekEnd}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="font-semibold">{formatHours(data.totalMinutes)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries by date */}
      <div className="mb-6 space-y-4">
        {sortedDates.map((date) => {
          const entries = byDate.get(date)!;
          const dayTotal = entries.reduce((s, e) => s + e.minutes, 0);
          return (
            <Card key={date}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{date}</span>
                  <span className="text-sm text-muted-foreground">{formatHours(dayTotal)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {entries.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {e.category}
                        </Badge>
                        <span className="text-sm font-medium">{formatHours(e.minutes)}</span>
                        {e.flags.length > 0 && (
                          <AlertTriangle className="size-4 text-amber-500" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {e.taskDescription || "—"}
                      </p>
                      {e.flags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {e.flags.map((f, fi) => (
                            <Badge
                              key={fi}
                              variant="secondary"
                              className={
                                f.severity === "warning"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              }
                            >
                              {t(flagKeyMap[f.flagType] ?? f.flagType)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t("categoryBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...catSummary.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([cat, min]) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{cat}</span>
                  <span className="font-medium">
                    {formatHours(min)}{" "}
                    <span className="text-muted-foreground">
                      ({Math.round((min / data.totalMinutes) * 100)}%)
                    </span>
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Review actions */}
      {reviewed || alreadyReviewed ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Check className="mx-auto mb-2 size-10 text-green-500" />
            <p className="text-lg font-medium">
              {data.status === "approved" || reviewed
                ? t("reviewed")
                : `${t("status")}: ${data.status}`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="text-sm font-medium">{t("yourEmail")}</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("comment")}</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("commentPlaceholder")}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                onClick={() => handleReview("approved")}
                disabled={submitting}
              >
                <Check className="mr-2 size-4" />
                {t("approve")}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleReview("rejected")}
                disabled={submitting}
              >
                <X className="mr-2 size-4" />
                {t("reject")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branding footer */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Powered by <strong>RealHourly</strong> &middot; {t("poweredBy")}
      </p>
    </div>
  );
}
