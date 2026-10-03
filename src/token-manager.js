/**
 * Token Manager Module
 * Manages token address to manager address mappings
 * Provides functionality to set, get, and manage token managers
 */

/**
 * Token Manager Class
 * Manages relationships between token addresses and their designated managers
 */
class TokenManager {
  /**
   * Creates a new Token Manager instance
   * @param {string} name - Name for this token manager instance
   */
  constructor(name = 'Default Token Manager') {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Manager name must be a non-empty string');
    }

    this.name = name;
    this.managers = new Map(); // Key: token address, Value: manager info
    this.createdAt = new Date().toISOString();
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

    // Remove 0x prefix if present
    const cleanAddress = address.toLowerCase().replace(/^0x/, '');

    // Check if address is 40 hex characters
    if (!/^[0-9a-f]{40}$/i.test(cleanAddress)) {
      throw new Error('Invalid Ethereum address format');
    }

    return '0x' + cleanAddress;
  }

  /**
   * Sets a manager for a token address
   * @param {string} tokenAddress - The token contract address
   * @param {string} managerAddress - The manager's address
   * @param {object} metadata - Additional metadata
   * @returns {object} The manager info
   * @throws {Error} If addresses are invalid
   */
  setManager(tokenAddress, managerAddress, metadata = {}) {
    // Validate addresses
    const validatedToken = this._validateAddress(tokenAddress);
    const validatedManager = this._validateAddress(managerAddress);

    const managerInfo = {
      tokenAddress: validatedToken,
      managerAddress: validatedManager,
      setAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata
    };

    this.managers.set(validatedToken, managerInfo);
    return managerInfo;
  }

  /**
   * Gets the manager for a token address
   * @param {string} tokenAddress - The token contract address
   * @returns {object} The manager info
   * @throws {Error} If token address is not found or invalid
   */
  getManager(tokenAddress) {
    const validatedToken = this._validateAddress(tokenAddress);
    
    const managerInfo = this.managers.get(validatedToken);
    if (!managerInfo) {
      throw new Error(`No manager found for token address ${validatedToken}`);
    }

    return { ...managerInfo };
  }

  /**
   * Checks if a token has a manager assigned
   * @param {string} tokenAddress - The token contract address
   * @returns {boolean} True if manager exists
   */
  hasManager(tokenAddress) {
    try {
      const validatedToken = this._validateAddress(tokenAddress);
      return this.managers.has(validatedToken);
    } catch (error) {
      return false;
    }
  }

  /**
   * Removes a manager for a token address
   * @param {string} tokenAddress - The token contract address
   * @returns {boolean} True if manager was removed
   * @throws {Error} If token address is not found or invalid
   */
  removeManager(tokenAddress) {
    const validatedToken = this._validateAddress(tokenAddress);

    if (!this.managers.has(validatedToken)) {
      throw new Error(`No manager found for token address ${validatedToken}`);
    }

    return this.managers.delete(validatedToken);
  }

  /**
   * Updates a manager's information
   * @param {string} tokenAddress - The token contract address
   * @param {string} newManagerAddress - The new manager's address
   * @param {object} metadata - Additional metadata
   * @returns {object} Updated manager info
   * @throws {Error} If addresses are invalid or token not found
   */
  updateManager(tokenAddress, newManagerAddress, metadata = {}) {
    const validatedToken = this._validateAddress(tokenAddress);
    const validatedManager = this._validateAddress(newManagerAddress);

    const currentInfo = this.getManager(validatedToken);

    const updatedInfo = {
      ...currentInfo,
      managerAddress: validatedManager,
      updatedAt: new Date().toISOString(),
      metadata: { ...currentInfo.metadata, ...metadata }
    };

    this.managers.set(validatedToken, updatedInfo);
    return updatedInfo;
  }

  /**
   * Gets all managed tokens
   * @returns {array} Array of all manager info objects
   */
  getAllManagers() {
    return Array.from(this.managers.values());
  }

  /**
   * Gets the count of managed tokens
   * @returns {number} Number of managed tokens
   */
  getManagerCount() {
    return this.managers.size;
  }

  /**
   * Clears all manager assignments
   * @returns {void}
   */
  clearAll() {
    this.managers.clear();
  }

  /**
   * Exports all manager data as JSON
   * @returns {object} JSON representation
   */
  toJSON() {
    return {
      name: this.name,
      createdAt: this.createdAt,
      managerCount: this.managers.size,
      managers: Array.from(this.managers.entries()).map(([token, info]) => ({
        tokenAddress: token,
        ...info
      }))
    };
  }

  /**
   * Imports manager data from JSON
   * @param {object} data - JSON data to import
   * @returns {void}
   * @throws {Error} If data is invalid or contains duplicate token addresses
   */
  fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data');
    }

    if (data.managers && Array.isArray(data.managers)) {
      const seenAddresses = new Set();
      data.managers.forEach(manager => {
        if (manager.tokenAddress && manager.managerAddress) {
          const normalizedAddress = this._validateAddress(manager.tokenAddress);
          if (seenAddresses.has(normalizedAddress)) {
            throw new Error(`Duplicate token address in import data: ${normalizedAddress}`);
          }
          seenAddresses.add(normalizedAddress);
        }
      });

      this.managers.clear();
      data.managers.forEach(manager => {
        if (manager.tokenAddress && manager.managerAddress) {
          const managerInfo = this.setManager(
            manager.tokenAddress,
            manager.managerAddress,
            manager.metadata || {}
          );
          if (manager.setAt) {
            managerInfo.setAt = manager.setAt;
            this.managers.set(managerInfo.tokenAddress, managerInfo);
          }
        }
      });
    }
  }
}

module.exports = TokenManager;
