/**
 * Staked ETH Balance Module
 * Provides functionality to fetch staked ETH balances including:
 * - Liquid staking tokens: stETH (Lido), rETH (Rocket Pool), cbETH (Coinbase), wstETH (Wrapped stETH)
 * - Native ETH staking via Beacon Chain validators (beaconcha.in API)
 */

'use strict';

const https = require('https');
const { CacheManager } = require('./http-client');

// Known liquid staking token contracts on Ethereum mainnet
const LIQUID_STAKING_CONTRACTS = {
  stETH: {
    address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    name: 'Lido Staked ETH',
    symbol: 'stETH'
  },
  rETH: {
    address: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    name: 'Rocket Pool ETH',
    symbol: 'rETH'
  },
  cbETH: {
    address: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
    name: 'Coinbase Wrapped Staked ETH',
    symbol: 'cbETH'
  },
  wstETH: {
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    name: 'Wrapped Liquid Staked Ether 2.0',
    symbol: 'wstETH'
  }
};

// ERC-20 balanceOf(address) function selector: keccak256('balanceOf(address)')[0..3]
const BALANCE_OF_SELECTOR = '0x70a08231';

class StakedEthFetcher {
  /**
   * Creates a new StakedEthFetcher instance
   * @param {string} rpcUrl - Ethereum JSON-RPC endpoint (default: ethereum.publicnode.com)
   * @param {string} beaconApiUrl - Beacon chain API hostname (default: beaconcha.in)
   */
  constructor(rpcUrl = 'https://ethereum.publicnode.com', beaconApiUrl = 'beaconcha.in') {
    this.rpcUrl = rpcUrl;
    this.beaconApiUrl = beaconApiUrl;
    this.cacheManager = new CacheManager(60000); // 1 minute cache
    this.requestId = 0;
  }

  /**
   * Validates an Ethereum address
   * @param {string} address - The address to validate
   * @returns {boolean} True if valid
   * @private
   */
  _validateAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Encodes a balanceOf(address) call for a given owner address
   * @param {string} address - The owner address (0x-prefixed)
   * @returns {string} ABI-encoded call data
   * @private
   */
  _encodeBalanceOf(address) {
    const paddedAddress = address.slice(2).toLowerCase().padStart(64, '0');
    return BALANCE_OF_SELECTOR + paddedAddress;
  }

  /**
   * Decodes a uint256 hex value returned from an eth_call
   * @param {string} hexData - Hex-encoded return value
   * @returns {string} Decimal string representation
   * @private
   */
  _decodeUint256(hexData) {
    if (!hexData || hexData === '0x' || hexData === '') {
      return '0';
    }
    const hex = hexData.startsWith('0x') ? hexData.slice(2) : hexData;
    if (!hex) return '0';
    return BigInt('0x' + hex).toString();
  }

  /**
   * Converts a wei value to an ETH string with 18 decimal places
   * @param {string} wei - Wei value as a decimal string
   * @returns {string} ETH value as a string
   * @private
   */
  _weiToEth(wei) {
    if (!wei || wei === '0') return '0.000000000000000000';
    const weiBI = BigInt(wei);
    const divisor = BigInt('1000000000000000000'); // 10^18
    const whole = weiBI / divisor;
    const remainder = weiBI % divisor;
    return `${whole}.${remainder.toString().padStart(18, '0')}`;
  }

  /**
   * Converts a Gwei value to an ETH string with 9 decimal places
   * @param {string|number} gwei - Gwei value
   * @returns {string} ETH value as a string
   * @private
   */
  _gweiToEth(gwei) {
    if (!gwei && gwei !== 0) return '0.000000000';
    const gweiBI = BigInt(gwei);
    const divisor = BigInt('1000000000'); // 10^9
    const whole = gweiBI / divisor;
    const remainder = gweiBI % divisor;
    return `${whole}.${remainder.toString().padStart(9, '0')}`;
  }

