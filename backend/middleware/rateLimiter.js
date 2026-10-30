// Simple in-memory per-IP rate limiter (fixed window, one minute by default).
// Protects API quotas such as Gemini requests-per-minute limits and slows down abuse of public auth/contact forms.
// Each call creates its own counter, so every route gets a separate budget.
export const rateLimit = ({ windowMs = 60 * 1000, max = 5, message } = {}) => {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const entry = hits.get(key);

    if (!entry || now - entry.start >= windowMs) {
      hits.set(key, { start: now, count: 1 });

      // Drop expired entries so the map does not grow without bound
      for (const [ip, value] of hits) {
        if (now - value.start >= windowMs) hits.delete(ip);
      }
      return next();
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        success: false,
        message: message || `Too many requests, please try again in ${retryAfter} seconds.`,
      });
    }

    entry.count += 1;
    next();
  };
};
