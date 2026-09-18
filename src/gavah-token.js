/**
 * Gavah Token Module
 * Provides utilities for interacting with the Gavah Token (GAVAH) ERC20 contract
 */

/**
 * GavahToken class for interacting with the Gavah Token contract
 */
class GavahToken {
  /**
   * Creates a new GavahToken instance
   * @param {string} contractAddress - The deployed Gavah Token contract address
   * @param {string} rpcUrl - The RPC URL for the blockchain network (default: Ethereum mainnet)
   */
  constructor(contractAddress, rpcUrl = 'https://ethereum.publicnode.com') {
    if (!contractAddress || typeof contractAddress !== 'string') {
      throw new Error('Contract address must be a non-empty string');
    }

    this.contractAddress = this._validateAddress(contractAddress);
    this.rpcUrl = rpcUrl;
    
    // Gavah Token ABI - includes ERC20 standard methods plus mint and burn
    this.abi = [
      // ERC20 Standard
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function transferFrom(address from, address to, uint256 amount) returns (bool)',
      
      // Ownable
      'function owner() view returns (address)',
      'function transferOwnership(address newOwner)',
      'function renounceOwnership()',
      
      // Custom functions
      'function mint(address to, uint256 amount)',
      'function burn(uint256 amount)',
      
      // Events
      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'event Approval(address indexed owner, address indexed spender, uint256 value)',
      'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)'
    ];
  }

  /**
   * Validates an Ethereum address
   * @param {string} address - The address to validate
   * @returns {string} Validated address with 0x prefix
   * @throws {Error} If address is invalid
   * @private
   */
  _validateAddress(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Address must be a non-empty string');
    }

    const cleanAddress = address.toLowerCase().replace(/^0x/, '');

    if (!/^[0-9a-f]{40}$/i.test(cleanAddress)) {
      throw new Error('Invalid Ethereum address format');
    }