  /**
   * Makes a JSON-RPC POST request to the configured Ethereum node
   * @param {string} method - JSON-RPC method
   * @param {Array} params - Method parameters
   * @returns {Promise<any>} RPC result
   * @private
   */
  async _makeRpcRequest(method, params = []) {
    const url = new URL(this.rpcUrl);
    const body = JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: ++this.requestId
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const protocol = url.protocol === 'https:' ? https : require('http');
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              reject(new Error(`RPC Error: ${parsed.error.message || JSON.stringify(parsed.error)}`));
              return;
            }
            resolve(parsed.result);
          } catch (e) {
            reject(new Error(`Failed to parse RPC response: ${e.message}`));
          }
        });
      });

      req.on('error', e => reject(new Error(`RPC request failed: ${e.message}`)));
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('RPC request timeout'));
      });
      req.write(body);
      req.end();
    });
  }

  /**
   * Makes a GET request to the beacon chain API
   * @param {string} path - API path
   * @returns {Promise<object>} Parsed JSON response
   * @private
   */
  async _makeBeaconRequest(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.beaconApiUrl,
        port: 443,
        path,
        method: 'GET',
        headers: { 'User-Agent': 'kushmanmb/staked-eth' }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse beacon API response: ${e.message}`));
          }
        });
      });

      req.on('error', e => reject(new Error(`Beacon API request failed: ${e.message}`)));
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Beacon API request timeout'));
      });
      req.end();
    });
  }

  /**
   * Fetches the balance of a specific liquid staking token for an address
   * @param {string} address - Ethereum address (0x-prefixed)
   * @param {string} tokenSymbol - Token symbol: 'stETH', 'rETH', 'cbETH', or 'wstETH'
   * @returns {Promise<object>} Balance info including wei and ETH values
   * @throws {Error} If address is invalid or token symbol is unknown
   */
  async getLiquidTokenBalance(address, tokenSymbol) {
    if (!this._validateAddress(address)) {
      throw new Error('Invalid Ethereum address format');
    }

    const token = LIQUID_STAKING_CONTRACTS[tokenSymbol];
    if (!token) {
      const validTokens = Object.keys(LIQUID_STAKING_CONTRACTS).join(', ');
      throw new Error(`Unknown liquid staking token: ${tokenSymbol}. Valid tokens: ${validTokens}`);
    }

    const cacheKey = `liquid-${tokenSymbol}-${address.toLowerCase()}`;

    return await this.cacheManager.getWithCache(cacheKey, async () => {
      const data = this._encodeBalanceOf(address);
      const result = await this._makeRpcRequest('eth_call', [
        { to: token.address, data },
        'latest'
      ]);
      const balanceWei = this._decodeUint256(result);
      return {
        address,
        token: tokenSymbol,
        tokenName: token.name,
        tokenContract: token.address,
        balanceWei,
        balanceEth: this._weiToEth(balanceWei)
      };
    });
  }

  /**
   * Fetches the stETH (Lido) balance for an address
   * @param {string} address - Ethereum address
   * @returns {Promise<object>} stETH balance info
   */
  async getStETHBalance(address) {
    return this.getLiquidTokenBalance(address, 'stETH');
  }

  /**
   * Fetches the rETH (Rocket Pool) balance for an address
   * @param {string} address - Ethereum address
   * @returns {Promise<object>} rETH balance info
   */
  async getRETHBalance(address) {
    return this.getLiquidTokenBalance(address, 'rETH');
  }

  /**
   * Fetches the cbETH (Coinbase) balance for an address
   * @param {string} address - Ethereum address
   * @returns {Promise<object>} cbETH balance info
   */
  async getCBETHBalance(address) {
    return this.getLiquidTokenBalance(address, 'cbETH');
  }

  /**
   * Fetches the wstETH (Wrapped stETH) balance for an address
   * @param {string} address - Ethereum address
   * @returns {Promise<object>} wstETH balance info
   */
  async getWSTETHBalance(address) {
    return this.getLiquidTokenBalance(address, 'wstETH');
  }

  /**
   * Fetches native staked ETH balance via Beacon Chain validators linked to the given
   * withdrawal address. Uses the beaconcha.in public API.
   * @param {string} address - Ethereum withdrawal address (0x-prefixed)
   * @returns {Promise<object>} Native staking info including all validators and total balance
   * @throws {Error} If address is invalid or the beacon API returns an error
   */
  async getNativeStakedBalance(address) {
    if (!this._validateAddress(address)) {
      throw new Error('Invalid Ethereum address format');
    }

    const cacheKey = `native-${address.toLowerCase()}`;

    return await this.cacheManager.getWithCache(cacheKey, async () => {
      const path = `/api/v1/validator/eth1/${address}`;
      const response = await this._makeBeaconRequest(path);

      if (!response || response.status !== 'OK') {
        const msg = response ? (response.message || JSON.stringify(response)) : 'No response';
        throw new Error(`Beacon API error: ${msg}`);
      }

      const validators = response.data || [];
      let totalGwei = BigInt(0);

      for (const validator of validators) {
        if (validator.balance) {
          totalGwei += BigInt(validator.balance);
        }
      }

      return {
        address,
        validatorCount: validators.length,
        validators: validators.map(v => ({
          index: v.validatorindex,
          status: v.status,
          balanceGwei: v.balance,
          balanceEth: this._gweiToEth(v.balance)
        })),
        totalBalanceGwei: totalGwei.toString(),
        totalBalanceEth: this._gweiToEth(totalGwei)
      };
    });
  }

  /**
   * Fetches all liquid staking token balances for an address in a single call.
   * Errors for individual tokens are caught and reported without failing the whole request.
   * @param {string} address - Ethereum address
   * @returns {Promise<object>} Combined staked ETH balance info
   * @throws {Error} If address is invalid
   */
  async getStakedBalance(address) {
    if (!this._validateAddress(address)) {
      throw new Error('Invalid Ethereum address format');
    }

    const [stETH, rETH, cbETH, wstETH] = await Promise.all([
      this.getLiquidTokenBalance(address, 'stETH').catch(e => ({
        address, token: 'stETH', balanceWei: '0', balanceEth: '0.000000000000000000', error: e.message
      })),
      this.getLiquidTokenBalance(address, 'rETH').catch(e => ({
        address, token: 'rETH', balanceWei: '0', balanceEth: '0.000000000000000000', error: e.message
      })),
      this.getLiquidTokenBalance(address, 'cbETH').catch(e => ({
        address, token: 'cbETH', balanceWei: '0', balanceEth: '0.000000000000000000', error: e.message
      })),
      this.getLiquidTokenBalance(address, 'wstETH').catch(e => ({
        address, token: 'wstETH', balanceWei: '0', balanceEth: '0.000000000000000000', error: e.message
      }))
    ]);

    const liquidStaking = { stETH, rETH, cbETH, wstETH };

    let totalWei = BigInt(0);
    for (const result of Object.values(liquidStaking)) {
      if (result.balanceWei && result.balanceWei !== '0') {
        totalWei += BigInt(result.balanceWei);
      }
    }

    return {
      address,
      liquidStaking,
      totalLiquidBalanceWei: totalWei.toString(),
      totalLiquidBalanceEth: this._weiToEth(totalWei.toString())
    };
  }

  /**
   * Formats balance info into a human-readable string
   * @param {object} balanceInfo - Result from getStakedBalance, getLiquidTokenBalance, or getNativeStakedBalance
   * @returns {string} Formatted balance output
   */
  formatBalance(balanceInfo) {
    if (!balanceInfo || typeof balanceInfo !== 'object') {
      return 'No balance data available';
    }

    let output = 'Staked ETH Balance\n';
    output += '==================\n\n';
    output += `Address: ${balanceInfo.address}\n\n`;

    if (balanceInfo.liquidStaking) {
      output += 'Liquid Staking Tokens:\n';
      for (const [symbol, data] of Object.entries(balanceInfo.liquidStaking)) {
        if (data.error) {
          output += `  ${symbol}: Error - ${data.error}\n`;
        } else {
          output += `  ${symbol}: ${data.balanceEth} ETH\n`;
        }
      }
      output += `\nTotal Liquid Staked: ${balanceInfo.totalLiquidBalanceEth} ETH\n`;
    } else if (balanceInfo.validatorCount !== undefined) {
      output += 'Native Staking (Beacon Chain):\n';
      output += `  Validators: ${balanceInfo.validatorCount}\n`;
      output += `  Total Balance: ${balanceInfo.totalBalanceEth} ETH\n`;
      if (balanceInfo.validators && balanceInfo.validators.length > 0) {
        output += '\n  Validator Details:\n';
        balanceInfo.validators.forEach(v => {
          output += `    #${v.index} [${v.status}]: ${v.balanceEth} ETH\n`;
        });
      }
    } else if (balanceInfo.token) {
      output += `Token:    ${balanceInfo.tokenName} (${balanceInfo.token})\n`;
      output += `Contract: ${balanceInfo.tokenContract}\n`;
      output += `Balance:  ${balanceInfo.balanceEth} ETH\n`;
    }

    return output;
  }

  /**
   * Clears the internal cache
   */
  clearCache() {
    this.cacheManager.clearCache();
  }

  /**
   * Gets cache statistics
   * @returns {object} Cache size, timeout, and keys
   */
  getCacheStats() {
    return {
      size: this.cacheManager.cache.size,
      timeout: this.cacheManager.cacheTimeout,
      keys: Array.from(this.cacheManager.cache.keys())
    };
  }

  /**
   * Supported liquid staking token contracts
   */
  static get CONTRACTS() {
    return LIQUID_STAKING_CONTRACTS;
  }
}

module.exports = StakedEthFetcher;
