import { prisma } from "./prisma";
import { normalizeForModeration } from "./normalize";
import { PrismaClient } from "@prisma/client";

type ModerationResult = {
  status: "approved" | "pending" | "rejected";
  reason?: string;
  matches?: Array<{ term: string; action: string; category: string }>;
};

export async function moderateContent(
  text: string,
  options?: { prisma?: PrismaClient }
): Promise<ModerationResult> {
  if (!text || !text.trim()) {
    return { status: "approved" };
  }

  const db = options?.prisma || prisma;

  const bannedWords = await db.bannedWord.findMany({
    where: { isActive: true },
    select: { id: true, term: true, normalizedTerm: true, category: true, action: true, matchType: true, severity: true },
  });

  if (bannedWords.length === 0) {
    return { status: "approved" };
  }

  const normalized = normalizeForModeration(text);
  const foundMatches: Array<{ term: string; action: string; category: string }> = [];

  for (const bw of bannedWords) {
    const target = (bw.normalizedTerm || bw.term).toLowerCase();

    let matched = false;
    if (bw.matchType === "EXACT_WORD") {
      const regex = new RegExp(`\\b${escapeRegex(target)}\\b`, "gi");
      matched = regex.test(normalized);
    } else if (bw.matchType === "REGEX") {
      try {
        matched = new RegExp(target, "gi").test(normalized);
      } catch {}
    } else {
      matched = normalized.includes(target);
    }

    if (matched) {
      foundMatches.push({ term: bw.term, action: bw.action, category: bw.category });
    }
  }

  if (foundMatches.length === 0) {
    return { status: "approved" };
  }

  const hasBlock = foundMatches.some((m) => m.action === "BLOCK" || m.action === "AUTO_REMOVE");
  const hasReview = foundMatches.some((m) => m.action === "REVIEW");

  if (hasBlock) {
    return {
      status: "rejected",
      reason: "تم رفض المحتوى لاحتوائه على كلمات غير مسموح بها.",
      matches: foundMatches,
    };
  }

  if (hasReview) {
    return {
      status: "pending",
      reason: "تم إرسال المحتوى للمراجعة قبل النشر.",
      matches: foundMatches,
    };
  }

  return { status: "approved" };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}