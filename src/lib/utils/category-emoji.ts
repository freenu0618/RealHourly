/**
 * Shared category → emoji mapping used across dashboard, history, reports, and time-log.
 */
export const CATEGORY_EMOJI: Record<string, string> = {
  planning: "\uD83D\uDCCB",
  design: "\uD83C\uDFA8",
  development: "\uD83D\uDCBB",
  meeting: "\uD83E\uDD1D",
  revision: "\uD83D\uDD04",
  admin: "\uD83D\uDCC2",
  email: "\uD83D\uDCE7",
  research: "\uD83D\uDD0D",
  other: "\uD83D\uDCE6",
};

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? CATEGORY_EMOJI.other;
}
