/**
 * Address Sanitization Module
 * 
 * Provides security utilities to sanitize and redact blockchain addresses
 * in logs, error messages, and external API calls to prevent address exposure.
 * 
 * This module implements security best practices to prevent sensitive
 * blockchain addresses from being exposed in:
 * - Console logs
 * - Error messages
 * - HTTP requests/responses
 * - Debug outputs
 * - External API calls
 */

/**
 * Security configuration for address sanitization
 */
const SECURITY_CONFIG = {
  // Enable/disable sanitization globally
  enabled: process.env.SANITIZE_ADDRESSES !== 'false',
  
  // Whitelisted addresses that can be shown (e.g., well-known contracts)
  whitelist: [
    '0x0000000000000000000000000000000000000000', // Zero address
    '0x000000000000000000000000000000000000dead', // Burn address
  ],
  
  // How many characters to show (prefix + suffix)
  visiblePrefix: 6,  // Show first 6 chars (0x + 4 hex)
  visibleSuffix: 4,  // Show last 4 chars
  
  // Replacement character
  redactionChar: '*'
};

/**
 * Address Sanitizer Class
 * Provides methods to sanitize blockchain addresses in various contexts
 */
class AddressSanitizer {
  /**
   * Creates a new Address Sanitizer instance
   * @param {Object} config - Optional configuration override
   */
  constructor(config = {}) {
    this.config = { ...SECURITY_CONFIG, ...config };
  }

  /**
   * Checks if an address is whitelisted
   * @param {string} address - The address to check
   * @returns {boolean} True if whitelisted
   */
  isWhitelisted(address) {
    if (!address) return false;
    const normalized = address.toLowerCase();
    return this.config.whitelist.some(addr => addr.toLowerCase() === normalized);
  }

  /**
   * Validates if a string looks like an Ethereum address
   * @param {string} str - String to validate
   * @returns {boolean} True if it looks like an address
   */
  looksLikeAddress(str) {
    if (!str || typeof str !== 'string') return false;
    // Match 0x followed by 40 hex characters
    return /^0x[0-9a-fA-F]{40}$/.test(str);
  }

  /**
   * Sanitizes a single address
   * @param {string} address - The address to sanitize
   * @returns {string} Sanitized address (e.g., "0x1234...abcd")
   */
  sanitizeAddress(address) {
    // If sanitization is disabled, return as-is
    if (!this.config.enabled) {
      return address;
    }

    // Validate input
    if (!address || typeof address !== 'string') {
      return address;
    }

    // Don't sanitize if not an address format
    if (!this.looksLikeAddress(address)) {
      return address;
    }

    // Don't sanitize whitelisted addresses
    if (this.isWhitelisted(address)) {
      return address;
    }

    // Sanitize: show prefix and suffix, hide middle
    const prefix = address.substring(0, this.config.visiblePrefix);
    const suffix = address.substring(address.length - this.config.visibleSuffix);
    const redacted = this.config.redactionChar.repeat(
      address.length - this.config.visiblePrefix - this.config.visibleSuffix
    );
    
    return `${prefix}${redacted}${suffix}`;
  }

  /**
   * Sanitizes all addresses in a string
   * @param {string} text - Text that may contain addresses
   * @returns {string} Text with addresses sanitized
   */
  sanitizeText(text) {
    if (!this.config.enabled || !text || typeof text !== 'string') {
      return text;
    }

    // Find and replace all address patterns
    return text.replace(/0x[0-9a-fA-F]{40}/g, (match) => {
      return this.sanitizeAddress(match);
    });
  }

