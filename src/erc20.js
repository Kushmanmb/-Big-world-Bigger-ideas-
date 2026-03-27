/**
 * ERC-20 Token Balance Module
 * Provides functionality to fetch ERC-20 token balances for Ethereum addresses
 * Uses Blockchair API for reliable data fetching without requiring API keys
 */

const https = require('https');

/**
 * ERC-20 Standard ABI functions
 */
const ERC20_ABI = {
  balanceOf: {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
    signature: '0x70a08231'
  },
  totalSupply: {
    name: 'totalSupply',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'supply', type: 'uint256' }],
    signature: '0x18160ddd'
  },
  name: {
    name: 'name',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'name', type: 'string' }],
    signature: '0x06fdde03'
  },
  symbol: {
    name: 'symbol',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'symbol', type: 'string' }],
    signature: '0x95d89b41'
  },
  decimals: {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'decimals', type: 'uint8' }],
    signature: '0x313ce567'
  }
};

class ERC20Fetcher {
  /**
   * Creates a new ERC-20 token balance fetcher instance
   * @param {string} baseUrl - The base API URL (default: api.blockchair.com)
   */
  constructor(baseUrl = 'api.blockchair.com') {
    this.baseUrl = baseUrl;
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache
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
    
    // Check if it's an ENS name
    if (/\.eth$/i.test(address)) {
      return address.toLowerCase();
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
   * Makes an HTTPS GET request to the API
   * @param {string} endpoint - The API endpoint path
   * @returns {Promise<any>} Parsed JSON response
   * @private
   */
  _makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: endpoint,
        method: 'GET',
        headers: {
          'User-Agent': 'ERC20Fetcher/1.0'
        }
      };

      const req = https.request(options, (res) => {
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

      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
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
   * Fetches ERC-20 token balances for an Ethereum address
   * @param {string} address - Ethereum address or ENS name
   * @returns {Promise<object>} Token balance data including all ERC-20 tokens
   * @throws {Error} If address is invalid or request fails
   */
  async getTokenBalances(address) {
    const validatedAddress = this.validateAddress(address);
    
    const endpoint = `/ethereum/dashboards/address/${validatedAddress}?erc_20=true`;
    const cacheKey = `erc20-balances-${validatedAddress}`;

    try {
      const response = await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
      
      // Extract ERC-20 token data from response
      const addressData = response.data?.[validatedAddress];
      if (!addressData) {
        throw new Error('No data returned for address');
      }

      const tokenBalances = addressData.layer_2?.erc_20 || [];
      
      return {
        address: validatedAddress,
        tokenCount: tokenBalances.length,
        tokens: tokenBalances.map(token => ({
          tokenAddress: token.token_address,
          tokenName: token.token_name || 'Unknown',
          tokenSymbol: token.token_symbol || 'UNKNOWN',
          tokenDecimals: token.token_decimals || 18,
          balance: token.balance,
          balanceApproximate: token.balance_approximate || 0,
          usdValue: token.balance_usd || null
        })),
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Error fetching token balances: ${error.message}`);
    }
  }

  /**
   * Gets all unique tokens from multiple addresses
   * @param {Array<string>} addresses - Array of Ethereum addresses
   * @returns {Promise<object>} Consolidated token data
   */
  async consolidateTokens(addresses) {
    if (!Array.isArray(addresses) || addresses.length === 0) {
      throw new Error('Addresses must be a non-empty array');
    }

    const allBalances = await Promise.all(
      addresses.map(addr => this.getTokenBalances(addr).catch(err => {
        console.warn(`Failed to fetch tokens for ${addr}: ${err.message}`);
        return { address: addr, tokens: [], tokenCount: 0 };
      }))
    );

    // Consolidate tokens by token address
    const tokenMap = new Map();
    const addressTokens = new Map();

    allBalances.forEach(balanceData => {
      addressTokens.set(balanceData.address, balanceData.tokens);
      
      balanceData.tokens.forEach(token => {
        const key = token.tokenAddress.toLowerCase();
        if (!tokenMap.has(key)) {
          tokenMap.set(key, {
            tokenAddress: token.tokenAddress,
            tokenName: token.tokenName,
            tokenSymbol: token.tokenSymbol,
            tokenDecimals: token.tokenDecimals,
            totalBalance: 0,
            totalUsdValue: 0,
            holders: []
          });
        }
        
        const consolidated = tokenMap.get(key);
        consolidated.totalBalance += parseFloat(token.balance || 0);
        consolidated.totalUsdValue += parseFloat(token.usdValue || 0);
        consolidated.holders.push({
          address: balanceData.address,
          balance: token.balance,
          usdValue: token.usdValue
        });
      });
    });

    return {
      addresses: addresses,
      uniqueTokens: tokenMap.size,
      totalAddresses: addresses.length,
      tokens: Array.from(tokenMap.values()),
      byAddress: Object.fromEntries(addressTokens),
      timestamp: Date.now()
    };
  }

  /**
   * Formats token balance data for display
   * @param {object} data - Token balance data from getTokenBalances
   * @returns {string} Formatted output
   */
  formatTokenBalances(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    let output = `ERC-20 Token Balances\n`;
    output += `${'='.repeat(70)}\n\n`;
    output += `Address: ${data.address}\n`;
    output += `Total Tokens: ${data.tokenCount}\n`;
    output += `Fetched: ${new Date(data.timestamp).toISOString()}\n\n`;

    if (data.tokens && data.tokens.length > 0) {
      output += `Token Details:\n`;
      output += `${'-'.repeat(70)}\n\n`;

      data.tokens.forEach((token, index) => {
        output += `${index + 1}. ${token.tokenName} (${token.tokenSymbol})\n`;
        output += `   Contract: ${token.tokenAddress}\n`;
        output += `   Balance: ${token.balance}\n`;
        output += `   Decimals: ${token.tokenDecimals}\n`;
        if (token.usdValue !== null) {
          output += `   USD Value: $${token.usdValue.toFixed(2)}\n`;
        }
        output += '\n';
      });
    } else {
      output += 'No ERC-20 tokens found for this address.\n';
    }

    return output;
  }

  /**
   * Formats consolidated token data for display
   * @param {object} data - Consolidated token data
   * @returns {string} Formatted output
   */
  formatConsolidatedTokens(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    let output = `Consolidated ERC-20 Token Report\n`;
    output += `${'='.repeat(70)}\n\n`;
    output += `Total Addresses: ${data.totalAddresses}\n`;
    output += `Unique Tokens: ${data.uniqueTokens}\n`;
    output += `Generated: ${new Date(data.timestamp).toISOString()}\n\n`;

    output += `Addresses Tracked:\n`;
    data.addresses.forEach((addr, i) => {
      output += `  ${i + 1}. ${addr}\n`;
    });
    output += '\n';

    if (data.tokens && data.tokens.length > 0) {
      output += `Token Holdings (Consolidated):\n`;
      output += `${'-'.repeat(70)}\n\n`;

      data.tokens.forEach((token, index) => {
        output += `${index + 1}. ${token.tokenName} (${token.tokenSymbol})\n`;
        output += `   Contract: ${token.tokenAddress}\n`;
        output += `   Total Balance: ${token.totalBalance}\n`;
        output += `   Total USD Value: $${token.totalUsdValue.toFixed(2)}\n`;
        output += `   Held by ${token.holders.length} address(es):\n`;
        token.holders.forEach(holder => {
          output += `     - ${holder.address}: ${holder.balance}`;
          if (holder.usdValue) {
            output += ` ($${holder.usdValue.toFixed(2)})`;
          }
          output += '\n';
        });
        output += '\n';
      });
    } else {
      output += 'No tokens found across tracked addresses.\n';
    }

    return output;
  }

  /**
   * Clears the internal cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Gets cache statistics
   * @returns {object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Gets the ABI for a specific ERC-20 function
   * @param {string} functionName - The function name
   * @returns {object|null} The ABI definition or null
   */
  static getABI(functionName) {
    return ERC20_ABI[functionName] || null;
  }

  /**
   * Gets all ERC-20 standard ABIs
   * @returns {object} All ABI definitions
   */
  static getAllABIs() {
    return { ...ERC20_ABI };
  }
}

module.exports = ERC20Fetcher;
