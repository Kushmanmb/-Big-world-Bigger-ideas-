/**
 * Transaction Validator Module
 * Validates blockchain transactions across multiple APIs:
 * - Etherscan API (Ethereum and EVM-compatible chains)
 * - Mempool.space API (Bitcoin)
 * - Blockchair API (multi-chain: Bitcoin, Ethereum, Litecoin, etc.)
 *
 * API Documentation:
 *   Etherscan:  https://docs.etherscan.io/
 *   Mempool:    https://mempool.space/docs/api/rest
 *   Blockchair: https://blockchair.com/api/docs
 */

const { makeRequest, CacheManager } = require('./http-client');

/**
 * Supported chain configurations
 */
const CHAIN_CONFIG = {
  // Etherscan-compatible chains
  ethereum: { api: 'etherscan', chainId: 1, host: 'api.etherscan.io' },
  base: { api: 'etherscan', chainId: 8453, host: 'api.etherscan.io' },
  polygon: { api: 'etherscan', chainId: 137, host: 'api.etherscan.io' },
  // Mempool.space chains
  bitcoin: { api: 'mempool', host: 'mempool.space' },
  // Blockchair chains
  'bitcoin-blockchair': { api: 'blockchair', chain: 'bitcoin', host: 'api.blockchair.com' },
  'ethereum-blockchair': { api: 'blockchair', chain: 'ethereum', host: 'api.blockchair.com' },
  'litecoin-blockchair': { api: 'blockchair', chain: 'litecoin', host: 'api.blockchair.com' },
  'dogecoin-blockchair': { api: 'blockchair', chain: 'dogecoin', host: 'api.blockchair.com' }
};

class TransactionValidator {
  /**
   * Creates a new TransactionValidator instance
   * @param {object} options - Configuration options
   * @param {string} [options.etherscanApiKey] - Etherscan API key (required for Etherscan validation)
   * @param {string} [options.mempoolBaseUrl='mempool.space'] - Mempool.space base URL
   * @param {string} [options.blockchairBaseUrl='api.blockchair.com'] - Blockchair base URL
   * @param {number} [options.cacheTimeout=60000] - Cache timeout in milliseconds
   */
  constructor(options = {}) {
    this.etherscanApiKey = options.etherscanApiKey || null;
    this.mempoolBaseUrl = options.mempoolBaseUrl || 'mempool.space';
    this.blockchairBaseUrl = options.blockchairBaseUrl || 'api.blockchair.com';
    this.cacheManager = new CacheManager(options.cacheTimeout || 60000);
    // Backward compatibility
    this.cache = this.cacheManager.cache;
    this.cacheTimeout = this.cacheManager.cacheTimeout;
  }

  // ---------------------------------------------------------------------------
  // Input validation helpers
  // ---------------------------------------------------------------------------

  /**
   * Validates an Ethereum transaction hash
   * @param {string} txHash - Transaction hash (0x + 64 hex chars)
   * @returns {string} Normalised transaction hash
   * @throws {Error} If the hash is invalid
   */
  validateEthereumTxHash(txHash) {
    if (!txHash || typeof txHash !== 'string') {
      throw new Error('Transaction hash must be a non-empty string');
    }
    const clean = txHash.toLowerCase().replace(/^0x/, '');
    if (!/^[0-9a-f]{64}$/.test(clean)) {
      throw new Error('Invalid Ethereum transaction hash format (expected 0x + 64 hex characters)');
    }
    return '0x' + clean;
  }

  /**
   * Validates a Bitcoin transaction hash (txid)
   * @param {string} txHash - 64-character hex string
   * @returns {string} Validated transaction hash
   * @throws {Error} If the hash is invalid
   */
  validateBitcoinTxHash(txHash) {
    if (!txHash || typeof txHash !== 'string') {
      throw new Error('Transaction hash must be a non-empty string');
    }
    const clean = txHash.toLowerCase().replace(/^0x/, '');
    if (!/^[0-9a-f]{64}$/.test(clean)) {
      throw new Error('Invalid Bitcoin transaction hash format (expected 64 hex characters)');
    }
    return clean;
  }

  // ---------------------------------------------------------------------------
  // Low-level request helpers
  // ---------------------------------------------------------------------------

  /**
   * Makes an HTTPS GET request
   * @param {string} hostname - Target hostname
   * @param {string} path - Request path
   * @param {string} [userAgent='kushmanmb/yaketh'] - User-Agent header
   * @returns {Promise<any>} Parsed JSON response
   * @private
   */
  _makeRequest(hostname, path, userAgent = 'kushmanmb/yaketh') {
    return makeRequest({
      hostname,
      path,
      headers: { 'User-Agent': userAgent }
    });
  }

