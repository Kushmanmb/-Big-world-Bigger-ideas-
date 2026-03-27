/**
 * Tests for Hello Bitcoin Module
 */

const HelloBitcoin = require('./hello-bitcoin.js');
const { test, testAsync, assertEqual, assertNotNull, assertThrows, printSummary } = require('./test-helpers');

// Helper function to assert truth
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('🧪 Running Hello Bitcoin Tests...\n');
console.log('=' .repeat(60));

// Test 1: Constructor with default name
test('Constructor with default name should work', () => {
  const hello = new HelloBitcoin();
  assertEqual(hello.name, 'World', 'Default name should be "World"');
  assertEqual(hello.greetingCount, 0, 'Initial greeting count should be 0');
  assert(Array.isArray(hello.greetings), 'Greetings should be an array');
  assertEqual(hello.greetings.length, 0, 'Initial greetings array should be empty');
});

// Test 2: Constructor with custom name
test('Constructor with custom name should work', () => {
  const hello = new HelloBitcoin('Alice');
  assertEqual(hello.name, 'Alice', 'Name should be "Alice"');
});

// Test 3: Basic greet method
test('greet() should return correct message', () => {
  const hello = new HelloBitcoin('Bob');
  const message = hello.greet();
  assert(message.includes('Hello Bitcoin'), 'Message should contain "Hello Bitcoin"');
  assert(message.includes('Bob'), 'Message should contain the name');
  assertEqual(hello.greetingCount, 1, 'Greeting count should be 1');
  assertEqual(hello.greetings.length, 1, 'Greetings array should have 1 entry');
});

// Test 4: Multiple greetings increment counter
test('Multiple greetings should increment counter', () => {
  const hello = new HelloBitcoin('Charlie');
  hello.greet();
  hello.greet();
  hello.greet();
  assertEqual(hello.greetingCount, 3, 'Greeting count should be 3');
  assertEqual(hello.greetings.length, 3, 'Greetings array should have 3 entries');
});

// Test 5: greetWithMessage with valid message
test('greetWithMessage() with valid message should work', () => {
  const hello = new HelloBitcoin('Dave');
  const message = hello.greetWithMessage('Welcome to the future');
  assert(message.includes('Hello Bitcoin'), 'Message should contain "Hello Bitcoin"');
  assert(message.includes('Welcome to the future'), 'Message should contain custom message');
  assert(message.includes('Dave'), 'Message should contain the name');
  assertEqual(hello.greetingCount, 1, 'Greeting count should be 1');
});

// Test 6: greetWithMessage with invalid message should throw
test('greetWithMessage() with empty message should throw', () => {
  const hello = new HelloBitcoin('Eve');
  assertThrows(() => hello.greetWithMessage(''), 'non-empty string');
});

// Test 7: greetWithMessage with non-string should throw
test('greetWithMessage() with non-string should throw', () => {
  const hello = new HelloBitcoin('Frank');
  assertThrows(() => hello.greetWithMessage(123), 'non-empty string');
  assertThrows(() => hello.greetWithMessage(null), 'non-empty string');
  assertThrows(() => hello.greetWithMessage(undefined), 'non-empty string');
});

// Test 8: formalGreet method
test('formalGreet() should return formal message', () => {
  const hello = new HelloBitcoin('Grace');
  const message = hello.formalGreet();
  assert(message.includes('Greetings'), 'Message should contain "Greetings"');
  assert(message.includes('Bitcoin'), 'Message should contain "Bitcoin"');
  assert(message.includes('Grace'), 'Message should contain the name');
  assertEqual(hello.greetingCount, 1, 'Greeting count should be 1');
});

// Test 9: greetWithEmoji method
test('greetWithEmoji() should return message with emoji', () => {
  const hello = new HelloBitcoin('Heidi');
  const message = hello.greetWithEmoji();
  assert(message.includes('Hello Bitcoin'), 'Message should contain "Hello Bitcoin"');
  assert(message.includes('Heidi'), 'Message should contain the name');
  assertEqual(hello.greetingCount, 1, 'Greeting count should be 1');
});

