/**
 * Reverse Register Module
 * A git-style blockchain asset register with forward and reverse log traversal.
 * Supports `git log` (newest-first) and `git log --reverse` (oldest-first) views
 * over a register of keyed blockchain entries.
 */

/**
 * Represents a single entry in the register (analogous to a git commit)
 */
class RegisterEntry {
  /**
   * Creates a new register entry
   * @param {string} key - The registered key (e.g., ENS name, token ID, asset identifier)
   * @param {string} value - The value being registered (e.g., address, metadata hash)
   * @param {string} registrant - Address or identifier of the registrant
   * @param {number} timestamp - Unix timestamp of the registration
   * @param {string} transactionHash - Transaction hash of the registration
   * @param {number} blockNumber - Block number of the registration
   * @param {object} [metadata={}] - Optional additional metadata
   */
  constructor(key, value, registrant, timestamp, transactionHash, blockNumber, metadata = {}) {
    this.key = key;
    this.value = value;
    this.registrant = registrant;
    this.timestamp = timestamp;
    this.transactionHash = transactionHash;
    this.blockNumber = blockNumber;
    this.metadata = metadata;
    this.id = this.generateEntryId();
  }

  /**
   * Generates a unique entry ID (analogous to a git commit hash)
   * @returns {string} Entry ID
   */
  generateEntryId() {
    const data = `${this.key}${this.value}${this.registrant}${this.timestamp}${this.transactionHash}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  /**
   * Formats the entry as a git-style log line
   * @returns {string} Formatted log entry
   */
  toGitLog() {
    const date = new Date(this.timestamp * 1000);
    return `commit ${this.id}
Author: ${this.registrant}
Date:   ${date.toISOString()}

    Register "${this.key}" → ${this.value}
    
    Transaction: ${this.transactionHash}
    Block: ${this.blockNumber}`;
  }

  /**
   * Formats the entry as a compact one-line log entry
   * @returns {string} Compact log entry
   */
  toShortLog() {
    const shortHash = this.id.substring(0, 8);
    const shortRegistrant = this.registrant.substring(0, 10);
    return `${shortHash} - "${this.key}" → ${this.value} (by ${shortRegistrant}...)`;
  }
}

/**
 * Reverse Register
 * Maintains a git-style register of keyed blockchain entries that can be
 * traversed newest-first (toGitLog) or oldest-first (toReverseLog).
 */
class ReverseRegister {
  /**
   * Creates a new reverse register
   * @param {string} name - Descriptive name for this register (e.g., "ENS Registry")
   * @param {string} owner - The owner identifier (e.g., "kushmanmb")
   */
  constructor(name, owner = 'kushmanmb') {
    if (!name || typeof name !== 'string') {
      throw new Error('Register name must be a non-empty string');
    }
    this.name = name;
    this.owner = owner;
    this.entries = [];           // All entries in insertion (chronological) order
    this._registry = new Map();  // Current value per key
  }

  /**
   * Validates an Ethereum address
   * @param {string} address - The address to validate
   * @returns {string} Validated and normalized address
   */
  validateAddress(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Address must be a non-empty string');
    }

    let cleanAddress = address.toLowerCase().replace(/^0x/, '');

    // Pad short addresses with zeros for testing purposes only
    // Production usage should always provide full 40-character addresses
    if (/^[0-9a-f]+$/i.test(cleanAddress) && cleanAddress.length < 40) {
      cleanAddress = cleanAddress.padStart(40, '0');
    }

    if (!/^[0-9a-f]{40}$/i.test(cleanAddress)) {
      throw new Error('Invalid Ethereum address format');
    }

    return '0x' + cleanAddress;
  }

  /**
   * Registers a key-value entry
   * @param {string} key - The key to register
   * @param {string} value - The value to associate with the key
   * @param {string} registrant - Address of the registrant
   * @param {number} timestamp - Unix timestamp of the registration
   * @param {string} transactionHash - Transaction hash
   * @param {number} blockNumber - Block number
   * @param {object} [metadata={}] - Optional additional metadata
   * @returns {RegisterEntry} The created entry
   */
  register(key, value, registrant, timestamp, transactionHash, blockNumber, metadata = {}) {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }
    if (value === undefined || value === null) {
      throw new Error('Value must be provided');
    }

    const validatedRegistrant = this.validateAddress(registrant);

    const entry = new RegisterEntry(
      key,
      value,
      validatedRegistrant,
      timestamp,
      transactionHash,
      blockNumber,
      metadata
    );

    this.entries.push(entry);
    this._registry.set(key, value);

    return entry;
  }

  /**
   * Looks up the current registered value for a key
   * @param {string} key - The key to look up
   * @returns {string|null} Current value or null if not registered
   */
  lookup(key) {
    return this._registry.get(key) || null;
  }

  /**
   * Gets all registration history for a specific key
   * @param {string} key - The key to query
   * @returns {Array<RegisterEntry>} Array of entries for the key (oldest-first)
   */
  getHistory(key) {
    return this.entries.filter(entry => entry.key === key);
  }

  /**
   * Gets all entries made by a specific registrant
   * @param {string} registrantAddress - The registrant address
   * @returns {Array<RegisterEntry>} Array of entries by the registrant
   */
  getEntriesByRegistrant(registrantAddress) {
    const validated = this.validateAddress(registrantAddress);
    return this.entries.filter(
      entry => entry.registrant.toLowerCase() === validated.toLowerCase()
    );
  }

  /**
   * Returns all currently registered keys
   * @returns {Array<string>} Array of registered keys
   */
  listKeys() {
    return Array.from(this._registry.keys());
  }

  /**
   * Formats history newest-first (standard `git log` order)
   * @param {number} [limit=null] - Maximum number of entries to return
   * @returns {string} Formatted git-style log (newest entry first)
   */
  toGitLog(limit = null) {
    const all = this.entries.slice().reverse(); // newest first
    const events = limit ? all.slice(0, limit) : all;
    return events.map(entry => entry.toGitLog()).join('\n\n');
  }

  /**
   * Formats history oldest-first (`git log --reverse` order)
   * @param {number} [limit=null] - Maximum number of entries to return
   * @returns {string} Formatted git-style log (oldest entry first)
   */
  toReverseLog(limit = null) {
    const events = limit ? this.entries.slice(0, limit) : this.entries;
    return events.map(entry => entry.toGitLog()).join('\n\n');
  }

  /**
   * Formats compact one-line history newest-first
   * @param {number} [limit=null] - Maximum number of entries to return
   * @returns {string} Compact log (newest entry first)
   */
  toShortLog(limit = null) {
    const all = this.entries.slice().reverse();
    const events = limit ? all.slice(0, limit) : all;
    return events.map(entry => entry.toShortLog()).join('\n');
  }

  /**
   * Formats compact one-line history oldest-first (`git log --reverse`)
   * @param {number} [limit=null] - Maximum number of entries to return
   * @returns {string} Compact reverse log (oldest entry first)
   */
  toReverseShortLog(limit = null) {
    const events = limit ? this.entries.slice(0, limit) : this.entries;
    return events.map(entry => entry.toShortLog()).join('\n');
  }

  /**
   * Gets statistics about the register
   * @returns {object} Statistics object
   */
  getStatistics() {
    const uniqueKeys = new Set(this.entries.map(e => e.key));
    const uniqueRegistrants = new Set(this.entries.map(e => e.registrant));

    return {
      totalEntries: this.entries.length,
      uniqueKeys: uniqueKeys.size,
      activeKeys: this._registry.size,
      uniqueRegistrants: uniqueRegistrants.size,
      name: this.name,
      owner: this.owner
    };
  }

  /**
   * Exports the register as JSON
   * @returns {object} Register data
   */
  toJSON() {
    return {
      name: this.name,
      owner: this.owner,
      statistics: this.getStatistics(),
      entries: this.entries.map(entry => ({
        id: entry.id,
        key: entry.key,
        value: entry.value,
        registrant: entry.registrant,
        timestamp: entry.timestamp,
        transactionHash: entry.transactionHash,
        blockNumber: entry.blockNumber,
        metadata: entry.metadata
      }))
    };
  }

  /**
   * Imports register data from JSON
   * @param {object} data - JSON data to import
   */
  fromJSON(data) {
    this.name = data.name;
    this.owner = data.owner;
    this.entries = [];
    this._registry.clear();

    if (data.entries) {
      for (const entryData of data.entries) {
        const entry = new RegisterEntry(
          entryData.key,
          entryData.value,
          entryData.registrant,
          entryData.timestamp,
          entryData.transactionHash,
          entryData.blockNumber,
          entryData.metadata || {}
        );
        this.entries.push(entry);
        this._registry.set(entryData.key, entryData.value);
      }
    }
  }
}

module.exports = {
  ReverseRegister,
  RegisterEntry
};
