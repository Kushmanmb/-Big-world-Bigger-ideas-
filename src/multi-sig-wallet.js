/**
 * Multi-Signature Wallet Module
 *
 * Provides utilities for deploying and interacting with the MultiSignatureWallet
 * smart contract. The contract requires a configurable number of owner approvals
 * before any transaction can be executed (M-of-N multi-sig).
 *
 * Contract source: contracts/MultiSignatureWallet.sol
 * ABI:             contracts/multi_signature_wallet.json
 *
 * Usage with ethers.js:
 *   const { ethers } = require('ethers');
 *   const { abi, bytecode } = require('./multi-sig-wallet');
 *   const factory = new ethers.ContractFactory(abi, bytecode, signer);
 *   const wallet  = await factory.deploy(owners, requiredConfirmations);
 */

'use strict';

const https = require('https');
const abi = require('../contracts/multi_signature_wallet.json');

// Bytecode produced by solc ^0.8.18 (optimizer enabled, 999999 runs, EVM paris)
// Source: contracts/MultiSignatureWallet.sol
// Loaded from contracts/multi_signature_wallet_bytecode.json for maintainability
const { bytecode } = require('../contracts/multi_signature_wallet_bytecode.json');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: minimal hex-RPC utility (no external dependencies)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Encodes a 4-byte function selector (keccak256 of signature, first 4 bytes).
 * Pre-computed selectors for the MultiSignatureWallet ABI.
 * @private
 */
const SELECTORS = {
  getOwners:                  '0xa0e67e2b',
  getTransactionCount:        '0x2e7700f0',
  getTransaction:             '0x33ea3dc8',
  numConfirmationsRequired:   '0x746c9171',
  isOwner:                    '0x2f54bf6e',
  isConfirmed:                '0x95b4f4ad',
  owners:                     '0x025e7c27',
  transactions:               '0x642f85cd',
};

// ─────────────────────────────────────────────────────────────────────────────
// MultiSigWallet class
// ─────────────────────────────────────────────────────────────────────────────

class MultiSigWallet {
  /**
   * Creates a MultiSigWallet client for reading on-chain state.
   *
   * @param {string} contractAddress  - Deployed contract address (0x-prefixed)
   * @param {string} [rpcUrl]         - JSON-RPC endpoint (defaults to Ethereum mainnet)
   * @param {number} [requestTimeout] - RPC request timeout in milliseconds (default: 30000)
   */
  constructor(contractAddress, rpcUrl = 'https://ethereum.publicnode.com', requestTimeout = 30000) {
    if (!contractAddress || !this._isValidAddress(contractAddress)) {
      throw new Error('A valid contract address is required');
    }
    if (!rpcUrl || typeof rpcUrl !== 'string') {
      throw new Error('rpcUrl must be a non-empty string');
    }
    if (typeof requestTimeout !== 'number' || requestTimeout <= 0) {
      throw new Error('requestTimeout must be a positive number');
    }

    this.contractAddress = contractAddress;
    this.rpcUrl = rpcUrl;
    this.requestTimeout = requestTimeout;
    this._requestId = 0;
  }

  // ── Input validation ────────────────────────────────────────────────────────

