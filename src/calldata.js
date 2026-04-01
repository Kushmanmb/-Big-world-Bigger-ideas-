/**
 * CALLDATA Module
 * Provides functionality to encode and decode Ethereum transaction calldata.
 *
 * Calldata is the data field included in Ethereum transactions and eth_call
 * requests. It consists of a 4-byte function selector followed by ABI-encoded
 * parameters.
 *
 * Supported parameter types:
 *   address, uint256, uint8–uint248 (multiples of 8), int256, bool,
 *   bytes1–bytes32 (fixed), bytes (dynamic), string
 */

/**
 * Known function selectors (keccak256 of the canonical signature, first 4 bytes).
 * Add entries here to enable encoding/decoding of additional functions without
 * a full keccak256 implementation.
 */
const KNOWN_SELECTORS = {
  // ERC-20
  'balanceOf(address)': '0x70a08231',
  'totalSupply()': '0x18160ddd',
  'name()': '0x06fdde03',
  'symbol()': '0x95d89b41',
  'decimals()': '0x313ce567',
  'allowance(address,address)': '0xdd62ed3e',
  'approve(address,uint256)': '0x095ea7b3',
  'transfer(address,uint256)': '0xa9059cbb',
  'transferFrom(address,address,uint256)': '0x23b872dd',
  // ERC-721
  'owner()': '0x8da5cb5b',
  'ownerOf(uint256)': '0x6352211e',
  'tokenURI(uint256)': '0xc87b56dd',
  'safeTransferFrom(address,address,uint256)': '0x42842e0e',
  'getApproved(uint256)': '0x081812fc',
  'setApprovalForAll(address,bool)': '0xa22cb465',
  'isApprovedForAll(address,address)': '0xe985e9c5',
  // ERC-1155
  'balanceOf(address,uint256)': '0x00fdd58e',
  'uri(uint256)': '0x0e89341c',
  // Common utility
  'supportsInterface(bytes4)': '0x01ffc9a7'
};

// Reverse map: selector hex → signature
const SELECTOR_TO_SIGNATURE = Object.fromEntries(
  Object.entries(KNOWN_SELECTORS).map(([sig, sel]) => [sel, sig])
);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Pads a hex string to 32 bytes (64 hex chars), left-padding with zeros.
 * @param {string} hex - Hex string without 0x prefix
 * @returns {string}
 */
function padLeft(hex) {
  return hex.padStart(64, '0');
}

/**
 * Encodes a single ABI parameter value into a 32-byte hex word (no 0x prefix).
 * Supports: address, uint*, int*, bool, bytes1–bytes32, bytes4.
 * Dynamic types (string, bytes) are not encoded here; use _encodeDynamic.
 *
 * @param {*} value - The value to encode
 * @param {string} type - The Solidity type string
 * @returns {string} 64-char hex string
 * @throws {Error} For unsupported or invalid values
 */
function _encodeStaticWord(value, type) {
  if (type === 'address') {
    const addr = String(value);
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      throw new Error(`Invalid address value: ${addr}`);
    }
    return padLeft(addr.slice(2).toLowerCase());
  }

  if (type === 'bool') {
    return padLeft(value ? '1' : '0');
  }

  if (/^uint(\d*)$/.test(type)) {
    const bits = parseInt(type.slice(4) || '256', 10);
    if (bits < 8 || bits > 256 || bits % 8 !== 0) {
      throw new Error(`Invalid uint bit size: ${bits}`);
    }
    const n = BigInt(value);
    if (n < 0n) {
      throw new Error(`Negative value for unsigned type ${type}: ${value}`);
    }
    return padLeft(n.toString(16));
  }

  if (/^int(\d*)$/.test(type)) {
    const bits = parseInt(type.slice(3) || '256', 10);
    if (bits < 8 || bits > 256 || bits % 8 !== 0) {
      throw new Error(`Invalid int bit size: ${bits}`);
    }
    let n = BigInt(value);
    if (n < 0n) {
      // Two's complement representation for 256-bit
      n = (1n << 256n) + n;
    }
    return padLeft(n.toString(16));
  }

  // Fixed-size bytes: bytes1 … bytes32
  if (/^bytes([1-9]|[12]\d|3[012])$/.test(type)) {
    const size = parseInt(type.slice(5), 10);
    const hex = String(value).replace(/^0x/i, '');
    if (hex.length > size * 2) {
      throw new Error(`Value too long for ${type}: ${value}`);
    }
    // Right-pad to 32 bytes
    return hex.padEnd(64, '0');
  }

  throw new Error(`Unsupported static type: ${type}`);
}

