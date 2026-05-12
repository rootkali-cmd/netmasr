import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES, DEFAULT_BANNED_WORDS, OFFICIAL_POLLS, SAMPLE_POSTS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin
  const passwordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      role: "owner",
      totpEnabled: false,
    },
  });
  console.log("Admin created:", admin.username);

  // Create categories
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: CATEGORIES.indexOf(cat),
      },
    });
  }
  console.log("Categories created");

  // Create banned words
  for (const bw of DEFAULT_BANNED_WORDS) {
    await prisma.bannedWord.upsert({
      where: { term: bw.term.toLowerCase() },
      update: {},
      create: {
        term: bw.term.toLowerCase(),
        normalizedTerm: bw.normalizedTerm || bw.term.toLowerCase(),
        category: bw.category,
        action: bw.action || "BLOCK",
        matchType: bw.matchType || "CONTAINS",
        severity: bw.severity || "MEDIUM",
      },
    });
  }
  console.log("Banned words created");

  // Create official polls
  for (const poll of OFFICIAL_POLLS) {
    const existing = await prisma.officialPoll.findFirst({
      where: { title: poll.title },
    });
    if (!existing) {
      await prisma.officialPoll.create({
        data: {
          title: poll.title,
          description: poll.description,
          isPinned: false,
          options: {
            create: poll.options.map((opt) => ({
              text: opt.text,
              order: opt.order,
            })),
          },
        },
      });
    }
  }
  console.log("Official polls created");

  // Create sample posts
  const existingPosts = await prisma.post.count();
  if (existingPosts === 0) {
    for (const sample of SAMPLE_POSTS) {
      const category = await prisma.category.findUnique({ where: { slug: sample.categorySlug } });
      if (!category) continue;

      const post = await prisma.post.create({
        data: {
          title: sample.title,
          content: sample.content,
          categoryId: category.id,
          anonymousId: sample.anonymousId,
          status: "approved",
          upvotes: sample.upvotes,
          downvotes: sample.downvotes,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });

      for (const comment of sample.comments) {
        await prisma.comment.create({
          data: {
            postId: post.id,
            content: comment.content,
            anonymousId: comment.anonymousId,
            status: "approved",
            createdAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
    console.log("Sample posts created");
  } else {
    console.log("Posts already exist, skipping sample posts");
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
