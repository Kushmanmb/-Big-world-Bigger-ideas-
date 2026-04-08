/**
 * Gavah Token Module
 * Provides utilities for interacting with the Gavah Token (GAVAH) ERC20 contract
 */

const { ethers } = require('ethers');

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
   * Gets a provider for read operations
   * @returns {ethers.JsonRpcProvider} Provider instance
   * @private
   */
  _getProvider() {
    return new ethers.JsonRpcProvider(this.rpcUrl);
  }

  /**
   * Gets a contract instance for read operations
   * @returns {ethers.Contract} Contract instance
   * @private
   */
  _getContract() {
    const provider = this._getProvider();
    return new ethers.Contract(this.contractAddress, this.abi, provider);
  }

  /**
   * Gets the token name
   * @returns {Promise<string>} Token name
   */
  async getName() {
    const contract = this._getContract();
    return await contract.name();
  }

  /**
   * Gets the token symbol
   * @returns {Promise<string>} Token symbol
   */
  async getSymbol() {
    const contract = this._getContract();
    return await contract.symbol();
  }

  /**
   * Gets the token decimals
   * @returns {Promise<number>} Token decimals
   */
  async getDecimals() {
    const contract = this._getContract();
    return Number(await contract.decimals());
  }

  /**
   * Gets the total token supply
   * @returns {Promise<string>} Total supply (in smallest unit)
   */
  async getTotalSupply() {
    const contract = this._getContract();
    const supply = await contract.totalSupply();
    return supply.toString();
  }

  /**
   * Gets the token balance of an address
   * @param {string} address - The address to check
   * @returns {Promise<string>} Balance (in smallest unit)
   */
  async getBalance(address) {
    const validatedAddress = this._validateAddress(address);
    const contract = this._getContract();
    const balance = await contract.balanceOf(validatedAddress);
    return balance.toString();
  }

  /**
   * Gets the owner of the contract
   * @returns {Promise<string>} Owner address
   */
  async getOwner() {
    const contract = this._getContract();
    return await contract.owner();
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
    const contract = this._getContract();
    const allowance = await contract.allowance(validatedOwner, validatedSpender);
    return allowance.toString();
  }

  /**
   * Formats a token amount from smallest unit to human-readable format
   * @param {string|number} amount - Amount in smallest unit
   * @param {number} decimals - Token decimals (default: 18)
   * @returns {string} Formatted amount
   */
  formatAmount(amount, decimals = 18) {
    return ethers.formatUnits(amount, decimals);
  }

  /**
   * Parses a human-readable amount to smallest unit
   * @param {string} amount - Human-readable amount
   * @param {number} decimals - Token decimals (default: 18)
   * @returns {string} Amount in smallest unit
   */
  parseAmount(amount, decimals = 18) {
    return ethers.parseUnits(amount, decimals).toString();
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
