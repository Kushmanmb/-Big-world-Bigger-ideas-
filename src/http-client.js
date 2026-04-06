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
 * Makes an HTTP/HTTPS POST request with form-encoded body
 * @param {Object} options - Request options
 * @param {string} options.hostname - The hostname to request
 * @param {number} [options.port] - The port (defaults to 443 for https, 80 for http)
 * @param {string} options.path - The request path
 * @param {string} [options.protocol='https'] - Protocol to use ('http' or 'https')
 * @param {Object} [options.headers] - Additional headers
 * @param {number} [options.timeout=10000] - Request timeout in milliseconds
 * @param {Object} options.body - Request body as key-value pairs (form-encoded)
 * @returns {Promise<any>} Parsed JSON response
 */
function makePostRequest(options) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'http' ? http : https;
    const port = options.port || (options.protocol === 'http' ? 80 : 443);
    const timeout = options.timeout || 10000;

    const bodyString = new URLSearchParams(options.body || {}).toString();

    const requestOptions = {
      hostname: options.hostname,
      port: port,
      path: options.path,
      method: 'POST',
      headers: Object.assign({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(bodyString),
        'User-Agent': 'kushmanmb/yaketh'
      }, options.headers || {})
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

    req.write(bodyString);
    req.end();
  });
}

/**
 * Request queue with active acknowledgements and rate limiting.
 * Queues incoming requests, immediately acknowledges each with a unique ID,
 * and processes them at a controlled rate to allow the team adequate time to
 * handle large volumes of incoming requests.
 */
class RequestQueue {
  /**
   * Creates a new request queue
   * @param {Object} [options] - Queue options
   * @param {number} [options.maxConcurrency=1] - Maximum number of concurrent requests
   * @param {number} [options.delay=1000] - Delay in milliseconds between requests
   */
  constructor(options = {}) {
    this.maxConcurrency = options.maxConcurrency || 1;
    this.delay = options.delay !== undefined ? options.delay : 1000;
    this._queue = [];
    this._active = 0;
    this._counter = 0;
  }

  /**
   * Enqueues a request function and returns an immediate acknowledgement.
   * The returned acknowledgement includes a unique queue ID and the promise
   * that resolves (or rejects) when the request is eventually processed.
   * @param {Function} fn - Async function representing the request to perform
   * @returns {{ queueId: string, status: string, position: number, promise: Promise<any> }}
   */
  enqueue(fn) {
    if (typeof fn !== 'function') {
      throw new Error('Request must be a function');
    }

    this._counter++;
    const queueId = `req_${Date.now()}_${this._counter}`;
    const position = this._queue.length + 1;

    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this._queue.push({ fn, resolve, reject });
    this._process();

    return {
      queueId,
      status: 'queued',
      position,
      promise
    };
  }

  /**
   * Returns the current number of requests waiting in the queue
   * @returns {number}
   */
  get size() {
    return this._queue.length;
  }

  /**
   * Returns the number of requests currently being processed
   * @returns {number}
   */
  get active() {
    return this._active;
  }

  /**
   * Clears all pending (unstarted) requests from the queue.
   * Active requests are not affected.
   */
  clear() {
    const pending = this._queue.splice(0);
    for (const item of pending) {
      item.reject(new Error('Queue cleared'));
    }
  }

  /**
   * Internal: starts processing queued requests up to maxConcurrency
   * @private
   */
  _process() {
    while (this._active < this.maxConcurrency && this._queue.length > 0) {
      const item = this._queue.shift();
      this._active++;
      this._run(item);
    }
  }

  /**
   * Internal: runs a single queued request then schedules the next
   * @param {{ fn: Function, resolve: Function, reject: Function }} item
   * @private
   */
  _run(item) {
    Promise.resolve()
      .then(() => item.fn())
      .then(
        (result) => {
          item.resolve(result);
          this._active--;
          if (this.delay > 0) {
            setTimeout(() => this._process(), this.delay);
          } else {
            this._process();
          }
        },
        (error) => {
          item.reject(error);
          this._active--;
          if (this.delay > 0) {
            setTimeout(() => this._process(), this.delay);
          } else {
            this._process();
          }
        }
      );
  }
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
  makePostRequest,
  CacheManager,
  RequestQueue
};
