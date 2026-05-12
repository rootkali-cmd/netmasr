import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATE_COOKIE = "admin_gate";
const ADMIN_GATE_SECRET = process.env.ADMIN_GATE_SECRET || "";

export async function GET() {
  if (ADMIN_GATE_SECRET) {
    const cookieStore = await cookies();
    const gate = cookieStore.get(GATE_COOKIE)?.value;
    return NextResponse.json({ valid: gate === "valid" });
  }
  return NextResponse.json({ valid: true, gateNotRequired: true });
}
