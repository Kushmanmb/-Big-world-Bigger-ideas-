/**
 * Litecoin Blockchair Module
 * Provides functionality to fetch Litecoin blockchain data from Blockchair API
 * 
 * API Documentation: https://blockchair.com/api/docs
 */

const { makeRequest, CacheManager } = require('./http-client');

class LitecoinBlockchairFetcher {
  /**
   * Creates a new Litecoin Blockchair fetcher instance
   * @param {string} baseUrl - The base API URL (default: api.blockchair.com)
   */
  constructor(baseUrl = 'api.blockchair.com') {
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
        'User-Agent': 'LitecoinBlockchairFetcher/1.0'
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
   * Fetches general Litecoin blockchain statistics
   * @returns {Promise<object>} Blockchain statistics
   * @throws {Error} If request fails
   */
  async getStats() {
    const endpoint = '/litecoin/stats';
    const cacheKey = 'litecoin-stats';

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches information about a specific Litecoin block
   * @param {number|string} blockId - Block height or hash
   * @returns {Promise<object>} Block information
   * @throws {Error} If blockId is invalid or request fails
   */
  async getBlock(blockId) {
    if (blockId === null || blockId === undefined || blockId === '') {
      throw new Error('Block ID is required');
    }

    const endpoint = `/litecoin/dashboards/block/${blockId}`;
    const cacheKey = `block-${blockId}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches information about a specific Litecoin address
   * @param {string} address - Litecoin address
   * @returns {Promise<object>} Address information
   * @throws {Error} If address is invalid or request fails
   */
  async getAddress(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Valid address string is required');
    }

    // Basic Litecoin address validation
    if (!address.match(/^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/)) {
      throw new Error('Invalid Litecoin address format');
    }

    const endpoint = `/litecoin/dashboards/address/${address}`;
    const cacheKey = `address-${address}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches information about a specific transaction
   * @param {string} txHash - Transaction hash
   * @returns {Promise<object>} Transaction information
   * @throws {Error} If txHash is invalid or request fails
   */
  async getTransaction(txHash) {
    if (!txHash || typeof txHash !== 'string') {
      throw new Error('Valid transaction hash string is required');
    }

    // Basic hash validation (64 hex characters)
    if (!txHash.match(/^[a-fA-F0-9]{64}$/)) {
      throw new Error('Invalid transaction hash format');
    }

    const endpoint = `/litecoin/dashboards/transaction/${txHash}`;
    const cacheKey = `tx-${txHash}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches recent blocks from the Litecoin blockchain
   * @param {number} limit - Number of blocks to fetch (default: 10, max: 100)
   * @returns {Promise<object>} Recent blocks data
   * @throws {Error} If limit is invalid or request fails
   */
  async getRecentBlocks(limit = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const endpoint = `/litecoin/blocks?limit=${limit}`;
    const cacheKey = `recent-blocks-${limit}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Formats blockchain statistics for display
   * @param {object} data - Raw statistics data
   * @returns {string} Formatted output
   */
  formatStats(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    const stats = data.data || data;
    
    let output = 'Litecoin Blockchain Statistics\n';
    output += '================================\n\n';

    if (stats.blocks) {
      output += `Latest Block: ${stats.blocks.toLocaleString()}\n`;
    }
    if (stats.transactions) {
      output += `Total Transactions: ${stats.transactions.toLocaleString()}\n`;
    }
    if (stats.circulation) {
      output += `Circulating Supply: ${(stats.circulation / 100000000).toLocaleString()} LTC\n`;
    }
    if (stats.difficulty) {
      output += `Difficulty: ${stats.difficulty.toLocaleString()}\n`;
    }
    if (stats.hashrate_24h) {
      output += `24h Hashrate: ${stats.hashrate_24h}\n`;
    }
    if (stats.blockchain_size) {
      output += `Blockchain Size: ${(stats.blockchain_size / (1024 * 1024 * 1024)).toFixed(2)} GB\n`;
    }
    if (stats.nodes) {
      output += `Network Nodes: ${stats.nodes}\n`;
    }
    if (stats.market_price_usd) {
      output += `Market Price: $${stats.market_price_usd.toFixed(2)} USD\n`;
    }
    if (stats.market_cap_usd) {
      output += `Market Cap: $${(stats.market_cap_usd / 1000000).toFixed(2)}M USD\n`;
    }

    return output;
  }

  /**
   * Formats block information for display
   * @param {object} data - Raw block data
   * @returns {string} Formatted output
   */
  formatBlock(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    const block = data.data || data;
    
    let output = 'Litecoin Block Information\n';
    output += '================================\n\n';

    if (block.id) {
      output += `Block Height: ${block.id}\n`;
    }
    if (block.hash) {
      output += `Block Hash: ${block.hash}\n`;
    }
    if (block.time) {
      output += `Time: ${new Date(block.time).toISOString()}\n`;
    }
    if (block.transaction_count) {
      output += `Transactions: ${block.transaction_count}\n`;
    }
    if (block.size) {
      output += `Size: ${(block.size / 1024).toFixed(2)} KB\n`;
    }
    if (block.difficulty) {
      output += `Difficulty: ${block.difficulty.toLocaleString()}\n`;
    }

    return output;
  }

  /**
   * Formats address information for display
   * @param {object} data - Raw address data
   * @returns {string} Formatted output
   */
  formatAddress(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    const address = data.data || data;
    
    let output = 'Litecoin Address Information\n';
    output += '================================\n\n';

    if (address.address) {
      output += `Address: ${address.address}\n`;
    }
    if (address.balance !== undefined) {
      output += `Balance: ${(address.balance / 100000000).toFixed(8)} LTC\n`;
    }
    if (address.transaction_count !== undefined) {
      output += `Transaction Count: ${address.transaction_count.toLocaleString()}\n`;
    }
    if (address.received !== undefined) {
      output += `Total Received: ${(address.received / 100000000).toFixed(8)} LTC\n`;
    }
    if (address.spent !== undefined) {
      output += `Total Spent: ${(address.spent / 100000000).toFixed(8)} LTC\n`;
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
module.exports = LitecoinBlockchairFetcher;