  /**
   * @param {string} address
   * @returns {boolean}
   * @private
   */
  _isValidAddress(address) {
    return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * @param {number|string|bigint} value
   * @returns {boolean}
   * @private
   */
  _isNonNegativeInteger(value) {
    if (value === null || value === undefined) return false;
    const n = typeof value === 'bigint' ? value : BigInt(value);
    return n >= 0n;
  }

  // ── Low-level RPC ───────────────────────────────────────────────────────────

  /**
   * Makes a JSON-RPC request.
   * @param {string} method
   * @param {Array}  params
   * @returns {Promise<*>}
   * @private
   */
  _rpc(method, params = []) {
    const url = new URL(this.rpcUrl);
    const body = JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: ++this._requestId,
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const protocol = url.protocol === 'https:' ? https : require('http');
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              reject(new Error(`RPC Error: ${parsed.error.message || JSON.stringify(parsed.error)}`));
            } else {
              resolve(parsed.result);
            }
          } catch (err) {
            reject(new Error(`Failed to parse RPC response: ${err.message}`));
          }
        });
      });

      req.on('error', (err) => reject(new Error(`RPC request failed: ${err.message}`)));
      req.setTimeout(this.requestTimeout, () => { req.destroy(); reject(new Error('RPC request timeout')); });
      req.write(body);
      req.end();
    });
  }

  /**
   * Performs an eth_call to the contract.
   * @param {string} data - Encoded calldata (hex)
   * @returns {Promise<string>} Raw hex result
   * @private
   */
  async _call(data) {
    return this._rpc('eth_call', [{ to: this.contractAddress, data }, 'latest']);
  }

  // ── ABI encoding / decoding helpers ────────────────────────────────────────

  /**
   * Pads a uint256 value to 32 bytes (64 hex chars).
   * @param {number|string|bigint} value
   * @returns {string} 64-char hex string (no 0x prefix)
   * @private
   */
  _encodeUint256(value) {
    return BigInt(value).toString(16).padStart(64, '0');
  }

  /**
   * Pads an address to 32 bytes (64 hex chars, left-padded with zeros).
   * @param {string} address - 0x-prefixed Ethereum address
   * @returns {string} 64-char hex string (no 0x prefix)
   * @private
   */
  _encodeAddress(address) {
    return address.slice(2).toLowerCase().padStart(64, '0');
  }

  /**
   * Decodes a uint256 from a 32-byte hex word.
   * @param {string} hex - 64-char hex string (no 0x prefix)
   * @returns {string} Decimal string representation
   * @private
   */
  _decodeUint256(hex) {
    return BigInt('0x' + hex).toString();
  }

  /**
   * Decodes an address from a 32-byte hex word.
   * @param {string} hex - 64-char hex string (no 0x prefix)
   * @returns {string} 0x-prefixed address
   * @private
   */
  _decodeAddress(hex) {
    return '0x' + hex.slice(-40);
  }

  /**
   * Decodes a boolean from a 32-byte hex word.
   * @param {string} hex
   * @returns {boolean}
   * @private
   */
  _decodeBool(hex) {
    return BigInt('0x' + hex) !== 0n;
  }

  // ── Public read methods ─────────────────────────────────────────────────────

  /**
   * Returns the list of wallet owners.
   * @returns {Promise<string[]>} Array of owner addresses
   */
  async getOwners() {
    const raw = await this._call(SELECTORS.getOwners);
    if (!raw || raw === '0x') return [];

    const hex = raw.startsWith('0x') ? raw.slice(2) : raw;
    // ABI dynamic array: [offset (32 bytes)][length (32 bytes)][elements...]
    if (hex.length < 128) return [];

    const length = parseInt(hex.slice(64, 128), 16);
    const owners = [];
    for (let i = 0; i < length; i++) {
      const start = 128 + i * 64;
      owners.push(this._decodeAddress(hex.slice(start, start + 64)));
    }
    return owners;
  }

  /**
   * Returns the total number of submitted transactions.
   * @returns {Promise<string>} Transaction count as a decimal string
   */
  async getTransactionCount() {
    const raw = await this._call(SELECTORS.getTransactionCount);
    if (!raw || raw === '0x') return '0';
    const hex = raw.startsWith('0x') ? raw.slice(2) : raw;
    return this._decodeUint256(hex.slice(0, 64));
  }

  /**
   * Returns the number of confirmations required to execute a transaction.
   * @returns {Promise<string>} Required confirmations as a decimal string
   */
  async getNumConfirmationsRequired() {
    const raw = await this._call(SELECTORS.numConfirmationsRequired);
    if (!raw || raw === '0x') return '0';
    const hex = raw.startsWith('0x') ? raw.slice(2) : raw;
    return this._decodeUint256(hex.slice(0, 64));
  }

  /**
   * Checks whether an address is an owner of the wallet.
   * @param {string} address - Ethereum address to check
   * @returns {Promise<boolean>}
   */
  async isOwner(address) {
    if (!this._isValidAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }
    const data = SELECTORS.isOwner + this._encodeAddress(address);
    const raw = await this._call(data);
    if (!raw || raw === '0x') return false;
    const hex = raw.startsWith('0x') ? raw.slice(2) : raw;
    return this._decodeBool(hex.slice(0, 64));
  }

  /**
   * Checks whether an owner has confirmed a specific transaction.
   * @param {number|string} txIndex - Transaction index
   * @param {string}        owner   - Owner address
   * @returns {Promise<boolean>}
   */
  async isConfirmed(txIndex, owner) {
    if (!this._isNonNegativeInteger(txIndex)) {
      throw new Error('txIndex must be a non-negative integer');
    }
    if (!this._isValidAddress(owner)) {
      throw new Error('Invalid owner address');
    }
    const data = SELECTORS.isConfirmed +
      this._encodeUint256(txIndex) +
      this._encodeAddress(owner);
    const raw = await this._call(data);
    if (!raw || raw === '0x') return false;
    const hex = raw.startsWith('0x') ? raw.slice(2) : raw;
    return this._decodeBool(hex.slice(0, 64));
  }

  /**
   * Returns the details of a transaction at the given index.
   * @param {number|string} txIndex - Transaction index
   * @returns {Promise<{to: string, value: string, data: string, executed: boolean, numConfirmations: string}>}
   */
  async getTransaction(txIndex) {
    if (!this._isNonNegativeInteger(txIndex)) {
      throw new Error('txIndex must be a non-negative integer');
    }
    const calldata = SELECTORS.getTransaction + this._encodeUint256(txIndex);
    const raw = await this._call(calldata);
    if (!raw || raw === '0x') {
      throw new Error(`Transaction ${txIndex} not found`);
    }

    const hex = raw.startsWith('0x') ? raw.slice(2) : raw;
    // Returns: (address to, uint256 value, bytes data, bool executed, uint256 numConfirmations)
    // Solidity ABI encoding for a tuple with a dynamic `bytes` field:
    //   [0..63]   to            (address, padded)
    //   [64..127] value         (uint256)
    //   [128..191] data offset  (uint256, offset from start of this tuple)
    //   [192..255] executed     (bool)
    //   [256..319] numConfs     (uint256)
    //   [offset..] bytes data

    if (hex.length < 320) {
      throw new Error('Unexpected response length from getTransaction');
    }

    const to             = this._decodeAddress(hex.slice(0, 64));
    const value          = this._decodeUint256(hex.slice(64, 128));
    const dataOffset     = parseInt(hex.slice(128, 192), 16) * 2; // in nibbles
    const executed       = this._decodeBool(hex.slice(192, 256));
    const numConfs       = this._decodeUint256(hex.slice(256, 320));

    // Decode dynamic bytes
    let txData = '0x';
    if (dataOffset + 64 <= hex.length) {
      const dataLen = parseInt(hex.slice(dataOffset, dataOffset + 64), 16);
      txData = '0x' + hex.slice(dataOffset + 64, dataOffset + 64 + dataLen * 2);
    }

    return {
      to,
      value,
      data: txData,
      executed,
      numConfirmations: numConfs,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = MultiSigWallet;
module.exports.abi = abi;
module.exports.bytecode = bytecode;