// Test 10: getBitcoinInfo method
test('getBitcoinInfo() should return correct info', () => {
  const hello = new HelloBitcoin();
  const info = hello.getBitcoinInfo();
  assertEqual(info.name, 'Bitcoin', 'Name should be Bitcoin');
  assertEqual(info.symbol, 'BTC', 'Symbol should be BTC');
  assertEqual(info.creator, 'Satoshi Nakamoto', 'Creator should be Satoshi Nakamoto');
  assertEqual(info.launched, '2009', 'Launch year should be 2009');
  assert(info.maxSupply.includes('21,000,000'), 'Max supply should include 21,000,000');
});

// Test 11: getHistory method
test('getHistory() should return greeting history', () => {
  const hello = new HelloBitcoin('Ivan');
  hello.greet();
  hello.greetWithMessage('Test');
  const history = hello.getHistory();
  assertEqual(history.length, 2, 'History should have 2 entries');
  assert(history[0].message, 'First entry should have message');
  assert(history[0].timestamp, 'First entry should have timestamp');
  assert(history[0].count, 'First entry should have count');
});

// Test 12: getGreetingCount method
test('getGreetingCount() should return correct count', () => {
  const hello = new HelloBitcoin('Judy');
  assertEqual(hello.getGreetingCount(), 0, 'Initial count should be 0');
  hello.greet();
  assertEqual(hello.getGreetingCount(), 1, 'Count should be 1 after one greeting');
  hello.greet();
  hello.greet();
  assertEqual(hello.getGreetingCount(), 3, 'Count should be 3 after three greetings');
});

// Test 13: reset method
test('reset() should clear counter and history', () => {
  const hello = new HelloBitcoin('Karl');
  hello.greet();
  hello.greet();
  hello.greet();
  assertEqual(hello.greetingCount, 3, 'Count should be 3 before reset');
  hello.reset();
  assertEqual(hello.greetingCount, 0, 'Count should be 0 after reset');
  assertEqual(hello.greetings.length, 0, 'History should be empty after reset');
});

// Test 14: setName with valid name
test('setName() with valid name should work', () => {
  const hello = new HelloBitcoin('Laura');
  hello.setName('Mike');
  assertEqual(hello.name, 'Mike', 'Name should be updated to Mike');
  const message = hello.greet();
  assert(message.includes('Mike'), 'Greeting should use new name');
});

// Test 15: setName with invalid name should throw
test('setName() with empty string should throw', () => {
  const hello = new HelloBitcoin('Nancy');
  assertThrows(() => hello.setName(''), 'non-empty string');
});

// Test 16: setName with non-string should throw
test('setName() with non-string should throw', () => {
  const hello = new HelloBitcoin('Oscar');
  assertThrows(() => hello.setName(null), 'non-empty string');
  assertThrows(() => hello.setName(undefined), 'non-empty string');
  assertThrows(() => hello.setName(123), 'non-empty string');
});

// Test 17: formatHistory with no greetings
test('formatHistory() with no greetings should return message', () => {
  const hello = new HelloBitcoin('Paul');
  const formatted = hello.formatHistory();
  assert(formatted.includes('No greetings yet'), 'Should indicate no greetings');
});

// Test 18: formatHistory with greetings
test('formatHistory() with greetings should format correctly', () => {
  const hello = new HelloBitcoin('Quinn');
  hello.greet();
  hello.formalGreet();
  const formatted = hello.formatHistory();
  assert(formatted.includes('Hello Bitcoin Greeting History'), 'Should have title');
  assert(formatted.includes('Total Greetings: 2'), 'Should show count');
  assert(formatted.includes('Quinn'), 'Should show name');
  assert(formatted.includes('1.'), 'Should have numbered list');
  assert(formatted.includes('2.'), 'Should have numbered list');
});

// Test 19: All greeting methods store in history
test('All greeting methods should store in history', () => {
  const hello = new HelloBitcoin('Rachel');
  hello.greet();
  hello.greetWithMessage('Custom');
  hello.formalGreet();
  hello.greetWithEmoji();
  assertEqual(hello.greetings.length, 4, 'History should have 4 entries');
  assertEqual(hello.greetingCount, 4, 'Count should be 4');
});

// Test 20: Greeting timestamps should be valid
test('Greeting timestamps should be valid Date objects', () => {
  const hello = new HelloBitcoin('Steve');
  hello.greet();
  const history = hello.getHistory();
  assert(history[0].timestamp instanceof Date, 'Timestamp should be a Date object');
  assert(!isNaN(history[0].timestamp.getTime()), 'Timestamp should be valid');
});

printSummary();
