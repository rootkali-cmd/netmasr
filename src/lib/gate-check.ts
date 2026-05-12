import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATE_COOKIE = "admin_gate";
const ADMIN_GATE_SECRET = process.env.ADMIN_GATE_SECRET || "";

export async function checkGate(): Promise<boolean> {
  if (!ADMIN_GATE_SECRET) return true;
  const cookieStore = await cookies();
  return cookieStore.get(GATE_COOKIE)?.value === "valid";
}

export async function requireGate(): Promise<NextResponse | null> {
  const valid = await checkGate();
  if (valid) return null;
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
