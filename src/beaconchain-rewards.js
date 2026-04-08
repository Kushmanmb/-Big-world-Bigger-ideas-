/**
 * Beaconchain Validator Rewards Module
 * Provides functionality to fetch Ethereum validator rewards data from beaconcha.in API
 * 
 * API Documentation: https://docs.beaconcha.in/
 */

const { makeRequest, makePostRequest, CacheManager } = require('./http-client');

class BeaconchainRewardsFetcher {
  /**
   * Creates a new Beaconchain Rewards fetcher instance
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - The beaconcha.in API key (required for most endpoints)
   * @param {string} options.baseUrl - The base API URL (default: beaconcha.in)
   * @param {string} options.network - The Ethereum network (default: mainnet)
   */
  constructor(options = {}) {
    this.apiKey = options.apiKey || '';
    this.baseUrl = options.baseUrl || 'beaconcha.in';
    this.network = options.network || 'mainnet';
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
    const headers = {
      'User-Agent': 'kushmanmb/yaketh'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return makeRequest({
      hostname: this.baseUrl,
      path: endpoint,
      headers
    });
  }

  /**
   * Makes an HTTPS POST request to the API
   * @param {string} endpoint - The API endpoint path
   * @param {Object} body - Request body
   * @returns {Promise<any>} Parsed JSON response
   * @private
   */
  async _makePostRequest(endpoint, body) {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
      const bodyString = JSON.stringify(body);
      
      const options = {
        hostname: this.baseUrl,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyString),
          'User-Agent': 'kushmanmb/yaketh'
        }
      };

      if (this.apiKey) {
        options.headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

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

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(bodyString);
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
    return await this.cacheManager.getWithCache(cacheKey, fetcher);
  }

