/**
 * BTCK (BtcTurk) API Module Tests
 * Tests for the BtcTurk public market data fetcher
 */

const BTCKFetcher = require('./btck.js');

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
    console.error(`✗ ${message}`);
    console.error(`  Expected: ${expected}`);
    console.error(`  Actual: ${actual}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('Running BTCK (BtcTurk) Module Tests...\n');
  console.log('='.repeat(50));

  // Test 1: Constructor defaults
  console.log('\n📦 Testing Constructor (defaults)...');
  try {
    const fetcher = new BTCKFetcher();
    assert(fetcher !== null, 'Should create fetcher instance');
    assertEqual(fetcher.baseUrl, 'api.btcturk.com', 'Should use default base URL');
    assert(fetcher.cache instanceof Map, 'Should initialize cache as Map');
    assert(typeof fetcher.cacheTimeout === 'number', 'Should have a numeric cacheTimeout');
  } catch (error) {
    assert(false, `Constructor test failed: ${error.message}`);
  }

  // Test 2: Constructor with custom URL
  console.log('\n🌐 Testing Constructor with Custom URL...');
  try {
    const customFetcher = new BTCKFetcher('custom.btcturk.com');
    assertEqual(customFetcher.baseUrl, 'custom.btcturk.com', 'Should use custom base URL');
  } catch (error) {
    assert(false, `Custom URL test failed: ${error.message}`);
  }

  // Test 3: getOrderBook requires pairSymbol
  console.log('\n⚠️  Testing getOrderBook validation (missing pairSymbol)...');
  try {
    const fetcher = new BTCKFetcher();
    await fetcher.getOrderBook();
    assert(false, 'Should throw error when pairSymbol is missing');
  } catch (error) {
    assert(error.message.includes('pairSymbol is required'), 'Should throw descriptive error for missing pairSymbol');
  }

  // Test 4: getTrades requires pairSymbol
  console.log('\n⚠️  Testing getTrades validation (missing pairSymbol)...');
  try {
    const fetcher = new BTCKFetcher();
    await fetcher.getTrades();
    assert(false, 'Should throw error when pairSymbol is missing');
  } catch (error) {
    assert(error.message.includes('pairSymbol is required'), 'Should throw descriptive error for missing pairSymbol');
  }

  // Test 5: getOHLC requires pair
  console.log('\n⚠️  Testing getOHLC validation (missing pair)...');
  try {
    const fetcher = new BTCKFetcher();
    await fetcher.getOHLC();
    assert(false, 'Should throw error when pair is missing');
  } catch (error) {
    assert(error.message.includes('pair is required'), 'Should throw descriptive error for missing pair');
  }

  // Test 6: getKlines validation - missing symbol
  console.log('\n⚠️  Testing getKlines validation (missing symbol)...');
  try {
    const fetcher = new BTCKFetcher();
    await fetcher.getKlines();
    assert(false, 'Should throw error when symbol is missing');
  } catch (error) {
    assert(error.message.includes('symbol is required'), 'Should throw descriptive error for missing symbol');
  }

  // Test 7: getKlines validation - invalid resolution (negative)
  console.log('\n⚠️  Testing getKlines validation (negative resolution)...');
  try {
    const fetcher = new BTCKFetcher();
    await fetcher.getKlines('BTCTRY', -1, 1000000, 2000000);
    assert(false, 'Should throw error for negative resolution');
  } catch (error) {
    assert(error.message.includes('resolution must be a positive number'), 'Should throw error for negative resolution');
  }

  // Test 7b: getKlines validation - zero resolution
  console.log('\n⚠️  Testing getKlines validation (zero resolution)...');
  try {
    const fetcher = new BTCKFetcher();
    await fetcher.getKlines('BTCTRY', 0, 1000000, 2000000);
    assert(false, 'Should throw error for zero resolution');
  } catch (error) {
    assert(error.message.includes('resolution must be a positive number'), 'Should throw error for zero resolution');
  }

  // Test 8: getKlines validation - from >= to
  console.log('\n⚠️  Testing getKlines validation (from >= to)...');
  try {
    const fetcher = new BTCKFetcher();
    await fetcher.getKlines('BTCTRY', 60, 2000000, 1000000);
    assert(false, 'Should throw error when from >= to');
  } catch (error) {
    assert(error.message.includes('from must be earlier than to'), 'Should throw error when from >= to');
  }

  // Test 9: getKlines validation - missing from/to
  console.log('\n⚠️  Testing getKlines validation (missing timestamps)...');
  try {
    const fetcher = new BTCKFetcher();
    await fetcher.getKlines('BTCTRY', 60, null, null);
    assert(false, 'Should throw error when from/to missing');
  } catch (error) {
    assert(error.message.includes('from and to timestamps are required'), 'Should throw error for missing timestamps');
  }

  // Test 10: Cache functionality
  console.log('\n💾 Testing Cache Functionality...');
  try {
    const fetcher = new BTCKFetcher();
    const stats = fetcher.getCacheStats();
    assert(stats.size === 0, 'Cache should be empty initially');
    assert(Array.isArray(stats.keys), 'Cache stats should include keys array');
    assertEqual(stats.timeout, 60000, 'Default cache timeout should be 60000ms');

    fetcher.clearCache();
    assertEqual(fetcher.cache.size, 0, 'Cache should be cleared');
  } catch (error) {
    assert(false, `Cache test failed: ${error.message}`);
  }

  // Test 11: formatTickers with array data
  console.log('\n📊 Testing formatTickers (array)...');
  try {
    const fetcher = new BTCKFetcher();
    const mockData = [
      { pairNumerator: 'BTC', pairDenominator: 'TRY', last: 1000000, bid: 999000, ask: 1001000, volume: 500, high: 1050000, low: 980000 },
      { pairNumerator: 'ETH', pairDenominator: 'TRY', last: 50000, bid: 49800, ask: 50200, volume: 1000, high: 52000, low: 48000 }
    ];
    const formatted = fetcher.formatTickers(mockData);
    assert(formatted.includes('BtcTurk (BTCK) Tickers'), 'Should include title');
    assert(formatted.includes('Total pairs: 2'), 'Should show total pairs count');
    assert(formatted.includes('BTC/TRY'), 'Should include BTC/TRY pair');
    assert(formatted.includes('1000000'), 'Should include last price');
  } catch (error) {
    assert(false, `formatTickers array test failed: ${error.message}`);
  }

  // Test 12: formatTickers with nested data.data array
  console.log('\n📊 Testing formatTickers (data.data array)...');
  try {
    const fetcher = new BTCKFetcher();
    const mockData = {
      data: [
        { pairNumerator: 'BTC', pairDenominator: 'TRY', last: 1000000, volume: 500 }
      ]
    };
    const formatted = fetcher.formatTickers(mockData);
    assert(formatted.includes('BtcTurk (BTCK) Tickers'), 'Should include title');
    assert(formatted.includes('BTC/TRY'), 'Should include pair from nested data');
  } catch (error) {
    assert(false, `formatTickers nested data test failed: ${error.message}`);
  }

  // Test 13: formatTickers with null data
  console.log('\n🚫 Testing formatTickers with Null Data...');
  try {
    const fetcher = new BTCKFetcher();
    const formatted = fetcher.formatTickers(null);
    assertEqual(formatted, 'No data available', 'Should return "No data available" for null');
  } catch (error) {
    assert(false, `formatTickers null test failed: ${error.message}`);
  }

  // Test 14: formatTickers with more than 10 pairs
  console.log('\n📊 Testing formatTickers with More Than 10 Pairs...');
  try {
    const fetcher = new BTCKFetcher();
    const mockData = Array.from({ length: 15 }, (_, i) => ({
      pairNumerator: `TOKEN${i}`,
      pairDenominator: 'TRY',
      last: i * 1000
    }));
    const formatted = fetcher.formatTickers(mockData);
    assert(formatted.includes('Total pairs: 15'), 'Should show 15 total pairs');
    assert(formatted.includes('... and 5 more pairs'), 'Should show overflow count');
  } catch (error) {
    assert(false, `formatTickers overflow test failed: ${error.message}`);
  }

  // Test 15: Multiple instances are independent
  console.log('\n🔄 Testing Multiple Instances...');
  try {
    const fetcher1 = new BTCKFetcher();
    const fetcher2 = new BTCKFetcher('custom.btcturk.com');
    assert(fetcher1.baseUrl !== fetcher2.baseUrl, 'Instances should have independent base URLs');
    assert(fetcher1.cache !== fetcher2.cache, 'Instances should have separate caches');
  } catch (error) {
    assert(false, `Multiple instances test failed: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
