import { createHash } from "crypto";

export function hashIP(ip: string): string {
  return createHash("sha256").update(ip + "netmasr-salt").digest("hex").slice(0, 16);
}

export function generateAnonymousId(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateTripcode(password: string): string {
  const hash = createHash("sha256").update(password).digest("base64").slice(0, 8);
  return hash;
}

export function generateVoterId(ipHash: string, ua: string): string {
  return createHash("sha256").update(ipHash + ua).digest("hex");
}

export function generateToken(): string {
  return createHash("sha256").update(Math.random().toString() + Date.now().toString()).digest("hex");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "…";
}

export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
