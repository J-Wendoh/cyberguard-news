/**
 * Security Middleware
 * Helmet configuration and additional security headers
 */

const helmet = require('helmet');

/**
 * Helmet security headers configuration
 */
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"],
      imgSrc: ["'none'"],
      fontSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
      connectSrc: ["'self'"],
    },
  },

  // Prevent MIME type sniffing
  noSniff: true,

  // Prevent clickjacking
  frameguard: {
    action: 'deny',
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Don't cache sensitive responses
  noCache: false, // We'll handle caching ourselves

  // Referrer policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // XSS filter (legacy browsers)
  xssFilter: true,
});

/**
 * Additional custom security middleware
 */
function additionalSecurity(req, res, next) {
  // Remove fingerprinting headers
  res.removeHeader('X-Powered-By');

  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Cache control for API responses
  if (req.method === 'GET') {
    // Cache GET responses for 5 minutes
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }

  next();
}

module.exports = {
  securityHeaders,
  additionalSecurity,
};
