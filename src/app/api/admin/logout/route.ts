import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    await prisma.adminSession.delete({ where: { id: session.id } });
    await prisma.auditLog.create({
      data: { adminId: session.adminId, action: "logout" },
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}