  /**
   * Fetches from cache or executes fetcher function
   * @param {string} cacheKey - Cache key
   * @param {Function} fetcher - Async function that returns data
   * @returns {Promise<any>}
   * @private
   */
  _getWithCache(cacheKey, fetcher) {
    return this.cacheManager.getWithCache(cacheKey, fetcher);
  }

  // ---------------------------------------------------------------------------
  // Etherscan validation
  // ---------------------------------------------------------------------------

  /**
   * Validates an Ethereum transaction using the Etherscan API
   * @param {string} txHash - Ethereum transaction hash
   * @param {number} [chainId=1] - Chain ID (1=mainnet, 8453=Base, 137=Polygon, etc.)
   * @returns {Promise<object>} Validation result with transaction details
   * @throws {Error} If API key is missing, hash is invalid, or request fails
   */
  async validateEthereumTransaction(txHash, chainId = 1) {
    if (!this.etherscanApiKey) {
      throw new Error('Etherscan API key is required for Ethereum transaction validation');
    }

    const validatedHash = this.validateEthereumTxHash(txHash);
    const cacheKey = `etherscan-tx-${chainId}-${validatedHash}`;

    return this._getWithCache(cacheKey, async () => {
      const params = new URLSearchParams({
        chainid: chainId.toString(),
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: validatedHash,
        apikey: this.etherscanApiKey
      });

      const response = await this._makeRequest(
        'api.etherscan.io',
        `/v2/api?${params}`,
        'kushmanmb/yaketh Etherscan'
      );

      const tx = response.result || null;
      const isValid = tx !== null && tx.hash !== undefined;

      const result = {
        txHash: validatedHash,
        chain: 'ethereum',
        chainId,
        api: 'etherscan',
        isValid,
        status: isValid ? 'found' : 'not_found',
        transaction: tx,
        timestamp: Date.now()
      };

      // Try to get receipt for confirmation status
      if (isValid) {
        try {
          const receiptParams = new URLSearchParams({
            chainid: chainId.toString(),
            module: 'proxy',
            action: 'eth_getTransactionReceipt',
            txhash: validatedHash,
            apikey: this.etherscanApiKey
          });
          const receiptResp = await this._makeRequest(
            'api.etherscan.io',
            `/v2/api?${receiptParams}`,
            'kushmanmb/yaketh Etherscan'
          );
          const receipt = receiptResp.result || null;
          if (receipt) {
            result.confirmed = receipt.status === '0x1';
            result.blockNumber = receipt.blockNumber
              ? parseInt(receipt.blockNumber, 16)
              : null;
            result.gasUsed = receipt.gasUsed
              ? parseInt(receipt.gasUsed, 16)
              : null;
            result.receipt = receipt;
          }
        } catch (_receiptErr) {
          // Receipt fetch is best-effort; do not fail the overall result
        }
      }

      return result;
    });
  }

  // ---------------------------------------------------------------------------
  // Mempool.space (Bitcoin) validation
  // ---------------------------------------------------------------------------

  /**
   * Validates a Bitcoin transaction using the Mempool.space API
   * @param {string} txHash - Bitcoin transaction hash (txid)
   * @returns {Promise<object>} Validation result with transaction details
   * @throws {Error} If hash is invalid or request fails
   */
  async validateBitcoinTransaction(txHash) {
    const validatedHash = this.validateBitcoinTxHash(txHash);
    const cacheKey = `mempool-tx-${validatedHash}`;

    return this._getWithCache(cacheKey, async () => {
      let tx = null;
      let isValid = false;
      let errorMessage = null;

      try {
        tx = await this._makeRequest(
          this.mempoolBaseUrl,
          `/api/tx/${validatedHash}`,
          'kushmanmb/yaketh Mempool'
        );
        isValid = tx !== null && tx.txid !== undefined;
      } catch (err) {
        errorMessage = err.message;
      }

      const result = {
        txHash: validatedHash,
        chain: 'bitcoin',
        api: 'mempool',
        isValid,
        status: isValid ? 'found' : 'not_found',
        transaction: tx,
        timestamp: Date.now()
      };

      if (errorMessage) {
        result.error = errorMessage;
      }

      if (isValid && tx.status) {
        result.confirmed = tx.status.confirmed === true;
        result.blockHeight = tx.status.block_height || null;
        result.blockTime = tx.status.block_time || null;
        result.fee = tx.fee || null;
        result.size = tx.size || null;
        result.weight = tx.weight || null;
      }

      return result;
    });
  }

