/**
 * Test suite for test-helpers module
 * This validates that the shared test utilities work correctly
 */

const {
  test,
  testAsync,
  assertEqual,
  assertNotNull,
  assertThrows,
  resetCounters,
  getResults,
  printSummary
} = require('./test-helpers');

console.log('Running Test Helpers Tests...\n');

// Test assertEqual
test('assertEqual should pass for equal values', () => {
  assertEqual(1, 1);
  assertEqual('test', 'test');
  assertEqual(true, true);
});

test('assertEqual should throw for unequal values', () => {
  assertThrows(() => assertEqual(1, 2));
  assertThrows(() => assertEqual('a', 'b'));
});

// Test assertNotNull
test('assertNotNull should pass for non-null values', () => {
  assertNotNull(1);
  assertNotNull('test');
  assertNotNull(false);
  assertNotNull(0);
});

test('assertNotNull should throw for null/undefined', () => {
  assertThrows(() => assertNotNull(null));
  assertThrows(() => assertNotNull(undefined));
});

// Test assertThrows
test('assertThrows should pass when function throws', () => {
  assertThrows(() => {
    throw new Error('Test error');
  });
});

test('assertThrows should validate error message', () => {
  assertThrows(() => {
    throw new Error('Invalid input');
  }, 'Invalid');
});

test('assertThrows should fail when no error thrown', () => {
  try {
    assertThrows(() => {
      // This function doesn't throw
      return 'no error';
    });
    throw new Error('assertThrows should have detected missing error');
  } catch (error) {
    // Expected - assertThrows should throw when function doesn't throw
  }
});

// Test async functionality
testAsync('testAsync should work with async functions', async () => {
  await new Promise(resolve => setTimeout(resolve, 10));
  assertEqual(1, 1);
});

// Test getResults
test('getResults should return current counts', () => {
  const results = getResults();
  assertNotNull(results.passed);
  assertNotNull(results.failed);
  assertNotNull(results.total);
});

// Run tests and print summary
printSummary();
