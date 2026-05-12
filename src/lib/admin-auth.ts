import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { admin: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.adminSession.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session;
}

export function requireAdmin(session: unknown): asserts session is NonNullable<typeof session> {
  if (!session) {
    throw new Error("Unauthorized");
  }
}

export function requireRole(session: { admin: { role: string } }, roles: string[]) {
  if (!roles.includes(session.admin.role)) {
    throw new Error("Forbidden");
  }
}
