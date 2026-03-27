/**
 * Test file for eth_call module
 */

const EthCallClient = require('./eth-call.js');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}`);
    testsPassed++;
    return true;
  } else {
    console.log(`✗ ${message}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual: ${actual}`);
    testsFailed++;
    return false;
  }
}

function assertTrue(condition, message) {
  return assertEqual(condition, true, message);
}

function assertNotNull(value, message) {
  if (value !== null && value !== undefined) {
    console.log(`✓ ${message}`);
    testsPassed++;
    return true;
  } else {
    console.log(`✗ ${message}`);
    console.log(`  Value was null or undefined`);
    testsFailed++;
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('='.repeat(60));
  console.log('Running eth_call Module Tests');
  console.log('='.repeat(60));
  console.log();

  // Test 1: Constructor
  console.log('Test 1: Constructor with default RPC');
  try {
    const client = new EthCallClient();
    assertNotNull(client, 'Client should be created');
    assertEqual(client.rpcUrl, 'https://ethereum.publicnode.com', 'Default RPC URL should be set');
  } catch (error) {
    console.log(`✗ Constructor test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 2: Constructor with custom RPC
  console.log('Test 2: Constructor with custom RPC');
  try {
    const client = new EthCallClient('https://mainnet.infura.io');
    assertEqual(client.rpcUrl, 'https://mainnet.infura.io', 'Custom RPC URL should be set');
  } catch (error) {
    console.log(`✗ Custom RPC test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 3: Address validation
  console.log('Test 3: Address validation');
  try {
    const client = new EthCallClient();
    assertTrue(client._isValidAddress('0x1234567890123456789012345678901234567890'), 'Valid address should pass');
    assertTrue(client._isValidAddress('0xAbCdEf1234567890123456789012345678901234'), 'Mixed case address should pass');
    assertTrue(!client._isValidAddress('0x123'), 'Short address should fail');
    assertTrue(!client._isValidAddress('not-an-address'), 'Invalid format should fail');
    assertTrue(!client._isValidAddress(''), 'Empty string should fail');
  } catch (error) {
    console.log(`✗ Address validation test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 4: ENS name detection
  console.log('Test 4: ENS name detection');
  try {
    const client = new EthCallClient();
    assertTrue(client._isENSName('kushmanmb.eth'), 'kushmanmb.eth should be detected as ENS');
    assertTrue(client._isENSName('vitalik.eth'), 'vitalik.eth should be detected as ENS');
    assertTrue(!client._isENSName('not-ens'), 'non-ENS string should not be detected');
    assertTrue(!client._isENSName('0x1234567890123456789012345678901234567890'), 'Address should not be detected as ENS');
  } catch (error) {
    console.log(`✗ ENS detection test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 5: Function selector encoding
  console.log('Test 5: Function selector encoding');
  try {
    const client = new EthCallClient();
    assertEqual(client._getFunctionSelector('balanceOf(address)'), '0x70a08231', 'balanceOf selector should match');
    assertEqual(client._getFunctionSelector('totalSupply()'), '0x18160ddd', 'totalSupply selector should match');
    assertEqual(client._getFunctionSelector('name()'), '0x06fdde03', 'name selector should match');
    assertEqual(client._getFunctionSelector('symbol()'), '0x95d89b41', 'symbol selector should match');
  } catch (error) {
    console.log(`✗ Function selector test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 6: Encode function call
  console.log('Test 6: Encode function call');
  try {
    const client = new EthCallClient();
    const data = client.encodeFunctionCall('balanceOf(address)', ['0x1234567890123456789012345678901234567890']);
    assertTrue(data.startsWith('0x70a08231'), 'Encoded data should start with balanceOf selector');
    assertTrue(data.length > 10, 'Encoded data should include parameters');
  } catch (error) {
    console.log(`✗ Encode function call test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 7: Decode uint256
  console.log('Test 7: Decode uint256');
  try {
    const client = new EthCallClient();
    assertEqual(client.decodeUint256('0x0000000000000000000000000000000000000000000000000000000000000064'), '100', 'Should decode 100');
    assertEqual(client.decodeUint256('0x00'), '0', 'Should decode 0');
    assertEqual(client.decodeUint256('0x'), '0', 'Empty hex should decode to 0');
  } catch (error) {
    console.log(`✗ Decode uint256 test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 8: Decode address
  console.log('Test 8: Decode address');
  try {
    const client = new EthCallClient();
    const decoded = client.decodeAddress('0x0000000000000000000000001234567890123456789012345678901234567890');
    assertEqual(decoded, '0x1234567890123456789012345678901234567890', 'Should decode address correctly');
  } catch (error) {
    console.log(`✗ Decode address test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 9: Resolve address (already valid)
  console.log('Test 9: Resolve address (already valid address)');
  try {
    const client = new EthCallClient();
    const address = '0x1234567890123456789012345678901234567890';
    const resolved = await client.resolveAddress(address);
    assertEqual(resolved, address, 'Valid address should be returned as-is');
  } catch (error) {
    console.log(`✗ Resolve address test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 10: Resolve ENS name
  console.log('Test 10: Resolve ENS name');
  try {
    const client = new EthCallClient();
    const resolved = await client.resolveENS('kushmanmb.eth');
    assertNotNull(resolved, 'ENS resolution should return an address');
    assertTrue(client._isValidAddress(resolved), 'Resolved value should be a valid address');
  } catch (error) {
    console.log(`✗ ENS resolution test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 11: Cache functionality
  console.log('Test 11: Cache functionality');
  try {
    const client = new EthCallClient();
    const stats1 = client.getCacheStats();
    assertEqual(stats1.size, 0, 'Cache should start empty');
    
    // Resolve ENS to populate cache
    await client.resolveENS('kushmanmb.eth');
    
    const stats2 = client.getCacheStats();
    assertTrue(stats2.size > 0, 'Cache should have entries after ENS resolution');
    
    client.clearCache();
    const stats3 = client.getCacheStats();
    assertEqual(stats3.size, 0, 'Cache should be empty after clearing');
  } catch (error) {
    console.log(`✗ Cache test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 12: Error handling - invalid call params
  console.log('Test 12: Error handling - missing call parameters');
  try {
    const client = new EthCallClient();
    let errorThrown = false;
    try {
      await client.call({ data: '0x123' }); // Missing 'to'
    } catch (error) {
      errorThrown = true;
    }
    assertTrue(errorThrown, 'Should throw error when "to" is missing');
  } catch (error) {
    console.log(`✗ Error handling test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 13: Error handling - invalid ENS format
  console.log('Test 13: Error handling - invalid ENS format');
  try {
    const client = new EthCallClient();
    let errorThrown = false;
    try {
      await client.resolveENS('invalid-ens-name');
    } catch (error) {
      errorThrown = true;
    }
    assertTrue(errorThrown, 'Should throw error for invalid ENS format');
  } catch (error) {
    console.log(`✗ Invalid ENS test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 14: Decode string (basic)
  console.log('Test 14: Decode string');
  try {
    const client = new EthCallClient();
    // Empty string case
    assertEqual(client.decodeString('0x'), '', 'Empty hex should decode to empty string');
    
    // For more complex string decoding, we'd need proper test data
    assertNotNull(client.decodeString, 'decodeString method should exist');
  } catch (error) {
    console.log(`✗ Decode string test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 15: Multiple selector checks
  console.log('Test 15: Known function selectors');
  try {
    const client = new EthCallClient();
    const selectors = {
      'decimals()': '0x313ce567',
      'owner()': '0x8da5cb5b',
      'ownerOf(uint256)': '0x6352211e',
      'tokenURI(uint256)': '0xc87b56dd'
    };
    
    for (const [sig, expected] of Object.entries(selectors)) {
      assertEqual(client._getFunctionSelector(sig), expected, `Selector for ${sig} should match`);
    }
  } catch (error) {
    console.log(`✗ Selector checks test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 16: Unknown function signature handling
  console.log('Test 16: Unknown function signature error handling');
  try {
    const client = new EthCallClient();
    let errorThrown = false;
    try {
      client._getFunctionSelector('unknownFunction()');
    } catch (error) {
      errorThrown = true;
      assertTrue(error.message.includes('Unknown function signature'), 'Should throw appropriate error message');
    }
    assertTrue(errorThrown, 'Should throw error for unknown function signature');
  } catch (error) {
    console.log(`✗ Unknown function test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Print summary
  console.log('='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);
  console.log();

  if (testsFailed === 0) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// Run all tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
