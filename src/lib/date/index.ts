import {
  format,
  formatRelative as _formatRelative,
  formatDistanceToNow as _formatDistanceToNow,
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

export function formatDistanceToNow(
  date: Date | string | number,
  locale?: string,
): string {
  return _formatDistanceToNow(toDate(date), {
    addSuffix: true,
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

/**
 * Parse a date string (yyyy-MM-dd) into a local Date object,
 * avoiding timezone offset issues from `new Date(dateStr)`.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Format a Date to yyyy-MM-dd string in a specific timezone.
 */
export function toDateString(
  date: Date = new Date(),
  timezone: string = "Asia/Seoul",
): string {
  const local = getCurrentDate(timezone);
  if (date !== undefined && date !== null && !(date instanceof Date && isNaN(date.getTime()))) {
    const formatted = date.toLocaleString("en-US", { timeZone: timezone });
    const tz = new Date(formatted);
    return `${tz.getFullYear()}-${String(tz.getMonth() + 1).padStart(2, "0")}-${String(tz.getDate()).padStart(2, "0")}`;
  }
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
}
