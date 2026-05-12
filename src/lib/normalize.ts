const ARABIC_DIACRITICS_RE = /[\u064B-\u065F\u0670]/g;
const TATWEEL_RE = /[\u0640]/g;
const ALEF_VARIANTS_RE = /[أإآٱ]/g;
const TEH_MARBUTA_RE = /ة/g;
const ALEF_MAKSURA_RE = /ى/g;
const ARABIC_NUMBERS_RE = /[٠١٢٣٤٥٦٧٨٩]/g;
const ARABIC_INDIC_NUMBERS_RE = /[۰۱۲۳۴۵۶۷۸۹]/g;
const MULTIPLE_SPACES_RE = /\s+/g;
const REPEATED_CHAR_RE = /(.)\1{2,}/g;
const SEPARATOR_BETWEEN_LETTERS_RE = /(?<=[\u0600-\u06FF\u0750-\u077F\uFE70-\uFEFF])([.\-ـ_ـ\s*]{1,3})(?=[\u0600-\u06FF\u0750-\u077F\uFE70-\uFEFF])/g;
const NON_ALPHANUMERIC_RE = /[^a-z0-9\u0600-\u06FF\s]/g;

export function normalizeForModeration(text: string): string {
  if (!text) return "";

  let normalized = text
    .toLowerCase()
    .replace(ARABIC_DIACRITICS_RE, "")
    .replace(TATWEEL_RE, "")
    .replace(ALEF_VARIANTS_RE, "ا")
    .replace(TEH_MARBUTA_RE, "ه")
    .replace(ALEF_MAKSURA_RE, "ي")
    .replace(ARABIC_NUMBERS_RE, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
    .replace(ARABIC_INDIC_NUMBERS_RE, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06F0 + 48))
    .replace(REPEATED_CHAR_RE, "$1$1")
    .replace(SEPARATOR_BETWEEN_LETTERS_RE, "")
    .replace(NON_ALPHANUMERIC_RE, "")
    .replace(MULTIPLE_SPACES_RE, " ")
    .trim();

  return normalized;
}

export function findMatches(
  text: string,
  words: Array<{ term: string; normalizedTerm: string | null; matchType: string }>
): Array<{ word: string; index: number; matchType: string }> {
  const normalized = normalizeForModeration(text);
  const matches: Array<{ word: string; index: number; matchType: string }> = [];

  for (const w of words) {
    const target = (w.normalizedTerm || w.term).toLowerCase();

    if (w.matchType === "EXACT_WORD") {
      const regex = new RegExp(`\\b${escapeRegex(target)}\\b`, "gi");
      let m;
      while ((m = regex.exec(normalized)) !== null) {
        const originalIdx = findOriginalIndex(text, normalized, m.index);
        if (originalIdx !== -1) matches.push({ word: w.term, index: originalIdx, matchType: w.matchType });
      }
    } else if (w.matchType === "REGEX") {
      try {
        const regex = new RegExp(target, "gi");
        let m;
        while ((m = regex.exec(normalized)) !== null) {
          const originalIdx = findOriginalIndex(text, normalized, m.index);
          if (originalIdx !== -1) matches.push({ word: w.term, index: originalIdx, matchType: w.matchType });
        }
      } catch {}
    } else {
      let idx = 0;
      while (idx < normalized.length) {
        const pos = normalized.indexOf(target, idx);
        if (pos === -1) break;
        const originalIdx = findOriginalIndex(text, normalized, pos);
        if (originalIdx !== -1) matches.push({ word: w.term, index: originalIdx, matchType: w.matchType });
        idx = pos + 1;
      }
    }
  }

  return matches.sort((a, b) => a.index - b.index);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findOriginalIndex(original: string, normalized: string, normIdx: number): number {
  const beforeNorm = normalized.slice(0, normIdx);
  const beforeLen = beforeNorm.length;

  let oi = 0;
  let ni = 0;
  let matched = 0;

  while (oi < original.length && ni <= normIdx) {
    const oc = original[oi].toLowerCase();
    if (/[\u064B-\u065F\u0670\u0640]/.test(oc) || /[^a-z0-9\u0600-\u06FF\s]/i.test(oc) && !/[\u0600-\u06FF]/.test(oc)) {
      oi++;
      continue;
    }
    ni++;
    oi++;
  }

  return oi < original.length ? oi : -1;
}