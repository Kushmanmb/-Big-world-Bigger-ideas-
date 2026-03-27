/**
 * Test suite for http-client module
 */

const { makeRequest, CacheManager } = require('./http-client');
const { test, testAsync, assertEqual, assertNotNull, assertThrows, printSummary } = require('./test-helpers');

console.log('Running HTTP Client Tests...\n');

// Test CacheManager
test('CacheManager should create instance with default timeout', () => {
  const cache = new CacheManager();
  assertNotNull(cache);
  assertEqual(cache.cacheTimeout, 60000);
});

test('CacheManager should create instance with custom timeout', () => {
  const cache = new CacheManager(30000);
  assertEqual(cache.cacheTimeout, 30000);
});

testAsync('CacheManager should cache and retrieve data', async () => {
  const cache = new CacheManager();
  let fetchCount = 0;
  
  const fetcher = async () => {
    fetchCount++;
    return { value: 'test data' };
  };
  
  const data1 = await cache.getWithCache('key1', fetcher);
  const data2 = await cache.getWithCache('key1', fetcher);
  
  assertEqual(fetchCount, 1, 'Should only fetch once');
  assertEqual(data1.value, 'test data');
  assertEqual(data2.value, 'test data');
});

testAsync('CacheManager should fetch again after cache clear', async () => {
  const cache = new CacheManager();
  let fetchCount = 0;
  
  const fetcher = async () => {
    fetchCount++;
    return { value: 'test data' };
  };
  
  await cache.getWithCache('key1', fetcher);
  cache.clearCache();
  await cache.getWithCache('key1', fetcher);
  
  assertEqual(fetchCount, 2, 'Should fetch twice after cache clear');
});

test('CacheManager get/set should work', () => {
  const cache = new CacheManager();
  cache.set('key1', 'value1');
  const value = cache.get('key1');
  assertEqual(value, 'value1');
});

test('CacheManager get should return null for non-existent key', () => {
  const cache = new CacheManager();
  const value = cache.get('nonexistent');
  assertEqual(value, null);
});

testAsync('CacheManager should expire old cache entries', async () => {
  const cache = new CacheManager(100); // 100ms timeout
  let fetchCount = 0;
  
  const fetcher = async () => {
    fetchCount++;
    return { value: 'test data' };
  };
  
  await cache.getWithCache('key1', fetcher);
  
  // Wait for cache to expire
  await new Promise(resolve => setTimeout(resolve, 150));
  
  await cache.getWithCache('key1', fetcher);
  
  assertEqual(fetchCount, 2, 'Should fetch again after cache expires');
});

// makeRequest tests - Note: These test the structure, not actual HTTP calls
test('makeRequest should be a function', () => {
  assertEqual(typeof makeRequest, 'function');
});

// Summary
printSummary();
