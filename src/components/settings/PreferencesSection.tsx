"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * PreferencesSection
 *
 * @description User preferences including currency, hourly goal, language, and theme
 * Theme and language apply immediately; currency and hourly goal need save
 */

interface PreferencesSectionProps {
  defaultCurrency: "USD" | "KRW" | "EUR" | "GBP" | "JPY";
  hourlyGoal: number | null;
  timezone: string;
  locale: string;
  onUpdate: (updates: Partial<PreferencesSectionProps>) => void;
}

export function PreferencesSection({
  defaultCurrency,
  hourlyGoal,
  locale,
  onUpdate,
}: PreferencesSectionProps) {
  const t = useTranslations("settings");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [currentCurrency, setCurrentCurrency] = useState(defaultCurrency);
  const [currentHourlyGoal, setCurrentHourlyGoal] = useState<number | null>(
    hourlyGoal
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultCurrency: currentCurrency,
          hourlyGoal: currentHourlyGoal,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      onUpdate({
        defaultCurrency: currentCurrency,
        hourlyGoal: currentHourlyGoal,
      });
      toast.success(t("saved"));
    } catch (error) {
      toast.error(t("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLocaleChange = async (newLocale: string) => {
    try {
      // Update backend
      const response = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      });

      if (!response.ok) {
        throw new Error("Failed to update language");
      }

      onUpdate({ locale: newLocale });

      // Navigate to new locale path
      router.replace(pathname, { locale: newLocale });
    } catch (error) {
      toast.error(t("saveFailed"));
    }
  };

  const hasChanges =
    currentCurrency !== defaultCurrency || currentHourlyGoal !== hourlyGoal;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("preferences")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency">{t("defaultCurrency")}</Label>
          <Select
            value={currentCurrency}
            onValueChange={(value) =>
              setCurrentCurrency(value as typeof currentCurrency)
            }
          >
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="KRW">KRW (₩)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hourly Goal */}
        <div className="space-y-2">
          <Label htmlFor="hourlyGoal">{t("hourlyGoal")}</Label>
          <Select
            value={currentHourlyGoal?.toString() || "0"}
            onValueChange={(value) =>
              setCurrentHourlyGoal(value === "0" ? null : parseInt(value, 10))
            }
          >
            <SelectTrigger id="hourlyGoal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{t("noGoal")}</SelectItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                <SelectItem key={hour} value={hour.toString()}>
                  {hour} {t("hours")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{t("hourlyGoalHint")}</p>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language">{t("language")}</Label>
          <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ko">한국어</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <Label>{t("theme")}</Label>
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
              className="flex-1"
            >
              {t("themeLight")}
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
              className="flex-1"
            >
              {t("themeDark")}
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("system")}
              className="flex-1"
            >
              {t("themeSystem")}
            </Button>
          </div>
        </div>

        {/* Save Button (for currency and hourly goal) */}
        <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
          {isSaving ? t("saving") : t("save")}
        </Button>
      </CardContent>
    </Card>
  );
}
