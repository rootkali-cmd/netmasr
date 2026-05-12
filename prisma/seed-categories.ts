import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories...");

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, isActive: true },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        isActive: true,
        sortOrder: CATEGORIES.indexOf(cat),
      },
    });
  }

  const count = await prisma.category.count();
  console.log(`Categories seeded: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
