/**
 * Tests for Withdrawal Credentials Module
 */

const { WithdrawalCredentials, WITHDRAWAL_TYPES } = require('./withdraw-credentials.js');

console.log('Running Withdrawal Credentials Tests...\n');

let passed = 0;
let failed = 0;

// Test 1: Create default instance
try {
  const creds = new WithdrawalCredentials();
  if (creds.owner === 'kushmanmb' && creds.ensName === 'kushmanmb.eth') {
    console.log('✓ Test 1 passed: Default instance creation');
    passed++;
  } else {
    console.log('✗ Test 1 failed: Default values incorrect');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 1 failed:', error.message);
  failed++;
}

// Test 2: Validate valid Ethereum address
try {
  const creds = new WithdrawalCredentials();
  const valid = creds.validateAddress('0x1234567890123456789012345678901234567890');
  if (valid) {
    console.log('✓ Test 2 passed: Valid address validation');
    passed++;
  } else {
    console.log('✗ Test 2 failed: Should validate correct address');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 2 failed:', error.message);
  failed++;
}

// Test 3: Reject invalid Ethereum address
try {
  const creds = new WithdrawalCredentials();
  const valid = creds.validateAddress('0xinvalid');
  if (!valid) {
    console.log('✓ Test 3 passed: Invalid address rejection');
    passed++;
  } else {
    console.log('✗ Test 3 failed: Should reject invalid address');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 3 failed:', error.message);
  failed++;
}

// Test 4: Set withdrawal address
try {
  const creds = new WithdrawalCredentials();
  creds.setWithdrawalAddress('0x1234567890123456789012345678901234567890');
  if (creds.getWithdrawalAddress() === '0x1234567890123456789012345678901234567890') {
    console.log('✓ Test 4 passed: Set withdrawal address');
    passed++;
  } else {
    console.log('✗ Test 4 failed: Address not set correctly');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 4 failed:', error.message);
  failed++;
}

// Test 5: Set ENS name
try {
  const creds = new WithdrawalCredentials();
  creds.setENSName('test.eth');
  if (creds.getENSName() === 'test.eth') {
    console.log('✓ Test 5 passed: Set ENS name');
    passed++;
  } else {
    console.log('✗ Test 5 failed: ENS name not set correctly');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 5 failed:', error.message);
  failed++;
}

// Test 6: Reject invalid ENS name
try {
  const creds = new WithdrawalCredentials();
  let errorThrown = false;
  try {
    creds.setENSName('invalid');
  } catch (e) {
    errorThrown = true;
  }
  if (errorThrown) {
    console.log('✓ Test 6 passed: Invalid ENS name rejection');
    passed++;
  } else {
    console.log('✗ Test 6 failed: Should reject invalid ENS name');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 6 failed:', error.message);
  failed++;
}

// Test 7: Convert address to withdrawal credentials
try {
  const creds = new WithdrawalCredentials();
  const address = '0x1234567890123456789012345678901234567890';
  const credentials = creds.addressToWithdrawalCredentials(address);
  
  // Should be 66 characters (0x + 64 hex chars)
  // Should start with 0x01 (execution credentials)
  // Should end with the address (without 0x)
  if (credentials.length === 66 && 
      credentials.startsWith('0x01') && 
      credentials.endsWith('1234567890123456789012345678901234567890')) {
    console.log('✓ Test 7 passed: Address to credentials conversion');
    passed++;
  } else {
    console.log('✗ Test 7 failed: Credentials format incorrect');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 7 failed:', error.message);
  failed++;
}

// Test 8: Extract address from execution credentials
try {
  const creds = new WithdrawalCredentials();
  const address = '0x1234567890123456789012345678901234567890';
  const credentials = creds.addressToWithdrawalCredentials(address);
  const extractedAddress = creds.credentialsToAddress(credentials);
  
  if (extractedAddress.toLowerCase() === address.toLowerCase()) {
    console.log('✓ Test 8 passed: Extract address from credentials');
    passed++;
  } else {
    console.log('✗ Test 8 failed: Extracted address does not match');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 8 failed:', error.message);
  failed++;
}

// Test 9: Validate valid withdrawal credentials
try {
  const creds = new WithdrawalCredentials();
  const validCreds = '0x010000000000000000000000' + '1234567890123456789012345678901234567890';
  const result = creds.validateWithdrawalCredentials(validCreds);
  
  if (result.valid && result.type === 'EXECUTION') {
    console.log('✓ Test 9 passed: Validate valid withdrawal credentials');
    passed++;
  } else {
    console.log('✗ Test 9 failed: Should validate correct credentials');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 9 failed:', error.message);
  failed++;
}

// Test 10: Validate BLS credentials
try {
  const creds = new WithdrawalCredentials();
  const blsCreds = '0x00' + '0'.repeat(62); // BLS credentials with 0x00 prefix
  const result = creds.validateWithdrawalCredentials(blsCreds);
  
  if (result.valid && result.type === 'BLS') {
    console.log('✓ Test 10 passed: Validate BLS credentials');
    passed++;
  } else {
    console.log('✗ Test 10 failed: Should recognize BLS credentials');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 10 failed:', error.message);
  failed++;
}

// Test 11: Reject invalid credentials (wrong length)
try {
  const creds = new WithdrawalCredentials();
  const invalidCreds = '0x01234';
  const result = creds.validateWithdrawalCredentials(invalidCreds);
  
  if (!result.valid) {
    console.log('✓ Test 11 passed: Reject invalid credentials length');
    passed++;
  } else {
    console.log('✗ Test 11 failed: Should reject incorrect length');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 11 failed:', error.message);
  failed++;
}

// Test 12: Create kushmanmb config
try {
  const creds = WithdrawalCredentials.createKushmanmbConfig();
  if (creds.owner === 'kushmanmb' && 
      creds.ensName === 'kushmanmb.eth' &&
      creds.network === 'ethereum') {
    console.log('✓ Test 12 passed: Create kushmanmb config');
    passed++;
  } else {
    console.log('✗ Test 12 failed: Kushmanmb config incorrect');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 12 failed:', error.message);
  failed++;
}

// Test 12b: Kushmanmb config with withdrawal address
try {
  const creds = WithdrawalCredentials.createKushmanmbConfig();
  const testAddress = '0x1234567890123456789012345678901234567890';
  creds.setWithdrawalAddress(testAddress);
  const credentials = creds.addressToWithdrawalCredentials(testAddress);
  
  if (credentials.length === 66 && credentials.startsWith('0x01')) {
    console.log('✓ Test 12b passed: Kushmanmb config with withdrawal address');
    passed++;
  } else {
    console.log('✗ Test 12b failed: Withdrawal credentials generation failed');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 12b failed:', error.message);
  failed++;
}

// Test 13: Export to JSON
try {
  const creds = new WithdrawalCredentials({
    owner: 'test',
    ensName: 'test.eth',
    withdrawalAddress: '0x1234567890123456789012345678901234567890'
  });
  const json = creds.toJSON();
  
  if (json.owner === 'test' && 
      json.ensName === 'test.eth' &&
      json.withdrawalAddress &&
      json.withdrawalCredentials) {
    console.log('✓ Test 13 passed: Export to JSON');
    passed++;
  } else {
    console.log('✗ Test 13 failed: JSON export incomplete');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 13 failed:', error.message);
  failed++;
}

// Test 14: Export to ENV format
try {
  const creds = new WithdrawalCredentials({
    owner: 'kushmanmb',
    ensName: 'kushmanmb.eth',
    withdrawalAddress: '0x1234567890123456789012345678901234567890'
  });
  const env = creds.toEnvFormat();
  
  if (env.includes('WITHDRAWAL_OWNER=kushmanmb') && 
      env.includes('WITHDRAWAL_ENS=kushmanmb.eth') &&
      env.includes('WITHDRAWAL_ADDRESS=')) {
    console.log('✓ Test 14 passed: Export to ENV format');
    passed++;
  } else {
    console.log('✗ Test 14 failed: ENV format incomplete');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 14 failed:', error.message);
  failed++;
}

// Test 15: Format configuration
try {
  const creds = new WithdrawalCredentials({
    owner: 'kushmanmb',
    ensName: 'kushmanmb.eth',
    withdrawalAddress: '0x1234567890123456789012345678901234567890'
  });
  const formatted = creds.formatConfiguration();
  
  if (formatted.includes('kushmanmb') && 
      formatted.includes('kushmanmb.eth') &&
      formatted.includes('Withdrawal Address:')) {
    console.log('✓ Test 15 passed: Format configuration');
    passed++;
  } else {
    console.log('✗ Test 15 failed: Format output incomplete');
    failed++;
  }
} catch (error) {
  console.log('✗ Test 15 failed:', error.message);
  failed++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}
