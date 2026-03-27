/**
 * Etherscan Contract Verification Module Tests
 * Tests for verifying contract source code via Etherscan API
 */

const EtherscanVerifier = require('./etherscan-verify.js');

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

function assertThrows(fn, message) {
  try {
    fn();
    console.error(`✗ ${message} (expected error but none was thrown)`);
    testsFailed++;
  } catch (error) {
    console.log(`✓ ${message}`);
    testsPassed++;
  }
}

async function assertThrowsAsync(fn, message) {
  try {
    await fn();
    console.error(`✗ ${message} (expected error but none was thrown)`);
    testsFailed++;
  } catch (error) {
    console.log(`✓ ${message}`);
    testsPassed++;
  }
}

async function runTests() {
  console.log('Running Etherscan Contract Verification Module Tests...\n');
  console.log('='.repeat(70));

  // Test 1: Constructor requires API key
  console.log('\n🔑 Testing Constructor Requires API Key...');
  try {
    assertThrows(() => {
      new EtherscanVerifier();
    }, 'Should throw error when no API key provided');

    assertThrows(() => {
      new EtherscanVerifier(null);
    }, 'Should throw error when null API key provided');

    assertThrows(() => {
      new EtherscanVerifier('');
    }, 'Should throw error when empty API key provided');
  } catch (error) {
    assert(false, `Constructor API key test failed: ${error.message}`);
  }

  // Test 2: Constructor with valid API key
  console.log('\n✅ Testing Constructor with Valid API Key...');
  try {
    const verifier = new EtherscanVerifier('test-api-key-12345');
    assert(verifier !== null, 'Should create verifier instance');
    assertEqual(verifier.apiKey, 'test-api-key-12345', 'Should set API key');
    assertEqual(verifier.chainId, 1, 'Should default to Ethereum mainnet (chain ID 1)');
    assertEqual(verifier.apiBaseUrl, 'api.etherscan.io', 'Should use Etherscan API URL');
    assert(verifier.cache instanceof Map, 'Should initialize cache as Map');
  } catch (error) {
    assert(false, `Constructor test failed: ${error.message}`);
  }

  // Test 3: Constructor with custom chain ID
  console.log('\n🔧 Testing Constructor with Custom Chain ID...');
  try {
    const verifier = new EtherscanVerifier('test-api-key', 8453);
    assertEqual(verifier.chainId, 8453, 'Should set custom chain ID (Base)');
    assertEqual(verifier.apiBaseUrl, 'api.basescan.org', 'Should use Base API URL');

    const polygonVerifier = new EtherscanVerifier('test-api-key', 137);
    assertEqual(polygonVerifier.apiBaseUrl, 'api.polygonscan.com', 'Should use Polygon API URL');

    const optimismVerifier = new EtherscanVerifier('test-api-key', 10);
    assertEqual(optimismVerifier.apiBaseUrl, 'api-optimistic.etherscan.io', 'Should use Optimism API URL');
  } catch (error) {
    assert(false, `Custom chain ID test failed: ${error.message}`);
  }

  // Test 4: Validate valid Ethereum address with 0x prefix
  console.log('\n✅ Testing Valid Address with 0x Prefix...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    const address = verifier.validateAddress('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');
    assert(address.startsWith('0x'), 'Should maintain 0x prefix');
    assertEqual(address.length, 42, 'Should be 42 characters long');
    assertEqual(address, '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', 'Should convert to lowercase');
  } catch (error) {
    assert(false, `Valid address test failed: ${error.message}`);
  }

  // Test 5: Validate valid address without 0x prefix
  console.log('\n➕ Testing Valid Address without 0x Prefix...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    const address = verifier.validateAddress('BC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');
    assert(address.startsWith('0x'), 'Should add 0x prefix');
    assertEqual(address.length, 42, 'Should be 42 characters long');
  } catch (error) {
    assert(false, `Address without prefix test failed: ${error.message}`);
  }

  // Test 6: Validate invalid addresses
  console.log('\n❌ Testing Invalid Addresses...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    
    assertThrows(() => {
      verifier.validateAddress('');
    }, 'Should reject empty address');

    assertThrows(() => {
      verifier.validateAddress(null);
    }, 'Should reject null address');

    assertThrows(() => {
      verifier.validateAddress('0x123');
    }, 'Should reject too short address');

    assertThrows(() => {
      verifier.validateAddress('0xGHIJKLMNOPQRSTUVWXYZ1234567890abcdef');
    }, 'Should reject address with invalid characters');

    assertThrows(() => {
      verifier.validateAddress(12345);
    }, 'Should reject non-string address');
  } catch (error) {
    assert(false, `Invalid address test failed: ${error.message}`);
  }

  // Test 7: Validate source code
  console.log('\n📝 Testing Source Code Validation...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    
    const validCode = 'pragma solidity ^0.8.0; contract Test {}';
    const result = verifier.validateSourceCode(validCode);
    assertEqual(result, validCode, 'Should accept valid source code');

    assertThrows(() => {
      verifier.validateSourceCode('');
    }, 'Should reject empty source code');

    assertThrows(() => {
      verifier.validateSourceCode('   ');
    }, 'Should reject whitespace-only source code');

    assertThrows(() => {
      verifier.validateSourceCode(null);
    }, 'Should reject null source code');

    assertThrows(() => {
      verifier.validateSourceCode('a'.repeat(600000));
    }, 'Should reject source code exceeding size limit');
  } catch (error) {
    assert(false, `Source code validation test failed: ${error.message}`);
  }

  // Test 8: Validate compiler version
  console.log('\n🔨 Testing Compiler Version Validation...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    
    const validVersion1 = verifier.validateCompilerVersion('v0.8.0+commit.c7dfd78e');
    assertEqual(validVersion1, 'v0.8.0+commit.c7dfd78e', 'Should accept version with commit');

    const validVersion2 = verifier.validateCompilerVersion('v0.8.19');
    assertEqual(validVersion2, 'v0.8.19', 'Should accept version without commit');

    assertThrows(() => {
      verifier.validateCompilerVersion('0.8.0');
    }, 'Should reject version without v prefix');

    assertThrows(() => {
      verifier.validateCompilerVersion('v0.8');
    }, 'Should reject incomplete version');

    assertThrows(() => {
      verifier.validateCompilerVersion('');
    }, 'Should reject empty version');

    assertThrows(() => {
      verifier.validateCompilerVersion(null);
    }, 'Should reject null version');
  } catch (error) {
    assert(false, `Compiler version validation test failed: ${error.message}`);
  }

  // Test 9: Verify contract input validation
  console.log('\n🔍 Testing Contract Verification Input Validation...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    
    await assertThrowsAsync(async () => {
      await verifier.verifyContract({});
    }, 'Should reject missing required parameters');

    await assertThrowsAsync(async () => {
      await verifier.verifyContract({
        contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        sourceCode: 'pragma solidity ^0.8.0;',
        contractName: 'Test',
        compilerVersion: 'invalid'
      });
    }, 'Should reject invalid compiler version');

    await assertThrowsAsync(async () => {
      await verifier.verifyContract({
        contractAddress: 'invalid',
        sourceCode: 'pragma solidity ^0.8.0;',
        contractName: 'Test',
        compilerVersion: 'v0.8.0'
      });
    }, 'Should reject invalid contract address');

    await assertThrowsAsync(async () => {
      await verifier.verifyContract({
        contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        sourceCode: '',
        contractName: 'Test',
        compilerVersion: 'v0.8.0'
      });
    }, 'Should reject empty source code');

    await assertThrowsAsync(async () => {
      await verifier.verifyContract({
        contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        sourceCode: 'pragma solidity ^0.8.0;',
        contractName: '',
        compilerVersion: 'v0.8.0'
      });
    }, 'Should reject empty contract name');

    await assertThrowsAsync(async () => {
      await verifier.verifyContract({
        contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        sourceCode: 'pragma solidity ^0.8.0;',
        contractName: 'Test',
        compilerVersion: 'v0.8.0',
        optimizationUsed: 2
      });
    }, 'Should reject invalid optimizationUsed value');

    await assertThrowsAsync(async () => {
      await verifier.verifyContract({
        contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        sourceCode: 'pragma solidity ^0.8.0;',
        contractName: 'Test',
        compilerVersion: 'v0.8.0',
        runs: -1
      });
    }, 'Should reject negative runs value');
  } catch (error) {
    assert(false, `Contract verification validation test failed: ${error.message}`);
  }

  // Test 10: Check verification status validation
  console.log('\n📊 Testing Verification Status Check Validation...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    
    await assertThrowsAsync(async () => {
      await verifier.checkVerificationStatus('');
    }, 'Should reject empty GUID');

    await assertThrowsAsync(async () => {
      await verifier.checkVerificationStatus(null);
    }, 'Should reject null GUID');

    await assertThrowsAsync(async () => {
      await verifier.checkVerificationStatus(123);
    }, 'Should reject non-string GUID');
  } catch (error) {
    assert(false, `Verification status validation test failed: ${error.message}`);
  }

  // Test 11: Get source code validation
  console.log('\n📄 Testing Get Source Code Validation...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    
    await assertThrowsAsync(async () => {
      await verifier.getSourceCode('invalid');
    }, 'Should reject invalid address');

    await assertThrowsAsync(async () => {
      await verifier.getSourceCode('');
    }, 'Should reject empty address');

    await assertThrowsAsync(async () => {
      await verifier.getSourceCode(null);
    }, 'Should reject null address');
  } catch (error) {
    assert(false, `Get source code validation test failed: ${error.message}`);
  }

  // Test 12: Get contract ABI validation
  console.log('\n📋 Testing Get Contract ABI Validation...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    
    await assertThrowsAsync(async () => {
      await verifier.getContractABI('invalid');
    }, 'Should reject invalid address');

    await assertThrowsAsync(async () => {
      await verifier.getContractABI('');
    }, 'Should reject empty address');
  } catch (error) {
    assert(false, `Get contract ABI validation test failed: ${error.message}`);
  }

  // Test 13: Format verification result
  console.log('\n🎨 Testing Format Verification Result...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    
    const result = {
      status: 'submitted',
      message: 'Source code submitted',
      guid: 'test-guid-123',
      contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
    };
    
    const formatted = verifier.formatVerificationResult(result);
    assert(formatted.includes('Contract Verification Result'), 'Should include title');
    assert(formatted.includes('submitted'), 'Should include status');
    assert(formatted.includes('test-guid-123'), 'Should include GUID');
    assert(formatted.includes('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'), 'Should include address');

    const emptyFormatted = verifier.formatVerificationResult(null);
    assert(emptyFormatted.includes('No data available'), 'Should handle null input');
  } catch (error) {
    assert(false, `Format verification result test failed: ${error.message}`);
  }

  // Test 14: Format source code result
  console.log('\n📝 Testing Format Source Code Result...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    
    const result = {
      contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      contractName: 'TestContract',
      compilerVersion: 'v0.8.0',
      optimizationUsed: '1',
      runs: '200',
      evmVersion: 'paris',
      licenseType: '3',
      verified: true,
      sourceCode: 'pragma solidity ^0.8.0; contract Test {}'
    };
    
    const formatted = verifier.formatSourceCodeResult(result);
    assert(formatted.includes('Contract Source Code'), 'Should include title');
    assert(formatted.includes('TestContract'), 'Should include contract name');
    assert(formatted.includes('v0.8.0'), 'Should include compiler version');
    assert(formatted.includes('Verified: Yes'), 'Should show verified status');

    const emptyFormatted = verifier.formatSourceCodeResult(null);
    assert(emptyFormatted.includes('No data available'), 'Should handle null input');
  } catch (error) {
    assert(false, `Format source code result test failed: ${error.message}`);
  }

  // Test 15: Cache functionality
  console.log('\n💾 Testing Cache Functionality...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    
    assertEqual(verifier.cache.size, 0, 'Cache should start empty');
    
    const stats = verifier.getCacheStats();
    assert(stats.size !== undefined, 'Should return cache size');
    assert(stats.timeout !== undefined, 'Should return cache timeout');
    assert(Array.isArray(stats.keys), 'Should return cache keys array');
    
    verifier.clearCache();
    assertEqual(verifier.cache.size, 0, 'Cache should be empty after clear');
  } catch (error) {
    assert(false, `Cache functionality test failed: ${error.message}`);
  }

  // Test 16: API info
  console.log('\n📡 Testing API Info...');
  try {
    const verifier = new EtherscanVerifier('test-api-key', 1);
    
    const info = verifier.getAPIInfo();
    assertEqual(info.baseUrl, 'api.etherscan.io', 'Should return API base URL');
    assertEqual(info.chainId, 1, 'Should return chain ID');
    assertEqual(info.hasApiKey, true, 'Should indicate API key is present');
    assert(info.cacheTimeout !== undefined, 'Should return cache timeout');
  } catch (error) {
    assert(false, `API info test failed: ${error.message}`);
  }

  // Test 17: Get contract creation validation
  console.log('\n🏗️ Testing Get Contract Creation Validation...');
  try {
    const verifier = new EtherscanVerifier('test-api-key');
    
    await assertThrowsAsync(async () => {
      await verifier.getContractCreation('invalid');
    }, 'Should reject invalid address');

    await assertThrowsAsync(async () => {
      await verifier.getContractCreation('');
    }, 'Should reject empty address');
  } catch (error) {
    assert(false, `Get contract creation validation test failed: ${error.message}`);
  }

  // Final results
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Test Summary:');
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
