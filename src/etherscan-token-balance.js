/**
 * Etherscan Token Balance Fetcher Module
 * Fetches ERC-20 and ERC-721 token balances from Etherscan API
 */

const { makeRequest, CacheManager } = require('./http-client');

class EtherscanTokenBalanceFetcher {
  /**
   * Creates a new Etherscan Token Balance Fetcher instance
   * @param {string} apiKey - Etherscan API key
   * @param {number} chainId - Chain ID (1 for Ethereum mainnet, 8453 for Base, etc.)
   */
  constructor(apiKey = null, chainId = 1) {
    this.apiKey = apiKey;
    this.chainId = chainId;
    this.apiBaseUrl = 'api.etherscan.io';
    this.cacheManager = new CacheManager(60000); // 1 minute cache
    // Backward compatibility - expose cache and cacheTimeout
    this.cache = this.cacheManager.cache;
    this.cacheTimeout = this.cacheManager.cacheTimeout;
  }

  /**
   * Validates an Ethereum address
   * @param {string} address - The address to validate
   * @returns {string} Validated address
   * @throws {Error} If address is invalid
   */
  validateAddress(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Address must be a non-empty string');
    }
    
    // Remove 0x prefix if present
    const cleanAddress = address.toLowerCase().replace(/^0x/, '');
    
    // Check if address is 40 hex characters
    if (!/^[0-9a-f]{40}$/i.test(cleanAddress)) {
      throw new Error('Invalid Ethereum address format');
    }
    
    return '0x' + cleanAddress;
  }

  /**
   * Makes an HTTPS request to the Etherscan API
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
   * Fetches token balances for an address
   * @param {string} address - The wallet address
   * @param {number} page - Page number (default: 1)
   * @param {number} offset - Results per page (default: 100, max: 100)
   * @returns {Promise<object>} Token balance data
   * @throws {Error} If address is invalid or request fails
   */
  async getTokenBalances(address, page = 1, offset = 100) {
    const validatedAddress = this.validateAddress(address);
    
    // Validate pagination parameters
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page must be a positive integer');
    }
    
    if (!Number.isInteger(offset) || offset < 1 || offset > 100) {
      throw new Error('Offset must be between 1 and 100');
    }

    if (!this.apiKey) {
      throw new Error('API key is required to fetch token balances from Etherscan');
    }

    const cacheKey = `token-balance_${this.chainId}_${validatedAddress}_${page}_${offset}`;

    return await this._getWithCache(cacheKey, async () => {
      try {
        const params = {
          chainid: this.chainId.toString(),
          module: 'account',
          action: 'addresstokenbalance',
          address: validatedAddress,
          page: page.toString(),
          offset: offset.toString(),
          apikey: this.apiKey
        };

        const response = await this._makeRequest(params);

        // Check if the API returned an error
        if (response.status !== '1') {
          throw new Error(response.message || 'Failed to fetch token balances from Etherscan');
        }

        const result = {
          address: validatedAddress,
          chainId: this.chainId,
          page: page,
          offset: offset,
          tokens: response.result || [],
          status: response.status,
          message: response.message,
          timestamp: Date.now()
        };

        return result;
      } catch (error) {
        throw new Error(`Error fetching token balances: ${error.message}`);
      }
    });
  }

  /**
   * Formats token balance data for display
   * @param {object} data - Token balance data
   * @returns {string} Formatted output
   */
  formatTokenBalances(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    let output = 'Token Balances for Address\n';
    output += '================================\n\n';
    output += `Address: ${data.address}\n`;
    output += `Chain ID: ${data.chainId}\n`;
    output += `Page: ${data.page}\n`;
    output += `Offset: ${data.offset}\n`;
    output += `Total Tokens: ${data.tokens ? data.tokens.length : 0}\n\n`;

    if (data.tokens && Array.isArray(data.tokens) && data.tokens.length > 0) {
      output += 'Token Details:\n';
      output += '-'.repeat(70) + '\n\n';

      data.tokens.forEach((token, index) => {
        output += `Token ${index + 1}:\n`;
        if (token.TokenName) output += `  Name: ${token.TokenName}\n`;
        if (token.TokenSymbol) output += `  Symbol: ${token.TokenSymbol}\n`;
        if (token.TokenQuantity) output += `  Balance: ${token.TokenQuantity}\n`;
        if (token.TokenDivisor) output += `  Divisor: ${token.TokenDivisor}\n`;
        if (token.TokenAddress) output += `  Contract: ${token.TokenAddress}\n`;
        if (token.TokenType) output += `  Type: ${token.TokenType}\n`;
        output += '\n';
      });
    } else {
      output += 'No tokens found for this address.\n';
    }

    return output;
  }

  /**
   * Filters tokens by type (e.g., ERC-20, ERC-721)
   * @param {Array} tokens - Array of token objects
   * @param {string} tokenType - Token type to filter by
   * @returns {Array} Filtered tokens
   */
  static filterTokensByType(tokens, tokenType) {
    if (!Array.isArray(tokens)) {
      throw new Error('Tokens must be an array');
    }

    if (!tokenType || typeof tokenType !== 'string') {
      throw new Error('Token type must be a non-empty string');
    }

    return tokens.filter(token => token.TokenType === tokenType);
  }

  /**
   * Gets total number of tokens
   * @param {object} data - Token balance data
   * @returns {number} Total token count
   */
  static getTotalTokenCount(data) {
    if (!data || !data.tokens || !Array.isArray(data.tokens)) {
      return 0;
    }

    return data.tokens.length;
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

module.exports = EtherscanTokenBalanceFetcher;
