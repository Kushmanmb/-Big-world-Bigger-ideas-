/**
 * Git Fetch Rewards Module
 * Fetches blockchain block rewards using git-style commands and log formatting.
 * Currently implements Bitcoin rewards via mempool.space; Ethereum support is
 * experimental/placeholder and does not yet fetch real on-chain data.
 *
 * Inspired by `git fetch`: retrieves reward data from remote blockchain sources
 * and stores them locally as "commits" in a reward history log.
 */

const { makeRequest, CacheManager } = require('./http-client');

/**
 * Represents a single reward event — analogous to a git commit.
 */
class RewardCommit {
  /**
   * Creates a new RewardCommit
   * @param {object} params - Reward parameters
   * @param {string} params.source - Data source identifier (e.g. 'bitcoin', 'ethereum')
   * @param {number} params.timestamp - Unix timestamp of the reward event
   * @param {number|string} params.blockHeight - Block height of the reward event
   * @param {number|string} params.amount - Reward amount (in the chain's native unit)
   * @param {string} params.unit - Currency unit label (e.g. 'BTC', 'ETH')
   * @param {object} [params.extra] - Additional metadata
   */
  constructor({ source, timestamp, blockHeight, amount, unit, extra = {} }) {
    this.source = source;
    this.timestamp = timestamp;
    this.blockHeight = blockHeight;
    this.amount = amount;
    this.unit = unit;
    this.extra = extra;
    this.hash = this._generateHash();
  }

