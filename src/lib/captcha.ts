export async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ TURNSTILE_SECRET_KEY is not set. Skipping Turnstile verification in development.");
      return true;
    }
    return false;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}