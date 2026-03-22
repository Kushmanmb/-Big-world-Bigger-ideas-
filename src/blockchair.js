/**
 * Blockchair Multi-Chain Module
 * Provides functionality to fetch blockchain data from Blockchair API across multiple chains
 * 
 * API Documentation: https://blockchair.com/api/docs
 */

const { makeRequest, CacheManager } = require('./http-client');

class BlockchairFetcher {
  /**
   * Creates a new Blockchair fetcher instance
   * @param {string} chain - The blockchain to query (bitcoin, ethereum, litecoin, etc.)
   * @param {string} baseUrl - The base API URL (default: api.blockchair.com)
   */
  constructor(chain, baseUrl = 'api.blockchair.com') {
    if (!chain || typeof chain !== 'string') {
      throw new Error('Valid chain name is required');
    }
    
    this.chain = chain.toLowerCase();
    this.baseUrl = baseUrl;
    this.cacheManager = new CacheManager(60000); // 1 minute cache
    // Backward compatibility - expose cache and cacheTimeout
    this.cache = this.cacheManager.cache;
    this.cacheTimeout = this.cacheManager.cacheTimeout;
    
    // Supported chains
    this.supportedChains = [
      'bitcoin', 'ethereum', 'litecoin', 'bitcoin-cash', 
      'dogecoin', 'dash', 'ripple', 'groestlcoin', 
      'stellar', 'monero', 'cardano', 'zcash', 'mixin'
    ];
    
    if (!this.supportedChains.includes(this.chain)) {
      console.warn(`Warning: Chain '${this.chain}' may not be supported by Blockchair API`);
    }
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
   * Fetches general blockchain statistics
   * @returns {Promise<object>} Blockchain statistics
   * @throws {Error} If request fails
   */
  async getStats() {
    const endpoint = `/${this.chain}/stats`;
    const cacheKey = `${this.chain}-stats`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches information about a specific block
   * @param {number|string} blockId - Block height or hash
   * @returns {Promise<object>} Block information
   * @throws {Error} If blockId is invalid or request fails
   */
  async getBlock(blockId) {
    if (blockId === null || blockId === undefined || blockId === '') {
      throw new Error('Block ID is required');
    }

    const endpoint = `/${this.chain}/dashboards/block/${blockId}`;
    const cacheKey = `${this.chain}-block-${blockId}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches information about a specific address
   * @param {string} address - Blockchain address
   * @returns {Promise<object>} Address information
   * @throws {Error} If address is invalid or request fails
   */
  async getAddress(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Valid address string is required');
    }

    const endpoint = `/${this.chain}/dashboards/address/${address}`;
    const cacheKey = `${this.chain}-address-${address}`;

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

    // Basic hash validation (64 hex characters, with or without 0x prefix)
    if (!txHash.match(/^(0x)?[a-fA-F0-9]{64}$/)) {
      throw new Error('Invalid transaction hash format');
    }

    const endpoint = `/${this.chain}/dashboards/transaction/${txHash}`;
    const cacheKey = `${this.chain}-tx-${txHash}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches recent blocks from the blockchain
   * @param {number} limit - Number of blocks to fetch (default: 10, max: 100)
   * @returns {Promise<object>} Recent blocks data
   * @throws {Error} If limit is invalid or request fails
   */
  async getRecentBlocks(limit = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const endpoint = `/${this.chain}/blocks?limit=${limit}`;
    const cacheKey = `${this.chain}-recent-blocks-${limit}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches recent transactions from the blockchain
   * @param {number} limit - Number of transactions to fetch (default: 10, max: 100)
   * @returns {Promise<object>} Recent transactions data
   * @throws {Error} If limit is invalid or request fails
   */
  async getRecentTransactions(limit = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const endpoint = `/${this.chain}/transactions?limit=${limit}`;
    const cacheKey = `${this.chain}-recent-transactions-${limit}`;

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
    
    let output = `${this.chain.charAt(0).toUpperCase() + this.chain.slice(1)} Blockchain Statistics\n`;
    output += '='.repeat(50) + '\n\n';

    if (stats.blocks) {
      output += `Latest Block: ${stats.blocks.toLocaleString()}\n`;
    }
    if (stats.transactions) {
      output += `Total Transactions: ${stats.transactions.toLocaleString()}\n`;
    }
    if (stats.circulation) {
      const decimals = this.chain === 'ethereum' ? 18 : 8;
      const divisor = Math.pow(10, decimals);
      output += `Circulating Supply: ${(stats.circulation / divisor).toLocaleString()}\n`;
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

    const blockData = data.data || data;
    const block = blockData[Object.keys(blockData)[0]] || blockData;
    
    let output = `${this.chain.charAt(0).toUpperCase() + this.chain.slice(1)} Block Information\n`;
    output += '='.repeat(50) + '\n\n';

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

    const addressData = data.data || data;
    const address = addressData[Object.keys(addressData)[0]] || addressData;
    
    let output = `${this.chain.charAt(0).toUpperCase() + this.chain.slice(1)} Address Information\n`;
    output += '='.repeat(50) + '\n\n';

    if (address.address) {
      output += `Address: ${address.address}\n`;
    }
    if (address.balance !== undefined) {
      const decimals = this.chain === 'ethereum' ? 18 : 8;
      const divisor = Math.pow(10, decimals);
      output += `Balance: ${(address.balance / divisor).toFixed(8)}\n`;
    }
    if (address.transaction_count !== undefined) {
      output += `Transaction Count: ${address.transaction_count.toLocaleString()}\n`;
    }
    if (address.received !== undefined) {
      const decimals = this.chain === 'ethereum' ? 18 : 8;
      const divisor = Math.pow(10, decimals);
      output += `Total Received: ${(address.received / divisor).toFixed(8)}\n`;
    }
    if (address.spent !== undefined) {
      const decimals = this.chain === 'ethereum' ? 18 : 8;
      const divisor = Math.pow(10, decimals);
      output += `Total Spent: ${(address.spent / divisor).toFixed(8)}\n`;
    }

    return output;
  }

  /**
   * Formats transaction information for display
   * @param {object} data - Raw transaction data
   * @returns {string} Formatted output
   */
  formatTransaction(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    const txData = data.data || data;
    const tx = txData[Object.keys(txData)[0]] || txData;
    
    let output = `${this.chain.charAt(0).toUpperCase() + this.chain.slice(1)} Transaction Information\n`;
    output += '='.repeat(50) + '\n\n';

    if (tx.hash) {
      output += `Transaction Hash: ${tx.hash}\n`;
    }
    if (tx.time) {
      output += `Time: ${new Date(tx.time).toISOString()}\n`;
    }
    if (tx.block_id !== undefined) {
      output += `Block: ${tx.block_id}\n`;
    }
    if (tx.size) {
      output += `Size: ${tx.size} bytes\n`;
    }
    if (tx.fee !== undefined) {
      output += `Fee: ${tx.fee}\n`;
    }
    if (tx.input_count !== undefined) {
      output += `Inputs: ${tx.input_count}\n`;
    }
    if (tx.output_count !== undefined) {
      output += `Outputs: ${tx.output_count}\n`;
    }
    if (tx.input_total !== undefined) {
      output += `Input Total: ${tx.input_total}\n`;
    }
    if (tx.output_total !== undefined) {
      output += `Output Total: ${tx.output_total}\n`;
    }

    return output;
  }

  /**
   * Gets the list of supported chains
   * @returns {Array<string>} List of supported chain names
   */
  getSupportedChains() {
    return [...this.supportedChains];
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
      chain: this.chain,
      keys: Array.from(this.cacheManager.cache.keys())
    };
  }
}

// Export the class
module.exports = BlockchairFetcher;
