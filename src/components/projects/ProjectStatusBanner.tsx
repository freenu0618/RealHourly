"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/money/currency";

/**
 * ProjectStatusBanner
 *
 * @description 프로젝트 상태별 배너 컴포넌트
 * Active 상태가 아닐 때 상태에 따른 안내 메시지와 액션 버튼 표시
 *
 * @example
 * <ProjectStatusBanner
 *   status="completed"
 *   realHourly={45000}
 *   currency="KRW"
 *   onResume={() => handleResume()}
 * />
 */

interface ProjectStatusBannerProps {
  status: string;
  realHourly: number | null;
  currency: string;
  onResume: () => void;
}

export function ProjectStatusBanner({
  status,
  realHourly,
  currency,
  onResume,
}: ProjectStatusBannerProps) {
  const t = useTranslations("projects");

  if (status === "active") {
    return null;
  }

  const bannerConfig = {
    completed: {
      bgColor: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
      emoji: "🎉",
      title: t("completedBanner"),
      message: realHourly
        ? t("completedMessage", { rate: formatCurrency(realHourly, currency) })
        : t("completedMessageNoRate"),
      showButton: false,
    },
    paused: {
      bgColor: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
      emoji: "⏸️",
      title: t("pausedBanner"),
      message: t("pausedMessage"),
      showButton: true,
    },
    cancelled: {
      bgColor: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
      emoji: "❌",
      title: t("cancelledBanner"),
      message: t("cancelledMessage"),
      showButton: false,
    },
  };

  const config = bannerConfig[status as keyof typeof bannerConfig];

  if (!config) {
    return null;
  }

  return (
    <div
      className={`${config.bgColor} border rounded-[20px] p-6 mb-6 flex items-center justify-between`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{config.emoji}</span>
        <div>
          <h3 className="font-semibold mb-1">{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.message}</p>
        </div>
      </div>
      {config.showButton && (
        <Button
          onClick={onResume}
          variant="outline"
          className="rounded-xl bg-background hover:bg-accent"
        >
          {t("resumeProject")}
        </Button>
      )}
    </div>
  );
}
