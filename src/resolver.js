/**
 * Resolver Module
 * Manages address to resolver address mappings
 * Provides functionality to set, get, and manage resolvers for addresses
 */

/**
 * Resolver Class
 * Manages relationships between addresses and their designated resolvers
 */
class Resolver {
  /**
   * Creates a new Resolver instance
   * @param {string} name - Name for this resolver instance
   */
  constructor(name = 'Default Resolver') {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Resolver name must be a non-empty string');
    }

    this.name = name;
    this.resolvers = new Map(); // Key: address, Value: resolver info
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
   * Sets a resolver for an address
   * @param {string} address - The address
   * @param {string} resolverAddress - The resolver's address
   * @param {object} metadata - Additional metadata
   * @returns {object} The resolver info
   * @throws {Error} If addresses are invalid
   */
  setResolver(address, resolverAddress, metadata = {}) {
    // Validate addresses
    const validatedAddress = this._validateAddress(address);
    const validatedResolver = this._validateAddress(resolverAddress);

    const resolverInfo = {
      address: validatedAddress,
      resolverAddress: validatedResolver,
      setAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata
    };

    this.resolvers.set(validatedAddress, resolverInfo);
    return resolverInfo;
  }

  /**
   * Gets the resolver for an address
   * @param {string} address - The address
   * @returns {object} The resolver info
   * @throws {Error} If address is not found or invalid
   */
  getResolver(address) {
    const validatedAddress = this._validateAddress(address);
    
    const resolverInfo = this.resolvers.get(validatedAddress);
    if (!resolverInfo) {
      throw new Error(`No resolver found for address ${validatedAddress}`);
    }

    return { ...resolverInfo };
  }

  /**
   * Checks if an address has a resolver assigned
   * @param {string} address - The address
   * @returns {boolean} True if resolver exists
   */
  hasResolver(address) {
    try {
      const validatedAddress = this._validateAddress(address);
      return this.resolvers.has(validatedAddress);
    } catch (error) {
      return false;
    }
  }

  /**
   * Removes a resolver for an address
   * @param {string} address - The address
   * @returns {boolean} True if resolver was removed
   * @throws {Error} If address is not found or invalid
   */
  removeResolver(address) {
    const validatedAddress = this._validateAddress(address);

    if (!this.resolvers.has(validatedAddress)) {
      throw new Error(`No resolver found for address ${validatedAddress}`);
    }

    return this.resolvers.delete(validatedAddress);
  }

  /**
   * Updates a resolver's information
   * @param {string} address - The address
   * @param {string} newResolverAddress - The new resolver's address
   * @param {object} metadata - Additional metadata
   * @returns {object} Updated resolver info
   * @throws {Error} If addresses are invalid or address not found
   */
  updateResolver(address, newResolverAddress, metadata = {}) {
    const validatedAddress = this._validateAddress(address);
    const validatedResolver = this._validateAddress(newResolverAddress);

    const currentInfo = this.getResolver(validatedAddress);

    const updatedInfo = {
      ...currentInfo,
      resolverAddress: validatedResolver,
      updatedAt: new Date().toISOString(),
      metadata: { ...currentInfo.metadata, ...metadata }
    };

    this.resolvers.set(validatedAddress, updatedInfo);
    return updatedInfo;
  }

  /**
   * Gets all resolver mappings
   * @returns {array} Array of all resolver info objects
   */
  getAllResolvers() {
    return Array.from(this.resolvers.values());
  }

  /**
   * Gets the count of resolvers
   * @returns {number} Number of resolver mappings
   */
  getResolverCount() {
    return this.resolvers.size;
  }

  /**
   * Clears all resolver assignments
   * @returns {void}
   */
  clearAll() {
    this.resolvers.clear();
  }

  /**
   * Exports all resolver data as JSON
   * @returns {object} JSON representation
   */
  toJSON() {
    return {
      name: this.name,
      createdAt: this.createdAt,
      resolverCount: this.resolvers.size,
      resolvers: Array.from(this.resolvers.entries()).map(([addr, info]) => ({
        address: addr,
        ...info
      }))
    };
  }

  /**
   * Imports resolver data from JSON
   * @param {object} data - JSON data to import
   * @returns {void}
   */
  fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data');
    }

    if (data.resolvers && Array.isArray(data.resolvers)) {
      this.resolvers.clear();
      data.resolvers.forEach(resolver => {
        if (resolver.address && resolver.resolverAddress) {
          this.setResolver(
            resolver.address,
            resolver.resolverAddress,
            resolver.metadata || {}
          );
        }
      });
    }
  }
}

module.exports = Resolver;
