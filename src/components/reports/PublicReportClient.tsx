"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface TimelineDay {
  date: string;
  entries: {
    category: string;
    categoryEmoji: string;
    minutes: number;
    taskDescription: string;
  }[];
  dayTotalMinutes: number;
}

interface CategoryBreakdown {
  category: string;
  categoryEmoji: string;
  totalMinutes: number;
  percentage: number;
}

interface ClientReport {
  project: {
    name: string;
    freelancerName: string;
    startDate: string | null;
    currency: string;
    progressPercent: number | null;
    status: string;
  };
  summary: {
    totalHours: number;
    totalEntries: number;
    dateRange: { from: string; to: string };
  };
  timeline: TimelineDay[] | null;
  categoryBreakdown: CategoryBreakdown[] | null;
  invoiceAvailable: boolean;
  generatedAt: string;
}

type ErrorCode =
  | "SHARE_NOT_FOUND"
  | "SHARE_EXPIRED"
  | "SHARE_REVOKED"
  | "RATE_LIMITED";

const INITIAL_VISIBLE = 50;

export function PublicReportClient({
  shareToken,
}: {
  shareToken: string;
}) {
  const [report, setReport] = useState<ClientReport | null>(null);
  const [error, setError] = useState<{
    code: ErrorCode;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleDays, setVisibleDays] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/report/${shareToken}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error);
        } else {
          setReport(json.data);
        }
      } catch {
        setError({
          code: "SHARE_NOT_FOUND",
          message: "Failed to load report",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-32 rounded-xl bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorPage code={error.code} />;
  }

  if (!report) return null;

  const { project, summary, timeline, categoryBreakdown } = report;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="RealHourly"
            width={28}
            height={28}
            className="rounded"
          />
          <span className="text-sm font-semibold text-gray-600">
            RealHourly
          </span>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-gray-900">
            {project.name}
          </h1>
          <p className="text-sm text-gray-500">
            {project.freelancerName}
          </p>
          {summary.dateRange.from && (
            <p className="text-sm text-gray-500">
              {summary.dateRange.from} ~ {summary.dateRange.to || "ongoing"}
            </p>
          )}
          <p className="text-xs text-gray-400">
            {new Date(report.generatedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.progressPercent !== null && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {project.progressPercent}%
                  </span>
                </div>
                <Progress value={project.progressPercent} className="h-2" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Hours</p>
                <p className="text-lg font-bold">{summary.totalHours}h</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tasks</p>
                <p className="text-lg font-bold">{summary.totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {categoryBreakdown && categoryBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {cat.categoryEmoji} {cat.category}
                    </span>
                    <span className="text-gray-500">
                      {formatMinutes(cat.totalMinutes)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {timeline && timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeline.slice(0, visibleDays).map((day) => (
                <div key={day.date} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                      {day.date}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {formatMinutes(day.dayTotalMinutes)}
                    </Badge>
                  </div>
                  {day.entries.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 pl-2 text-sm"
                    >
                      <span className="shrink-0">
                        {entry.categoryEmoji}
                      </span>
                      <span className="text-gray-600 shrink-0">
                        {formatMinutes(entry.minutes)}
                      </span>
                      <span className="text-gray-800">
                        {entry.taskDescription || entry.category}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
              {timeline.length > visibleDays && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() =>
                    setVisibleDays((v) => v + INITIAL_VISIBLE)
                  }
                >
                  Show more ({timeline.length - visibleDays} days remaining)
                </Button>
              )}
              {summary.totalEntries === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">
                  No work entries yet
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* No entries */}
        {(!timeline || timeline.length === 0) &&
          summary.totalEntries === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-gray-400">
                  No work entries yet
                </p>
              </CardContent>
            </Card>
          )}

        {/* Footer */}
        <div className="border-t pt-6 text-center space-y-1">
          <p className="text-xs text-gray-400">
            Powered by{" "}
            <a
              href={process.env.NEXT_PUBLIC_SITE_URL || "/"}
              className="font-medium text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              RealHourly
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorPage({ code }: { code: ErrorCode }) {
  const messages: Record<ErrorCode, { title: string; desc: string }> = {
    SHARE_NOT_FOUND: {
      title: "Report Not Found",
      desc: "This report link is invalid or has been removed.",
    },
    SHARE_EXPIRED: {
      title: "Report Expired",
      desc: "This report link has expired. Please request a new one from your freelancer.",
    },
    SHARE_REVOKED: {
      title: "Report Deactivated",
      desc: "This report has been deactivated by the freelancer.",
    },
    RATE_LIMITED: {
      title: "Too Many Requests",
      desc: "Please wait a moment and try again.",
    },
  };

  const msg = messages[code] ?? messages.SHARE_NOT_FOUND;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-3 px-4">
        <h1 className="text-2xl font-bold text-gray-800">{msg.title}</h1>
        <p className="text-gray-500 max-w-sm">{msg.desc}</p>
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL || "/"}
          className="inline-block text-sm text-primary hover:underline mt-4"
        >
          Go to RealHourly
        </a>
      </div>
    </div>
  );
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
