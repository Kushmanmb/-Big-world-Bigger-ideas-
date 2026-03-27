/**
 * Ethereum Blockchair Module
 * Provides functionality to fetch Ethereum blockchain data from Blockchair API
 * Supports ENS name resolution for addresses
 * 
 * API Documentation: https://blockchair.com/api/docs
 */

const { makeRequest, CacheManager } = require('./http-client');

class EthereumBlockchairFetcher {
  /**
   * Creates a new Ethereum Blockchair fetcher instance
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
        'User-Agent': 'EthereumBlockchairFetcher/1.0'
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
   * Validates Ethereum address format
   * @param {string} address - Address to validate
   * @returns {boolean} True if valid
   * @private
   */
  _isValidEthereumAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }
    // Ethereum address: 0x followed by 40 hex characters (case insensitive), or ENS name
    const addressPattern = /^0x[a-fA-F0-9]{40}$/;
    const ensPattern = /\.eth$/;
    return addressPattern.test(address) || ensPattern.test(address);
  }

  /**
   * Fetches general Ethereum blockchain statistics
   * @returns {Promise<object>} Blockchain statistics
   * @throws {Error} If request fails
   */
  async getStats() {
    const endpoint = '/ethereum/stats';
    const cacheKey = 'ethereum-stats';

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches information about a specific Ethereum block
   * @param {number|string} blockId - Block height or hash
   * @returns {Promise<object>} Block information
   * @throws {Error} If blockId is invalid or request fails
   */
  async getBlock(blockId) {
    if (blockId === null || blockId === undefined || blockId === '') {
      throw new Error('Block ID is required');
    }

    const endpoint = `/ethereum/dashboards/block/${blockId}`;
    const cacheKey = `block-${blockId}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches information about a specific Ethereum address
   * Supports both regular addresses (0x...) and ENS names (.eth)
   * @param {string} address - Ethereum address or ENS name
   * @returns {Promise<object>} Address information
   * @throws {Error} If address is invalid or request fails
   */
  async getAddress(address) {
    if (!this._isValidEthereumAddress(address)) {
      throw new Error('Invalid Ethereum address or ENS name format');
    }

    const endpoint = `/ethereum/dashboards/address/${address}`;
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

    // Basic hash validation (64 hex characters, with optional 0x prefix)
    const cleanHash = txHash.startsWith('0x') ? txHash.slice(2) : txHash;
    if (!cleanHash.match(/^[a-fA-F0-9]{64}$/)) {
      throw new Error('Invalid transaction hash format');
    }

    const endpoint = `/ethereum/dashboards/transaction/${txHash}`;
    const cacheKey = `tx-${txHash}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches recent blocks from the Ethereum blockchain
   * @param {number} limit - Number of blocks to fetch (default: 10, max: 100)
   * @returns {Promise<object>} Recent blocks data
   * @throws {Error} If limit is invalid or request fails
   */
  async getRecentBlocks(limit = 10) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const endpoint = `/ethereum/blocks?limit=${limit}`;
    const cacheKey = `recent-blocks-${limit}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches ERC-20 token balances for an address
   * @param {string} address - Ethereum address or ENS name
   * @returns {Promise<object>} Token balances
   * @throws {Error} If address is invalid or request fails
   */
  async getTokenBalances(address) {
    if (!this._isValidEthereumAddress(address)) {
      throw new Error('Invalid Ethereum address or ENS name format');
    }

    const endpoint = `/ethereum/dashboards/address/${address}?erc_20=true`;
    const cacheKey = `tokens-${address}`;

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
    
    let output = 'Ethereum Blockchain Statistics\n';
    output += '================================\n\n';

    if (stats.blocks) {
      output += `Latest Block: ${stats.blocks.toLocaleString()}\n`;
    }
    if (stats.transactions) {
      output += `Total Transactions: ${stats.transactions.toLocaleString()}\n`;
    }
    if (stats.circulation) {
      const circulation = typeof stats.circulation === 'bigint' 
        ? Number(stats.circulation) / 1e18 
        : stats.circulation / 1e18;
      output += `Circulating Supply: ${circulation.toLocaleString()} ETH\n`;
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
      output += `Market Cap: $${(stats.market_cap_usd / 1000000000).toFixed(2)}B USD\n`;
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
    
    let output = 'Ethereum Block Information\n';
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

    const address = data.data ? data.data[Object.keys(data.data)[0]] : data;
    const addressKey = Object.keys(data.data || {})[0] || 'unknown';
    
    let output = 'Ethereum Address Information\n';
    output += '================================\n\n';

    output += `Address: ${addressKey}\n`;
    
    if (address && address.address) {
      if (address.address.balance !== undefined) {
        const balance = typeof address.address.balance === 'bigint' 
          ? Number(address.address.balance) / 1e18 
          : address.address.balance / 1e18;
        output += `Balance: ${balance.toFixed(8)} ETH\n`;
      }
      if (address.address.transaction_count !== undefined) {
        output += `Transaction Count: ${address.address.transaction_count.toLocaleString()}\n`;
      }
      if (address.address.received_approximate !== undefined) {
        const received = typeof address.address.received_approximate === 'bigint' 
          ? Number(address.address.received_approximate) / 1e18 
          : address.address.received_approximate / 1e18;
        output += `Total Received: ${received.toFixed(8)} ETH\n`;
      }
      if (address.address.spent_approximate !== undefined) {
        const spent = typeof address.address.spent_approximate === 'bigint' 
          ? Number(address.address.spent_approximate) / 1e18 
          : address.address.spent_approximate / 1e18;
        output += `Total Spent: ${spent.toFixed(8)} ETH\n`;
      }
      if (address.address.first_seen_receiving) {
        output += `First Seen: ${new Date(address.address.first_seen_receiving).toISOString()}\n`;
      }
    }

    return output;
  }

  /**
   * Formats token balances for display
   * @param {object} data - Raw token data
   * @returns {string} Formatted output
   */
  formatTokenBalances(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    const addressKey = Object.keys(data.data || {})[0] || 'unknown';
    const address = data.data ? data.data[addressKey] : data;
    
    let output = 'ERC-20 Token Balances\n';
    output += '================================\n\n';

    if (address && address.layer_2 && address.layer_2.erc_20) {
      const tokens = address.layer_2.erc_20;
      if (tokens.length === 0) {
        output += 'No ERC-20 tokens found\n';
      } else {
        tokens.forEach((token, index) => {
          output += `Token ${index + 1}:\n`;
          output += `  Name: ${token.token_name || 'Unknown'}\n`;
          output += `  Symbol: ${token.token_symbol || 'Unknown'}\n`;
          output += `  Balance: ${token.balance || '0'}\n`;
          output += `  Contract: ${token.token_address || 'Unknown'}\n`;
          output += '\n';
        });
      }
    } else {
      output += 'No token data available\n';
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
module.exports = EthereumBlockchairFetcher;
