/**
 * Blockchain Path Fetcher Module
 * Fetches blockchain data for API paths relevant to kushmanmb
 * Supports fetching stats, address info, token balances, and recent blocks
 *
 * API Documentation: https://blockchair.com/api/docs
 */

const { makeRequest, CacheManager } = require('./http-client');

/**
 * Default owner address used across the repository
 */
const DEFAULT_OWNER = 'kushmanmb.eth';

/**
 * BlockchainPathFetcher
 * Provides targeted fetch access to Blockchair API paths relevant to a given owner
 */
class BlockchainPathFetcher {
  /**
   * Creates a new BlockchainPathFetcher instance
   * @param {string} owner - ENS name or Ethereum address of the owner (default: 'kushmanmb.eth')
   * @param {string} baseUrl - The Blockchair API hostname (default: 'api.blockchair.com')
   */
  constructor(owner = DEFAULT_OWNER, baseUrl = 'api.blockchair.com') {
    if (!owner || typeof owner !== 'string') {
      throw new Error('Owner must be a non-empty string');
    }

    this.owner = owner;
    this.baseUrl = baseUrl;
    this.cacheManager = new CacheManager(60000); // 1 minute cache

    // All Blockchair API paths relevant to the owner
    this.paths = {
      stats: '/ethereum/stats',
      address: `/ethereum/dashboards/address/${this.owner}`,
      recentBlocks: '/ethereum/blocks?limit=10',
      recentTransactions: '/ethereum/transactions?limit=10'
    };
  }

  /**
   * Returns all defined API paths for this owner
   * @returns {Object} Map of path key to path string
   */
  getRelevantPaths() {
    return { ...this.paths };
  }

  /**
   * Returns all defined path keys
   * @returns {string[]} Array of path key names
   */
  getPathKeys() {
    return Object.keys(this.paths);
  }

  /**
   * Makes an HTTPS GET request to the Blockchair API
   * @param {string} path - The API endpoint path
   * @returns {Promise<any>} Parsed JSON response
   * @private
   */
  _makeRequest(path) {
    return makeRequest({
      hostname: this.baseUrl,
      path,
      headers: {
        'User-Agent': 'BlockchainPathFetcher/1.0'
      }
    });
  }

  /**
   * Fetches data for a single path key
   * @param {string} pathKey - One of the keys returned by getPathKeys()
   * @returns {Promise<any>} Parsed API response
   * @throws {Error} If the path key is unknown or the request fails
   */
  async fetchPath(pathKey) {
    if (!pathKey || typeof pathKey !== 'string') {
      throw new Error('Path key must be a non-empty string');
    }

    const path = this.paths[pathKey];
    if (!path) {
      throw new Error(`Unknown path key: '${pathKey}'. Valid keys: ${this.getPathKeys().join(', ')}`);
    }

    const cacheKey = `${this.owner}-${pathKey}`;
    return this.cacheManager.getWithCache(cacheKey, () => this._makeRequest(path));
  }

  /**
   * Fetches data for all relevant paths concurrently
   * Results are keyed by the path key; failed fetches store an Error object
   * @returns {Promise<Object>} Map of pathKey -> data (or Error on failure)
   */
  async fetchAllPaths() {
    const keys = this.getPathKeys();

    const results = await Promise.allSettled(
      keys.map(key => this.fetchPath(key))
    );

    const output = {};
    keys.forEach((key, index) => {
      const result = results[index];
      output[key] = result.status === 'fulfilled' ? result.value : result.reason;
    });

    return output;
  }

  /**
   * Fetches Ethereum blockchain statistics
   * @returns {Promise<Object>} Ethereum stats
   */
  async getStats() {
    return this.fetchPath('stats');
  }

  /**
   * Fetches address information for the owner
   * @returns {Promise<Object>} Address data
   */
  async getOwnerAddress() {
    return this.fetchPath('address');
  }

  /**
   * Fetches the most recent Ethereum blocks
   * @returns {Promise<Object>} Recent blocks
   */
  async getRecentBlocks() {
    return this.fetchPath('recentBlocks');
  }

  /**
   * Fetches the most recent Ethereum transactions
   * @returns {Promise<Object>} Recent transactions
   */
  async getRecentTransactions() {
    return this.fetchPath('recentTransactions');
  }

  /**
   * Formats fetched results for human-readable display
   * @param {Object} results - Output from fetchAllPaths()
   * @returns {string} Formatted report string
   */
  formatResults(results) {
    if (!results || typeof results !== 'object') {
      return 'No results available';
    }

    let output = `Blockchain Data Report for ${this.owner}\n`;
    output += '='.repeat(60) + '\n\n';

    for (const [key, data] of Object.entries(results)) {
      const path = this.paths[key] || key;
      output += `## ${key}\n`;
      output += `Path: ${path}\n`;

      if (data instanceof Error) {
        output += `Status: Error - ${data.message}\n`;
      } else if (data && typeof data === 'object') {
        output += `Status: OK\n`;

        const inner = data.data || data;

        // Stats summary
        if (key === 'stats' && inner.blocks) {
          output += `Latest Block: ${inner.blocks.toLocaleString()}\n`;
          if (inner.transactions) {
            output += `Total Transactions: ${inner.transactions.toLocaleString()}\n`;
          }
          if (inner.market_price_usd) {
            output += `ETH Price: $${inner.market_price_usd.toFixed(2)} USD\n`;
          }
        }

        // Address summary
        if (key === 'address') {
          const addrData = inner[Object.keys(inner)[0]] || inner;
          if (addrData && addrData.address) {
            const balance = addrData.balance !== undefined
              ? (addrData.balance / 1e18).toFixed(6)
              : 'N/A';
            output += `Address: ${addrData.address}\n`;
            output += `Balance: ${balance} ETH\n`;
            if (addrData.transaction_count !== undefined) {
              output += `Transactions: ${addrData.transaction_count.toLocaleString()}\n`;
            }
          }
        }

        // Recent blocks summary
        if (key === 'recentBlocks' && Array.isArray(inner)) {
          inner.slice(0, 3).forEach((block, i) => {
            output += `Block ${i + 1}: #${block.id} (${block.transaction_count} txs)\n`;
          });
        }
      } else {
        output += `Status: No data\n`;
      }

      output += '\n';
    }

    return output.trimEnd();
  }

  /**
   * Clears all cached responses
   */
  clearCache() {
    this.cacheManager.clearCache();
  }

  /**
   * Returns cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cacheManager.cache.size,
      timeout: this.cacheManager.cacheTimeout,
      owner: this.owner,
      keys: Array.from(this.cacheManager.cache.keys())
    };
  }
}

module.exports = { BlockchainPathFetcher, DEFAULT_OWNER };
