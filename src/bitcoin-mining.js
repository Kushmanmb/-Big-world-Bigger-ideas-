/**
 * Bitcoin Mining Block Rewards Module
 * Provides functionality to fetch mining block rewards data from mempool.space API
 * 
 * API Documentation: https://mempool.space/docs/api/rest
 */

const { makeRequest, CacheManager } = require('./http-client');

class BitcoinMiningFetcher {
  /**
   * Creates a new Bitcoin Mining fetcher instance
   * @param {string} baseUrl - The base API URL (default: https://mempool.space)
   */
  constructor(baseUrl = 'mempool.space') {
    this.baseUrl = baseUrl;
    this.cacheManager = new CacheManager(60000); // 1 minute cache
    // Backward compatibility - expose cache and cacheTimeout
    this.cache = this.cacheManager.cache;
    this.cacheTimeout = this.cacheManager.cacheTimeout;
  }

  /**
   * Makes an HTTPS GET request to the API
   * @param {string} endpoint - The API endpoint path
   * @returns {Promise<any>} Parsed JSON response
   * @private
   */
  _makeRequest(endpoint) {
    return makeRequest({
      hostname: this.baseUrl,
      path: endpoint,
      headers: {
        'User-Agent': 'kushmanmb/yaketh'
      }
    });
  }

  /**
   * Gets data from cache or fetches if not cached
   * @param {string} cacheKey - The cache key
   * @param {Function} fetcher - Function that returns a promise to fetch data
   * @returns {Promise<any>} Cached or fetched data
   * @private
   */
  async _getWithCache(cacheKey, fetcher) {
    return await this.cacheManager.getWithCache(cacheKey, fetcher);
  }

  /**
   * Fetches mining block rewards for a specified time period
   * @param {string} period - Time period: '1d', '3d', '1w', '1m', '3m', '6m', '1y', '2y', '3y', 'all'
   * @returns {Promise<object>} Block rewards data
   * @throws {Error} If period is invalid or request fails
   */
  async getBlockRewards(period = '1d') {
    const validPeriods = ['1d', '3d', '1w', '1m', '3m', '6m', '1y', '2y', '3y', 'all'];
    
    if (!validPeriods.includes(period)) {
      throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`);
    }

    const endpoint = `/api/v1/mining/blocks/rewards/${period}`;
    const cacheKey = `block-rewards-${period}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches mining pool statistics for a specified time period
   * @param {string} period - Time period: '24h', '3d', '1w', '1m', '3m', '6m', '1y', '2y', '3y', 'all'
   * @returns {Promise<object>} Mining pool statistics
   */
  async getMiningPools(period = '1w') {
    const endpoint = `/api/v1/mining/pools/${period}`;
    const cacheKey = `mining-pools-${period}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches mining hashrate data for a specified time period
   * @param {string} period - Time period: '1d', '3d', '1w', '1m', '3m', '6m', '1y', '2y', '3y', 'all'
   * @returns {Promise<object>} Hashrate data
   */
  async getHashrate(period = '1w') {
    const endpoint = `/api/v1/mining/hashrate/${period}`;
    const cacheKey = `hashrate-${period}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches network difficulty adjustment data
   * @returns {Promise<object>} Difficulty adjustment data
   */
  async getDifficultyAdjustment() {
    const endpoint = '/api/v1/mining/difficulty-adjustments/1m';
    const cacheKey = 'difficulty-adjustment';

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Formats block rewards data for display
   * @param {object} data - Raw block rewards data
   * @returns {string} Formatted output
   */
  formatBlockRewards(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    let output = 'Bitcoin Mining Block Rewards\n';
    output += '================================\n\n';

    if (Array.isArray(data)) {
      // If data is an array of reward entries
      output += `Total entries: ${data.length}\n\n`;
      
      data.slice(0, 10).forEach((entry, index) => {
        output += `Entry ${index + 1}:\n`;
        if (entry.avgRewards) output += `  Average Rewards: ${entry.avgRewards} BTC\n`;
        if (entry.timestamp) output += `  Timestamp: ${new Date(entry.timestamp * 1000).toISOString()}\n`;
        if (entry.totalRewards) output += `  Total Rewards: ${entry.totalRewards} BTC\n`;
        if (entry.blockCount) output += `  Block Count: ${entry.blockCount}\n`;
        output += '\n';
      });

      if (data.length > 10) {
        output += `... and ${data.length - 10} more entries\n`;
      }
    } else {
      // If data is an object with various fields
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null) {
          output += `${key}: ${JSON.stringify(value, null, 2)}\n`;
        } else {
          output += `${key}: ${value}\n`;
        }
      }
    }

    return output;
  }

  /**
   * Clears the cache
   */
  clearCache() {
    this.cacheManager.clearCache();
  }

  /**
   * Gets cache statistics
   * @returns {object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cacheManager.cache.size,
      timeout: this.cacheManager.cacheTimeout,
      keys: Array.from(this.cacheManager.cache.keys())
    };
  }
}

// Export the class
module.exports = BitcoinMiningFetcher;