  /**
   * Sanitizes addresses in an object (deep)
   * @param {any} obj - Object that may contain addresses
   * @returns {any} Object with addresses sanitized
   */
  sanitizeObject(obj) {
    if (!this.config.enabled) {
      return obj;
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle strings
    if (typeof obj === 'string') {
      return this.looksLikeAddress(obj) ? this.sanitizeAddress(obj) : this.sanitizeText(obj);
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    // Handle objects
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Creates a safe logger that sanitizes all output
   * @param {Object} logger - Original logger (e.g., console)
   * @returns {Object} Safe logger with sanitized output
   */
  createSafeLogger(logger = console) {
    const sanitizer = this;
    
    return {
      log(...args) {
        logger.log(...args.map(arg => sanitizer.sanitizeObject(arg)));
      },
      error(...args) {
        logger.error(...args.map(arg => sanitizer.sanitizeObject(arg)));
      },
      warn(...args) {
        logger.warn(...args.map(arg => sanitizer.sanitizeObject(arg)));
      },
      info(...args) {
        logger.info(...args.map(arg => sanitizer.sanitizeObject(arg)));
      },
      debug(...args) {
        logger.debug(...args.map(arg => sanitizer.sanitizeObject(arg)));
      }
    };
  }

  /**
   * Sanitizes HTTP request options before sending
   * Ensures addresses in URLs, headers, and body are sanitized for logging
   * @param {Object} options - HTTP request options
   * @returns {Object} Sanitized options (for logging only, not for actual request)
   */
  sanitizeRequestForLogging(options) {
    if (!this.config.enabled) {
      return options;
    }

    return this.sanitizeObject(options);
  }

  /**
   * Validates that no unsanitized addresses are in the output
   * @param {string} text - Text to validate
   * @param {Array<string>} allowedAddresses - Addresses that are allowed
   * @returns {Object} Validation result { valid: boolean, exposedAddresses: [] }
   */
  validateNoAddressLeaks(text, allowedAddresses = []) {
    if (!text || typeof text !== 'string') {
      return { valid: true, exposedAddresses: [] };
    }

    const addresses = text.match(/0x[0-9a-fA-F]{40}/g) || [];
    const exposedAddresses = addresses.filter(addr => {
      // Check if it's whitelisted or in allowed list
      const normalized = addr.toLowerCase();
      const isAllowed = this.isWhitelisted(addr) || 
        allowedAddresses.some(a => a.toLowerCase() === normalized);
      return !isAllowed;
    });

    return {
      valid: exposedAddresses.length === 0,
      exposedAddresses: [...new Set(exposedAddresses)]
    };
  }
}

/**
 * Global singleton instance
 */
const defaultSanitizer = new AddressSanitizer();

/**
 * Safe console logger with automatic sanitization
 */
const safeConsole = defaultSanitizer.createSafeLogger(console);

/**
 * Convenience function to sanitize an address
 * @param {string} address - The address to sanitize
 * @returns {string} Sanitized address
 */
function sanitize(address) {
  return defaultSanitizer.sanitizeAddress(address);
}

/**
 * Convenience function to sanitize text
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
  return defaultSanitizer.sanitizeText(text);
}

/**
 * Convenience function to sanitize objects
 * @param {any} obj - Object to sanitize
 * @returns {any} Sanitized object
 */
function sanitizeObject(obj) {
  return defaultSanitizer.sanitizeObject(obj);
}

/**
 * Enable/disable sanitization
 * @param {boolean} enabled - Whether to enable sanitization
 */
function setSanitizationEnabled(enabled) {
  defaultSanitizer.config.enabled = enabled;
}

/**
 * Add an address to the whitelist
 * @param {string} address - Address to whitelist
 */
function addToWhitelist(address) {
  if (!address) return;
  
  const normalized = address.toLowerCase();
  // Check if already whitelisted (case-insensitive)
  const alreadyWhitelisted = defaultSanitizer.config.whitelist.some(
    addr => addr.toLowerCase() === normalized
  );
  
  if (!alreadyWhitelisted) {
    defaultSanitizer.config.whitelist.push(normalized);
  }
}

module.exports = {
  AddressSanitizer,
  defaultSanitizer,
  safeConsole,
  sanitize,
  sanitizeText,
  sanitizeObject,
  setSanitizationEnabled,
  addToWhitelist,
  SECURITY_CONFIG
};
