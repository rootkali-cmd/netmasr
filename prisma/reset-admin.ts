import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 14) {
    return { valid: false, error: "Password must be at least 14 characters." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number." };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return { valid: false, error: "Password must contain at least one symbol." };
  }
  return { valid: true };
}

async function main() {
  const username = process.env.ADMIN_RESET_USERNAME;
  const rawPassword = process.env.ADMIN_RESET_PASSWORD;

  if (!username) {
    console.error("ERROR: ADMIN_RESET_USERNAME is not set.");
    console.error("Set it as an environment variable before running this script.");
    process.exit(1);
  }

  if (!rawPassword) {
    console.error("ERROR: ADMIN_RESET_PASSWORD is not set.");
    console.error("Set it as an environment variable before running this script.");
    process.exit(1);
  }

  const passwordCheck = validatePassword(rawPassword);
  if (!passwordCheck.valid) {
    console.error("ERROR: Invalid password —", passwordCheck.error);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(rawPassword, 12);

  const existingAdmin = await prisma.admin.findUnique({ where: { username } });

  const admin = await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: {
      username,
      passwordHash,
      role: "owner",
      totpEnabled: false,
    },
  });

  if (existingAdmin?.totpEnabled && existingAdmin.totpSecret) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { totpSecret: existingAdmin.totpSecret, totpEnabled: true },
    });
    console.log("Admin credentials reset successfully. 2FA was preserved.");
  } else if (existingAdmin && !existingAdmin.totpSecret) {
    console.log("Admin credentials reset successfully. 2FA was preserved.");
  } else {
    console.log("Admin credentials reset successfully. 2FA was preserved.");
  }
}

main()
  .catch((e) => {
    console.error("Unexpected error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