  /**
   * Generates a git-commit-style short hash from the event data
   * @returns {string} 8-character hex hash
   * @private
   */
  _generateHash() {
    const raw = `${this.source}${this.timestamp}${this.blockHeight}${this.amount}`;
    let h = 0;
    for (let i = 0; i < raw.length; i++) {
      h = Math.imul(31, h) + raw.charCodeAt(i) | 0;
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Formats this reward event as a full git-style log entry
   * @returns {string} Multi-line git log entry
   */
  toGitLog() {
    const date = new Date(this.timestamp * 1000).toISOString();
    return `commit ${this.hash}
Source: ${this.source}
Date:   ${date}

    Block reward at height #${this.blockHeight}
    Amount: ${this.amount} ${this.unit}`;
  }

  /**
   * Formats this reward event as a compact one-line log entry
   * @returns {string} Single-line summary
   */
  toShortLog() {
    const date = new Date(this.timestamp * 1000).toISOString().slice(0, 10);
    return `${this.hash} [${date}] Block #${this.blockHeight} — ${this.amount} ${this.unit} (${this.source})`;
  }
}

/**
 * GitFetchRewards — the main class.
 *
 * Analogous to a local git repository: you `fetch` reward data from a remote
 * blockchain source, and the results are recorded as RewardCommit objects that
 * can be displayed with `log()` or `shortLog()`.
 */
class GitFetchRewards {
  /**
   * Creates a new GitFetchRewards instance
   * @param {object} [options={}] - Configuration options
   * @param {string} [options.bitcoinBaseUrl='mempool.space'] - Bitcoin API base URL
   * @param {number} [options.cacheTimeout=60000] - Cache TTL in milliseconds
   */
  constructor(options = {}) {
    this.bitcoinBaseUrl = options.bitcoinBaseUrl || 'mempool.space';
    this.cacheManager = new CacheManager(options.cacheTimeout || 60000);
    // Expose cache for backward-compatible tests
    this.cache = this.cacheManager.cache;
    this.cacheTimeout = this.cacheManager.cacheTimeout;

    /** @type {RewardCommit[]} */
    this.commits = [];
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * @private
   */
  _makeRequest(hostname, path) {
    return makeRequest({
      hostname,
      path,
      headers: { 'User-Agent': 'kushmanmb/yaketh' }
    });
  }

  /**
   * @private
   */
  async _getWithCache(key, fetcher) {
    return this.cacheManager.getWithCache(key, fetcher);
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  /**
   * Validates a rewards time period string accepted by the Bitcoin API
   * @param {string} period - Time period string
   * @returns {string} Validated period
   * @throws {Error} If the period is not valid
   */
  validatePeriod(period) {
    const valid = ['1d', '3d', '1w', '1m', '3m', '6m', '1y', '2y', '3y', 'all'];
    if (!valid.includes(period)) {
      throw new Error(`Invalid period '${period}'. Must be one of: ${valid.join(', ')}`);
    }
    return period;
  }

  /**
   * Validates the source string
   * @param {string} source - Reward source ('bitcoin' or 'ethereum')
   * @returns {string} Validated source
   * @throws {Error} If the source is not supported
   */
  validateSource(source) {
    const supported = ['bitcoin', 'ethereum'];
    if (!supported.includes(source)) {
      throw new Error(`Unsupported source '${source}'. Supported sources: ${supported.join(', ')}`);
    }
    return source;
  }

  // ---------------------------------------------------------------------------
  // Fetch — the core "git fetch" operation
  // ---------------------------------------------------------------------------

  /**
   * Fetches block rewards from the specified blockchain source and appends them
   * to the internal commit history (analogous to `git fetch <remote>`).
   *
   * @param {string} [source='bitcoin'] - Blockchain source: 'bitcoin' | 'ethereum'
   * @param {string} [period='1w'] - Time period for Bitcoin: '1d','3d','1w','1m','3m','6m','1y','2y','3y','all'
   * @returns {Promise<RewardCommit[]>} Array of newly fetched RewardCommit objects
   * @throws {Error} If source or period is invalid, or the API request fails
   */
  async fetch(source = 'bitcoin', period = '1w') {
    this.validateSource(source);

    let newCommits;
    if (source === 'bitcoin') {
      newCommits = await this._fetchBitcoinRewards(period);
    } else {
      newCommits = await this._fetchEthereumRewards(period);
    }

    this.commits.push(...newCommits);
    return newCommits;
  }

  /**
   * Fetches Bitcoin block rewards from mempool.space
   * @param {string} period - Time period
   * @returns {Promise<RewardCommit[]>}
   * @private
   */
  async _fetchBitcoinRewards(period) {
    this.validatePeriod(period);
    const cacheKey = `btc-rewards-${period}`;
    const path = `/api/v1/mining/blocks/rewards/${period}`;

    const data = await this._getWithCache(cacheKey, () =>
      this._makeRequest(this.bitcoinBaseUrl, path)
    );

    return this._parseBitcoinRewards(data);
  }

  /**
   * Converts raw Bitcoin API response into RewardCommit objects
   * @param {Array} data - Raw API response array
   * @returns {RewardCommit[]}
   * @private
   */
  _parseBitcoinRewards(data) {
    if (!Array.isArray(data)) return [];
    return data.map(entry => new RewardCommit({
      source: 'bitcoin',
      timestamp: entry.timestamp || 0,
      blockHeight: entry.blockHeight || entry.avgHeight || 0,
      amount: entry.avgRewards != null
        ? (entry.avgRewards / 1e8).toFixed(8)    // satoshis → BTC
        : (entry.totalRewards != null
            ? (entry.totalRewards / 1e8).toFixed(8)
            : '0'),
      unit: 'BTC',
      extra: {
        blockCount: entry.blockCount,
        totalRewards: entry.totalRewards
      }
    }));
  }

  /**
   * Placeholder fetch for Ethereum staking rewards.
   * Returns sample/mock data because a full beacon-chain API integration
   * would require additional credentials outside this module's scope.
   * Replace the body of this method to plug in a real data source.
   * @returns {Promise<RewardCommit[]>}
   * @private
   */
  async _fetchEthereumRewards(/* period */) {
    // Return a representative sample to demonstrate the interface
    const now = Math.floor(Date.now() / 1000);
    return [
      new RewardCommit({
        source: 'ethereum',
        timestamp: now,
        blockHeight: 0,
        amount: '0',
        unit: 'ETH',
        extra: { note: 'Ethereum staking rewards require a beacon-chain API key.' }
      })
    ];
  }

  // ---------------------------------------------------------------------------
  // Log display — git log / git log --oneline equivalents
  // ---------------------------------------------------------------------------

  /**
   * Returns the full git-style log of all fetched reward commits.
   * Analogous to `git log`.
   *
   * @param {number|null} [limit=null] - Maximum number of entries (most-recent first)
   * @returns {string} Formatted multi-line log
   */
  log(limit = null) {
    const entries = limit ? this.commits.slice(-limit) : this.commits;
    if (entries.length === 0) {
      return '(no rewards fetched yet — run fetch() first)';
    }
    return entries
      .slice()
      .reverse()
      .map(c => c.toGitLog())
      .join('\n\n');
  }

  /**
   * Returns a compact one-line-per-commit log.
   * Analogous to `git log --oneline`.
   *
   * @param {number|null} [limit=null] - Maximum number of entries (most-recent first)
   * @returns {string} Formatted compact log
   */
  shortLog(limit = null) {
    const entries = limit ? this.commits.slice(-limit) : this.commits;
    if (entries.length === 0) {
      return '(no rewards fetched yet — run fetch() first)';
    }
    return entries
      .slice()
      .reverse()
      .map(c => c.toShortLog())
      .join('\n');
  }

  // ---------------------------------------------------------------------------
  // Statistics and utilities
  // ---------------------------------------------------------------------------

  /**
   * Returns statistics about the locally stored reward commits.
   * @returns {object} Statistics object
   */
  getStats() {
    const bySource = {};
    for (const c of this.commits) {
      if (!bySource[c.source]) bySource[c.source] = { count: 0, totalAmount: 0, unit: c.unit };
      bySource[c.source].count++;
      bySource[c.source].totalAmount += parseFloat(c.amount) || 0;
    }

    return {
      totalCommits: this.commits.length,
      bySource,
      cacheSize: this.cacheManager.cache.size
    };
  }

  /**
   * Clears both the local commit history and the API response cache.
   * Analogous to removing your local git clone.
   */
  clearHistory() {
    this.commits = [];
    this.cacheManager.clearCache();
  }

  /**
   * Clears only the API response cache.
   */
  clearCache() {
    this.cacheManager.clearCache();
  }

  /**
   * Returns cache statistics
   * @returns {object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cacheManager.cache.size,
      timeout: this.cacheManager.cacheTimeout,
      keys: Array.from(this.cacheManager.cache.keys())
    };
  }
}

module.exports = { GitFetchRewards, RewardCommit };
