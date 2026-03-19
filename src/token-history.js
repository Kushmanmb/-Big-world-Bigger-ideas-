/**
 * Token Ownership History Module
 * Tracks the ownership history of ERC-721 tokens in a git-style format
 * Similar to git commit history but for NFT token transfers
 */

/**
 * Represents a single ownership change event (similar to a git commit)
 */
class OwnershipEvent {
  /**
   * Creates a new ownership event
   * @param {string} tokenId - The token ID
   * @param {string} from - Previous owner address
   * @param {string} to - New owner address
   * @param {number} timestamp - Unix timestamp of the transfer
   * @param {string} transactionHash - Transaction hash of the transfer
   * @param {number} blockNumber - Block number of the transfer
   */
  constructor(tokenId, from, to, timestamp, transactionHash, blockNumber) {
    this.tokenId = tokenId;
    this.from = from;
    this.to = to;
    this.timestamp = timestamp;
    this.transactionHash = transactionHash;
    this.blockNumber = blockNumber;
    this.id = this.generateEventId();
  }

  /**
   * Generates a unique event ID (similar to git commit hash)
   * @returns {string} Event ID
   */
  generateEventId() {
    // Simple hash-like ID generation
    const data = `${this.tokenId}${this.from}${this.to}${this.timestamp}${this.transactionHash}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  /**
   * Formats the event as a git-style log entry
   * @returns {string} Formatted log entry
   */
  toGitLog() {
    const date = new Date(this.timestamp * 1000);
    return `commit ${this.id}
Author: ${this.to}
Date:   ${date.toISOString()}

    Transfer token #${this.tokenId} from ${this.from} to ${this.to}
    
    Transaction: ${this.transactionHash}
    Block: ${this.blockNumber}`;
  }

  /**
   * Formats the event as a compact one-line entry
   * @returns {string} Compact log entry
   */
  toShortLog() {
    const shortHash = this.id.substring(0, 8);
    const shortFrom = this.from.substring(0, 10);
    const shortTo = this.to.substring(0, 10);
    return `${shortHash} - Token #${this.tokenId}: ${shortFrom}... → ${shortTo}...`;
  }
}

/**
 * Token History Tracker
 * Manages and tracks ownership history for ERC-721 tokens
 */
class TokenHistoryTracker {
  /**
   * Creates a new token history tracker
   * @param {string} contractAddress - The ERC-721 contract address
   * @param {string} owner - The owner identifier (e.g., "kushmanmb")
   */
  constructor(contractAddress, owner = 'kushmanmb') {
    this.contractAddress = this.validateAddress(contractAddress);
    this.owner = owner;
    this.history = [];
    this.tokenOwners = new Map(); // Current token ownership state
    this.tokenHistoryIndex = new Map(); // tokenId -> array of events (for fast lookup)
  }

  /**
   * Validates an Ethereum address
   * @param {string} address - The address to validate
   * @returns {string} Validated address
   */
  validateAddress(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Address must be a non-empty string');
    }
    
    let cleanAddress = address.toLowerCase().replace(/^0x/, '');
    
    // Pad short addresses with zeros for testing purposes only
    // This allows tests to use short addresses like '0xaaaa' instead of full 40-char addresses
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
   * Appends an event to the per-token history index.
   * Initialises the bucket for the tokenId on first use.
   * @param {string} tokenId - The token ID
   * @param {OwnershipEvent} event - The event to index
   * @private
   */
  _indexEvent(tokenId, event) {
    if (!this.tokenHistoryIndex.has(tokenId)) {
      this.tokenHistoryIndex.set(tokenId, []);
    }
    this.tokenHistoryIndex.get(tokenId).push(event);
  }

  /**
   * Records a token transfer event
   * @param {string} tokenId - The token ID
   * @param {string} from - Previous owner address
   * @param {string} to - New owner address
   * @param {number} timestamp - Unix timestamp
   * @param {string} transactionHash - Transaction hash
   * @param {number} blockNumber - Block number
   */
  recordTransfer(tokenId, from, to, timestamp, transactionHash, blockNumber) {
    const validatedFrom = this.validateAddress(from);
    const validatedTo = this.validateAddress(to);
    
    const event = new OwnershipEvent(
      tokenId,
      validatedFrom,
      validatedTo,
      timestamp,
      transactionHash,
      blockNumber
    );
    
    this.history.push(event);
    this.tokenOwners.set(tokenId, validatedTo);

    // Keep the per-token index up to date for O(1) history lookup
    this._indexEvent(tokenId, event);
    
    return event;
  }

