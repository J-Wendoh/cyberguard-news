/**
 * Content Sanitization Utilities
 * Cleans and normalizes article content before sending to frontend
 */

const sanitizeHtml = require('sanitize-html');

/**
 * HTML entity fixes for common encoding issues
 */
const htmlEntityMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&#x27;': "'",
  '&#x2F;': '/',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '...',
  '&rsquo;': "'",
  '&lsquo;': "'",
  '&rdquo;': '"',
  '&ldquo;': '"',
};

/**
 * Fix HTML entities in text
 * @param {string} text - Text with potential HTML entities
 * @returns {string} Clean text
 */
function fixHtmlEntities(text) {
  if (!text || typeof text !== 'string') return text;

  let result = text;
  for (const [entity, char] of Object.entries(htmlEntityMap)) {
    result = result.replace(new RegExp(entity, 'gi'), char);
  }

  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (match, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });

  // Handle hex entities
  result = result.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return result;
}

/**
 * Sanitize HTML content (for summaries that may contain markup)
 * @param {string} html - HTML content
 * @returns {string} Sanitized HTML
 */
function sanitizeContent(html) {
  if (!html) return html;

  return sanitizeHtml(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    },
  });
}

/**
 * Strip all HTML tags (for plain text output)
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
function stripHtml(html) {
  if (!html) return html;

  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

/**
 * Sanitize an entire article object
 * @param {Object} article - Raw article from database
 * @returns {Object} Sanitized article
 */
function sanitizeArticle(article) {
  if (!article) return null;

  const sanitized = { ...article };

  // Fix HTML entities in text fields
  if (sanitized.title) {
    sanitized.title = fixHtmlEntities(sanitized.title);
  }

  if (sanitized.description) {
    sanitized.description = fixHtmlEntities(sanitized.description);
  }

  // Handle JSONB summary field
  if (sanitized.summary) {
    // If it's a string, try to parse it
    if (typeof sanitized.summary === 'string') {
      try {
        sanitized.summary = JSON.parse(sanitized.summary);
      } catch {
        // Keep as string if not valid JSON
        sanitized.summary = fixHtmlEntities(sanitized.summary);
      }
    }

    // If it's an object, sanitize its string values
    if (typeof sanitized.summary === 'object' && sanitized.summary !== null) {
      sanitized.summary = sanitizeJsonObject(sanitized.summary);
    }
  }

  // Ensure URL is valid
  if (sanitized.source_url) {
    sanitized.source_url = sanitized.source_url.trim();
  }

  return sanitized;
}

/**
 * Recursively sanitize string values in a JSON object
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
function sanitizeJsonObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJsonObject(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeJsonObject(value);
    }
    return result;
  }

  if (typeof obj === 'string') {
    return fixHtmlEntities(obj);
  }

  return obj;
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncate(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

module.exports = {
  fixHtmlEntities,
  sanitizeContent,
  stripHtml,
  sanitizeArticle,
  sanitizeJsonObject,
  truncate,
};