  // ---------------------------------------------------------------------------
  // Blockchair validation (multi-chain)
  // ---------------------------------------------------------------------------

  /**
   * Validates a transaction using the Blockchair API (multi-chain)
   * @param {string} txHash - Transaction hash
   * @param {string} [chain='bitcoin'] - Blockchain name (bitcoin, ethereum, litecoin, etc.)
   * @returns {Promise<object>} Validation result with transaction details
   * @throws {Error} If hash is invalid or request fails
   */
  async validateBlockchairTransaction(txHash, chain = 'bitcoin') {
    if (!txHash || typeof txHash !== 'string') {
      throw new Error('Transaction hash must be a non-empty string');
    }
    const cleanHash = txHash.replace(/^0x/, '');
    if (!/^[0-9a-fA-F]{64}$/.test(cleanHash)) {
      throw new Error('Invalid transaction hash format (expected 64 hex characters)');
    }

    if (!chain || typeof chain !== 'string') {
      throw new Error('Chain name must be a non-empty string');
    }

    const normalizedChain = chain.toLowerCase();
    const cacheKey = `blockchair-tx-${normalizedChain}-${cleanHash.toLowerCase()}`;

    return this._getWithCache(cacheKey, async () => {
      let data = null;
      let isValid = false;
      let errorMessage = null;

      try {
        data = await this._makeRequest(
          this.blockchairBaseUrl,
          `/${normalizedChain}/dashboards/transaction/${cleanHash}`,
          'kushmanmb/yaketh Blockchair'
        );
        isValid =
          data !== null &&
          data.data !== undefined &&
          data.data[cleanHash.toLowerCase()] !== undefined;
      } catch (err) {
        errorMessage = err.message;
      }

      const txData = isValid ? data.data[cleanHash.toLowerCase()] : null;

      const result = {
        txHash: cleanHash.toLowerCase(),
        chain: normalizedChain,
        api: 'blockchair',
        isValid,
        status: isValid ? 'found' : 'not_found',
        transaction: txData ? txData.transaction : null,
        timestamp: Date.now()
      };

      if (errorMessage) {
        result.error = errorMessage;
      }

      if (isValid && txData && txData.transaction) {
        const tx = txData.transaction;
        result.confirmed = tx.block_id !== null && tx.block_id > 0;
        result.blockId = tx.block_id || null;
        result.fee = tx.fee || null;
        result.size = tx.size || null;
        result.inputs = txData.inputs ? txData.inputs.length : null;
        result.outputs = txData.outputs ? txData.outputs.length : null;
      }

      return result;
    });
  }

  // ---------------------------------------------------------------------------
  // Combined / cross-API validation
  // ---------------------------------------------------------------------------

  /**
   * Validates a transaction across all available APIs for a given chain.
   * For Ethereum: uses both Etherscan and Blockchair.
   * For Bitcoin:  uses both Mempool.space and Blockchair.
   * @param {string} txHash - Transaction hash
   * @param {string} [chain='bitcoin'] - 'bitcoin' or 'ethereum'
   * @returns {Promise<object>} Aggregated validation results from all APIs
   * @throws {Error} If hash or chain is invalid
   */
  async validateTransaction(txHash, chain = 'bitcoin') {
    if (!txHash || typeof txHash !== 'string') {
      throw new Error('Transaction hash must be a non-empty string');
    }
    if (!chain || typeof chain !== 'string') {
      throw new Error('Chain must be a non-empty string');
    }

    const normalizedChain = chain.toLowerCase();
    const results = {
      txHash,
      chain: normalizedChain,
      timestamp: Date.now(),
      sources: {}
    };

    if (normalizedChain === 'ethereum') {
      // Etherscan
      if (this.etherscanApiKey) {
        try {
          results.sources.etherscan = await this.validateEthereumTransaction(txHash, 1);
        } catch (err) {
          results.sources.etherscan = { isValid: false, error: err.message };
        }
      }
      // Blockchair (Ethereum)
      try {
        results.sources.blockchair = await this.validateBlockchairTransaction(txHash, 'ethereum');
      } catch (err) {
        results.sources.blockchair = { isValid: false, error: err.message };
      }
    } else if (normalizedChain === 'bitcoin') {
      // Mempool.space
      try {
        results.sources.mempool = await this.validateBitcoinTransaction(txHash);
      } catch (err) {
        results.sources.mempool = { isValid: false, error: err.message };
      }
      // Blockchair (Bitcoin)
      try {
        results.sources.blockchair = await this.validateBlockchairTransaction(txHash, 'bitcoin');
      } catch (err) {
        results.sources.blockchair = { isValid: false, error: err.message };
      }
    } else {
      // Generic Blockchair-only validation for other chains
      try {
        results.sources.blockchair = await this.validateBlockchairTransaction(txHash, normalizedChain);
      } catch (err) {
        results.sources.blockchair = { isValid: false, error: err.message };
      }
    }

    // Compute overall validity: valid if at least one source confirms it
    const sourceValues = Object.values(results.sources);
    results.isValid = sourceValues.some(s => s.isValid === true);
    results.confirmedBy = sourceValues.filter(s => s.isValid === true).length;
    results.totalSources = sourceValues.length;

    return results;
  }

