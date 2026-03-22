/**
 * Etherscan Contract Verification Module
 * Provides secure functionality to verify contract source code and publish documentation via Etherscan API
 * 
 * SECURITY NOTES:
 * - Never hardcode API keys in source code
 * - Use environment variables or secure configuration management
 * - Validate all inputs before making API calls
 * - Source code should be sanitized before submission
 */

const { makeRequest, CacheManager } = require('./http-client');

class EtherscanVerifier {
  /**
   * Creates a new Etherscan Verifier instance
   * @param {string} apiKey - Etherscan API key (required for verification)
   * @param {number} chainId - Chain ID (1 for Ethereum mainnet, 8453 for Base, etc.)
   */
  constructor(apiKey = null, chainId = 1) {
    if (!apiKey) {
      throw new Error('API key is required for Etherscan verification. Please provide a valid API key.');
    }
    
    this.apiKey = apiKey;
    this.chainId = chainId;
    this.apiBaseUrl = this._getApiUrl(chainId);
    this.cacheManager = new CacheManager(300000); // 5 minute cache for verification status
    
    // Backward compatibility
    this.cache = this.cacheManager.cache;
    this.cacheTimeout = this.cacheManager.cacheTimeout;
  }

  /**
   * Gets the appropriate Etherscan API URL based on chain ID
   * @param {number} chainId - The chain ID
   * @returns {string} API base URL
   * @private
   */
  _getApiUrl(chainId) {
    const urls = {
      1: 'api.etherscan.io',           // Ethereum Mainnet
      5: 'api-goerli.etherscan.io',    // Goerli Testnet
      11155111: 'api-sepolia.etherscan.io', // Sepolia Testnet
      10: 'api-optimistic.etherscan.io', // Optimism
      137: 'api.polygonscan.com',      // Polygon
      8453: 'api.basescan.org',        // Base
      42161: 'api.arbiscan.io',        // Arbitrum One
      56: 'api.bscscan.com',           // BSC
      43114: 'api.snowtrace.io'        // Avalanche
    };
    
    return urls[chainId] || 'api.etherscan.io';
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
   * Validates source code input
   * @param {string} sourceCode - The source code to validate
   * @returns {string} Validated source code
   * @throws {Error} If source code is invalid
   */
  validateSourceCode(sourceCode) {
    if (!sourceCode || typeof sourceCode !== 'string') {
      throw new Error('Source code must be a non-empty string');
    }
    
    if (sourceCode.trim().length === 0) {
      throw new Error('Source code cannot be empty');
    }
    
    // Basic validation - check for reasonable length
    if (sourceCode.length > 500000) { // 500KB limit
      throw new Error('Source code exceeds maximum allowed size (500KB)');
    }
    
    return sourceCode;
  }

  /**
   * Validates compiler version
   * @param {string} compilerVersion - The compiler version to validate
   * @returns {string} Validated compiler version
   * @throws {Error} If compiler version is invalid
   */
  validateCompilerVersion(compilerVersion) {
    if (!compilerVersion || typeof compilerVersion !== 'string') {
      throw new Error('Compiler version must be a non-empty string');
    }
    
    // Format: v0.8.0+commit.c7dfd78e
    const versionPattern = /^v\d+\.\d+\.\d+(\+commit\.[a-f0-9]+)?$/;
    if (!versionPattern.test(compilerVersion)) {
      throw new Error('Invalid compiler version format. Expected format: v0.8.0+commit.c7dfd78e');
    }
    
    return compilerVersion;
  }

  /**
   * Makes an HTTPS request to the Etherscan API
   * @param {object} params - Query parameters
   * @returns {Promise<object>} API response
   * @private
   */
  async _makeRequest(params) {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/api?${queryParams}`;
    
    return makeRequest({
      hostname: this.apiBaseUrl,
      path: url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'kushmanmb/yaketh'
      }
    });
  }

  /**
   * Verifies a contract's source code on Etherscan
   * @param {object} options - Verification options
   * @param {string} options.contractAddress - The contract address to verify
   * @param {string} options.sourceCode - The contract source code
   * @param {string} options.contractName - The contract name
   * @param {string} options.compilerVersion - The Solidity compiler version (e.g., v0.8.0+commit.c7dfd78e)
   * @param {number} [options.optimizationUsed=0] - Whether optimization was used (0 or 1)
   * @param {number} [options.runs=200] - Number of optimization runs
   * @param {string} [options.constructorArguments=''] - Constructor arguments (ABI-encoded)
   * @param {string} [options.evmVersion='default'] - EVM version (e.g., 'paris', 'london', 'default')
   * @param {string} [options.licenseType='1'] - License type (1=No License, 3=MIT, etc.)
   * @returns {Promise<object>} Verification result
   * @throws {Error} If validation fails or API request fails
   */
  async verifyContract(options) {
    // Validate required parameters
    if (!options || typeof options !== 'object') {
      throw new Error('Options must be an object');
    }

    const {
      contractAddress,
      sourceCode,
      contractName,
      compilerVersion,
      optimizationUsed = 0,
      runs = 200,
      constructorArguments = '',
      evmVersion = 'default',
      licenseType = '1'
    } = options;

    // Validate inputs
    const validatedAddress = this.validateAddress(contractAddress);
    const validatedSourceCode = this.validateSourceCode(sourceCode);
    const validatedCompilerVersion = this.validateCompilerVersion(compilerVersion);

    if (!contractName || typeof contractName !== 'string') {
      throw new Error('Contract name must be a non-empty string');
    }

    if (![0, 1].includes(optimizationUsed)) {
      throw new Error('optimizationUsed must be 0 or 1');
    }

    if (!Number.isInteger(runs) || runs < 0) {
      throw new Error('runs must be a non-negative integer');
    }

    try {
      const params = {
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: validatedAddress,
        sourceCode: validatedSourceCode,
        codeformat: 'solidity-single-file',
        contractname: contractName,
        compilerversion: validatedCompilerVersion,
        optimizationUsed: optimizationUsed.toString(),
        runs: runs.toString(),
        constructorArguements: constructorArguments, // Note: Etherscan API uses 'Arguements' typo
        evmversion: evmVersion,
        licenseType: licenseType,
        apikey: this.apiKey
      };

      const response = await this._makeRequest(params);

      // Check if the API returned an error
      if (response.status !== '1') {
        throw new Error(response.result || 'Failed to submit contract for verification');
      }

      return {
        status: 'submitted',
        message: response.message || 'Source code submitted for verification',
        guid: response.result, // Unique identifier for checking verification status
        contractAddress: validatedAddress,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Error verifying contract: ${error.message}`);
    }
  }

  /**
   * Checks the verification status of a contract
   * @param {string} guid - The GUID returned from verifyContract
   * @returns {Promise<object>} Verification status
   * @throws {Error} If GUID is invalid or API request fails
   */
  async checkVerificationStatus(guid) {
    if (!guid || typeof guid !== 'string') {
      throw new Error('GUID must be a non-empty string');
    }

    const cacheKey = `verification-status_${guid}`;

    return await this.cacheManager.getWithCache(cacheKey, async () => {
      try {
        const params = {
          module: 'contract',
          action: 'checkverifystatus',
          guid: guid,
          apikey: this.apiKey
        };

        const response = await this._makeRequest(params);

        return {
          guid: guid,
          status: response.status === '1' ? 'verified' : 'pending',
          result: response.result,
          message: response.message || '',
          timestamp: Date.now()
        };
      } catch (error) {
        throw new Error(`Error checking verification status: ${error.message}`);
      }
    });
  }

  /**
   * Gets the source code of a verified contract
   * @param {string} contractAddress - The contract address
   * @returns {Promise<object>} Contract source code and ABI
   * @throws {Error} If address is invalid or API request fails
   */
  async getSourceCode(contractAddress) {
    const validatedAddress = this.validateAddress(contractAddress);

    const cacheKey = `source-code_${this.chainId}_${validatedAddress}`;

    return await this.cacheManager.getWithCache(cacheKey, async () => {
      try {
        const params = {
          module: 'contract',
          action: 'getsourcecode',
          address: validatedAddress,
          apikey: this.apiKey
        };

        const response = await this._makeRequest(params);

        // Check if the API returned an error
        if (response.status !== '1') {
          throw new Error(response.message || 'Failed to fetch contract source code');
        }

        const result = response.result[0] || {};

        return {
          contractAddress: validatedAddress,
          sourceCode: result.SourceCode || '',
          abi: result.ABI || '',
          contractName: result.ContractName || '',
          compilerVersion: result.CompilerVersion || '',
          optimizationUsed: result.OptimizationUsed || '',
          runs: result.Runs || '',
          constructorArguments: result.ConstructorArguments || '',
          evmVersion: result.EVMVersion || '',
          library: result.Library || '',
          licenseType: result.LicenseType || '',
          proxy: result.Proxy || '',
          implementation: result.Implementation || '',
          swarmSource: result.SwarmSource || '',
          verified: result.SourceCode && result.SourceCode.length > 0,
          timestamp: Date.now()
        };
      } catch (error) {
        throw new Error(`Error fetching source code: ${error.message}`);
      }
    });
  }

  /**
   * Gets the ABI of a verified contract
   * @param {string} contractAddress - The contract address
   * @returns {Promise<object>} Contract ABI
   * @throws {Error} If address is invalid or API request fails
   */
  async getContractABI(contractAddress) {
    const validatedAddress = this.validateAddress(contractAddress);

    const cacheKey = `contract-abi_${this.chainId}_${validatedAddress}`;

    return await this.cacheManager.getWithCache(cacheKey, async () => {
      try {
        const params = {
          module: 'contract',
          action: 'getabi',
          address: validatedAddress,
          apikey: this.apiKey
        };

        const response = await this._makeRequest(params);

        // Check if the API returned an error
        if (response.status !== '1') {
          throw new Error(response.message || 'Failed to fetch contract ABI');
        }

        // Parse ABI if it's a string
        let abi = response.result;
        if (typeof abi === 'string') {
          try {
            abi = JSON.parse(abi);
          } catch (e) {
            // If parsing fails, keep as string
          }
        }

        return {
          contractAddress: validatedAddress,
          abi: abi,
          status: 'success',
          timestamp: Date.now()
        };
      } catch (error) {
        throw new Error(`Error fetching contract ABI: ${error.message}`);
      }
    });
  }

  /**
   * Gets the creation transaction of a contract
   * @param {string} contractAddress - The contract address
   * @returns {Promise<object>} Contract creation transaction
   * @throws {Error} If address is invalid or API request fails
   */
  async getContractCreation(contractAddress) {
    const validatedAddress = this.validateAddress(contractAddress);

    const cacheKey = `contract-creation_${this.chainId}_${validatedAddress}`;

    return await this.cacheManager.getWithCache(cacheKey, async () => {
      try {
        const params = {
          module: 'contract',
          action: 'getcontractcreation',
          contractaddresses: validatedAddress,
          apikey: this.apiKey
        };

        const response = await this._makeRequest(params);

        // Check if the API returned an error
        if (response.status !== '1') {
          throw new Error(response.message || 'Failed to fetch contract creation info');
        }

        const result = response.result[0] || {};

        return {
          contractAddress: validatedAddress,
          contractCreator: result.contractCreator || '',
          txHash: result.txHash || '',
          timestamp: Date.now()
        };
      } catch (error) {
        throw new Error(`Error fetching contract creation: ${error.message}`);
      }
    });
  }

  /**
   * Formats verification result for display
   * @param {object} result - Verification result
   * @returns {string} Formatted output
   */
  formatVerificationResult(result) {
    if (!result || typeof result !== 'object') {
      return 'No data available';
    }

    let output = 'Contract Verification Result\n';
    output += '================================\n\n';
    output += `Status: ${result.status}\n`;
    output += `Message: ${result.message}\n`;
    
    if (result.guid) {
      output += `GUID: ${result.guid}\n`;
    }
    
    if (result.contractAddress) {
      output += `Contract Address: ${result.contractAddress}\n`;
    }

    return output;
  }

  /**
   * Formats source code result for display
   * @param {object} result - Source code result
   * @returns {string} Formatted output
   */
  formatSourceCodeResult(result) {
    if (!result || typeof result !== 'object') {
      return 'No data available';
    }

    let output = 'Contract Source Code\n';
    output += '================================\n\n';
    output += `Contract Address: ${result.contractAddress}\n`;
    output += `Contract Name: ${result.contractName}\n`;
    output += `Compiler Version: ${result.compilerVersion}\n`;
    output += `Optimization Used: ${result.optimizationUsed}\n`;
    output += `Runs: ${result.runs}\n`;
    output += `EVM Version: ${result.evmVersion}\n`;
    output += `License Type: ${result.licenseType}\n`;
    output += `Verified: ${result.verified ? 'Yes' : 'No'}\n\n`;

    if (result.sourceCode) {
      output += 'Source Code:\n';
      output += '-'.repeat(50) + '\n';
      output += result.sourceCode.substring(0, 500) + '...\n';
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

module.exports = EtherscanVerifier;
