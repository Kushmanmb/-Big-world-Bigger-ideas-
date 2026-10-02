/**
 * BTCK (BtcTurk) API Module
 * Provides functionality to fetch all public market data from the BtcTurk cryptocurrency exchange API
 *
 * API Documentation: https://docs.btcturk.com/
 */

const { makeRequest, CacheManager } = require('./http-client');

const BTCK_API_HOST = 'api.btcturk.com';

class BTCKFetcher {
  /**
   * Creates a new BTCKFetcher instance
   * @param {string} baseUrl - The BtcTurk API hostname (default: 'api.btcturk.com')
   */
  constructor(baseUrl = BTCK_API_HOST) {
    this.baseUrl = baseUrl;
    this.cacheManager = new CacheManager(60000); // 1 minute cache
    this.cache = this.cacheManager.cache;
    this.cacheTimeout = this.cacheManager.cacheTimeout;
  }

  /**
   * Makes an HTTPS GET request to the BtcTurk API
   * @param {string} endpoint - The API endpoint path (including query string if needed)
   * @returns {Promise<any>} Parsed JSON response
   * @private
   */
  _makeRequest(endpoint) {
    return makeRequest({
      hostname: this.baseUrl,
      path: endpoint,
      headers: {
        'User-Agent': 'kushmanmb/yaketh'
      }
    });
  }

  /**
   * Gets data from cache or fetches if not cached
   * @param {string} cacheKey - The cache key
   * @param {Function} fetcher - Function that returns a promise to fetch data
   * @returns {Promise<any>} Cached or fetched data
   * @private
   */
  async _getWithCache(cacheKey, fetcher) {
    return await this.cacheManager.getWithCache(cacheKey, fetcher);
  }

  /**
   * Fetches exchange info — the full list of supported currencies and trading pairs
   * @returns {Promise<object>} Exchange info data
   */
  async getExchangeInfo() {
    const endpoint = '/api/v2/server/exchangeinfo';
    return await this._getWithCache('exchange-info', () => this._makeRequest(endpoint));
  }

  /**
   * Fetches ticker snapshots (last trade, best bid/ask, 24h volume)
   * @param {string|null} pairSymbol - Optional trading pair symbol (e.g. 'BTCTRY'). Omit to get all tickers.
   * @returns {Promise<object>} Ticker data
   */
  async getTickers(pairSymbol = null) {
    const endpoint = pairSymbol
      ? `/api/v2/ticker?pairSymbol=${encodeURIComponent(pairSymbol)}`
      : '/api/v2/ticker';
    const cacheKey = pairSymbol ? `ticker-${pairSymbol}` : 'ticker-all';
    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches the current order book for a trading pair
   * @param {string} pairSymbol - Trading pair symbol (e.g. 'BTCTRY')
   * @param {number} [limit=25] - Number of bids/asks to return (default: 25)
   * @returns {Promise<object>} Order book data
   * @throws {Error} If pairSymbol is not provided
   */
  async getOrderBook(pairSymbol, limit = 25) {
    if (!pairSymbol) {
      throw new Error('pairSymbol is required for getOrderBook');
    }
    const endpoint = `/api/v2/orderbook?pairSymbol=${encodeURIComponent(pairSymbol)}&limit=${limit}`;
    const cacheKey = `orderbook-${pairSymbol}-${limit}`;
    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches the latest trades for a trading pair
   * @param {string} pairSymbol - Trading pair symbol (e.g. 'BTCTRY')
   * @param {number} [last=50] - Number of trades to return (default: 50)
   * @returns {Promise<object>} Trades data
   * @throws {Error} If pairSymbol is not provided
   */
  async getTrades(pairSymbol, last = 50) {
    if (!pairSymbol) {
      throw new Error('pairSymbol is required for getTrades');
    }
    const endpoint = `/api/v1/trades?pairSymbol=${encodeURIComponent(pairSymbol)}&last=${last}`;
    const cacheKey = `trades-${pairSymbol}-${last}`;
    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches OHLC (Open, High, Low, Close) candlestick data for a trading pair
   * @param {string} pair - Trading pair symbol (e.g. 'BTCTRY')
   * @returns {Promise<object>} OHLC data
   * @throws {Error} If pair is not provided
   */
  async getOHLC(pair) {
    if (!pair) {
      throw new Error('pair is required for getOHLC');
    }
    const endpoint = `/api/v2/ohlc?pair=${encodeURIComponent(pair)}`;
    const cacheKey = `ohlc-${pair}`;
    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches historical kline/candlestick data for a trading pair
   * @param {string} symbol - Trading pair symbol (e.g. 'BTCTRY')
   * @param {number} resolution - Candle resolution in minutes (e.g. 1, 5, 15, 30, 60, 240, 1440)
   * @param {number} from - Start time as Unix timestamp in seconds
   * @param {number} to - End time as Unix timestamp in seconds
   * @returns {Promise<object>} Kline history data
   * @throws {Error} If required parameters are missing or invalid
   */
  async getKlines(symbol, resolution, from, to) {
    if (!symbol) {
      throw new Error('symbol is required for getKlines');
    }
    if (typeof resolution !== 'number' || resolution <= 0) {
      throw new Error('resolution must be a positive number (minutes)');
    }
    if (!from || !to) {
      throw new Error('from and to timestamps are required for getKlines');
    }
    if (from >= to) {
      throw new Error('from must be earlier than to');
    }
    const endpoint = `/api/v2/klines/history?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}`;
    const cacheKey = `klines-${symbol}-${resolution}-${from}-${to}`;
    return await this._getWithCache(cacheKey, () => this._makeRequest(endpoint));
  }

  /**
   * Fetches all available public data in a single call
   * Retrieves exchange info and all tickers concurrently
   * @returns {Promise<object>} Object containing exchangeInfo and tickers
   */
  async fetchAll() {
    const [exchangeInfo, tickers] = await Promise.all([
      this.getExchangeInfo(),
      this.getTickers()
    ]);
    return { exchangeInfo, tickers };
  }

  /**
   * Formats ticker data for display
   * @param {object} data - Raw ticker response from the API
   * @returns {string} Formatted output
   */
  formatTickers(data) {
    if (!data || typeof data !== 'object') {
      return 'No data available';
    }

    const items = Array.isArray(data)
      ? data
      : (data.data && Array.isArray(data.data) ? data.data : [data]);

    let output = 'BtcTurk (BTCK) Tickers\n';
    output += '='.repeat(60) + '\n\n';
    output += `Total pairs: ${items.length}\n\n`;

    items.slice(0, 10).forEach((ticker, index) => {
      output += `${index + 1}. ${ticker.pairNumerator || ''}/${ticker.pairDenominator || ''}\n`;
      if (ticker.last !== undefined) output += `   Last:   ${ticker.last}\n`;
      if (ticker.bid !== undefined) output += `   Bid:    ${ticker.bid}\n`;
      if (ticker.ask !== undefined) output += `   Ask:    ${ticker.ask}\n`;
      if (ticker.volume !== undefined) output += `   Volume: ${ticker.volume}\n`;
      if (ticker.high !== undefined) output += `   High:   ${ticker.high}\n`;
      if (ticker.low !== undefined) output += `   Low:    ${ticker.low}\n`;
      output += '\n';
    });

    if (items.length > 10) {
      output += `... and ${items.length - 10} more pairs\n`;
    }

    return output;
  }

  /**
   * Clears the response cache
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
}

module.exports = BTCKFetcher;
