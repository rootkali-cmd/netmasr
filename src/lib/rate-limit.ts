const rateMap = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (entry.count >= config.maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

export function getRateLimitRemaining(key: string, config: RateLimitConfig): number {
  const entry = rateMap.get(key);
  if (!entry) return config.maxRequests;
  return Math.max(0, config.maxRequests - entry.count);
}

export const RATE_LIMITS = {
  post: { windowMs: 5 * 60 * 1000, maxRequests: 3 },
  comment: { windowMs: 60 * 1000, maxRequests: 5 },
  vote: { windowMs: 60 * 1000, maxRequests: 10 },
  report: { windowMs: 60 * 1000, maxRequests: 3 },
  contact: { windowMs: 60 * 60 * 1000, maxRequests: 2 },
  adminLogin: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
} as const;

export const RATE_LIMIT_RESPONSE = { error: "طلبات كثيرة جدًا. الرجاء الانتظار قبل المحاولة مرة أخرى." };