/**
 * Encodes a dynamic type (string or bytes) as a length + padded data block.
 * Returns the raw bytes as a hex string (multiple of 32 bytes, no 0x prefix).
 *
 * @param {string|Buffer} value
 * @returns {string} hex
 */
function _encodeDynamicValue(value) {
  const buf = typeof value === 'string'
    ? Buffer.from(value, 'utf8')
    : Buffer.from(value);

  const lengthHex = padLeft(buf.length.toString(16));
  const dataHex = buf.toString('hex').padEnd(Math.ceil(buf.length / 32) * 64, '0');
  return lengthHex + dataHex;
}

/**
 * Parses a canonical function signature into its name and parameter type list.
 * Example: "transfer(address,uint256)" → { name: "transfer", types: ["address","uint256"] }
 *
 * @param {string} signature - Canonical function signature
 * @returns {{ name: string, types: string[] }}
 */
function _parseSignature(signature) {
  if (typeof signature !== 'string') {
    throw new Error('Function signature must be a string');
  }
  const match = signature.match(/^([^(]+)\(([^)]*)\)$/);
  if (!match) {
    throw new Error(`Invalid function signature format: ${signature}`);
  }
  const name = match[1].trim();
  const typeStr = match[2].trim();
  const types = typeStr === '' ? [] : typeStr.split(',').map(t => t.trim());
  return { name, types };
}

/**
 * Returns true for dynamic ABI types (string, bytes, arrays).
 * @param {string} type
 * @returns {boolean}
 */
function _isDynamic(type) {
  return type === 'string' || type === 'bytes' || type.endsWith('[]');
}

// ---------------------------------------------------------------------------
// CalldataEncoder
// ---------------------------------------------------------------------------

class CalldataEncoder {
  /**
   * Creates a new CalldataEncoder instance.
   * @param {object} [options]
   * @param {object} [options.extraSelectors] - Additional { signature: selectorHex } entries
   */
  constructor(options = {}) {
    this.selectors = Object.assign({}, KNOWN_SELECTORS, options.extraSelectors || {});
    this.selectorToSignature = Object.assign({}, SELECTOR_TO_SIGNATURE);

    if (options.extraSelectors) {
      for (const [sig, sel] of Object.entries(options.extraSelectors)) {
        this.selectorToSignature[sel] = sig;
      }
    }
  }

  // -------------------------------------------------------------------------
  // Selector helpers
  // -------------------------------------------------------------------------

  /**
   * Returns the 4-byte function selector (as "0xXXXXXXXX") for a known
   * function signature.
   *
   * @param {string} signature - Canonical function signature
   * @returns {string} 4-byte selector with 0x prefix
   * @throws {Error} If the signature is not in the known list
   */
  getSelector(signature) {
    const sel = this.selectors[signature];
    if (!sel) {
      throw new Error(
        `Unknown function signature: "${signature}". ` +
        `Known signatures: ${Object.keys(this.selectors).join(', ')}`
      );
    }
    return sel;
  }

  /**
   * Returns the function signature for a given 4-byte selector, or null if
   * unknown.
   *
   * @param {string} selector - 4-byte selector with or without 0x prefix
   * @returns {string|null}
   */
  getSignature(selector) {
    const normalised = selector.startsWith('0x') ? selector : '0x' + selector;
    return this.selectorToSignature[normalised.toLowerCase()] || null;
  }

  /**
   * Returns all known { signature → selector } entries.
   * @returns {object}
   */
  getKnownSelectors() {
    return Object.assign({}, this.selectors);
  }

  // -------------------------------------------------------------------------
  // Encoding
  // -------------------------------------------------------------------------

  /**
   * Encodes a complete function call into calldata (selector + ABI params).
   *
   * @param {string} signature - Canonical function signature
   *   e.g. "transfer(address,uint256)"
   * @param {Array} [params=[]] - Parameter values in the same order as the
   *   signature's type list
   * @returns {string} Hex-encoded calldata with 0x prefix
   * @throws {Error} For unknown signatures or invalid parameter values
   */
  encode(signature, params = []) {
    const selector = this.getSelector(signature);
    const { types } = _parseSignature(signature);

    if (params.length !== types.length) {
      throw new Error(
        `Parameter count mismatch for "${signature}": ` +
        `expected ${types.length}, got ${params.length}`
      );
    }

    if (types.length === 0) {
      return selector;
    }

    return selector + this._encodeParams(types, params);
  }

