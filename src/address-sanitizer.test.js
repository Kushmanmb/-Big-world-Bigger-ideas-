/**
 * Address Sanitizer Tests
 */

const {
  AddressSanitizer,
  sanitize,
  sanitizeText,
  sanitizeObject,
  safeConsole,
  setSanitizationEnabled,
  addToWhitelist
} = require('./address-sanitizer');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

console.log('Running Address Sanitizer Tests...\n');

// Test 1: Basic address sanitization
test('Should sanitize a valid address', () => {
  const address = '0x1234567890123456789012345678901234567890';
  const sanitized = sanitize(address);
  assert(sanitized.startsWith('0x1234'), 'Should keep prefix');
  assert(sanitized.endsWith('7890'), 'Should keep suffix');
  assert(sanitized.includes('***'), 'Should contain redaction');
});

// Test 2: Whitelist functionality
test('Should not sanitize whitelisted addresses', () => {
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const sanitized = sanitize(zeroAddress);
  assertEqual(sanitized, zeroAddress, 'Zero address should not be sanitized');
});

// Test 3: Text sanitization
test('Should sanitize addresses in text', () => {
  const text = 'Transfer from 0x1234567890123456789012345678901234567890 to 0xabcdef1234567890123456789012345678901234';
  const sanitized = sanitizeText(text);
  assert(!sanitized.includes('0x1234567890123456789012345678901234567890'), 'Original address should be sanitized');
  assert(sanitized.includes('0x1234'), 'Should keep prefix');
  assert(sanitized.includes('****'), 'Should contain redaction');
  assert(sanitized.includes('7890'), 'Should keep suffix');
});

// Test 4: Object sanitization
test('Should sanitize addresses in objects', () => {
  const obj = {
    from: '0x1234567890123456789012345678901234567890',
    to: '0xabcdef1234567890123456789012345678901234',
    amount: '100',
    nested: {
      address: '0x1111111111111111111111111111111111111111'
    }
  };
  const sanitized = sanitizeObject(obj);
  assert(sanitized.from.includes('***'), 'Should sanitize from address');
  assert(sanitized.to.includes('***'), 'Should sanitize to address');
  assert(sanitized.nested.address.includes('***'), 'Should sanitize nested address');
  assertEqual(sanitized.amount, '100', 'Should not modify non-address fields');
});

// Test 5: Array sanitization
test('Should sanitize addresses in arrays', () => {
  const arr = [
    '0x1234567890123456789012345678901234567890',
    'some text',
    { address: '0xabcdef1234567890123456789012345678901234' }
  ];
  const sanitized = sanitizeObject(arr);
  assert(sanitized[0].includes('***'), 'Should sanitize array element');
  assertEqual(sanitized[1], 'some text', 'Should not modify non-address elements');
  assert(sanitized[2].address.includes('***'), 'Should sanitize nested address');
});

// Test 6: Non-address strings
test('Should not sanitize non-address strings', () => {
  const text = 'This is just normal text without addresses';
  const sanitized = sanitizeText(text);
  assertEqual(sanitized, text, 'Should not modify non-address text');
});

// Test 7: Invalid inputs
test('Should handle null and undefined', () => {
  assertEqual(sanitize(null), null);
  assertEqual(sanitize(undefined), undefined);
  assertEqual(sanitizeText(null), null);
  assertEqual(sanitizeObject(null), null);
});

// Test 8: Disable sanitization
test('Should respect disabled sanitization', () => {
  setSanitizationEnabled(false);
  const address = '0x1234567890123456789012345678901234567890';
  const sanitized = sanitize(address);
  assertEqual(sanitized, address, 'Should not sanitize when disabled');
  setSanitizationEnabled(true); // Re-enable for other tests
});

// Test 9: Custom sanitizer configuration
test('Should support custom configuration', () => {
  const customSanitizer = new AddressSanitizer({
    visiblePrefix: 8,
    visibleSuffix: 6,
    redactionChar: 'X'
  });
  const address = '0x1234567890123456789012345678901234567890';
  const sanitized = customSanitizer.sanitizeAddress(address);
  assert(sanitized.startsWith('0x123456'), 'Should use custom prefix length');
  assert(sanitized.endsWith('567890'), 'Should use custom suffix length');
  assert(sanitized.includes('XXX'), 'Should use custom redaction char');
});

// Test 10: Address detection
test('Should correctly identify addresses', () => {
  const sanitizer = new AddressSanitizer();
  assert(sanitizer.looksLikeAddress('0x1234567890123456789012345678901234567890'), 'Should detect valid address');
  assert(!sanitizer.looksLikeAddress('not an address'), 'Should not detect non-address');
  assert(!sanitizer.looksLikeAddress('0x123'), 'Should not detect short hex string');
});

