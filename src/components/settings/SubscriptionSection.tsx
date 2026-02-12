"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PlanInfo {
  plan: "free" | "pro";
  limits: {
    maxProjects: number;
    nlpParsePerMonth: number;
    aiChatPerMonth: number;
    pdfInvoice: boolean;
    timesheetApproval: boolean;
    shareLinks: boolean;
    weeklyInsight: boolean;
    dailyBriefing: boolean;
    csvExport: boolean;
    voiceInput: boolean;
  };
}

const PRO_FEATURES = [
  "unlimitedProjects",
  "unlimitedNlp",
  "unlimitedAiChat",
  "pdfInvoice",
  "timesheetApproval",
  "shareLinks",
  "weeklyInsight",
  "dailyBriefing",
  "csvExport",
  "voiceInput",
] as const;

export function SubscriptionSection() {
  const t = useTranslations("subscription");
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((j) => setPlanInfo(j.data))
      .catch(() => setPlanInfo({ plan: "free", limits: {} as PlanInfo["limits"] }))
      .finally(() => setLoading(false));
  }, []);

  async function handleCheckout(interval: "monthly" | "yearly") {
    const productId =
      interval === "monthly"
        ? process.env.NEXT_PUBLIC_POLAR_PRODUCT_MONTHLY
        : process.env.NEXT_PUBLIC_POLAR_PRODUCT_YEARLY;

    if (!productId) {
      toast.error("Product not configured");
      return;
    }

    setCheckoutLoading(interval);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, interval }),
      });
      const json = await res.json();
      if (json.data?.checkoutUrl) {
        window.location.href = json.data.checkoutUrl;
      } else {
        toast.error(t("checkoutError"));
      }
    } catch {
      toast.error(t("checkoutError"));
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/customer-portal", { method: "POST" });
      const json = await res.json();
      if (json.data?.portalUrl) {
        window.open(json.data.portalUrl, "_blank");
      } else {
        toast.error(t("portalError"));
      }
    } catch {
      toast.error(t("portalError"));
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5 text-brand-orange" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {t("loading")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPro = planInfo?.plan === "pro";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className={cn("size-5", isPro ? "text-brand-orange" : "text-muted-foreground")} />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan Badge */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "rounded-full px-3 py-1 text-sm font-semibold",
              isPro
                ? "bg-brand-orange/10 text-brand-orange"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isPro ? "Pro" : "Free"}
          </div>
          {isPro && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePortal}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <ExternalLink className="mr-1.5 size-3.5" />
              )}
              {t("manageSubscription")}
            </Button>
          )}
        </div>

        {/* Upgrade Cards (only for Free users) */}
        {!isPro && (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Monthly */}
            <div className="rounded-xl border border-border p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("monthly")}</p>
                <p className="text-2xl font-bold">
                  $9<span className="text-sm font-normal text-muted-foreground">/{t("month")}</span>
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => handleCheckout("monthly")}
                disabled={checkoutLoading !== null}
              >
                {checkoutLoading === "monthly" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {t("upgradePro")}
              </Button>
            </div>

            {/* Yearly */}
            <div className="relative rounded-xl border-2 border-brand-orange p-4 space-y-3">
              <div className="absolute -top-2.5 right-3 rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold text-white">
                {t("save22")}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("yearly")}</p>
                <p className="text-2xl font-bold">
                  $7<span className="text-sm font-normal text-muted-foreground">/{t("month")}</span>
                </p>
                <p className="text-xs text-muted-foreground">{t("billedYearly")}</p>
              </div>
              <Button
                className="w-full bg-brand-orange hover:bg-brand-orange/90"
                onClick={() => handleCheckout("yearly")}
                disabled={checkoutLoading !== null}
              >
                {checkoutLoading === "yearly" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {t("upgradePro")}
              </Button>
            </div>
          </div>
        )}

        {/* Pro Features List */}
        <div>
          <p className="mb-2 text-sm font-medium">
            {isPro ? t("yourFeatures") : t("proIncludes")}
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {PRO_FEATURES.map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-sm">
                <Check className={cn("size-4 shrink-0", isPro ? "text-brand-orange" : "text-muted-foreground")} />
                <span className={isPro ? "" : "text-muted-foreground"}>{t(feat)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
