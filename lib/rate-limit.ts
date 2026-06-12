interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Simple in-memory rate limiter. Tracks request counts per identifier
 * within a rolling time window.
 *
 * @param identifier - A unique key for the caller (e.g. IP address, user ID, email).
 * @param limit      - Maximum number of requests allowed within the window. Defaults to 10.
 * @param windowMs   - Duration of the window in milliseconds. Defaults to 60 000 (1 minute).
 * @returns An object with `success` (whether the request is allowed) and
 *          `remaining` (how many requests are left in the current window).
 */
export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60_000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: limit - record.count };
}
