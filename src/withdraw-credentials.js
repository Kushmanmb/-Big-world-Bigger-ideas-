/**
 * Withdrawal Credentials Module
 * Manages withdrawal credentials for Ethereum staking and blockchain operations
 * Provides utilities for configuring, validating, and formatting withdrawal addresses
 */

/**
 * Withdrawal credential types for Ethereum Beacon Chain
 */
const WITHDRAWAL_TYPES = {
  BLS: '0x00', // BLS withdrawal credentials (legacy)
  EXECUTION: '0x01' // Execution layer withdrawal credentials (Ethereum address)
};

/**
 * Withdrawal Credentials Manager
 * Handles withdrawal credential configuration for blockchain operations
 */
class WithdrawalCredentials {
  /**
   * Creates a new Withdrawal Credentials Manager
   * @param {object} config - Configuration options
   * @param {string} config.owner - Owner identifier (e.g., 'kushmanmb')
   * @param {string} config.ensName - ENS name (e.g., 'kushmanmb.eth')
   * @param {string} config.withdrawalAddress - Ethereum address for withdrawals
   */
  constructor(config = {}) {
    this.owner = config.owner || 'kushmanmb';
    this.ensName = config.ensName || 'kushmanmb.eth';
    this.withdrawalAddress = config.withdrawalAddress || null;
    this.network = config.network || 'ethereum';
  }

  /**
   * Validates an Ethereum address
   * @param {string} address - Ethereum address to validate
   * @returns {boolean} True if address is valid
   */
  validateAddress(address) {
    if (!address) return false;
    
    // Remove 0x prefix if present
    const cleanAddress = address.toLowerCase().replace('0x', '');
    
    // Must be 40 hex characters
    if (cleanAddress.length !== 40) return false;
    
    // Must be valid hex
    return /^[0-9a-f]{40}$/i.test(cleanAddress);
  }

  /**
   * Validates withdrawal credentials format
   * @param {string} credentials - Withdrawal credentials to validate
   * @returns {object} Validation result with type and validity
   */
  validateWithdrawalCredentials(credentials) {
    if (!credentials || typeof credentials !== 'string') {
      return { valid: false, error: 'Credentials must be a string' };
    }

    // Remove 0x prefix if present
    const cleanCreds = credentials.toLowerCase().replace('0x', '');

    // Must be 64 hex characters (32 bytes)
    if (cleanCreds.length !== 64) {
      return { valid: false, error: 'Credentials must be 32 bytes (64 hex characters)' };
    }

    // Must be valid hex
    if (!/^[0-9a-f]{64}$/.test(cleanCreds)) {
      return { valid: false, error: 'Credentials must be valid hexadecimal' };
    }

    // Determine type based on prefix
    const prefix = '0x' + cleanCreds.substring(0, 2);
    let type = 'UNKNOWN';

    if (prefix === WITHDRAWAL_TYPES.BLS) {
      type = 'BLS';
    } else if (prefix === WITHDRAWAL_TYPES.EXECUTION) {
      type = 'EXECUTION';
    }

    return {
      valid: true,
      type,
      prefix,
      credentials: '0x' + cleanCreds
    };
  }

  /**
   * Sets withdrawal address
   * @param {string} address - Ethereum address
   * @throws {Error} If address is invalid
   */
  setWithdrawalAddress(address) {
    if (!this.validateAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }
    this.withdrawalAddress = address.toLowerCase();
  }

  /**
   * Gets the configured withdrawal address
   * @returns {string|null} Withdrawal address or null
   */
  getWithdrawalAddress() {
    return this.withdrawalAddress;
  }

  /**
   * Sets ENS name
   * @param {string} ensName - ENS name (e.g., 'kushmanmb.eth')
   */
  setENSName(ensName) {
    if (!ensName || !ensName.endsWith('.eth')) {
      throw new Error('Invalid ENS name - must end with .eth');
    }
    this.ensName = ensName.toLowerCase();
  }

  /**
   * Gets the configured ENS name
   * @returns {string} ENS name
   */
  getENSName() {
    return this.ensName;
  }

