/**
 * Transaction Validator Module Tests
 * Tests for the multi-API transaction validation functionality
 */

const TransactionValidator = require('./transaction-validator.js');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function safeStringify(value) {
  const seen = new WeakSet();
  const SENSITIVE_KEYS = ['key', 'token', 'secret', 'password', 'pwd', 'apikey', 'api_key'];

  function isSensitiveKey(k) {
    const lower = String(k).toLowerCase();
    return SENSITIVE_KEYS.some(marker => lower.includes(marker));
  }

  function replacer(key, val) {
    if (typeof key === 'string' && isSensitiveKey(key)) {
      return '[REDACTED]';
    }
    if (val && typeof val === 'object') {
      if (seen.has(val)) {
        return '[Circular]';
      }
      seen.add(val);
    }
    if (typeof val === 'string' && val.length > 64) {
      return val.slice(0, 61) + '...';
    }
    return val;
  }

  try {
    return JSON.stringify(value, replacer);
  } catch (e) {
    try {
      return String(value);
    } catch {
      return '[Unserializable]';
    }
  }
}

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    testsFailed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    console.error(`  Expected: ${safeStringify(expected)}`);
    console.error(`  Actual:   ${safeStringify(actual)}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('Running Transaction Validator Module Tests...\n');
  console.log('='.repeat(50));

  // ------------------------------------------------------------------
  // Constructor
  // ------------------------------------------------------------------
  console.log('\n📦 Testing Constructor (no options)...');
  try {
    const validator = new TransactionValidator();
    assert(validator !== null, 'Should create validator instance');
    assert(validator.etherscanApiKey === null, 'etherscanApiKey should default to null');
    assertEqual(validator.mempoolBaseUrl, 'mempool.space', 'mempoolBaseUrl should default to mempool.space');
    assertEqual(validator.blockchairBaseUrl, 'api.blockchair.com', 'blockchairBaseUrl should default to api.blockchair.com');
    assert(validator.cache instanceof Map, 'Should expose cache as a Map');
  } catch (error) {
    assert(false, `Constructor test failed: ${error.message}`);
  }

  console.log('\n📦 Testing Constructor (with options)...');
  try {
    const validator = new TransactionValidator({
      etherscanApiKey: 'test-api-key',
      mempoolBaseUrl: 'custom.mempool.space',
      blockchairBaseUrl: 'custom.blockchair.com',
      cacheTimeout: 30000
    });
    assertEqual(validator.etherscanApiKey, 'test-api-key', 'Should set etherscanApiKey');
    assertEqual(validator.mempoolBaseUrl, 'custom.mempool.space', 'Should set mempoolBaseUrl');
    assertEqual(validator.blockchairBaseUrl, 'custom.blockchair.com', 'Should set blockchairBaseUrl');
    assertEqual(validator.cacheTimeout, 30000, 'Should set cacheTimeout');
  } catch (error) {
    assert(false, `Constructor with options test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // Ethereum hash validation
  // ------------------------------------------------------------------
  console.log('\n🔑 Testing validateEthereumTxHash...');
  const validator = new TransactionValidator();

  try {
    const validHash = '0x' + 'a'.repeat(64);
    const result = validator.validateEthereumTxHash(validHash);
    assert(result.startsWith('0x'), 'Should return hash with 0x prefix');
    assertEqual(result.length, 66, 'Should be 66 characters (0x + 64)');
  } catch (error) {
    assert(false, `Valid Ethereum hash test failed: ${error.message}`);
  }

  try {
    // Without 0x prefix
    const hashNoPrefix = 'a'.repeat(64);
    const result = validator.validateEthereumTxHash(hashNoPrefix);
    assert(result.startsWith('0x'), 'Should add 0x prefix');
  } catch (error) {
    assert(false, `Hash without prefix test failed: ${error.message}`);
  }

  try {
    validator.validateEthereumTxHash('');
    assert(false, 'Should throw for empty string');
  } catch (error) {
    assert(error.message.includes('non-empty string'), 'Should throw for empty string');
  }

  try {
    validator.validateEthereumTxHash(null);
    assert(false, 'Should throw for null');
  } catch (error) {
    assert(error.message.includes('non-empty string'), 'Should throw for null');
  }

  try {
    validator.validateEthereumTxHash('0xshort');
    assert(false, 'Should throw for too-short hash');
  } catch (error) {
    assert(error.message.includes('Invalid Ethereum transaction hash'), 'Should throw for short hash');
  }

  // ------------------------------------------------------------------
  // Bitcoin hash validation
  // ------------------------------------------------------------------
  console.log('\n🔑 Testing validateBitcoinTxHash...');

  try {
    const validBtcHash = 'a'.repeat(64);
    const result = validator.validateBitcoinTxHash(validBtcHash);
    assertEqual(result.length, 64, 'Should be 64 characters');
    assert(!result.startsWith('0x'), 'Should not have 0x prefix');
  } catch (error) {
    assert(false, `Valid Bitcoin hash test failed: ${error.message}`);
  }

  try {
    validator.validateBitcoinTxHash('');
    assert(false, 'Should throw for empty string');
  } catch (error) {
    assert(error.message.includes('non-empty string'), 'Should throw for empty string');
  }

  try {
    validator.validateBitcoinTxHash('tooshort');
    assert(false, 'Should throw for too-short Bitcoin hash');
  } catch (error) {
    assert(error.message.includes('Invalid Bitcoin transaction hash'), 'Should throw for short hash');
  }

  // ------------------------------------------------------------------
  // Etherscan validation – missing API key
  // ------------------------------------------------------------------
  console.log('\n🔐 Testing Etherscan validation without API key...');
  try {
    const v = new TransactionValidator();
    const fakeHash = '0x' + 'a'.repeat(64);
    await v.validateEthereumTransaction(fakeHash);
    assert(false, 'Should throw when no API key');
  } catch (error) {
    assert(error.message.includes('API key is required'), 'Should require Etherscan API key');
  }

  // ------------------------------------------------------------------
  // Blockchair validation – input validation
  // ------------------------------------------------------------------
  console.log('\n🔑 Testing Blockchair hash validation...');

  try {
    const v = new TransactionValidator();
    await v.validateBlockchairTransaction('');
    assert(false, 'Should throw for empty hash');
  } catch (error) {
    assert(error.message.includes('non-empty string'), 'Should throw for empty hash');
  }

  try {
    const v = new TransactionValidator();
    await v.validateBlockchairTransaction('a'.repeat(64), null);
    assert(false, 'Should throw for null chain');
  } catch (error) {
    assert(error.message.includes('non-empty string'), 'Should throw for null chain');
  }

  // ------------------------------------------------------------------
  // validateTransaction – input validation
  // ------------------------------------------------------------------
  console.log('\n🔑 Testing validateTransaction input validation...');

  try {
    const v = new TransactionValidator();
    await v.validateTransaction('', 'bitcoin');
    assert(false, 'Should throw for empty hash');
  } catch (error) {
    assert(error.message.includes('non-empty string'), 'Should throw for empty hash');
  }

  try {
    const v = new TransactionValidator();
    const hash = 'a'.repeat(64);
    await v.validateTransaction(hash, null);
    assert(false, 'Should throw for null chain');
  } catch (error) {
    assert(error.message.includes('non-empty string'), 'Should throw for null chain');
  }

  // ------------------------------------------------------------------
  // getSupportedChains
  // ------------------------------------------------------------------
  console.log('\n⛓️  Testing getSupportedChains...');
  try {
    const chains = TransactionValidator.getSupportedChains();
    assert(typeof chains === 'object', 'Should return an object');
    assert('bitcoin' in chains, 'Should include bitcoin');
    assert('ethereum' in chains, 'Should include ethereum');
    assert('litecoin-blockchair' in chains, 'Should include litecoin-blockchair');
    assertEqual(chains.bitcoin.api, 'mempool', 'Bitcoin should use mempool API');
    assertEqual(chains.ethereum.api, 'etherscan', 'Ethereum should use etherscan API');
  } catch (error) {
    assert(false, `getSupportedChains test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // formatResult
  // ------------------------------------------------------------------
  console.log('\n📊 Testing formatResult...');
  try {
    const v = new TransactionValidator();
    const mockResult = {
      txHash: '0x' + 'a'.repeat(64),
      chain: 'ethereum',
      chainId: 1,
      api: 'etherscan',
      isValid: true,
      status: 'found',
      confirmed: true,
      blockNumber: 12345678,
      gasUsed: 21000,
      timestamp: Date.now()
    };
    const formatted = v.formatResult(mockResult);
    assert(typeof formatted === 'string', 'Should return a string');
    assert(formatted.includes('Transaction Validation Result'), 'Should include title');
    assert(formatted.includes('ethereum'), 'Should include chain name');
    assert(formatted.includes('etherscan'), 'Should include API name');
    assert(formatted.includes('✅ Yes'), 'Should show valid status');
    assert(formatted.includes('12345678'), 'Should include block number');
  } catch (error) {
    assert(false, `formatResult test failed: ${error.message}`);
  }

  try {
    const v = new TransactionValidator();
    const formatted = v.formatResult(null);
    assertEqual(formatted, 'No validation result available', 'Should handle null input');
  } catch (error) {
    assert(false, `formatResult null test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // formatAggregatedResult
  // ------------------------------------------------------------------
  console.log('\n📋 Testing formatAggregatedResult...');
  try {
    const v = new TransactionValidator();
    const mockAggregated = {
      txHash: 'a'.repeat(64),
      chain: 'bitcoin',
      isValid: true,
      confirmedBy: 2,
      totalSources: 2,
      sources: {
        mempool: { isValid: true, status: 'found', confirmed: true },
        blockchair: { isValid: true, status: 'found', confirmed: true }
      },
      timestamp: Date.now()
    };
    const formatted = v.formatAggregatedResult(mockAggregated);
    assert(typeof formatted === 'string', 'Should return a string');
    assert(formatted.includes('Aggregated Transaction Validation'), 'Should include title');
    assert(formatted.includes('bitcoin'), 'Should include chain name');
    assert(formatted.includes('2 / 2'), 'Should include confirmation counts');
    assert(formatted.includes('MEMPOOL'), 'Should include mempool source');
    assert(formatted.includes('BLOCKCHAIR'), 'Should include blockchair source');
  } catch (error) {
    assert(false, `formatAggregatedResult test failed: ${error.message}`);
  }

  try {
    const v = new TransactionValidator();
    const formatted = v.formatAggregatedResult(null);
    assertEqual(formatted, 'No aggregated validation result available', 'Should handle null input');
  } catch (error) {
    assert(false, `formatAggregatedResult null test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // Cache management
  // ------------------------------------------------------------------
  console.log('\n💾 Testing Cache Management...');
  try {
    const v = new TransactionValidator();
    const stats = v.getCacheStats();
    assertEqual(stats.size, 0, 'Cache should be empty initially');
    assert(Array.isArray(stats.keys), 'Cache stats should include keys array');
    assertEqual(stats.timeout, 60000, 'Default cache timeout should be 60000ms');

    v.clearCache();
    assertEqual(v.cache.size, 0, 'Cache should remain empty after clear');
  } catch (error) {
    assert(false, `Cache test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // Multiple instances are independent
  // ------------------------------------------------------------------
  console.log('\n🔄 Testing Multiple Independent Instances...');
  try {
    const v1 = new TransactionValidator({ etherscanApiKey: 'key1' });
    const v2 = new TransactionValidator({ etherscanApiKey: 'key2' });
    assert(v1.etherscanApiKey !== v2.etherscanApiKey, 'Instances should have independent API keys');
    assert(v1.cache !== v2.cache, 'Instances should have separate caches');
  } catch (error) {
    assert(false, `Multiple instances test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed.');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
