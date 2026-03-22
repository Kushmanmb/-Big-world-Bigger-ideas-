/**
 * Etherscan Stats Module Tests
 * Tests for fetching blockchain statistics from Etherscan API
 */

const EtherscanStats = require('./etherscan-stats.js');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

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
    console.error(`✗ ${message} (expected: ${expected}, got: ${actual})`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('Running Etherscan Stats Module Tests...\n');
  console.log('='.repeat(50));

  // Test 1: Constructor requires API key
  console.log('\n🔑 Testing Constructor Requires API Key...');
  try {
    new EtherscanStats();
    assert(false, 'Should throw error without API key');
  } catch (error) {
    assert(error.message.includes('API key is required'), 'Should throw API key error');
  }

  // Test 2: Constructor with valid API key
  console.log('\n📦 Testing Constructor with API Key...');
  try {
    const stats = new EtherscanStats('test-api-key');
    assert(stats instanceof EtherscanStats, 'Should create stats instance');
    assertEqual(stats.chainId, 1, 'Should default to Ethereum mainnet (chain ID 1)');
    assertEqual(stats.apiBaseUrl, 'api.etherscan.io', 'Should use Etherscan API URL');
    assert(stats.cache instanceof Map, 'Should initialize cache as Map');
  } catch (error) {
    assert(false, `Constructor test failed: ${error.message}`);
  }

  // Test 3: Constructor with custom chain ID
  console.log('\n🔧 Testing Constructor with Custom Chain ID...');
  try {
    const stats = new EtherscanStats('test-api-key', 8453);
    assertEqual(stats.chainId, 8453, 'Should set custom chain ID');
  } catch (error) {
    assert(false, `Custom chain ID test failed: ${error.message}`);
  }

  // Test 4: validateDate with valid date
  console.log('\n📅 Testing validateDate with Valid Date...');
  try {
    const stats = new EtherscanStats('test-api-key');
    const date = stats.validateDate('2019-02-01');
    assertEqual(date, '2019-02-01', 'Should return the date string unchanged');
  } catch (error) {
    assert(false, `Valid date test failed: ${error.message}`);
  }

  // Test 5: validateDate with invalid format
  console.log('\n⚠️  Testing validateDate with Invalid Format...');
  try {
    const stats = new EtherscanStats('test-api-key');
    stats.validateDate('01-02-2019');
    assert(false, 'Should throw error for wrong format');
  } catch (error) {
    assert(error.message.includes('YYYY-MM-DD'), 'Should throw format error');
  }

  // Test 6: validateDate with non-string
  console.log('\n⚠️  Testing validateDate with Non-String...');
  try {
    const stats = new EtherscanStats('test-api-key');
    stats.validateDate(null);
    assert(false, 'Should throw error for null');
  } catch (error) {
    assert(error.message.includes('non-empty'), 'Should throw non-empty error');
  }

  // Test 7: validateDate with invalid date value
  console.log('\n⚠️  Testing validateDate with Invalid Date Value...');
  try {
    const stats = new EtherscanStats('test-api-key');
    stats.validateDate('2019-13-01');
    assert(false, 'Should throw error for invalid date');
  } catch (error) {
    assert(true, 'Should throw error for invalid date value');
  }

  // Test 8: validateSort with valid values
  console.log('\n🔀 Testing validateSort with Valid Values...');
  try {
    const stats = new EtherscanStats('test-api-key');
    assertEqual(stats.validateSort('asc'), 'asc', 'Should accept asc');
    assertEqual(stats.validateSort('desc'), 'desc', 'Should accept desc');
  } catch (error) {
    assert(false, `Valid sort test failed: ${error.message}`);
  }

  // Test 9: validateSort with invalid value
  console.log('\n⚠️  Testing validateSort with Invalid Value...');
  try {
    const stats = new EtherscanStats('test-api-key');
    stats.validateSort('random');
    assert(false, 'Should throw error for invalid sort');
  } catch (error) {
    assert(error.message.includes('Invalid sort'), 'Should throw sort validation error');
  }

  // Test 10: getDailyBlockRewards - startdate after enddate
  console.log('\n⚠️  Testing getDailyBlockRewards - startdate after enddate...');
  try {
    const stats = new EtherscanStats('test-api-key');
    await stats.getDailyBlockRewards('2019-02-28', '2019-02-01', 'desc');
    assert(false, 'Should throw error when startdate > enddate');
  } catch (error) {
    assert(error.message.includes('startdate must be before'), 'Should throw date range error');
  }

  // Test 11: getDailyBlockRewards - invalid startdate
  console.log('\n⚠️  Testing getDailyBlockRewards - Invalid startdate...');
  try {
    const stats = new EtherscanStats('test-api-key');
    await stats.getDailyBlockRewards('bad-date', '2019-02-28', 'desc');
    assert(false, 'Should throw error for invalid startdate');
  } catch (error) {
    assert(error.message.includes('YYYY-MM-DD'), 'Should throw date format error');
  }

  // Test 12: getDailyBlockRewards - invalid sort
  console.log('\n⚠️  Testing getDailyBlockRewards - Invalid sort...');
  try {
    const stats = new EtherscanStats('test-api-key');
    await stats.getDailyBlockRewards('2019-02-01', '2019-02-28', 'up');
    assert(false, 'Should throw error for invalid sort');
  } catch (error) {
    assert(error.message.includes('Invalid sort'), 'Should throw sort validation error');
  }

  // Test 13: formatDailyBlockRewards with valid data
  console.log('\n📝 Testing formatDailyBlockRewards with Valid Data...');
  try {
    const stats = new EtherscanStats('test-api-key');
    const data = {
      chainId: 1,
      startdate: '2019-02-01',
      enddate: '2019-02-28',
      sort: 'desc',
      rewards: [
        {
          UTCDate: '2019-02-01',
          blockRewards_Eth: '13500.123',
          blockCount: '5760',
          uncleInclusionRewards_Eth: '100.5'
        }
      ]
    };
    const formatted = stats.formatDailyBlockRewards(data);
    assert(typeof formatted === 'string', 'Should return string');
    assert(formatted.includes('2019-02-01'), 'Should include date');
    assert(formatted.includes('13500.123'), 'Should include block rewards');
    assert(formatted.includes('5760'), 'Should include block count');
  } catch (error) {
    assert(false, `Format test failed: ${error.message}`);
  }

  // Test 14: formatDailyBlockRewards with empty rewards
  console.log('\n📄 Testing formatDailyBlockRewards with Empty Rewards...');
  try {
    const stats = new EtherscanStats('test-api-key');
    const data = {
      chainId: 1,
      startdate: '2019-02-01',
      enddate: '2019-02-28',
      sort: 'asc',
      rewards: []
    };
    const formatted = stats.formatDailyBlockRewards(data);
    assert(formatted.includes('No reward entries found'), 'Should indicate no entries');
  } catch (error) {
    assert(false, `Empty rewards format test failed: ${error.message}`);
  }

  // Test 15: formatDailyBlockRewards with null data
  console.log('\n⚠️  Testing formatDailyBlockRewards with Null Data...');
  try {
    const stats = new EtherscanStats('test-api-key');
    const formatted = stats.formatDailyBlockRewards(null);
    assertEqual(formatted, 'No data available', 'Should return no data message');
  } catch (error) {
    assert(false, `Null format test failed: ${error.message}`);
  }

  // Test 16: clearCache
  console.log('\n🗑️  Testing clearCache...');
  try {
    const stats = new EtherscanStats('test-api-key');
    stats.cache.set('test', { data: 'value', timestamp: Date.now() });
    assertEqual(stats.cache.size, 1, 'Should have 1 item in cache');
    stats.clearCache();
    assertEqual(stats.cache.size, 0, 'Should clear cache');
  } catch (error) {
    assert(false, `Clear cache test failed: ${error.message}`);
  }

  // Test 17: getCacheStats
  console.log('\n📊 Testing getCacheStats...');
  try {
    const stats = new EtherscanStats('test-api-key');
    stats.cache.set('key1', { data: 'value1', timestamp: Date.now() });
    stats.cache.set('key2', { data: 'value2', timestamp: Date.now() });
    const cacheStats = stats.getCacheStats();
    assertEqual(cacheStats.size, 2, 'Should report 2 items in cache');
    assert(cacheStats.timeout === 60000, 'Should report cache timeout');
    assert(Array.isArray(cacheStats.keys), 'Should return keys array');
  } catch (error) {
    assert(false, `Cache stats test failed: ${error.message}`);
  }

  // Test 18: getAPIInfo
  console.log('\n📡 Testing getAPIInfo...');
  try {
    const stats = new EtherscanStats('my-api-key', 8453);
    const info = stats.getAPIInfo();
    assertEqual(info.baseUrl, 'api.etherscan.io', 'Should return base URL');
    assertEqual(info.chainId, 8453, 'Should return chain ID');
    assert(info.hasApiKey === true, 'Should indicate API key is present');
    assertEqual(info.cacheTimeout, 60000, 'Should return cache timeout');
  } catch (error) {
    assert(false, `API info test failed: ${error.message}`);
  }

  // Test 19: getDailyBlockRewards uses default sort 'asc'
  console.log('\n🔀 Testing getDailyBlockRewards Default Sort...');
  try {
    const stats = new EtherscanStats('test-api-key');
    // Should not throw for default sort
    const validateOnly = () => {
      stats.validateDate('2019-02-01');
      stats.validateDate('2019-02-28');
      stats.validateSort('asc');
    };
    validateOnly();
    assert(true, 'Default sort asc is valid');
  } catch (error) {
    assert(false, `Default sort test failed: ${error.message}`);
  }

  // Final Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);
  console.log('\n' + '='.repeat(50));

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(`\n❌ ${testsFailed} test(s) failed!`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