  /**
   * Converts Ethereum address to execution withdrawal credentials
   * @param {string} address - Ethereum address
   * @returns {string} Withdrawal credentials (32 bytes)
   */
  addressToWithdrawalCredentials(address) {
    if (!this.validateAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    const cleanAddress = address.toLowerCase().replace('0x', '');
    // Execution credentials: 0x01 prefix + 11 zero bytes (22 hex chars) + 20 bytes address (40 hex chars)
    // Total: 0x + 2 (prefix) + 22 (zeros) + 40 (address) = 66 characters
    const credentials = '0x01' + '0000000000000000000000' + cleanAddress;
    
    return credentials;
  }

  /**
   * Extracts Ethereum address from execution withdrawal credentials
   * @param {string} credentials - Withdrawal credentials
   * @returns {string|null} Ethereum address or null if not execution credentials
   */
  credentialsToAddress(credentials) {
    const validation = this.validateWithdrawalCredentials(credentials);
    
    if (!validation.valid || validation.type !== 'EXECUTION') {
      return null;
    }

    // Extract last 40 characters (20 bytes) as address
    const cleanCreds = credentials.replace('0x', '');
    const address = '0x' + cleanCreds.substring(24);
    
    return address;
  }

  /**
   * Formats withdrawal configuration for display
   * @returns {string} Formatted configuration
   */
  formatConfiguration() {
    let output = `
Withdrawal Credentials Configuration
${'='.repeat(50)}

Owner: ${this.owner}
ENS Name: ${this.ensName}
Network: ${this.network}
Withdrawal Address: ${this.withdrawalAddress || 'Not configured'}
`;

    if (this.withdrawalAddress) {
      const credentials = this.addressToWithdrawalCredentials(this.withdrawalAddress);
      output += `Withdrawal Credentials: ${credentials}\n`;
      output += `Credential Type: Execution Layer (${WITHDRAWAL_TYPES.EXECUTION})\n`;
    }

    output += `
Configuration Details:
  - BLS credentials prefix: ${WITHDRAWAL_TYPES.BLS}
  - Execution credentials prefix: ${WITHDRAWAL_TYPES.EXECUTION}
  - Update available: Yes (BLS -> Execution)
  - Withdrawals enabled: Yes (Ethereum Beacon Chain)
`;

    return output;
  }

  /**
   * Gets withdrawal configuration as JSON
   * @returns {object} Configuration object
   */
  toJSON() {
    const config = {
      owner: this.owner,
      ensName: this.ensName,
      network: this.network,
      withdrawalAddress: this.withdrawalAddress,
      withdrawalTypes: WITHDRAWAL_TYPES
    };

    if (this.withdrawalAddress) {
      config.withdrawalCredentials = this.addressToWithdrawalCredentials(this.withdrawalAddress);
    }

    return config;
  }

  /**
   * Exports configuration to environment variables format
   * @returns {string} Environment variables
   */
  toEnvFormat() {
    let output = '# Withdrawal Credentials Configuration\n';
    output += `WITHDRAWAL_OWNER=${this.owner}\n`;
    output += `WITHDRAWAL_ENS=${this.ensName}\n`;
    output += `WITHDRAWAL_NETWORK=${this.network}\n`;
    
    if (this.withdrawalAddress) {
      output += `WITHDRAWAL_ADDRESS=${this.withdrawalAddress}\n`;
      output += `WITHDRAWAL_CREDENTIALS=${this.addressToWithdrawalCredentials(this.withdrawalAddress)}\n`;
    }

    return output;
  }

  /**
   * Creates a configuration for kushmanmb with default settings
   * @returns {WithdrawalCredentials} Configured instance
   */
  static createKushmanmbConfig() {
    return new WithdrawalCredentials({
      owner: 'kushmanmb',
      ensName: 'kushmanmb.eth',
      network: 'ethereum'
    });
  }
}

module.exports = { WithdrawalCredentials, WITHDRAWAL_TYPES };
