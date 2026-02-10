/**
 * Sanitize user text before inserting into LLM prompts.
 * Prevents prompt injection and excessive input lengths.
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above/i,
  /you\s+are\s+now/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /<<SYS>>/i,
  /<<\/SYS>>/i,
];

function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

function detectInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

export function sanitizeForParse(text: string): string {
  let cleaned = stripHtmlTags(text);
  if (cleaned.length > 2000) {
    cleaned = cleaned.slice(0, 2000);
  }
  // Remove injection attempts by replacing with empty string
  if (detectInjection(cleaned)) {
    for (const pattern of INJECTION_PATTERNS) {
      cleaned = cleaned.replace(pattern, "");
    }
  }
  return cleaned.trim();
}

export function sanitizeForMessage(text: string): string {
  let cleaned = stripHtmlTags(text);
  if (cleaned.length > 5000) {
    cleaned = cleaned.slice(0, 5000);
  }
  if (detectInjection(cleaned)) {
    for (const pattern of INJECTION_PATTERNS) {
      cleaned = cleaned.replace(pattern, "");
    }
  }
  return cleaned.trim();
}