// Test 11: Whitelist management
test('Should allow adding to whitelist', () => {
  const testAddress = '0x9999999999999999999999999999999999999999';
  addToWhitelist(testAddress);
  const sanitized = sanitize(testAddress);
  assertEqual(sanitized, testAddress, 'Whitelisted address should not be sanitized');
});

// Test 12: Validation of address leaks
test('Should validate no address leaks', () => {
  const sanitizer = new AddressSanitizer();
  const cleanText = 'No addresses here';
  const dirtyText = 'Address: 0x1234567890123456789012345678901234567890';
  
  const cleanResult = sanitizer.validateNoAddressLeaks(cleanText);
  assert(cleanResult.valid, 'Should validate clean text');
  
  const dirtyResult = sanitizer.validateNoAddressLeaks(dirtyText);
  assert(!dirtyResult.valid, 'Should detect leaked address');
  assertEqual(dirtyResult.exposedAddresses.length, 1, 'Should identify one exposed address');
});

// Test 13: Safe logger
test('Should create safe logger', () => {
  const mockLogger = {
    logCalls: [],
    log(...args) { this.logCalls.push(args); }
  };
  
  const sanitizer = new AddressSanitizer();
  const safeMockLogger = sanitizer.createSafeLogger(mockLogger);
  
  safeMockLogger.log('Address:', '0x1234567890123456789012345678901234567890');
  
  assert(mockLogger.logCalls.length === 1, 'Should log once');
  const loggedAddress = mockLogger.logCalls[0][1];
  assert(loggedAddress.includes('***'), 'Logged address should be sanitized');
});

// Test 14: Mixed content
test('Should handle mixed content', () => {
  const text = 'Send 100 tokens from 0x1234567890123456789012345678901234567890 to user@example.com';
  const sanitized = sanitizeText(text);
  assert(sanitized.includes('user@example.com'), 'Should preserve non-address content');
  assert(!sanitized.includes('0x1234567890123456789012345678901234567890'), 'Should sanitize address');
});

// Test 15: Case insensitivity
test('Should handle mixed case addresses', () => {
  const address = '0x1234567890ABCDEF123456789012345678901234';
  const sanitized = sanitize(address);
  assert(sanitized.includes('***'), 'Should sanitize mixed case address');
});

// Test 16: Multiple addresses in text
test('Should sanitize multiple addresses in text', () => {
  const text = 'From 0x1111111111111111111111111111111111111111 to 0x2222222222222222222222222222222222222222';
  const sanitized = sanitizeText(text);
  const addressMatches = sanitized.match(/0x[0-9a-fA-F*]{40}/g) || [];
  assert(addressMatches.length === 2, 'Should find both sanitized addresses');
  addressMatches.forEach(addr => {
    assert(addr.includes('***'), 'Each address should be sanitized');
  });
});

// Test 17: Request sanitization for logging
test('Should sanitize HTTP request options for logging', () => {
  const sanitizer = new AddressSanitizer();
  const requestOptions = {
    url: 'https://api.example.com/address/0x1234567890123456789012345678901234567890',
    headers: {
      'X-Wallet-Address': '0xabcdef1234567890123456789012345678901234'
    }
  };
  
  const sanitized = sanitizer.sanitizeRequestForLogging(requestOptions);
  assert(sanitized.url.includes('***'), 'Should sanitize URL');
  assert(sanitized.headers['X-Wallet-Address'].includes('***'), 'Should sanitize headers');
});

// Test 18: Empty strings
test('Should handle empty strings', () => {
  assertEqual(sanitize(''), '');
  assertEqual(sanitizeText(''), '');
});

// Test 19: Deep nesting
test('Should handle deeply nested objects', () => {
  const obj = {
    level1: {
      level2: {
        level3: {
          address: '0x1234567890123456789012345678901234567890'
        }
      }
    }
  };
  const sanitized = sanitizeObject(obj);
  assert(sanitized.level1.level2.level3.address.includes('***'), 'Should sanitize deeply nested address');
});

// Test 20: Preserve data types
test('Should preserve data types', () => {
  const obj = {
    number: 123,
    boolean: true,
    null: null,
    undefined: undefined,
    address: '0x1234567890123456789012345678901234567890'
  };
  const sanitized = sanitizeObject(obj);
  assertEqual(typeof sanitized.number, 'number');
  assertEqual(typeof sanitized.boolean, 'boolean');
  assertEqual(sanitized.null, null);
  assertEqual(sanitized.undefined, undefined);
  assert(sanitized.address.includes('***'), 'Should sanitize address while preserving other types');
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

if (failed > 0) {
  console.log('\n❌ Some tests failed');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
}
