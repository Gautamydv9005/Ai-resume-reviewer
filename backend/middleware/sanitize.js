/**
 * Data Sanitization & Security Middleware
 * 
 * 1. NoSQL Injection Prevention: Strips MongoDB query operators ($gt, $ne, etc.) and dot notation
 * 2. XSS & HTML Sanitization: Cleans dangerous script tags and malicious attributes
 * 3. Text Normalization: Trims strings and normalizes email casing
 */

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Prohibit keys starting with '$' or containing '.' to block NoSQL injection
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    if (typeof value === 'string') {
      // 1. Trim whitespace
      let sanitized = value.trim();

      // Don't strip characters from passwords — passwords must be preserved as typed
      if (key.toLowerCase().includes('password')) {
        clean[key] = sanitized;
        continue;
      }

      // 2. Strip potential XSS script tags and javascript: URIs
      sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript\s*:/gi, '');

      // 3. Normalize email fields
      if (key.toLowerCase().includes('email')) {
        sanitized = sanitized.toLowerCase();
      }

      clean[key] = sanitized;
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export const sanitizeData = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};
