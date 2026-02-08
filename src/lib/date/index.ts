import {
  format,
  formatRelative as _formatRelative,
  parse,
  isValid,
  toDate,
  type Locale,
} from "date-fns";
import { ko, enUS } from "date-fns/locale";

const localeMap: Record<string, Locale> = {
  ko,
  en: enUS,
};

function getLocale(locale?: string): Locale {
  return localeMap[locale ?? "ko"] ?? ko;
}

export function formatDate(
  date: Date | string | number,
  pattern: string = "yyyy-MM-dd",
  locale?: string,
): string {
  return format(toDate(date), pattern, { locale: getLocale(locale) });
}

export function formatRelative(
  date: Date | string | number,
  baseDate: Date = new Date(),
  locale?: string,
): string {
  return _formatRelative(toDate(date), baseDate, {
    locale: getLocale(locale),
  });
}

export function parseUserDate(
  dateString: string,
  formatStr: string = "yyyy-MM-dd",
  referenceDate: Date = new Date(),
): Date | null {
  const parsed = parse(dateString, formatStr, referenceDate);
  return isValid(parsed) ? parsed : null;
}

export function getCurrentDate(timezone: string = "Asia/Seoul"): Date {
  const now = new Date();
  const formatted = now.toLocaleString("en-US", { timeZone: timezone });
  return new Date(formatted);
}
