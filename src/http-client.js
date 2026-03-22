/**
 * Shared HTTP Client Module
 * 
 * This module provides common HTTP/HTTPS request functionality used across API modules
 * to reduce code duplication and maintain consistency.
 */

const https = require('https');
const http = require('http');

/**
 * Makes an HTTP/HTTPS GET request
 * @param {Object} options - Request options
 * @param {string} options.hostname - The hostname to request
 * @param {number} [options.port] - The port (defaults to 443 for https, 80 for http)
 * @param {string} options.path - The request path
 * @param {string} [options.protocol='https'] - Protocol to use ('http' or 'https')
 * @param {Object} [options.headers] - Additional headers
 * @param {number} [options.timeout=10000] - Request timeout in milliseconds
 * @returns {Promise<any>} Parsed JSON response
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'http' ? http : https;
    const port = options.port || (options.protocol === 'http' ? 80 : 443);
    const timeout = options.timeout || 10000;
    
    const requestOptions = {
      hostname: options.hostname,
      port: port,
      path: options.path,
      method: 'GET',
      headers: options.headers || {
        'User-Agent': 'kushmanmb/yaketh'
      }
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Simple cache manager for API responses
 */
class CacheManager {
  /**
   * Creates a new cache manager
   * @param {number} [timeout=60000] - Cache timeout in milliseconds (default: 1 minute)
   */
  constructor(timeout = 60000) {
    this.cache = new Map();
    this.cacheTimeout = timeout;
  }

  /**
   * Gets data from cache or fetches if not cached
   * @param {string} cacheKey - The cache key
   * @param {Function} fetcher - Function that returns a promise to fetch data
   * @returns {Promise<any>} Cached or fetched data
   */
  async getWithCache(cacheKey, fetcher) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  /**
   * Clears all cached data
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Gets a specific cached value
   * @param {string} cacheKey - The cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Sets a cached value
   * @param {string} cacheKey - The cache key
   * @param {any} data - Data to cache
   */
  set(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }
}

module.exports = {
  makeRequest,
  CacheManager
};
