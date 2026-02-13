"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils/index";

const TIMEZONES = [
  { value: "Pacific/Honolulu", label: "Hawaii (UTC-10)" },
  { value: "America/Los_Angeles", label: "Pacific (UTC-8)" },
  { value: "America/Denver", label: "Mountain (UTC-7)" },
  { value: "America/Chicago", label: "Central (UTC-6)" },
  { value: "America/New_York", label: "Eastern (UTC-5)" },
  { value: "America/Sao_Paulo", label: "Brasilia (UTC-3)" },
  { value: "Europe/London", label: "London (UTC+0)" },
  { value: "Europe/Paris", label: "Paris (UTC+1)" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1)" },
  { value: "Europe/Moscow", label: "Moscow (UTC+3)" },
  { value: "Asia/Dubai", label: "Dubai (UTC+4)" },
  { value: "Asia/Kolkata", label: "India (UTC+5:30)" },
  { value: "Asia/Bangkok", label: "Bangkok (UTC+7)" },
  { value: "Asia/Shanghai", label: "China (UTC+8)" },
  { value: "Asia/Seoul", label: "Seoul (UTC+9)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+11)" },
] as const;

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
  timezone,
  locale,
  onUpdate,
}: PreferencesSectionProps) {
  const t = useTranslations("settings");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [currentCurrency, setCurrentCurrency] = useState(defaultCurrency);
  const [currentHourlyGoal, setCurrentHourlyGoal] = useState<number | null>(hourlyGoal);
  const [currentTimezone, setCurrentTimezone] = useState(timezone);
  const [tzOpen, setTzOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    currentCurrency !== defaultCurrency ||
    currentHourlyGoal !== hourlyGoal ||
    currentTimezone !== timezone;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultCurrency: currentCurrency,
          hourlyGoal: currentHourlyGoal,
          timezone: currentTimezone,
        }),
      });

      if (!response.ok) throw new Error("Failed to update preferences");

      onUpdate({
        defaultCurrency: currentCurrency,
        hourlyGoal: currentHourlyGoal,
        timezone: currentTimezone,
      });
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setCurrentCurrency(defaultCurrency);
    setCurrentHourlyGoal(hourlyGoal);
    setCurrentTimezone(timezone);
  };

  const handleLocaleChange = async (newLocale: string) => {
    try {
      const response = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      });
      if (!response.ok) throw new Error("Failed to update language");

      onUpdate({ locale: newLocale });
      router.replace(pathname, { locale: newLocale });
    } catch {
      toast.error(t("saveFailed"));
    }
  };

  const selectedTzLabel =
    TIMEZONES.find((tz) => tz.value === currentTimezone)?.label ?? currentTimezone;

  return (
    <>
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
                <SelectItem value="KRW">KRW (&#8361;)</SelectItem>
                <SelectItem value="EUR">EUR (&euro;)</SelectItem>
                <SelectItem value="GBP">GBP (&pound;)</SelectItem>
                <SelectItem value="JPY">JPY (&yen;)</SelectItem>
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

          {/* Timezone (searchable) */}
          <div className="space-y-2">
            <Label>{t("timezone")}</Label>
            <Popover open={tzOpen} onOpenChange={setTzOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={tzOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedTzLabel}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder={t("searchTimezone")} />
                  <CommandList>
                    <CommandEmpty>{t("noTimezoneFound")}</CommandEmpty>
                    <CommandGroup>
                      {TIMEZONES.map((tz) => (
                        <CommandItem
                          key={tz.value}
                          value={`${tz.value} ${tz.label}`}
                          onSelect={() => {
                            setCurrentTimezone(tz.value);
                            setTzOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4",
                              currentTimezone === tz.value ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="truncate">{tz.label}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {tz.value.split("/").pop()?.replace("_", " ")}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
        </CardContent>
      </Card>

      {/* Floating Save Bar */}
      {hasChanges && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 backdrop-blur-lg animate-in slide-in-from-bottom-4 duration-300">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-3">
            <p className="text-sm font-medium">{t("unsavedChanges")}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleDiscard}>
                {t("discard")}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? t("saving") : t("save")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
