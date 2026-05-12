"use client";

import { useState, useEffect, useCallback } from "react";

interface BannedWordItem {
  id: string;
  term: string;
  category: string;
  action: string;
  matchType: string;
  severity: string;
  isActive: boolean;
  detectionCount: number;
}

export function useBannedWords() {
  const [words, setWords] = useState<BannedWordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWords = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/banned-words");
      const data = await res.json();
      setWords(data.words || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWords(); }, [fetchWords]);

  const activeBlockWords = words
    .filter((w) => w.isActive && (w.action === "BLOCK" || w.action === "AUTO_REMOVE"))
    .map((w) => w.term);

  const activeReviewWords = words
    .filter((w) => w.isActive && w.action === "REVIEW")
    .map((w) => w.term);

  function findBanned(input: string): { term: string; index: number; action: string }[] {
    const found: { term: string; index: number; action: string }[] = [];
    const lower = input.toLowerCase();

    for (const w of words) {
      if (!w.isActive) continue;
      const target = w.term.toLowerCase();
      const idx = lower.indexOf(target);
      if (idx !== -1) {
        found.push({ term: target, index: idx, action: w.action });
      }
    }

    return found.sort((a, b) => a.index - b.index);
  }

  function hasBanned(input: string): boolean {
    return activeBlockWords.some((w) => input.toLowerCase().includes(w));
  }

  function hasReviewOnly(input: string): boolean {
    if (hasBanned(input)) return false;
    return activeReviewWords.some((w) => input.toLowerCase().includes(w));
  }

  function highlight(text: string): React.ReactNode[] {
    if (!text || words.length === 0) return [text];

    const lower = text.toLowerCase();
    const segments: React.ReactNode[] = [];
    let lastEnd = 0;

    const matches: { start: number; end: number; term: string }[] = [];
    for (const w of words) {
      if (!w.isActive) continue;
      const target = w.term.toLowerCase();
      let idx = 0;
      while (idx < lower.length) {
        const pos = lower.indexOf(target, idx);
        if (pos === -1) break;
        matches.push({ start: pos, end: pos + target.length, term: w.term });
        idx = pos + 1;
      }
    }
    matches.sort((a, b) => a.start - b.start);

    for (const m of matches) {
      if (m.start < lastEnd) continue;
      if (m.start > lastEnd) {
        segments.push(text.slice(lastEnd, m.start));
      }
      segments.push(
        <mark key={m.start} className="rounded bg-red-100 px-1 font-bold text-red-700">
          {text.slice(m.start, m.end)}
        </mark>
      );
      lastEnd = m.end;
    }
    if (lastEnd < text.length) {
      segments.push(text.slice(lastEnd));
    }
    return segments.length > 0 ? segments : [text];
  }

  function getStatus(input: string): { hasBlock: boolean; hasReview: boolean } {
    const lower = input.toLowerCase();
    let hasBlock = false;
    let hasReview = false;
    for (const w of words) {
      if (!w.isActive) continue;
      const target = w.term.toLowerCase();
      if (lower.includes(target)) {
        if (w.action === "BLOCK" || w.action === "AUTO_REMOVE") hasBlock = true;
        if (w.action === "REVIEW") hasReview = true;
      }
    }
    return { hasBlock, hasReview };
  }

  return {
    words,
    loading,
    findBanned,
    hasBanned,
    hasReviewOnly,
    highlight,
    getStatus,
    refresh: fetchWords,
  };
}