  /**
   * Gets the ownership history for a specific token
   * @param {string} tokenId - The token ID
   * @returns {Array<OwnershipEvent>} Array of ownership events
   */
  getTokenHistory(tokenId) {
    return this.tokenHistoryIndex.get(tokenId) || [];
  }

  /**
   * Gets all tokens currently owned by a specific address
   * @param {string} ownerAddress - The owner address
   * @returns {Array<string>} Array of token IDs
   */
  getTokensByOwner(ownerAddress) {
    const validatedAddress = this.validateAddress(ownerAddress);
    const tokens = [];
    
    // Both keys in tokenOwners and validatedAddress are already normalized to
    // lowercase by validateAddress(), so a direct equality check is sufficient.
    for (const [tokenId, owner] of this.tokenOwners.entries()) {
      if (owner === validatedAddress) {
        tokens.push(tokenId);
      }
    }
    
    return tokens;
  }

  /**
   * Gets the current owner of a token
   * @param {string} tokenId - The token ID
   * @returns {string|null} Owner address or null if not found
   */
  getCurrentOwner(tokenId) {
    return this.tokenOwners.get(tokenId) || null;
  }

  /**
   * Gets all ownership history for the specified owner
   * @param {string} ownerAddress - Optional owner address (defaults to tracker owner)
   * @returns {Array<OwnershipEvent>} Array of events involving the owner
   */
  getHistoryForOwner(ownerAddress = null) {
    const address = ownerAddress || this.owner;
    const validatedAddress = this.validateAddress(address);
    
    // event.from and event.to are stored as validated (lowercase) addresses,
    // so a direct equality check avoids redundant toLowerCase() calls per event.
    return this.history.filter(event => 
      event.from === validatedAddress ||
      event.to === validatedAddress
    );
  }

  /**
   * Formats the complete history in git log style
   * @param {number} limit - Maximum number of events to return (returns last N events)
   * @returns {string} Formatted git-style log
   */
  toGitLog(limit = null) {
    const events = limit ? this.history.slice(-limit) : this.history;
    return events.map(event => event.toGitLog()).join('\n\n');
  }

  /**
   * Formats the complete history in compact format
   * @param {number} limit - Maximum number of events to return (returns last N events)
   * @returns {string} Formatted compact log
   */
  toShortLog(limit = null) {
    const events = limit ? this.history.slice(-limit) : this.history;
    return events.map(event => event.toShortLog()).join('\n');
  }

  /**
   * Gets statistics about the ownership history
   * @returns {object} Statistics object
   */
  getStatistics() {
    const uniqueTokens = new Set();
    const uniqueAddresses = new Set();

    // Single pass instead of three separate map() iterations
    for (const e of this.history) {
      uniqueTokens.add(e.tokenId);
      uniqueAddresses.add(e.from);
      uniqueAddresses.add(e.to);
    }
    
    return {
      totalTransfers: this.history.length,
      uniqueTokens: uniqueTokens.size,
      uniqueAddresses: uniqueAddresses.size,
      currentOwners: this.tokenOwners.size,
      contract: this.contractAddress,
      trackedOwner: this.owner
    };
  }

  /**
   * Exports the history as JSON
   * @returns {object} History data
   */
  toJSON() {
    return {
      contract: this.contractAddress,
      owner: this.owner,
      statistics: this.getStatistics(),
      history: this.history.map(event => ({
        id: event.id,
        tokenId: event.tokenId,
        from: event.from,
        to: event.to,
        timestamp: event.timestamp,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      }))
    };
  }

  /**
   * Imports history from JSON
   * @param {object} data - JSON data to import
   */
  fromJSON(data) {
    this.contractAddress = data.contract;
    this.owner = data.owner;
    this.history = [];
    this.tokenOwners.clear();
    this.tokenHistoryIndex.clear();
    
    if (data.history) {
      for (const eventData of data.history) {
        const event = new OwnershipEvent(
          eventData.tokenId,
          eventData.from,
          eventData.to,
          eventData.timestamp,
          eventData.transactionHash,
          eventData.blockNumber
        );
        this.history.push(event);
        this.tokenOwners.set(eventData.tokenId, eventData.to);

        // Rebuild the per-token index
        this._indexEvent(eventData.tokenId, event);
      }
    }
  }
}

module.exports = {
  TokenHistoryTracker,
  OwnershipEvent
};
