/**
 * Etherscan Stats Module
 * Fetches blockchain statistics from Etherscan API v2
 * Supports daily block rewards and other stats actions
 *
 * API Documentation: https://docs.etherscan.io/etherscan-v2
 */

const { makeRequest, CacheManager } = require('./http-client');

class EtherscanStats {
  /**
   * Creates a new EtherscanStats instance
   * @param {string} apiKey - Etherscan API key (required)
   * @param {number} chainId - Chain ID (default: 1 for Ethereum mainnet)
   */
  constructor(apiKey = null, chainId = 1) {
    if (!apiKey) {
      throw new Error('API key is required for Etherscan stats. Please provide a valid API key.');
    }

    this.apiKey = apiKey;
    this.chainId = chainId;
    this.apiBaseUrl = 'api.etherscan.io';
    this.cacheManager = new CacheManager(60000); // 1 minute cache
    // Backward compatibility - expose cache and cacheTimeout
    this.cache = this.cacheManager.cache;
    this.cacheTimeout = this.cacheManager.cacheTimeout;
  }

  /**
   * Validates a date string in YYYY-MM-DD format
   * @param {string} date - Date string to validate
   * @returns {string} Validated date string
   * @throws {Error} If date format is invalid
   */
  validateDate(date) {
    if (!date || typeof date !== 'string') {
      throw new Error('Date must be a non-empty string');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date value: ${date}`);
    }

    return date;
  }

  /**
   * Validates the sort parameter
   * @param {string} sort - Sort order ('asc' or 'desc')
   * @returns {string} Validated sort value
   * @throws {Error} If sort value is invalid
   */
  validateSort(sort) {
    const validSorts = ['asc', 'desc'];
    if (!validSorts.includes(sort)) {
      throw new Error(`Invalid sort value. Must be one of: ${validSorts.join(', ')}`);
    }
    return sort;
  }

  /**
   * Makes an HTTPS request to the Etherscan API v2
   * @param {object} params - Query parameters
   * @returns {Promise<object>} API response
   * @private
   */
  async _makeRequest(params) {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/v2/api?${queryParams}`;

    return makeRequest({
      hostname: this.apiBaseUrl,
      path: url,
      headers: {
        'Content-Type': 'application/json',
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
   * Fetches daily block rewards for a date range
   * @param {string} startdate - Start date in YYYY-MM-DD format
   * @param {string} enddate - End date in YYYY-MM-DD format
   * @param {string} sort - Sort order: 'asc' or 'desc' (default: 'asc')
   * @returns {Promise<object>} Daily block rewards data
   * @throws {Error} If parameters are invalid or request fails
   */
  async getDailyBlockRewards(startdate, enddate, sort = 'asc') {
    const validatedStart = this.validateDate(startdate);
    const validatedEnd = this.validateDate(enddate);
    const validatedSort = this.validateSort(sort);

    if (new Date(validatedStart) > new Date(validatedEnd)) {
      throw new Error('startdate must be before or equal to enddate');
    }

    const cacheKey = `daily-block-rewards_${this.chainId}_${validatedStart}_${validatedEnd}_${validatedSort}`;

    return await this._getWithCache(cacheKey, async () => {
      try {
        const params = {
          chainid: this.chainId.toString(),
          module: 'stats',
          action: 'dailyblockrewards',
          startdate: validatedStart,
          enddate: validatedEnd,
          sort: validatedSort,
          apikey: this.apiKey
        };

        const response = await this._makeRequest(params);

        if (response.status !== '1') {
          throw new Error(response.message || 'Failed to fetch daily block rewards from Etherscan');
        }

        return {
          chainId: this.chainId,
          startdate: validatedStart,
          enddate: validatedEnd,
          sort: validatedSort,
          rewards: response.result || [],
          status: response.status,
          message: response.message,
          timestamp: Date.now()
        };
      } catch (error) {
        throw new Error(`Error fetching daily block rewards: ${error.message}`);
      }
    });
  }

  /**
   * Formats daily block rewards data for display
   * @param {object} data - Daily block rewards data
   * @returns {string} Formatted output
   */
  formatDailyBlockRewards(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    let output = 'Ethereum Daily Block Rewards\n';
    output += '================================\n\n';
    output += `Chain ID: ${data.chainId}\n`;
    output += `Period: ${data.startdate} to ${data.enddate}\n`;
    output += `Sort: ${data.sort}\n`;
    output += `Total Entries: ${data.rewards ? data.rewards.length : 0}\n\n`;

    if (data.rewards && Array.isArray(data.rewards) && data.rewards.length > 0) {
      output += 'Daily Rewards:\n';
      output += '-'.repeat(70) + '\n\n';

      data.rewards.forEach((entry, index) => {
        output += `Day ${index + 1}:\n`;
        if (entry.UTCDate) output += `  Date: ${entry.UTCDate}\n`;
        if (entry.blockRewards_Eth !== undefined) output += `  Block Rewards: ${entry.blockRewards_Eth} ETH\n`;
        if (entry.blockCount !== undefined) output += `  Block Count: ${entry.blockCount}\n`;
        if (entry.uncleInclusionRewards_Eth !== undefined) output += `  Uncle Inclusion Rewards: ${entry.uncleInclusionRewards_Eth} ETH\n`;
        output += '\n';
      });
    } else {
      output += 'No reward entries found for this date range.\n';
    }

    return output;
  }

  /**
   * Clears the internal cache
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

  /**
   * Gets API information
   * @returns {object} API configuration
   */
  getAPIInfo() {
    return {
      baseUrl: this.apiBaseUrl,
      chainId: this.chainId,
      hasApiKey: !!this.apiKey,
      cacheTimeout: this.cacheTimeout
    };
  }
}

module.exports = EtherscanStats;