    return '0x' + cleanAddress;
  }

  /**
   * Makes an RPC call to the blockchain
   * @param {string} method - The RPC method to call
   * @param {array} params - The parameters for the RPC call
   * @returns {Promise<any>} The result of the RPC call
   * @private
   */
  async _rpcCall(method, params) {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'RPC call failed');
    }

    return data.result;
  }

  /**
   * Encodes function data for contract call
   * @param {string} signature - Function signature
   * @param {array} params - Function parameters
   * @returns {string} Encoded function data
   * @private
   */
  _encodeFunctionData(signature, params = []) {
    // For read-only methods with simple signatures, we can use the signature hash directly
    // This is a simplified implementation - for production, use a proper ABI encoder
    const functionHash = this._getFunctionHash(signature);
    
    if (params.length === 0) {
      return functionHash;
    }
    
    // Encode parameters (simplified - supports only address type for now)
    let encodedParams = '';
    for (const param of params) {
      if (typeof param === 'string' && param.startsWith('0x')) {
        // Address parameter
        encodedParams += param.slice(2).padStart(64, '0');
      }
    }
    
    return functionHash + encodedParams;
  }

  /**
   * Gets function signature hash (first 4 bytes of keccak256)
   * @param {string} signature - Function signature
   * @returns {string} Function hash
   * @private
   */
  _getFunctionHash(signature) {
    // Simplified hashes for common ERC20 functions
    const hashes = {
      'name()': '0x06fdde03',
      'symbol()': '0x95d89b41',
      'decimals()': '0x313ce567',
      'totalSupply()': '0x18160ddd',
      'balanceOf(address)': '0x70a08231',
      'owner()': '0x8da5cb5b',
      'allowance(address,address)': '0xdd62ed3e',
    };
    
    return hashes[signature] || '0x00000000';
  }

  /**
   * Calls a view function on the contract
   * @param {string} signature - Function signature
   * @param {array} params - Function parameters
   * @returns {Promise<string>} The result
   * @private
   */
  async _callViewFunction(signature, params = []) {
    const data = this._encodeFunctionData(signature, params);
    
    const result = await this._rpcCall('eth_call', [
      {
        to: this.contractAddress,
        data,
      },
      'latest',
    ]);

    return result;
  }

  /**
   * Decodes a string result from contract call
   * @param {string} result - Hex result
   * @returns {string} Decoded string
   * @private
   */
  _decodeString(result) {
    if (!result || result === '0x') {
      return '';
    }
    
    // Remove 0x prefix and decode
    const hex = result.slice(2);
    
    // Skip first 64 bytes (offset) and next 64 bytes (length)
    // Then decode the actual string content
    const length = parseInt(hex.slice(64, 128), 16) * 2;
    const stringHex = hex.slice(128, 128 + length);
    
    let str = '';
    for (let i = 0; i < stringHex.length; i += 2) {
      const charCode = parseInt(stringHex.slice(i, i + 2), 16);
      if (charCode > 0) {
        str += String.fromCharCode(charCode);
      }
    }
    
    return str;
  }

  /**
   * Decodes a uint256 result from contract call
   * @param {string} result - Hex result
   * @returns {string} Decoded number as string
   * @private
   */
  _decodeUint256(result) {
    if (!result || result === '0x') {
      return '0';
    }
    
    return BigInt(result).toString();
  }

  /**
   * Decodes a uint8 result from contract call
   * @param {string} result - Hex result
   * @returns {number} Decoded number
   * @private
   */
  _decodeUint8(result) {
    if (!result || result === '0x') {
      return 0;
    }
    
    return parseInt(result, 16);
  }

  /**
   * Decodes an address result from contract call
   * @param {string} result - Hex result
   * @returns {string} Decoded address
   * @private
   */
  _decodeAddress(result) {
    if (!result || result === '0x') {
      return '0x0000000000000000000000000000000000000000';
    }
    
    // Address is in the last 40 characters (20 bytes)
    return '0x' + result.slice(-40);
  }

  /**
   * Gets the token name
   * @returns {Promise<string>} Token name
   */
  async getName() {
    const result = await this._callViewFunction('name()');
    return this._decodeString(result);
  }

  /**
   * Gets the token symbol
   * @returns {Promise<string>} Token symbol
   */
  async getSymbol() {
    const result = await this._callViewFunction('symbol()');
    return this._decodeString(result);
  }

  /**
   * Gets the token decimals
   * @returns {Promise<number>} Token decimals
   */
  async getDecimals() {
    const result = await this._callViewFunction('decimals()');
    return this._decodeUint8(result);
  }

  /**
   * Gets the total token supply
   * @returns {Promise<string>} Total supply (in smallest unit)
   */
  async getTotalSupply() {
    const result = await this._callViewFunction('totalSupply()');
    return this._decodeUint256(result);
  }

  /**
   * Gets the token balance of an address
   * @param {string} address - The address to check
   * @returns {Promise<string>} Balance (in smallest unit)
   */
  async getBalance(address) {
    const validatedAddress = this._validateAddress(address);
    const result = await this._callViewFunction('balanceOf(address)', [validatedAddress]);
    return this._decodeUint256(result);
  }

  /**
   * Gets the owner of the contract
   * @returns {Promise<string>} Owner address
   */
  async getOwner() {
    const result = await this._callViewFunction('owner()');
    return this._decodeAddress(result);
  }

  /**
   * Gets the allowance granted by owner to spender
   * @param {string} owner - The owner address
   * @param {string} spender - The spender address
   * @returns {Promise<string>} Allowance amount (in smallest unit)
   */
  async getAllowance(owner, spender) {
    const validatedOwner = this._validateAddress(owner);
    const validatedSpender = this._validateAddress(spender);
    const result = await this._callViewFunction('allowance(address,address)', [validatedOwner, validatedSpender]);
    return this._decodeUint256(result);
  }

  /**
   * Formats a token amount from smallest unit to human-readable format
   * @param {string|number} amount - Amount in smallest unit
   * @param {number} decimals - Token decimals (default: 18)
   * @returns {string} Formatted amount
   */
  formatAmount(amount, decimals = 18) {
    const amountBigInt = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const whole = amountBigInt / divisor;
    const remainder = amountBigInt % divisor;
    
    if (remainder === 0n) {
      return whole.toString() + '.0';
    }
    
    const fractional = remainder.toString().padStart(decimals, '0');
    return whole.toString() + '.' + fractional.replace(/0+$/, '');
  }

  /**
   * Parses a human-readable amount to smallest unit
   * @param {string|number} amount - Human-readable amount
   * @param {number} decimals - Token decimals (default: 18)
   * @returns {string} Amount in smallest unit
   */
  parseAmount(amount, decimals = 18) {
    if (!Number.isInteger(decimals) || decimals < 0) {
      throw new Error('Decimals must be a non-negative integer');
    }

    const normalizedAmount = amount.toString().trim();
    if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalizedAmount)) {
      throw new Error('Amount must be a valid non-negative decimal number');
    }

    const parts = normalizedAmount.split('.');
    const whole = parts[0] || '0';
    const fractionalPart = parts[1] || '';

    if (fractionalPart.length > decimals) {
      throw new Error(`Amount has more than ${decimals} decimal places`);
    }

    const fractional = fractionalPart.padEnd(decimals, '0');
    const amountStr = whole + fractional;
    return BigInt(amountStr).toString();
  }

  /**
   * Gets comprehensive token information
   * @returns {Promise<object>} Token information
   */
  async getTokenInfo() {
    const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
      this.getName(),
      this.getSymbol(),
      this.getDecimals(),
      this.getTotalSupply(),
      this.getOwner()
    ]);

    return {
      contractAddress: this.contractAddress,
      name,
      symbol,
      decimals,
      totalSupply,
      totalSupplyFormatted: this.formatAmount(totalSupply, decimals),
      owner,
      rpcUrl: this.rpcUrl
    };
  }
}

module.exports = GavahToken;
