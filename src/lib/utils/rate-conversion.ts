/**
 * Convert a decimal rate (0–1) to a percentage (0–100).
 * Avoids floating-point noise (e.g., 0.033 * 100 → 3.3, not 3.300…003).
 */
export const toPercent = (rate: number): number =>
  parseFloat((rate * 100).toFixed(2));

/**
 * Convert a percentage (0–100) to a decimal rate (0–1).
 * Avoids floating-point noise (e.g., 3.3 / 100 → 0.033, not 0.032999…).
 */
export const toRate = (percent: number): number =>
  parseFloat((percent / 100).toFixed(6));