  /**
   * ABI-encodes a list of typed parameters (without selector).
   *
   * @param {string[]} types - Array of Solidity type strings
   * @param {Array} values - Corresponding values
   * @returns {string} Hex string (no 0x prefix)
   */
  _encodeParams(types, values) {
    // Two-pass ABI encoding:
    // 1. Build head words (static values or offsets for dynamic types)
    // 2. Append tail blocks for dynamic values
    const headWords = [];
    const tailBlocks = [];

    // Start of tail section = 32 * types.length bytes from head start
    let tailOffset = types.length * 32;

    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      const value = values[i];

      if (_isDynamic(type)) {
        // Head is the byte offset to the tail data
        headWords.push(padLeft(tailOffset.toString(16)));
        const block = _encodeDynamicValue(value);
        tailBlocks.push(block);
        tailOffset += block.length / 2; // block is hex chars, /2 = bytes
      } else {
        headWords.push(_encodeStaticWord(value, type));
      }
    }

    return headWords.join('') + tailBlocks.join('');
  }

  // -------------------------------------------------------------------------
  // Decoding
  // -------------------------------------------------------------------------

  /**
   * Decodes calldata into its function selector and raw parameter data.
   *
   * @param {string} calldata - Hex-encoded calldata with or without 0x prefix
   * @returns {{ selector: string, params: string }}
   *   - selector: "0xXXXXXXXX"
   *   - params: remaining hex data after the selector (no 0x prefix)
   * @throws {Error} For invalid calldata format
   */
  split(calldata) {
    if (!calldata || typeof calldata !== 'string') {
      throw new Error('Calldata must be a non-empty string');
    }

    const hex = calldata.startsWith('0x') ? calldata.slice(2) : calldata;

    if (hex.length < 8) {
      throw new Error(
        `Calldata too short to contain a 4-byte selector (got ${hex.length / 2} bytes)`
      );
    }

    // Validate hex
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
      throw new Error('Calldata contains non-hexadecimal characters');
    }

    return {
      selector: '0x' + hex.slice(0, 8),
      params: hex.slice(8)
    };
  }

  /**
   * Decodes the ABI-encoded parameters section of calldata given a list of
   * expected types.
   *
   * @param {string} paramsHex - Hex-encoded parameter data (no 0x prefix)
   * @param {string[]} types - Array of Solidity type strings
   * @returns {Array} Decoded values
   * @throws {Error} For malformed data or unsupported types
   */
  decodeParams(paramsHex, types) {
    if (!types || types.length === 0) {
      return [];
    }

    const hex = paramsHex.startsWith('0x') ? paramsHex.slice(2) : paramsHex;
    const values = [];
    let headPos = 0; // position in hex chars within the head section

    for (let i = 0; i < types.length; i++) {
      const type = types[i];

      if (_isDynamic(type)) {
        const offsetHex = hex.slice(headPos, headPos + 64);
        const offsetBytes = parseInt(offsetHex, 16);
        const tailPos = offsetBytes * 2; // convert bytes → hex chars

        if (type === 'string' || type === 'bytes') {
          const lenHex = hex.slice(tailPos, tailPos + 64);
          const len = parseInt(lenHex, 16);
          const dataHex = hex.slice(tailPos + 64, tailPos + 64 + len * 2);
          if (type === 'string') {
            values.push(Buffer.from(dataHex, 'hex').toString('utf8'));
          } else {
            values.push('0x' + dataHex);
          }
        } else {
          // Generic dynamic handling – return raw hex
          const lenHex = hex.slice(tailPos, tailPos + 64);
          const len = parseInt(lenHex, 16);
          const dataHex = hex.slice(tailPos + 64, tailPos + 64 + len * 2);
          values.push('0x' + dataHex);
        }
        headPos += 64;
      } else {
        const word = hex.slice(headPos, headPos + 64);
        values.push(this._decodeStaticWord(word, type));
        headPos += 64;
      }
    }

    return values;
  }

  /**
   * Decodes a single 32-byte (64 hex char) static ABI word.
   *
   * @param {string} word - 64-char hex string (no 0x prefix)
   * @param {string} type - Solidity type
   * @returns {*} Decoded value
   */
  _decodeStaticWord(word, type) {
    if (type === 'address') {
      return '0x' + word.slice(-40);
    }

    if (type === 'bool') {
      return BigInt('0x' + word) !== 0n;
    }

    if (/^uint(\d*)$/.test(type)) {
      return BigInt('0x' + word).toString();
    }

    if (/^int(\d*)$/.test(type)) {
      const bits = parseInt(type.slice(3) || '256', 10);
      let n = BigInt('0x' + word);
      const maxPositive = (1n << BigInt(bits - 1)) - 1n;
      if (n > maxPositive) {
        n -= 1n << BigInt(bits);
      }
      return n.toString();
    }

    // Fixed bytes: bytes1 … bytes32 — return left-aligned hex
    if (/^bytes([1-9]|[12]\d|3[012])$/.test(type)) {
      const size = parseInt(type.slice(5), 10);
      return '0x' + word.slice(0, size * 2);
    }

    // bytes4 (e.g. interface ID)
    if (type === 'bytes4') {
      return '0x' + word.slice(0, 8);
    }

    // Fall back to raw hex
    return '0x' + word;
  }

  /**
   * Fully decodes calldata given the function signature.
   *
   * @param {string} calldata - Hex-encoded calldata with or without 0x prefix
   * @param {string} [signature] - Override the signature. If omitted the
   *   selector is looked up in the known list.
   * @returns {{ selector: string, signature: string|null, params: Array }}
   * @throws {Error} For invalid calldata or unknown selector (when signature
   *   is omitted and selector is not in the known list)
   */
  decode(calldata, signature) {
    const { selector, params } = this.split(calldata);

    const resolvedSig = signature || this.getSignature(selector);

    if (!resolvedSig) {
      return {
        selector,
        signature: null,
        params: params ? ['0x' + params] : []
      };
    }

    const { types } = _parseSignature(resolvedSig);
    const decodedParams = this.decodeParams(params, types);

    return {
      selector,
      signature: resolvedSig,
      params: decodedParams
    };
  }

  // -------------------------------------------------------------------------
  // Validation helpers
  // -------------------------------------------------------------------------

  /**
   * Validates that the given string looks like well-formed calldata.
   *
   * @param {string} calldata
   * @returns {{ valid: boolean, error?: string, bytes: number }}
   */
  validate(calldata) {
    if (!calldata || typeof calldata !== 'string') {
      return { valid: false, error: 'Calldata must be a non-empty string', bytes: 0 };
    }

    const hex = calldata.startsWith('0x') ? calldata.slice(2) : calldata;

    if (!/^[0-9a-fA-F]*$/.test(hex)) {
      return { valid: false, error: 'Calldata contains non-hexadecimal characters', bytes: 0 };
    }

    if (hex.length === 0) {
      return { valid: false, error: 'Calldata is empty', bytes: 0 };
    }

    if (hex.length < 8) {
      return {
        valid: false,
        error: `Calldata too short to contain a function selector (${hex.length / 2} bytes, minimum 4)`,
        bytes: hex.length / 2
      };
    }

    if (hex.length % 2 !== 0) {
      return { valid: false, error: 'Calldata has an odd number of hex characters', bytes: 0 };
    }

    return {
      valid: true,
      bytes: hex.length / 2,
      selector: '0x' + hex.slice(0, 8),
      knownSignature: this.getSignature('0x' + hex.slice(0, 8))
    };
  }

  /**
   * Returns a human-readable summary of calldata.
   *
   * @param {string} calldata - Hex-encoded calldata
   * @returns {string} Formatted summary
   */
  format(calldata) {
    const validation = this.validate(calldata);

    if (!validation.valid) {
      return `Invalid calldata: ${validation.error}`;
    }

    const { selector, params } = this.split(calldata);
    const sig = this.getSignature(selector);

    let lines = [
      `Calldata Summary`,
      '='.repeat(40),
      `Bytes:    ${validation.bytes}`,
      `Selector: ${selector}`
    ];

    if (sig) {
      lines.push(`Function: ${sig}`);
      try {
        const { types } = _parseSignature(sig);
        const decoded = this.decodeParams(params, types);
        decoded.forEach((val, idx) => {
          lines.push(`  Param ${idx + 1} (${types[idx]}): ${val}`);
        });
      } catch (_) {
        lines.push(`  (Could not decode parameters)`);
      }
    } else {
      lines.push(`Function: unknown`);
      if (params) {
        lines.push(`  Raw params: 0x${params}`);
      }
    }

    return lines.join('\n');
  }
}

module.exports = CalldataEncoder;
