import rateLimit from 'express-rate-limit';

// General API rate limiter - applies to all routes
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Strict rate limiter for write operations (POST, PUT, DELETE)
export const strictLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_STRICT_WINDOW_MS || '900000', 10), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_STRICT_MAX_REQUESTS || '20', 10), // 20 requests per window
  message: {
    error: 'Too many write requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict rate limiter for sensitive operations (order creation, discount application)
export const veryStrictLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_VERY_STRICT_WINDOW_MS || '900000', 10), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_VERY_STRICT_MAX_REQUESTS || '10', 10), // 10 requests per window
  message: {
    error: 'Too many requests for this operation, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for authentication/login endpoints (if added in future)
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '900000', 10), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || '5', 10), // 5 requests per window
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

