import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { checkRateLimit, RATE_LIMITS, RATE_LIMIT_RESPONSE } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  const rateKey = `contact:${ip}`;
  if (!checkRateLimit(rateKey, RATE_LIMITS.contact)) {
    return NextResponse.json(RATE_LIMIT_RESPONSE, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

    // In MVP version, log the contact message
    // In production, this would send an email
    console.log("Contact message:", { name, email, message, ip, date: new Date().toISOString() });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