  /**
   * Validates validator identifier (index or pubkey)
   * @param {number|string} validator - Validator index or public key
   * @returns {boolean} True if valid
   * @private
   */
  _validateValidator(validator) {
    if (typeof validator === 'number' && validator >= 0) {
      return true;
    }
    if (typeof validator === 'string') {
      // Check if it's a hex string (pubkey) - 96 characters (48 bytes)
      if (/^0x[0-9a-fA-F]{96}$/.test(validator)) {
        return true;
      }
      // Check if it's a numeric string
      if (/^\d+$/.test(validator)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Fetches validator rewards list for a specific epoch
   * @param {number|string|Array} validators - Validator index(es) or public key(s)
   * @param {Object} options - Query options
   * @param {number} options.epoch - Specific epoch to query (optional)
   * @param {number} options.pageSize - Number of results per page (default: 10, max: 100)
   * @returns {Promise<object>} Validator rewards data
   * @throws {Error} If validator identifier is invalid or request fails
   */
  async getRewardsList(validators, options = {}) {
    // Validate validators
    const validatorArray = Array.isArray(validators) ? validators : [validators];
    
    for (const validator of validatorArray) {
      if (!this._validateValidator(validator)) {
        throw new Error(`Invalid validator identifier: ${validator}. Must be a validator index (number) or public key (0x...)`);
      }
    }

    const pageSize = options.pageSize || 10;
    if (pageSize < 1 || pageSize > 100) {
      throw new Error('pageSize must be between 1 and 100');
    }

    const body = {
      validator: {
        validator_identifiers: validatorArray
      },
      chain: this.network,
      page_size: pageSize
    };

    if (options.epoch !== undefined) {
      body.epoch = options.epoch;
    }

    const endpoint = '/api/v2/ethereum/validators/rewards-list';
    const cacheKey = `rewards-list-${JSON.stringify(validatorArray)}-${options.epoch || 'latest'}-${pageSize}`;

    return await this._getWithCache(cacheKey, () => this._makePostRequest(endpoint, body));
  }

  /**
   * Fetches aggregated validator rewards over a time period
   * @param {number|string|Array} validators - Validator index(es) or public key(s)
   * @param {Object} options - Query options
   * @param {string} options.period - Time period: '24h', '7d', '30d' (default: '24h')
   * @returns {Promise<object>} Aggregated rewards data
   * @throws {Error} If validator identifier is invalid or request fails
   */
  async getRewardsAggregate(validators, options = {}) {
    // Validate validators
    const validatorArray = Array.isArray(validators) ? validators : [validators];
    
    for (const validator of validatorArray) {
      if (!this._validateValidator(validator)) {
        throw new Error(`Invalid validator identifier: ${validator}`);
      }
    }

    const validPeriods = ['24h', '7d', '30d'];
    const period = options.period || '24h';
    
    if (!validPeriods.includes(period)) {
      throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`);
    }

    const body = {
      validator: {
        validator_identifiers: validatorArray
      },
      chain: this.network,
      period: period
    };

    const endpoint = '/api/v2/ethereum/validators/rewards-aggregate';
    const cacheKey = `rewards-aggregate-${JSON.stringify(validatorArray)}-${period}`;

    return await this._getWithCache(cacheKey, () => this._makePostRequest(endpoint, body));
  }

  /**
   * Fetches validator information including balances
   * @param {number|string|Array} validators - Validator index(es) or public key(s)
   * @returns {Promise<object>} Validator information
   * @throws {Error} If validator identifier is invalid or request fails
   */
  async getValidatorInfo(validators) {
    // Validate validators
    const validatorArray = Array.isArray(validators) ? validators : [validators];
    
    for (const validator of validatorArray) {
      if (!this._validateValidator(validator)) {
        throw new Error(`Invalid validator identifier: ${validator}`);
      }
    }

    const body = {
      validator: {
        validator_identifiers: validatorArray
      },
      chain: this.network
    };

    const endpoint = '/api/v2/ethereum/validators/info';
    const cacheKey = `validator-info-${JSON.stringify(validatorArray)}`;

    return await this._getWithCache(cacheKey, () => this._makePostRequest(endpoint, body));
  }

  /**
   * Fetches total rewards for validators using V1 API (no auth required)
   * @param {number|string|Array} validators - Validator index(es)
   * @returns {Promise<object>} Total rewards data
   * @throws {Error} If validator identifier is invalid or request fails
   */
  async getTotalRewards(validators) {
    const validatorArray = Array.isArray(validators) ? validators : [validators];
    
    // V1 API expects comma-separated validator indices
    const validatorString = validatorArray.join(',');
    const endpoint = `/api/v1/validator/${validatorString}/performance`;
    const cacheKey = `total-rewards-v1-${validatorString}`;

    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Formats rewards list data for display
   * @param {object} data - Raw rewards list data
   * @returns {string} Formatted output
   */
  formatRewardsList(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    let output = 'Beaconchain Validator Rewards\n';
    output += '================================\n\n';

    if (data.data && Array.isArray(data.data)) {
      output += `Total entries: ${data.data.length}\n\n`;
      
      data.data.slice(0, 10).forEach((entry, index) => {
        output += `Entry ${index + 1}:\n`;
        if (entry.validator_index !== undefined) output += `  Validator Index: ${entry.validator_index}\n`;
        if (entry.epoch !== undefined) output += `  Epoch: ${entry.epoch}\n`;
        if (entry.attestation_reward !== undefined) output += `  Attestation Reward: ${entry.attestation_reward} Gwei\n`;
        if (entry.sync_committee_reward !== undefined) output += `  Sync Committee Reward: ${entry.sync_committee_reward} Gwei\n`;
        if (entry.total_reward !== undefined) output += `  Total Reward: ${entry.total_reward} Gwei\n`;
        output += '\n';
      });

      if (data.data.length > 10) {
        output += `... and ${data.data.length - 10} more entries\n`;
      }
    } else {
      // Generic object formatting
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
   * Formats aggregated rewards data for display
   * @param {object} data - Raw aggregated rewards data
   * @returns {string} Formatted output
   */
  formatRewardsAggregate(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    let output = 'Beaconchain Aggregated Rewards\n';
    output += '================================\n\n';

    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((entry, index) => {
        output += `Validator ${index + 1}:\n`;
        if (entry.validator_index !== undefined) output += `  Index: ${entry.validator_index}\n`;
        if (entry.total_attestation_rewards !== undefined) {
          output += `  Total Attestation Rewards: ${entry.total_attestation_rewards} Gwei\n`;
        }
        if (entry.total_sync_rewards !== undefined) {
          output += `  Total Sync Rewards: ${entry.total_sync_rewards} Gwei\n`;
        }
        if (entry.total_rewards !== undefined) {
          output += `  Total Rewards: ${entry.total_rewards} Gwei\n`;
        }
        output += '\n';
      });
    } else {
      // Generic object formatting
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
   * Converts Gwei to ETH
   * @param {number|string} gwei - Amount in Gwei
   * @returns {string} Amount in ETH
   */
  gweiToEth(gwei) {
    return (Number(gwei) / 1000000000).toFixed(9);
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
module.exports = BeaconchainRewardsFetcher;
