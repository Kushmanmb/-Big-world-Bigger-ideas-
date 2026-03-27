/**
 * Shared test utility functions
 * 
 * This module provides common test helpers used across all test files
 * to reduce code duplication and maintain consistency.
 */

let testsPassed = 0;
let testsFailed = 0;

/**
 * Reset test counters (useful when running multiple test suites)
 */
function resetCounters() {
  testsPassed = 0;
  testsFailed = 0;
}

/**
 * Get current test results
 * @returns {{passed: number, failed: number, total: number}}
 */
function getResults() {
  return {
    passed: testsPassed,
    failed: testsFailed,
    total: testsPassed + testsFailed
  };
}

/**
 * Run a synchronous test
 * @param {string} description - Test description
 * @param {Function} fn - Test function
 */
function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  Error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * Run an asynchronous test
 * @param {string} description - Test description
 * @param {Function} fn - Async test function
 */
async function testAsync(description, fn) {
  try {
    await fn();
    console.log(`✓ ${description}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  Error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * Assert that two values are equal
 * @param {*} actual - Actual value
 * @param {*} expected - Expected value
 * @param {string} message - Optional message
 */
function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} - Expected ${expected}, got ${actual}`);
  }
}

/**
 * Assert that a value is not null or undefined
 * @param {*} value - Value to check
 * @param {string} message - Optional message
 */
function assertNotNull(value, message = '') {
  if (value === null || value === undefined) {
    throw new Error(`${message} - Value should not be null or undefined`);
  }
}

/**
 * Assert that a function throws an error
 * @param {Function} fn - Function that should throw
 * @param {string|null} expectedError - Optional expected error message substring
 */
function assertThrows(fn, expectedError = null) {
  try {
    fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (expectedError && !error.message.includes(expectedError)) {
      throw new Error(`Expected error message to include "${expectedError}", got "${error.message}"`);
    }
  }
}

/**
 * Print test summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log('='.repeat(50));
  
  if (testsFailed > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

module.exports = {
  test,
  testAsync,
  assertEqual,
  assertNotNull,
  assertThrows,
  resetCounters,
  getResults,
  printSummary
};
