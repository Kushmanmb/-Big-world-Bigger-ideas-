/**
 * Token UUID Tests
 * Test suite for Token UUID functionality
 */

const TokenUUID = require('./token-uuid');

// Simple test framework
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.log(`❌ ${message}`);
    testsFailed++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

function test(description, fn) {
  console.log(`\n🧪 ${description}`);
  try {
    fn();
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
}

console.log('🔍 Token UUID - Test Suite\n');
console.log('='.repeat(70));

// Test 1: Constructor with default namespace
test('TokenUUID - Create instance with default namespace', () => {
  const tokenUUID = new TokenUUID();
  assert(tokenUUID.namespace === TokenUUID.getTokenNamespace(), 'Uses default namespace');
  assert(typeof tokenUUID.namespace === 'string', 'Namespace is a string');
});

// Test 2: Constructor with custom namespace
test('TokenUUID - Create instance with custom namespace', () => {
  const customNamespace = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
  const tokenUUID = new TokenUUID(customNamespace);
  assert(tokenUUID.namespace === customNamespace, 'Uses custom namespace');
});

// Test 3: Generate random UUID v4
test('TokenUUID - Generate random UUID v4', () => {
  const tokenUUID = new TokenUUID();
  const uuid1 = tokenUUID.generateRandom();
  const uuid2 = tokenUUID.generateRandom();
  
  assert(typeof uuid1 === 'string', 'Returns a string');
  assert(uuid1.length === 36, 'UUID has correct length');
  assert(uuid1 !== uuid2, 'Each call generates a unique UUID');
  assert(tokenUUID.getVersion(uuid1) === 4, 'Generated UUID is version 4');
});

// Test 4: Generate deterministic UUID for token
test('TokenUUID - Generate deterministic UUID for token', () => {
  const tokenUUID = new TokenUUID();
  const contractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
  const tokenId = '1234';
  
  const uuid1 = tokenUUID.generateForToken(contractAddress, tokenId);
  const uuid2 = tokenUUID.generateForToken(contractAddress, tokenId);
  
  assert(uuid1 === uuid2, 'Same input generates same UUID (deterministic)');
  assert(tokenUUID.getVersion(uuid1) === 5, 'Generated UUID is version 5');
});

// Test 5: Different tokens generate different UUIDs
test('TokenUUID - Different tokens generate different UUIDs', () => {
  const tokenUUID = new TokenUUID();
  const contractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
  
  const uuid1 = tokenUUID.generateForToken(contractAddress, '1234');
  const uuid2 = tokenUUID.generateForToken(contractAddress, '5678');
  
  assert(uuid1 !== uuid2, 'Different token IDs generate different UUIDs');
});

// Test 6: Different contracts generate different UUIDs
test('TokenUUID - Different contracts generate different UUIDs', () => {
  const tokenUUID = new TokenUUID();
  const tokenId = '1234';
  
  const uuid1 = tokenUUID.generateForToken('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', tokenId);
  const uuid2 = tokenUUID.generateForToken('0x60E4d786628Fea6478F785A6d7e704777c86a7c6', tokenId);
  
  assert(uuid1 !== uuid2, 'Different contract addresses generate different UUIDs');
});

// Test 7: Address format normalization
test('TokenUUID - Address format normalization', () => {
  const tokenUUID = new TokenUUID();
  const tokenId = '1234';
  
  // Same address in different formats should generate the same UUID
  const uuid1 = tokenUUID.generateForToken('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', tokenId);
  const uuid2 = tokenUUID.generateForToken('0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', tokenId);
  const uuid3 = tokenUUID.generateForToken('BC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', tokenId);
  
  assert(uuid1 === uuid2, 'Mixed case and lowercase generate same UUID');
  assert(uuid2 === uuid3, 'With and without 0x prefix generate same UUID');
});

// Test 8: Generate UUID for ownership event
test('TokenUUID - Generate UUID for ownership event', () => {
  const tokenUUID = new TokenUUID();
  const contractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
  const tokenId = '1234';
  const from = '0x0000000000000000000000000000000000000000';
  const to = '0x1234567890123456789012345678901234567890';
  const timestamp = 1609459200;
  
  const uuid = tokenUUID.generateForEvent(contractAddress, tokenId, from, to, timestamp);
  
  assert(typeof uuid === 'string', 'Returns a string');
  assert(tokenUUID.getVersion(uuid) === 5, 'Generated UUID is version 5');
});

// Test 9: Same event generates same UUID
test('TokenUUID - Same event generates same UUID', () => {
  const tokenUUID = new TokenUUID();
  const contractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
  const tokenId = '1234';
  const from = '0x0000000000000000000000000000000000000000';
  const to = '0x1234567890123456789012345678901234567890';
  const timestamp = 1609459200;
  
  const uuid1 = tokenUUID.generateForEvent(contractAddress, tokenId, from, to, timestamp);
  const uuid2 = tokenUUID.generateForEvent(contractAddress, tokenId, from, to, timestamp);
  
  assert(uuid1 === uuid2, 'Same event generates same UUID (deterministic)');
});

// Test 10: Different timestamps generate different UUIDs
test('TokenUUID - Different timestamps generate different UUIDs', () => {
  const tokenUUID = new TokenUUID();
  const contractAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
  const tokenId = '1234';
  const from = '0x0000000000000000000000000000000000000000';
  const to = '0x1234567890123456789012345678901234567890';
  
  const uuid1 = tokenUUID.generateForEvent(contractAddress, tokenId, from, to, 1609459200);
  const uuid2 = tokenUUID.generateForEvent(contractAddress, tokenId, from, to, 1609459300);
  
  assert(uuid1 !== uuid2, 'Different timestamps generate different UUIDs');
});

// Test 11: Validate UUID - valid
test('TokenUUID - Validate valid UUID', () => {
  const tokenUUID = new TokenUUID();
  const validUUID = tokenUUID.generateRandom();
  
  assert(tokenUUID.validateUUID(validUUID), 'Valid UUID passes validation');
});

// Test 12: Validate UUID - invalid
test('TokenUUID - Validate invalid UUID', () => {
  const tokenUUID = new TokenUUID();
  
  try {
    tokenUUID.validateUUID('not-a-uuid');
    assert(false, 'Should throw error for invalid UUID');
  } catch (error) {
    assert(error.message.includes('not a valid UUID'), 'Throws error for invalid UUID');
  }
});

// Test 13: isValidUUID - does not throw
test('TokenUUID - isValidUUID does not throw', () => {
  const tokenUUID = new TokenUUID();
  
  assert(tokenUUID.isValidUUID(tokenUUID.generateRandom()) === true, 'Returns true for valid UUID');
  assert(tokenUUID.isValidUUID('not-a-uuid') === false, 'Returns false for invalid UUID');
  assert(tokenUUID.isValidUUID(null) === false, 'Returns false for null');
  assert(tokenUUID.isValidUUID('') === false, 'Returns false for empty string');
});

// Test 14: Get UUID version
test('TokenUUID - Get UUID version', () => {
  const tokenUUID = new TokenUUID();
  const v4UUID = tokenUUID.generateRandom();
  const v5UUID = tokenUUID.generateForToken('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', '1234');
  
  assert(tokenUUID.getVersion(v4UUID) === 4, 'Correctly identifies v4 UUID');
  assert(tokenUUID.getVersion(v5UUID) === 5, 'Correctly identifies v5 UUID');
  assert(tokenUUID.getVersion('not-a-uuid') === 0, 'Returns 0 for invalid UUID');
});

// Test 15: NIL UUID
test('TokenUUID - NIL UUID', () => {
  const tokenUUID = new TokenUUID();
  const nilUUID = TokenUUID.getNilUUID();
  
  assert(nilUUID === '00000000-0000-0000-0000-000000000000', 'NIL UUID is all zeros');
  assert(tokenUUID.isNilUUID(nilUUID), 'Correctly identifies NIL UUID');
  assert(!tokenUUID.isNilUUID(tokenUUID.generateRandom()), 'Random UUID is not NIL');
});

// Test 16: Error handling - missing contract address
test('TokenUUID - Error handling for missing contract address', () => {
  const tokenUUID = new TokenUUID();
  
  try {
    tokenUUID.generateForToken('', '1234');
    assert(false, 'Should throw error for empty contract address');
  } catch (error) {
    assert(error.message.includes('Contract address'), 'Throws appropriate error');
  }
});

// Test 17: Error handling - missing token ID
test('TokenUUID - Error handling for missing token ID', () => {
  const tokenUUID = new TokenUUID();
  
  try {
    tokenUUID.generateForToken('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', null);
    assert(false, 'Should throw error for null token ID');
  } catch (error) {
    assert(error.message.includes('Token ID'), 'Throws appropriate error');
  }
});

// Test 18: Error handling - invalid address format
test('TokenUUID - Error handling for invalid address format', () => {
  const tokenUUID = new TokenUUID();
  
  try {
    tokenUUID.generateForToken('invalid-address', '1234');
    assert(false, 'Should throw error for invalid address');
  } catch (error) {
    assert(error.message.includes('Invalid Ethereum address'), 'Throws appropriate error');
  }
});

// Test 19: Error handling - missing timestamp in event
test('TokenUUID - Error handling for missing timestamp', () => {
  const tokenUUID = new TokenUUID();
  
  try {
    tokenUUID.generateForEvent(
      '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      '1234',
      '0x0000000000000000000000000000000000000000',
      '0x1234567890123456789012345678901234567890',
      null
    );
    assert(false, 'Should throw error for null timestamp');
  } catch (error) {
    assert(error.message.includes('Timestamp'), 'Throws appropriate error');
  }
});

// Test 20: Static method - withNamespace
test('TokenUUID - Static method withNamespace', () => {
  const customNamespace = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
  const tokenUUID = TokenUUID.withNamespace(customNamespace);
  
  assert(tokenUUID.namespace === customNamespace, 'Creates instance with custom namespace');
  assert(tokenUUID instanceof TokenUUID, 'Returns TokenUUID instance');
});

// Test 21: Static method - getTokenNamespace
test('TokenUUID - Static method getTokenNamespace', () => {
  const namespace = TokenUUID.getTokenNamespace();
  
  assert(typeof namespace === 'string', 'Returns a string');
  assert(namespace.length === 36, 'Namespace has correct UUID length');
});

// Test 22: Large token IDs
test('TokenUUID - Handle large token IDs', () => {
  const tokenUUID = new TokenUUID();
  const largeTokenId = '999999999999999999999999999999';
  
  const uuid = tokenUUID.generateForToken('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', largeTokenId);
  
  assert(typeof uuid === 'string', 'Handles large token IDs');
  assert(tokenUUID.isValidUUID(uuid), 'Generated UUID is valid');
});

// Test 23: Numeric token IDs
test('TokenUUID - Handle numeric token IDs', () => {
  const tokenUUID = new TokenUUID();
  
  const uuid1 = tokenUUID.generateForToken('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', 1234);
  const uuid2 = tokenUUID.generateForToken('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', '1234');
  
  assert(uuid1 === uuid2, 'Numeric and string token IDs generate same UUID');
});

// Test 24: Constructor validation
test('TokenUUID - Constructor validates namespace', () => {
  try {
    new TokenUUID('invalid-namespace');
    assert(false, 'Should throw error for invalid namespace');
  } catch (error) {
    assert(error.message.includes('Namespace'), 'Throws error for invalid namespace');
  }
});

// Test 25: Different namespaces generate different UUIDs
test('TokenUUID - Different namespaces generate different UUIDs', () => {
  const namespace1 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const namespace2 = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
  
  const tokenUUID1 = new TokenUUID(namespace1);
  const tokenUUID2 = new TokenUUID(namespace2);
  
  const uuid1 = tokenUUID1.generateForToken('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', '1234');
  const uuid2 = tokenUUID2.generateForToken('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', '1234');
  
  assert(uuid1 !== uuid2, 'Different namespaces generate different UUIDs');
});

// Summary
console.log('\n' + '='.repeat(70));
console.log('\n📊 Test Summary:');
console.log(`   Passed: ${testsPassed}`);
console.log(`   Failed: ${testsFailed}`);
console.log(`   Total:  ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✨ All tests passed!\n');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed.\n');
  process.exit(1);
}
