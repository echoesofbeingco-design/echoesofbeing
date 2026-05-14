import "server-only";
import { profanityDictionaries } from "@/data/profanity-dictionaries";

/**
 * Multi-language content moderation engine.
 * Checks text against profanity dictionaries for English, Hindi, and
 * major Indian regional languages.
 *
 * Strategy:
 * 1. Normalize text (lowercase, strip diacritics, collapse repeats, leetspeak)
 * 2. Check against word lists using word-boundary matching
 * 3. Return result with flagged terms
 */

interface ModerationResult {
  isClean: boolean;
  flaggedTerms: string[];
}

/**
 * Normalize text for matching:
 * - Lowercase
 * - Strip common diacritics / combining marks
 * - Collapse repeated characters (fuuuck → fuck)
 * - Replace leetspeak (0→o, 1→l, 3→e, @→a, $→s, etc.)
 * - Collapse whitespace
 */
function normalize(text: string): string {
  let s = text.toLowerCase();

  // NFD decomposition then strip combining marks
  s = s.normalize("NFD").replace(/[̀-ͯ]/g, "");

  // Leetspeak substitutions
  s = s
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/\|/g, "l");

  // Collapse repeated characters (3+ → 2)
  s = s.replace(/(.)\1{2,}/g, "$1$1");

  // Strip non-alphanumeric except spaces and Devanagari/Tamil/Telugu/etc. Unicode ranges
  // Keep: Latin, Devanagari, Bengali, Gujarati, Gurmukhi, Kannada, Malayalam, Tamil, Telugu
  s = s.replace(
    /[^\w\sऀ-ॿঀ-৿਀-੿઀-૿଀-୿஀-௿ఀ-౿ಀ-೿ഀ-ൿ]/g,
    " "
  );

  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

/**
 * Check a single string against all dictionaries.
 */
function checkText(text: string): ModerationResult {
  const normalized = normalize(text);
  const flagged: string[] = [];

  for (const [, words] of Object.entries(profanityDictionaries)) {
    for (const word of words) {
      const normalizedWord = normalize(word);
      if (normalizedWord.length < 2) continue;

      // For short words (2-3 chars), require exact word boundary match
      // For longer words, check if the word appears as a substring
      if (normalizedWord.length <= 3) {
        const regex = new RegExp(`\\b${escapeRegex(normalizedWord)}\\b`, "i");
        if (regex.test(normalized)) {
          flagged.push(word);
        }
      } else {
        if (normalized.includes(normalizedWord)) {
          flagged.push(word);
        }
      }
    }
  }

  return {
    isClean: flagged.length === 0,
    flaggedTerms: [...new Set(flagged)],
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Main moderation function. Checks title and body.
 */
export function moderateContent(
  title: string,
  body: string
): ModerationResult {
  const titleResult = checkText(title);
  const bodyResult = checkText(body);

  const allFlagged = [...titleResult.flaggedTerms, ...bodyResult.flaggedTerms];

  return {
    isClean: titleResult.isClean && bodyResult.isClean,
    flaggedTerms: [...new Set(allFlagged)],
  };
}

/**
 * Check a single text field (for comments).
 */
export function moderateText(text: string): ModerationResult {
  return checkText(text);
}
