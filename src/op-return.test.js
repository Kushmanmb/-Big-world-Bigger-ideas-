/**
 * OP_RETURN Module Tests
 * Tests for encoding, decoding, and fetching OP_RETURN data across multiple platforms
 */

const OPReturnFetcher = require('./op-return.js');

// Test counter
let passed = 0;
let failed = 0;

// Test helper function
function assert(condition, testName) {
  if (condition) {
    console.log(`✓ ${testName}`);
    passed++;
  } else {
    console.log(`✗ ${testName}`);
    failed++;
  }
}

// Test helper for async functions
async function assertAsync(fn, testName) {
  try {
    const result = await fn();
    if (result) {
      console.log(`✓ ${testName}`);
      passed++;
    } else {
      console.log(`✗ ${testName}`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ ${testName}: ${error.message}`);
    failed++;
  }
}

console.log('Running OP_RETURN Module Tests...\n');

// Test 1: Constructor with valid platforms
console.log('=== Constructor Tests ===');
try {
  const btcFetcher = new OPReturnFetcher('bitcoin');
  assert(btcFetcher.platform === 'bitcoin', 'Constructor creates Bitcoin instance');
} catch (error) {
  assert(false, 'Constructor creates Bitcoin instance');
}

try {
  const ltcFetcher = new OPReturnFetcher('litecoin');
  assert(ltcFetcher.platform === 'litecoin', 'Constructor creates Litecoin instance');
} catch (error) {
  assert(false, 'Constructor creates Litecoin instance');
}

try {
  const ethFetcher = new OPReturnFetcher('ethereum');
  assert(ethFetcher.platform === 'ethereum', 'Constructor creates Ethereum instance');
} catch (error) {
  assert(false, 'Constructor creates Ethereum instance');
}

// Test 2: Constructor with invalid platform
try {
  new OPReturnFetcher('invalid');
  assert(false, 'Constructor rejects invalid platform');
} catch (error) {
  assert(error.message.includes('Invalid platform'), 'Constructor rejects invalid platform');
}

// Test 3: Case insensitivity
try {
  const fetcher = new OPReturnFetcher('BiTcOiN');
  assert(fetcher.platform === 'bitcoin', 'Constructor handles case insensitive platform names');
} catch (error) {
  assert(false, 'Constructor handles case insensitive platform names');
}

console.log('\n=== Data Encoding Tests ===');

const btcFetcher = new OPReturnFetcher('bitcoin');

// Test 4: Basic encoding
try {
  const encoded = btcFetcher.encodeData('Hello World');
  assert(encoded === Buffer.from('Hello World', 'utf8').toString('hex'), 'Encodes simple string correctly');
} catch (error) {
  assert(false, 'Encodes simple string correctly');
}

// Test 5: Encoding with special characters
try {
  const encoded = btcFetcher.encodeData('Hello 🌍');
  const expected = Buffer.from('Hello 🌍', 'utf8').toString('hex');
  assert(encoded === expected, 'Encodes string with emoji correctly');
} catch (error) {
  assert(false, 'Encodes string with emoji correctly');
}

// Test 6: Empty string encoding
try {
  btcFetcher.encodeData('');
  assert(false, 'Rejects empty string');
} catch (error) {
  assert(error.message.includes('non-empty string'), 'Rejects empty string');
}

// Test 7: Non-string encoding
try {
  btcFetcher.encodeData(123);
  assert(false, 'Rejects non-string data');
} catch (error) {
  assert(error.message.includes('non-empty string'), 'Rejects non-string data');
}

// Test 8: Data size limit for Bitcoin
try {
  const longString = 'a'.repeat(81); // 81 bytes
  btcFetcher.encodeData(longString);
  assert(false, 'Rejects data exceeding 80 bytes for Bitcoin');
} catch (error) {
  assert(error.message.includes('exceeds maximum'), 'Rejects data exceeding 80 bytes for Bitcoin');
}

// Test 9: Maximum size data for Bitcoin
try {
  const maxString = 'a'.repeat(80); // Exactly 80 bytes
  const encoded = btcFetcher.encodeData(maxString);
  assert(encoded.length === 160, 'Accepts exactly 80 bytes for Bitcoin'); // 80 bytes = 160 hex chars
} catch (error) {
  assert(false, 'Accepts exactly 80 bytes for Bitcoin');
}

// Test 10: Ethereum has no size limit
const ethFetcher = new OPReturnFetcher('ethereum');
try {
  const longString = 'a'.repeat(200); // 200 bytes
  const encoded = ethFetcher.encodeData(longString);
  assert(encoded.length === 400, 'Ethereum accepts data over 80 bytes'); // 200 bytes = 400 hex chars
} catch (error) {
  assert(false, 'Ethereum accepts data over 80 bytes');
}

console.log('\n=== Data Decoding Tests ===');

// Test 11: Basic decoding
try {
  const hex = Buffer.from('Hello World', 'utf8').toString('hex');
  const decoded = btcFetcher.decodeData(hex);
  assert(decoded === 'Hello World', 'Decodes simple hex string correctly');
} catch (error) {
  assert(false, 'Decodes simple hex string correctly');
}

// Test 12: Decoding with 0x prefix
try {
  const hex = '0x' + Buffer.from('Test', 'utf8').toString('hex');
  const decoded = btcFetcher.decodeData(hex);
  assert(decoded === 'Test', 'Handles 0x prefix in hex string');
} catch (error) {
  assert(false, 'Handles 0x prefix in hex string');
}

// Test 13: Invalid hex decoding
try {
  btcFetcher.decodeData('xyz123');
  assert(false, 'Rejects invalid hexadecimal');
} catch (error) {
  assert(error.message.includes('Invalid hexadecimal'), 'Rejects invalid hexadecimal');
}

// Test 14: Empty hex string
try {
  const decoded = btcFetcher.decodeData('');
  assert(false, 'Rejects empty hex string');
} catch (error) {
  assert(error.message.includes('non-empty string'), 'Rejects empty hex string');
}

// Test 15: Decoding with emoji
try {
  const hex = Buffer.from('Hello 🌍', 'utf8').toString('hex');
  const decoded = btcFetcher.decodeData(hex);
  assert(decoded === 'Hello 🌍', 'Decodes emoji correctly');
} catch (error) {
  assert(false, 'Decodes emoji correctly');
}

console.log('\n=== OP_RETURN Script Creation Tests ===');

// Test 16: Create Bitcoin OP_RETURN script
try {
  const script = btcFetcher.createOpReturnScript('Hello');
  assert(
    script.opcode === 'OP_RETURN' &&
    script.data === 'Hello' &&
    script.platform === 'bitcoin' &&
    script.bytes === 5,
    'Creates valid Bitcoin OP_RETURN script'
  );
} catch (error) {
  assert(false, 'Creates valid Bitcoin OP_RETURN script');
}

// Test 17: Create Litecoin OP_RETURN script
const ltcFetcher = new OPReturnFetcher('litecoin');
try {
  const script = ltcFetcher.createOpReturnScript('Test');
  assert(
    script.opcode === 'OP_RETURN' &&
    script.platform === 'litecoin',
    'Creates valid Litecoin OP_RETURN script'
  );
} catch (error) {
  assert(false, 'Creates valid Litecoin OP_RETURN script');
}

// Test 18: Ethereum should use createEthereumData instead
try {
  ethFetcher.createOpReturnScript('Test');
  assert(false, 'Ethereum rejects createOpReturnScript()');
} catch (error) {
  assert(error.message.includes('createEthereumData'), 'Ethereum rejects createOpReturnScript()');
}

console.log('\n=== Ethereum Data Creation Tests ===');

// Test 19: Create Ethereum transaction data
try {
  const ethData = ethFetcher.createEthereumData('Hello');
  assert(
    ethData.platform === 'ethereum' &&
    ethData.field === 'input_data' &&
    ethData.hex.startsWith('0x') &&
    ethData.bytes === 5,
    'Creates valid Ethereum transaction data'
  );
} catch (error) {
  assert(false, 'Creates valid Ethereum transaction data');
}

// Test 20: Bitcoin should use createOpReturnScript instead
try {
  btcFetcher.createEthereumData('Test');
  assert(false, 'Bitcoin rejects createEthereumData()');
} catch (error) {
  assert(error.message.includes('createOpReturnScript'), 'Bitcoin rejects createEthereumData()');
}

console.log('\n=== Data Validation Tests ===');

// Test 21: Validate valid short data for Bitcoin
try {
  const validation = btcFetcher.validateDataSize('Short text');
  assert(validation.valid === true && validation.platform === 'bitcoin', 'Validates short Bitcoin data');
} catch (error) {
  assert(false, 'Validates short Bitcoin data');
}

// Test 22: Validate data at limit for Bitcoin
try {
  const maxData = 'a'.repeat(80);
  const validation = btcFetcher.validateDataSize(maxData);
  assert(validation.valid === true && validation.size === 80, 'Validates 80-byte Bitcoin data');
} catch (error) {
  assert(false, 'Validates 80-byte Bitcoin data');
}

// Test 23: Validate oversized data for Bitcoin
try {
  const oversized = 'a'.repeat(81);
  const validation = btcFetcher.validateDataSize(oversized);
  assert(
    validation.valid === false &&
    validation.error.includes('exceeds maximum'),
    'Rejects oversized Bitcoin data'
  );
} catch (error) {
  assert(false, 'Rejects oversized Bitcoin data');
}

// Test 24: Validate large data for Ethereum
try {
  const largeData = 'a'.repeat(200);
  const validation = ethFetcher.validateDataSize(largeData);
  assert(
    validation.valid === true &&
    validation.maxSize === 'unlimited',
    'Validates large Ethereum data'
  );
} catch (error) {
  assert(false, 'Validates large Ethereum data');
}

// Test 25: Validate empty string
try {
  const validation = btcFetcher.validateDataSize('');
  assert(validation.valid === false, 'Rejects empty string in validation');
} catch (error) {
  assert(false, 'Rejects empty string in validation');
}

// Test 26: Validate non-string
try {
  const validation = btcFetcher.validateDataSize(null);
  assert(validation.valid === false, 'Rejects null in validation');
} catch (error) {
  assert(false, 'Rejects null in validation');
}

console.log('\n=== Cache Tests ===');

// Test 27: Cache initialization
try {
  const stats = btcFetcher.getCacheStats();
  assert(
    stats.size >= 0 &&
    stats.platform === 'bitcoin' &&
    stats.timeout === 60000,
    'Cache initialized correctly'
  );
} catch (error) {
  assert(false, 'Cache initialized correctly');
}

// Test 28: Cache clearing
try {
  btcFetcher.clearCache();
  const stats = btcFetcher.getCacheStats();
  assert(stats.size === 0, 'Cache clears successfully');
} catch (error) {
  assert(false, 'Cache clears successfully');
}

console.log('\n=== Format Tests ===');

// Test 29: Format data with content
try {
  const mockData = {
    platform: 'bitcoin',
    hasData: true,
    raw: '48656c6c6f',
    decoded: 'Hello'
  };
  const formatted = btcFetcher.formatData(mockData);
  assert(
    formatted.includes('bitcoin') &&
    formatted.includes('Hello') &&
    formatted.includes('48656c6c6f'),
    'Formats data with content correctly'
  );
} catch (error) {
  assert(false, 'Formats data with content correctly');
}

// Test 30: Format empty data
try {
  const mockData = {
    platform: 'bitcoin',
    hasData: false,
    raw: null,
    decoded: null
  };
  const formatted = btcFetcher.formatData(mockData);
  assert(
    formatted.includes('No OP_RETURN') ||
    (formatted.includes('No') && formatted.includes('found')),
    'Formats empty data correctly'
  );
} catch (error) {
  assert(false, 'Formats empty data correctly');
}

console.log('\n=== Round-trip Encoding/Decoding Tests ===');

// Test 31: Round-trip with simple text
try {
  const original = 'Test message';
  const encoded = btcFetcher.encodeData(original);
  const decoded = btcFetcher.decodeData(encoded);
  assert(decoded === original, 'Round-trip encoding/decoding preserves simple text');
} catch (error) {
  assert(false, 'Round-trip encoding/decoding preserves simple text');
}

// Test 32: Round-trip with special characters
try {
  const original = 'Special: !@#$%^&*()';
  const encoded = btcFetcher.encodeData(original);
  const decoded = btcFetcher.decodeData(encoded);
  assert(decoded === original, 'Round-trip encoding/decoding preserves special characters');
} catch (error) {
  assert(false, 'Round-trip encoding/decoding preserves special characters');
}

// Test 33: Round-trip with Unicode
try {
  const original = '你好世界';
  const encoded = btcFetcher.encodeData(original);
  const decoded = btcFetcher.decodeData(encoded);
  assert(decoded === original, 'Round-trip encoding/decoding preserves Unicode');
} catch (error) {
  assert(false, 'Round-trip encoding/decoding preserves Unicode');
}

console.log('\n=== Edge Cases ===');

// Test 34: Single character encoding
try {
  const encoded = btcFetcher.encodeData('A');
  const decoded = btcFetcher.decodeData(encoded);
  assert(decoded === 'A', 'Handles single character correctly');
} catch (error) {
  assert(false, 'Handles single character correctly');
}

// Test 35: Whitespace only
try {
  const encoded = btcFetcher.encodeData('   ');
  const decoded = btcFetcher.decodeData(encoded);
  assert(decoded === '   ', 'Handles whitespace correctly');
} catch (error) {
  assert(false, 'Handles whitespace correctly');
}

// Test 36: Numbers as string
try {
  const encoded = btcFetcher.encodeData('123456');
  const decoded = btcFetcher.decodeData(encoded);
  assert(decoded === '123456', 'Handles numeric strings correctly');
} catch (error) {
  assert(false, 'Handles numeric strings correctly');
}

// Test 37: JSON string
try {
  const jsonStr = '{"key":"value"}';
  const encoded = btcFetcher.encodeData(jsonStr);
  const decoded = btcFetcher.decodeData(encoded);
  assert(decoded === jsonStr, 'Handles JSON strings correctly');
} catch (error) {
  assert(false, 'Handles JSON strings correctly');
}

// Test 38: URL encoding
try {
  const url = 'https://example.com/path?query=value';
  const encoded = btcFetcher.encodeData(url);
  const decoded = btcFetcher.decodeData(encoded);
  assert(decoded === url, 'Handles URLs correctly');
} catch (error) {
  assert(false, 'Handles URLs correctly');
}

console.log('\n=== Platform-Specific Tests ===');

// Test 39: Bitcoin max bytes configuration
try {
  assert(btcFetcher.maxOpReturnBytes === 80, 'Bitcoin has 80-byte limit');
} catch (error) {
  assert(false, 'Bitcoin has 80-byte limit');
}

// Test 40: Litecoin max bytes configuration
try {
  assert(ltcFetcher.maxOpReturnBytes === 80, 'Litecoin has 80-byte limit');
} catch (error) {
  assert(false, 'Litecoin has 80-byte limit');
}

// Test 41: Different platforms are independent
try {
  const btc = new OPReturnFetcher('bitcoin');
  const ltc = new OPReturnFetcher('litecoin');
  const eth = new OPReturnFetcher('ethereum');
  assert(
    btc.platform === 'bitcoin' &&
    ltc.platform === 'litecoin' &&
    eth.platform === 'ethereum',
    'Multiple instances maintain separate platform state'
  );
} catch (error) {
  assert(false, 'Multiple instances maintain separate platform state');
}

console.log('\n=== Summary ===');
console.log(`Total tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✅ All tests passed!');
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed`);
  process.exit(1);
}
