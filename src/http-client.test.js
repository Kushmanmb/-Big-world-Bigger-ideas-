/**
 * Test suite for http-client module
 */

const { makeRequest, makePostRequest, CacheManager, RequestQueue } = require('./http-client');
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

// makePostRequest tests
test('makePostRequest should be a function', () => {
  assertEqual(typeof makePostRequest, 'function');
});

// RequestQueue tests
test('RequestQueue should create instance with defaults', () => {
  const queue = new RequestQueue();
  assertEqual(queue.maxConcurrency, 1, 'Default maxConcurrency should be 1');
  assertEqual(queue.delay, 1000, 'Default delay should be 1000ms');
  assertEqual(queue.size, 0, 'Initial queue size should be 0');
  assertEqual(queue.active, 0, 'Initial active count should be 0');
});

test('RequestQueue should create instance with custom options', () => {
  const queue = new RequestQueue({ maxConcurrency: 3, delay: 500 });
  assertEqual(queue.maxConcurrency, 3);
  assertEqual(queue.delay, 500);
});

test('RequestQueue enqueue should return acknowledgement immediately', () => {
  const queue = new RequestQueue({ delay: 0 });
  const ack = queue.enqueue(() => Promise.resolve('done'));

  assertNotNull(ack, 'Acknowledgement should not be null');
  assertNotNull(ack.queueId, 'Acknowledgement should have a queueId');
  assertEqual(ack.status, 'queued', 'Status should be "queued"');
  assertEqual(typeof ack.position, 'number', 'Position should be a number');
  assertNotNull(ack.promise, 'Acknowledgement should include a promise');
});

test('RequestQueue enqueue should generate unique queueIds', () => {
  const queue = new RequestQueue({ delay: 0 });
  const ack1 = queue.enqueue(() => Promise.resolve(1));
  const ack2 = queue.enqueue(() => Promise.resolve(2));
  const different = ack1.queueId !== ack2.queueId;
  assertEqual(different, true, 'Queue IDs should be unique');
});

test('RequestQueue enqueue should throw for non-function argument', () => {
  const queue = new RequestQueue();
  assertThrows(() => queue.enqueue('not a function'), 'function');
});

testAsync('RequestQueue should process requests and resolve promises', async () => {
  const queue = new RequestQueue({ delay: 0 });
  const ack = queue.enqueue(() => Promise.resolve('result'));
  const result = await ack.promise;
  assertEqual(result, 'result', 'Promise should resolve with the request result');
});

testAsync('RequestQueue should process multiple requests sequentially', async () => {
  const queue = new RequestQueue({ maxConcurrency: 1, delay: 0 });
  const order = [];

  const ack1 = queue.enqueue(async () => { order.push(1); return 1; });
  const ack2 = queue.enqueue(async () => { order.push(2); return 2; });
  const ack3 = queue.enqueue(async () => { order.push(3); return 3; });

  await Promise.all([ack1.promise, ack2.promise, ack3.promise]);

  assertEqual(order[0], 1, 'First request should run first');
  assertEqual(order[1], 2, 'Second request should run second');
  assertEqual(order[2], 3, 'Third request should run third');
});

testAsync('RequestQueue should propagate errors through the promise', async () => {
  const queue = new RequestQueue({ delay: 0 });
  const ack = queue.enqueue(() => Promise.reject(new Error('request failed')));

  let caughtError = null;
  try {
    await ack.promise;
  } catch (err) {
    caughtError = err;
  }

  assertNotNull(caughtError, 'Error should be propagated');
  assertEqual(caughtError.message, 'request failed');
});

testAsync('RequestQueue clear should reject pending requests', async () => {
  const queue = new RequestQueue({ maxConcurrency: 1, delay: 100 });

  // First request starts immediately (not pending)
  const ack1 = queue.enqueue(() => new Promise(resolve => setTimeout(() => resolve(1), 50)));
  // Second request is queued (pending)
  const ack2 = queue.enqueue(() => Promise.resolve(2));

  queue.clear();

  let secondError = null;
  try {
    await ack2.promise;
  } catch (err) {
    secondError = err;
  }

  assertNotNull(secondError, 'Cleared pending request should reject');
  assertEqual(secondError.message, 'Queue cleared');
});

// Summary
printSummary();
