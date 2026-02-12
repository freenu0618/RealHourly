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
  weekStart: string;
  weekEnd: string;
  status: string;
  totalMinutes: number;
  approvalAction: string;
  entries: Entry[];
};

const flagLabels: Record<string, string> = {
  weekend_work: "Weekend work",
  late_night: "Late night",
  long_session: "Long session (8h+)",
  backdated: "Backdated entry",
  round_number: "Round number pattern",
};

export function TimesheetReviewClient({ token }: { token: string }) {
  const [data, setData] = useState<TimesheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    fetch(`/api/timesheets/review/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid link");
        return r.json();
      })
      .then(({ data }) => setData(data))
      .catch(() => setError("This review link is invalid or expired."))
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
      toast.success(action === "approved" ? "Timesheet approved" : "Timesheet rejected");
    } catch {
      toast.error("Failed to submit review");
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
              <CardTitle className="text-xl">Timesheet Review</CardTitle>
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
      <div className="space-y-4 mb-6">
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
                    <div className="flex-1 min-w-0">
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
                              {flagLabels[f.flagType] ?? f.flagType}
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
          <CardTitle className="text-base">Category Breakdown</CardTitle>
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
                ? "This timesheet has been reviewed"
                : `Status: ${data.status}`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="text-sm font-medium">Your Email (optional)</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reviewer@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Comment (optional)</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a comment..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleReview("approved")}
                disabled={submitting}
              >
                <Check className="mr-2 size-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleReview("rejected")}
                disabled={submitting}
              >
                <X className="mr-2 size-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branding footer */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Powered by <strong>RealHourly</strong> &middot; Transparent time tracking for freelancers
      </p>
    </div>
  );
}