  // ---------------------------------------------------------------------------
  // Formatting
  // ---------------------------------------------------------------------------

  /**
   * Formats a single-source validation result for display
   * @param {object} result - Validation result from any validateXxx method
   * @returns {string} Human-readable formatted string
   */
  formatResult(result) {
    if (!result || typeof result !== 'object') {
      return 'No validation result available';
    }

    let output = 'Transaction Validation Result\n';
    output += '================================\n\n';
    output += `Transaction Hash: ${result.txHash}\n`;
    output += `Chain:            ${result.chain}\n`;
    if (result.chainId !== undefined) {
      output += `Chain ID:         ${result.chainId}\n`;
    }
    output += `API:              ${result.api}\n`;
    output += `Valid:            ${result.isValid ? '✅ Yes' : '❌ No'}\n`;
    output += `Status:           ${result.status || 'unknown'}\n`;

    if (result.confirmed !== undefined) {
      output += `Confirmed:        ${result.confirmed ? '✅ Yes' : '⏳ Pending'}\n`;
    }
    if (result.blockNumber !== undefined && result.blockNumber !== null) {
      output += `Block Number:     ${result.blockNumber}\n`;
    }
    if (result.blockHeight !== undefined && result.blockHeight !== null) {
      output += `Block Height:     ${result.blockHeight}\n`;
    }
    if (result.blockId !== undefined && result.blockId !== null) {
      output += `Block ID:         ${result.blockId}\n`;
    }
    if (result.fee !== undefined && result.fee !== null) {
      output += `Fee:              ${result.fee}\n`;
    }
    if (result.size !== undefined && result.size !== null) {
      output += `Size:             ${result.size} bytes\n`;
    }
    if (result.gasUsed !== undefined && result.gasUsed !== null) {
      output += `Gas Used:         ${result.gasUsed}\n`;
    }
    if (result.error) {
      output += `Error:            ${result.error}\n`;
    }
    output += `\nFetched At: ${new Date(result.timestamp).toISOString()}\n`;

    return output;
  }

  /**
   * Formats aggregated cross-API validation results for display
   * @param {object} result - Result from validateTransaction()
   * @returns {string} Human-readable formatted string
   */
  formatAggregatedResult(result) {
    if (!result || typeof result !== 'object') {
      return 'No aggregated validation result available';
    }

    let output = 'Aggregated Transaction Validation\n';
    output += '===================================\n\n';
    output += `Transaction Hash: ${result.txHash}\n`;
    output += `Chain:            ${result.chain}\n`;
    output += `Overall Valid:    ${result.isValid ? '✅ Yes' : '❌ No'}\n`;
    output += `Confirmed By:     ${result.confirmedBy} / ${result.totalSources} source(s)\n\n`;

    if (result.sources && typeof result.sources === 'object') {
      output += 'Sources:\n';
      output += '-'.repeat(50) + '\n';
      for (const [source, data] of Object.entries(result.sources)) {
        output += `\n[${source.toUpperCase()}]\n`;
        output += `  Valid:   ${data.isValid ? '✅ Yes' : '❌ No'}\n`;
        if (data.status) output += `  Status:  ${data.status}\n`;
        if (data.confirmed !== undefined) {
          output += `  Confirmed: ${data.confirmed ? '✅ Yes' : '⏳ Pending'}\n`;
        }
        if (data.error) output += `  Error:   ${data.error}\n`;
      }
    }

    output += `\nFetched At: ${new Date(result.timestamp).toISOString()}\n`;

    return output;
  }

  // ---------------------------------------------------------------------------
  // Cache utilities
  // ---------------------------------------------------------------------------

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
   * Returns supported chain names and their API backends
   * @returns {object} Chain configuration map
   */
  static getSupportedChains() {
    return { ...CHAIN_CONFIG };
  }
}

module.exports = TransactionValidator;
