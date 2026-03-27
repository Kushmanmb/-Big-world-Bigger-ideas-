/**
 * Token UUID Module
 * Provides UUID generation and validation for blockchain tokens and NFTs
 * Supports both random (v4) and deterministic (v5) UUIDs
 */

const { v4: uuidv4, v5: uuidv5, validate, version, NIL: NIL_UUID } = require('uuid');

/**
 * Token UUID namespace for generating deterministic UUIDs
 * This is a fixed UUID namespace specifically for token identification
 */
const TOKEN_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS namespace UUID

/**
 * TokenUUID class for managing token UUIDs
 */
class TokenUUID {
  /**
   * Creates a new TokenUUID instance
   * @param {string} namespace - Optional custom namespace UUID for v5 generation
   */
  constructor(namespace = null) {
    this.namespace = namespace || TOKEN_NAMESPACE;
    this.validateUUID(this.namespace, 'Namespace');
  }

  /**
   * Generates a random UUID v4
   * Use this for creating unique identifiers that don't need to be deterministic
   * @returns {string} A UUID v4 string
   */
  generateRandom() {
    return uuidv4();
  }

  /**
   * Generates a deterministic UUID v5 based on token information
   * Use this when you need the same input to always generate the same UUID
   * @param {string} contractAddress - The token contract address
   * @param {string|number} tokenId - The token ID
   * @returns {string} A UUID v5 string
   */
  generateForToken(contractAddress, tokenId) {
    if (!contractAddress || typeof contractAddress !== 'string') {
      throw new Error('Contract address must be a non-empty string');
    }

    if (tokenId === null || tokenId === undefined) {
      throw new Error('Token ID must be provided');
    }

    // Normalize the contract address to lowercase
    const normalizedAddress = contractAddress.toLowerCase().replace(/^0x/, '');
    
    // Validate address format (40 hex characters)
    if (!/^[0-9a-f]{40}$/i.test(normalizedAddress)) {
      throw new Error('Invalid Ethereum address format');
    }

    // Create a unique identifier by combining contract address and token ID
    const tokenIdentifier = `${normalizedAddress}:${tokenId.toString()}`;
    
    // Generate deterministic UUID v5
    return uuidv5(tokenIdentifier, this.namespace);
  }

  /**
   * Generates a deterministic UUID v5 for an ownership event
   * @param {string} contractAddress - The token contract address
   * @param {string|number} tokenId - The token ID
   * @param {string} from - Previous owner address
   * @param {string} to - New owner address
   * @param {number} timestamp - Unix timestamp
   * @returns {string} A UUID v5 string
   */
  generateForEvent(contractAddress, tokenId, from, to, timestamp) {
    if (!contractAddress || !from || !to) {
      throw new Error('Contract address, from, and to addresses must be provided');
    }

    if (tokenId === null || tokenId === undefined) {
      throw new Error('Token ID must be provided');
    }

    if (!timestamp || typeof timestamp !== 'number') {
      throw new Error('Timestamp must be a number');
    }

    // Normalize addresses
    const normalizedContract = contractAddress.toLowerCase().replace(/^0x/, '');
    const normalizedFrom = from.toLowerCase().replace(/^0x/, '');
    const normalizedTo = to.toLowerCase().replace(/^0x/, '');

    // Create a unique identifier for the event
    const eventIdentifier = `${normalizedContract}:${tokenId}:${normalizedFrom}:${normalizedTo}:${timestamp}`;
    
    // Generate deterministic UUID v5
    return uuidv5(eventIdentifier, this.namespace);
  }

  /**
   * Validates a UUID string
   * @param {string} uuid - The UUID to validate
   * @param {string} name - Optional name for error messages
   * @returns {boolean} True if valid
   * @throws {Error} If UUID is invalid
   */
  validateUUID(uuid, name = 'UUID') {
    if (!uuid || typeof uuid !== 'string') {
      throw new Error(`${name} must be a non-empty string`);
    }

    if (!validate(uuid)) {
      throw new Error(`${name} is not a valid UUID format`);
    }

    return true;
  }

  /**
   * Checks if a string is a valid UUID without throwing an error
   * @param {string} uuid - The UUID to check
   * @returns {boolean} True if valid, false otherwise
   */
  isValidUUID(uuid) {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }
    return validate(uuid);
  }

  /**
   * Gets the version of a UUID
   * @param {string} uuid - The UUID to check
   * @returns {number} The UUID version (1-5), or 0 if invalid
   */
  getVersion(uuid) {
    if (!this.isValidUUID(uuid)) {
      return 0;
    }
    return version(uuid);
  }

  /**
   * Checks if a UUID is a NIL UUID (all zeros)
   * @param {string} uuid - The UUID to check
   * @returns {boolean} True if NIL UUID
   */
  isNilUUID(uuid) {
    return uuid === NIL_UUID;
  }

  /**
   * Gets the NIL UUID constant
   * @returns {string} The NIL UUID
   */
  static getNilUUID() {
    return NIL_UUID;
  }

  /**
   * Gets the default token namespace UUID
   * @returns {string} The token namespace UUID
   */
  static getTokenNamespace() {
    return TOKEN_NAMESPACE;
  }

  /**
   * Creates a TokenUUID instance with a custom namespace
   * @param {string} namespace - Custom namespace UUID
   * @returns {TokenUUID} New instance with custom namespace
   */
  static withNamespace(namespace) {
    return new TokenUUID(namespace);
  }
}

module.exports = TokenUUID;
