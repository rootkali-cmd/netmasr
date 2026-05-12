import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { normalizeForModeration } from "@/lib/normalize";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { contentTypes } = body || {};
    const types = contentTypes || ["post", "comment", "userPoll"];

    const bannedWords = await prisma.bannedWord.findMany({ where: { isActive: true } });
    if (bannedWords.length === 0) {
      return NextResponse.json({ message: "لا توجد كلمات محظورة مفعلة", scanned: 0, actions: 0 });
    }

    let totalScanned = 0;
    let totalActions = 0;

    for (const contentType of types) {
      if (contentType === "post") {
        const posts = await prisma.post.findMany({ where: { status: "approved" } });
        totalScanned += posts.length;
        for (const post of posts) {
          const combined = post.title + " " + post.content;
          const normalized = normalizeForModeration(combined);
          const found = findAnyMatch(normalized, bannedWords);
          if (found.length > 0) {
            const hasBlock = found.some((f) => f.action === "BLOCK" || f.action === "AUTO_REMOVE");
            const hasReview = found.some((f) => f.action === "REVIEW");
            if (hasBlock) {
              await prisma.post.update({ where: { id: post.id }, data: { status: "pending", moderationStatus: "patrol_removed", moderationReason: found.map((f) => f.term).join(", ") } });
              totalActions++;
            } else if (hasReview) {
              await prisma.post.update({ where: { id: post.id }, data: { status: "pending", moderationStatus: "patrol_review", moderationReason: found.map((f) => f.term).join(", ") } });
              totalActions++;
            }
            for (const f of found) {
              await prisma.moderationLog.create({
                data: { contentType: "post", contentId: post.id, matchedTermId: f.id, matchedTerm: f.term, actionTaken: hasBlock ? "patrol_removed" : "patrol_review", scanType: "PATROL", status: hasBlock ? "removed" : "pending" },
              });
            }
          }
          await prisma.post.update({ where: { id: post.id }, data: { lastModerationScanAt: new Date() } });
        }
      }

      if (contentType === "comment") {
        const comments = await prisma.comment.findMany({ where: { status: "approved" } });
        totalScanned += comments.length;
        for (const comment of comments) {
          const normalized = normalizeForModeration(comment.content);
          const found = findAnyMatch(normalized, bannedWords);
          if (found.length > 0) {
            const hasBlock = found.some((f) => f.action === "BLOCK" || f.action === "AUTO_REMOVE");
            const hasReview = found.some((f) => f.action === "REVIEW");
            if (hasBlock) {
              await prisma.comment.update({ where: { id: comment.id }, data: { status: "pending", moderationStatus: "patrol_removed", moderationReason: found.map((f) => f.term).join(", ") } });
              totalActions++;
            } else if (hasReview) {
              await prisma.comment.update({ where: { id: comment.id }, data: { status: "pending", moderationStatus: "patrol_review", moderationReason: found.map((f) => f.term).join(", ") } });
              totalActions++;
            }
            for (const f of found) {
              await prisma.moderationLog.create({
                data: { contentType: "comment", contentId: comment.id, matchedTermId: f.id, matchedTerm: f.term, actionTaken: hasBlock ? "patrol_removed" : "patrol_review", scanType: "PATROL", status: hasBlock ? "removed" : "pending" },
              });
            }
          }
          await prisma.comment.update({ where: { id: comment.id }, data: { lastModerationScanAt: new Date() } });
        }
      }

      if (contentType === "userPoll") {
        const polls = await prisma.userPoll.findMany({ where: { status: "approved" } });
        totalScanned += polls.length;
        for (const poll of polls) {
          const combined = poll.question + " " + (poll.description || "");
          const normalized = normalizeForModeration(combined);
          const found = findAnyMatch(normalized, bannedWords);
          if (found.length > 0) {
            const hasBlock = found.some((f) => f.action === "BLOCK" || f.action === "AUTO_REMOVE");
            const hasReview = found.some((f) => f.action === "REVIEW");
            if (hasBlock) {
              await prisma.userPoll.update({ where: { id: poll.id }, data: { status: "pending", moderationStatus: "patrol_removed", moderationReason: found.map((f) => f.term).join(", ") } });
              totalActions++;
            } else if (hasReview) {
              await prisma.userPoll.update({ where: { id: poll.id }, data: { status: "pending", moderationStatus: "patrol_review", moderationReason: found.map((f) => f.term).join(", ") } });
              totalActions++;
            }
            for (const f of found) {
              await prisma.moderationLog.create({
                data: { contentType: "userPoll", contentId: poll.id, matchedTermId: f.id, matchedTerm: f.term, actionTaken: hasBlock ? "patrol_removed" : "patrol_review", scanType: "PATROL", status: hasBlock ? "removed" : "pending" },
              });
            }
          }
          await prisma.userPoll.update({ where: { id: poll.id }, data: { lastModerationScanAt: new Date() } });
        }
      }
    }

    return NextResponse.json({ message: "تم الفحص", scanned: totalScanned, actions: totalActions });
  } catch (e) {
    return NextResponse.json({ error: "حدث خطأ", details: String(e) }, { status: 500 });
  }
}

function findAnyMatch(normalized: string, words: Array<{ id: string; term: string; normalizedTerm: string | null; matchType: string; action: string; category: string }>) {
  const found: Array<{ id: string; term: string; action: string; category: string }> = [];
  for (const w of words) {
    const target = (w.normalizedTerm || w.term).toLowerCase();
    let matched = false;
    if (w.matchType === "EXACT_WORD") {
      const regex = new RegExp(`\\b${w.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      matched = regex.test(normalized);
    } else if (w.matchType === "REGEX") {
      try { matched = new RegExp(target, "gi").test(normalized); } catch {}
    } else {
      matched = normalized.includes(target);
    }
    if (matched) found.push({ id: w.id, term: w.term, action: w.action, category: w.category });
  }
  return found;
}