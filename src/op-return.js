/**
 * OP_RETURN Module
 * Provides functionality to encode, decode, and fetch OP_RETURN data across multiple blockchain platforms
 * Supports Bitcoin, Litecoin, and Ethereum (as data field in transactions)
 * 
 * OP_RETURN is a Bitcoin script opcode used to store arbitrary data on the blockchain.
 * Bitcoin/Litecoin: Standard OP_RETURN allows up to 80 bytes of data
 * Ethereum: Uses transaction data field (input data) which can store larger amounts
 * 
 * API Documentation: https://blockchair.com/api/docs
 */

const { makeRequest, CacheManager } = require('./http-client');

class OPReturnFetcher {
  /**
   * Creates a new OP_RETURN fetcher instance
   * @param {string} platform - The blockchain platform: 'bitcoin', 'litecoin', or 'ethereum'
   * @param {string} baseUrl - The base API URL (default: api.blockchair.com)
   */
  constructor(platform = 'bitcoin', baseUrl = 'api.blockchair.com') {
    const validPlatforms = ['bitcoin', 'litecoin', 'ethereum'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      throw new Error(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`);
    }
    
    this.platform = platform.toLowerCase();
    this.baseUrl = baseUrl;
    this.cacheManager = new CacheManager(60000); // 1 minute cache
    // Backward compatibility - expose cache and cacheTimeout
    this.cache = this.cacheManager.cache;
    this.cacheTimeout = this.cacheManager.cacheTimeout;
    
    // Bitcoin/Litecoin OP_RETURN constraints
    this.maxOpReturnBytes = 80;
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
   * Encodes a string to hexadecimal format for OP_RETURN
   * @param {string} data - The data to encode
   * @returns {string} Hexadecimal encoded string
   * @throws {Error} If data exceeds maximum size for Bitcoin/Litecoin
   */
  encodeData(data) {
    if (!data || typeof data !== 'string') {
      throw new Error('Data must be a non-empty string');
    }

    // Convert string to Buffer and then to hex
    const buffer = Buffer.from(data, 'utf8');
    const hexData = buffer.toString('hex');

    // For Bitcoin and Litecoin, enforce 80-byte limit
    if ((this.platform === 'bitcoin' || this.platform === 'litecoin') && buffer.length > this.maxOpReturnBytes) {
      throw new Error(`Data exceeds maximum ${this.maxOpReturnBytes} bytes for ${this.platform}. Current size: ${buffer.length} bytes`);
    }

    return hexData;
  }

  /**
   * Decodes hexadecimal OP_RETURN data to a string
   * @param {string} hexData - The hexadecimal data to decode
   * @returns {string} Decoded string
   * @throws {Error} If hexData is invalid
   */
  decodeData(hexData) {
    if (!hexData || typeof hexData !== 'string') {
      throw new Error('Hex data must be a non-empty string');
    }

    // Remove 0x prefix if present
    const cleanHex = hexData.startsWith('0x') ? hexData.slice(2) : hexData;

    // Validate hex format
    if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
      throw new Error('Invalid hexadecimal format');
    }

    // Handle empty string
    if (cleanHex.length === 0) {
      return '';
    }

    try {
      const buffer = Buffer.from(cleanHex, 'hex');
      return buffer.toString('utf8');
    } catch (error) {
      throw new Error(`Failed to decode hex data: ${error.message}`);
    }
  }

  /**
   * Creates an OP_RETURN script for Bitcoin/Litecoin transactions
   * @param {string} data - The data to embed
   * @returns {object} OP_RETURN script details
   * @throws {Error} If data is invalid or platform is not supported
   */
  createOpReturnScript(data) {
    if (this.platform === 'ethereum') {
      throw new Error('Use createEthereumData() for Ethereum platform');
    }

    const hexData = this.encodeData(data);
    const dataLength = hexData.length / 2; // byte length

    return {
      opcode: 'OP_RETURN',
      hex: hexData,
      bytes: dataLength,
      data: data,
      script: `OP_RETURN ${hexData}`,
      platform: this.platform
    };
  }

  /**
   * Creates transaction data for Ethereum
   * @param {string} data - The data to embed
   * @returns {object} Ethereum transaction data details
   * @throws {Error} If platform is not Ethereum
   */
  createEthereumData(data) {
    if (this.platform !== 'ethereum') {
      throw new Error('Use createOpReturnScript() for Bitcoin/Litecoin platforms');
    }

    const hexData = this.encodeData(data);
    const dataLength = hexData.length / 2; // byte length

    return {
      data: data,
      hex: '0x' + hexData,
      bytes: dataLength,
      platform: 'ethereum',
      field: 'input_data'
    };
  }

  /**
   * Fetches transaction data and extracts OP_RETURN or input data
   * @param {string} txHash - Transaction hash
   * @returns {Promise<object>} Transaction data with decoded OP_RETURN/input data
   * @throws {Error} If txHash is invalid or request fails
   */
  async getTransactionData(txHash) {
    if (!txHash || typeof txHash !== 'string') {
      throw new Error('Valid transaction hash string is required');
    }

    // Validate transaction hash format
    const cleanHash = txHash.startsWith('0x') ? txHash.slice(2) : txHash;
    if (!cleanHash.match(/^[a-fA-F0-9]{64}$/)) {
      throw new Error('Invalid transaction hash format');
    }

    const endpoint = `/${this.platform}/dashboards/transaction/${txHash}`;
    const cacheKey = `tx-${this.platform}-${txHash}`;

    const result = await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));

    // Extract OP_RETURN or input data based on platform
    return this._extractEmbeddedData(result);
  }

  /**
   * Extracts OP_RETURN or input data from transaction result
   * @param {object} txResult - Transaction result from API
   * @returns {object} Extracted and decoded data
   * @private
   */
  _extractEmbeddedData(txResult) {
    if (!txResult || !txResult.data) {
      return {
        hasData: false,
        platform: this.platform,
        raw: null,
        decoded: null
      };
    }

    const txData = txResult.data;
    let embeddedData = null;
    let rawHex = null;

    if (this.platform === 'bitcoin' || this.platform === 'litecoin') {
      // Look for OP_RETURN in transaction outputs
      const txKey = Object.keys(txData)[0];
      const transaction = txData[txKey];

      if (transaction && transaction.transaction && transaction.transaction.outputs) {
        const outputs = transaction.transaction.outputs;
        
        for (const output of outputs) {
          if (output.script_hex && output.script_hex.startsWith('6a')) {
            // 6a is the OP_RETURN opcode in hex
            // Parse the script properly: OP_RETURN (6a) + length byte(s) + data
            const scriptHex = output.script_hex;
            
            // Skip the OP_RETURN opcode (6a = 1 byte = 2 hex chars)
            let offset = 2;
            
            // Read the length byte
            const lengthByte = parseInt(scriptHex.substring(offset, offset + 2), 16);
            offset += 2;
            
            // For data ≤75 bytes, the length is directly encoded
            // For larger data, OP_PUSHDATA1 (0x4c) or OP_PUSHDATA2 (0x4d) are used
            if (lengthByte <= 75) {
              // Direct length encoding
              rawHex = scriptHex.substring(offset);
            } else if (lengthByte === 0x4c) {
              // OP_PUSHDATA1: next byte is length
              offset += 2;
              rawHex = scriptHex.substring(offset);
            } else if (lengthByte === 0x4d) {
              // OP_PUSHDATA2: next 2 bytes are length (little-endian)
              offset += 4;
              rawHex = scriptHex.substring(offset);
            } else {
              // Fallback: try to decode everything after the length byte
              rawHex = scriptHex.substring(offset);
            }
            
            try {
              embeddedData = this.decodeData(rawHex);
            } catch (error) {
              embeddedData = null;
            }
            break;
          }
        }
      }
    } else if (this.platform === 'ethereum') {
      // Look for input data in Ethereum transaction
      const txKey = Object.keys(txData)[0];
      const transaction = txData[txKey];

      if (transaction && transaction.transaction && transaction.transaction.input_hex) {
        rawHex = transaction.transaction.input_hex;
        if (rawHex !== '0x' && rawHex.length > 2) {
          try {
            embeddedData = this.decodeData(rawHex);
          } catch (error) {
            embeddedData = null;
          }
        }
      }
    }

    return {
      hasData: embeddedData !== null,
      platform: this.platform,
      raw: rawHex,
      decoded: embeddedData,
      transaction: txResult.data
    };
  }

  /**
   * Validates data size for the current platform
   * @param {string} data - The data to validate
   * @returns {object} Validation result
   */
  validateDataSize(data) {
    if (!data || typeof data !== 'string') {
      return {
        valid: false,
        error: 'Data must be a non-empty string',
        platform: this.platform
      };
    }

    const buffer = Buffer.from(data, 'utf8');
    const byteLength = buffer.length;

    if (this.platform === 'bitcoin' || this.platform === 'litecoin') {
      if (byteLength > this.maxOpReturnBytes) {
        return {
          valid: false,
          error: `Data exceeds maximum ${this.maxOpReturnBytes} bytes`,
          currentSize: byteLength,
          maxSize: this.maxOpReturnBytes,
          platform: this.platform
        };
      }
    }

    return {
      valid: true,
      size: byteLength,
      maxSize: this.platform === 'ethereum' ? 'unlimited' : this.maxOpReturnBytes,
      platform: this.platform
    };
  }

  /**
   * Formats OP_RETURN data for display
   * @param {object} data - OP_RETURN data object
   * @returns {string} Formatted output
   */
  formatData(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    let output = `OP_RETURN Data (${this.platform.toUpperCase()})\n`;
    output += '================================\n\n';

    output += `Platform: ${data.platform || this.platform}\n`;
    output += `Has Embedded Data: ${data.hasData ? 'Yes' : 'No'}\n\n`;

    if (data.hasData) {
      if (data.raw) {
        output += `Raw Hex: ${data.raw}\n`;
        output += `Hex Length: ${data.raw.length} characters (${data.raw.length / 2} bytes)\n\n`;
      }

      if (data.decoded) {
        output += `Decoded Data:\n`;
        output += `${data.decoded}\n\n`;
        output += `Decoded Length: ${data.decoded.length} characters\n`;
      }
    } else {
      output += 'No OP_RETURN or input data found in transaction\n';
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
      platform: this.platform,
      keys: Array.from(this.cacheManager.cache.keys())
    };
  }
}

// Export the class
module.exports = OPReturnFetcher;
