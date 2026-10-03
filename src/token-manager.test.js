/**
 * Token Manager Module Tests
 * Tests for token-to-manager address mapping functionality
 */

const TokenManager = require('./token-manager');

// Test utilities
let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✓ ${testName}`);
    passCount++;
  } else {
    console.log(`✗ ${testName}`);
    failCount++;
  }
}

function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`✓ ${testName}`);
    passCount++;
  } else {
    console.log(`✗ ${testName}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual: ${actual}`);
    failCount++;
  }
}

// Test: Constructor
console.log('\n=== Constructor Tests ===');
try {
  const manager = new TokenManager('Test Manager');
  assert(manager.name === 'Test Manager', 'Constructor sets name correctly');
  assert(manager.getManagerCount() === 0, 'Constructor initializes empty manager map');
  assert(manager.createdAt !== undefined, 'Constructor sets createdAt timestamp');
} catch (error) {
  console.log(`✗ Constructor test failed: ${error.message}`);
  failCount++;
}

// Test: Constructor validation
console.log('\n=== Constructor Validation Tests ===');
try {
  const defaultManager = new TokenManager();
  assert(defaultManager.name === 'Default Token Manager', 'Constructor uses default name when not provided');
} catch (error) {
  console.log(`✗ Default name test failed: ${error.message}`);
  failCount++;
}

try {
  new TokenManager('');
  console.log('✗ Should throw error for empty string name');
  failCount++;
} catch (error) {
  assert(error.message.includes('non-empty string'), 'Constructor validates empty string name');
}

try {
  new TokenManager(123);
  console.log('✗ Should throw error for non-string name');
  failCount++;
} catch (error) {
  assert(error.message.includes('non-empty string'), 'Constructor validates name type');
}

// Test: Set Manager
console.log('\n=== Set Manager Tests ===');
const manager = new TokenManager('Test Manager');

// Test with USDC token address
const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const managerAddr = '0x6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253';

try {
  const result = manager.setManager(usdcAddress, managerAddr);
  assert(result.tokenAddress !== undefined, 'setManager returns token address');
  assert(result.managerAddress !== undefined, 'setManager returns manager address');
  assert(result.setAt !== undefined, 'setManager sets timestamp');
  assert(manager.getManagerCount() === 1, 'Manager count increases after set');
} catch (error) {
  console.log(`✗ setManager failed: ${error.message}`);
  failCount++;
}

// Test: Set Manager with metadata
console.log('\n=== Set Manager with Metadata Tests ===');
try {
  const manager2 = new TokenManager('Test Manager 2');
  const metadata = { tokenName: 'USDC', tokenSymbol: 'USDC', network: 'ethereum' };
  const result = manager2.setManager(usdcAddress, managerAddr, metadata);
  assert(result.metadata.tokenName === 'USDC', 'setManager stores metadata');
  assert(result.metadata.network === 'ethereum', 'setManager stores all metadata fields');
} catch (error) {
  console.log(`✗ setManager with metadata failed: ${error.message}`);
  failCount++;
}

// Test: Get Manager
console.log('\n=== Get Manager Tests ===');
try {
  const retrieved = manager.getManager(usdcAddress);
  assert(retrieved.tokenAddress === usdcAddress.toLowerCase(), 'getManager returns correct token address');
  assert(retrieved.managerAddress === managerAddr.toLowerCase(), 'getManager returns correct manager address');
} catch (error) {
  console.log(`✗ getManager failed: ${error.message}`);
  failCount++;
}

// Test: Get Manager for non-existent token
console.log('\n=== Get Manager Error Handling Tests ===');
try {
  manager.getManager('0x0000000000000000000000000000000000000001');
  console.log('✗ Should throw error for non-existent manager');
  failCount++;
} catch (error) {
  assert(error.message.includes('No manager found'), 'getManager throws error for non-existent manager');
}

// Test: Has Manager
console.log('\n=== Has Manager Tests ===');
assert(manager.hasManager(usdcAddress), 'hasManager returns true for existing manager');
assert(!manager.hasManager('0x0000000000000000000000000000000000000001'), 'hasManager returns false for non-existent manager');

// Test: Address Validation
console.log('\n=== Address Validation Tests ===');
const testManager = new TokenManager('Validation Test');

// Test valid addresses
try {
  testManager.setManager('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0x6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253');
  console.log('✓ Accepts valid addresses with 0x prefix');
  passCount++;
} catch (error) {
  console.log(`✗ Valid address rejected: ${error.message}`);
  failCount++;
}

// Test without 0x prefix
try {
  const testManager2 = new TokenManager('Test Manager 3');
  testManager2.setManager('A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253');
  console.log('✓ Accepts valid addresses without 0x prefix');
  passCount++;
} catch (error) {
  console.log(`✗ Valid address without 0x rejected: ${error.message}`);
  failCount++;
}

// Test invalid addresses
try {
  testManager.setManager('invalid', managerAddr);
  console.log('✗ Should reject invalid token address');
  failCount++;
} catch (error) {
  assert(error.message.includes('Invalid Ethereum address'), 'Validates token address format');
}

try {
  testManager.setManager(usdcAddress, 'invalid');
  console.log('✗ Should reject invalid manager address');
  failCount++;
} catch (error) {
  assert(error.message.includes('Invalid Ethereum address'), 'Validates manager address format');
}

try {
  testManager.setManager('', managerAddr);
  console.log('✗ Should reject empty token address');
  failCount++;
} catch (error) {
  assert(error.message.includes('non-empty string'), 'Validates empty token address');
}

try {
  testManager.setManager(null, managerAddr);
  console.log('✗ Should reject null token address');
  failCount++;
} catch (error) {
  assert(error.message.includes('non-empty string'), 'Validates null token address');
}

// Test: Update Manager
console.log('\n=== Update Manager Tests ===');
const updateManager = new TokenManager('Update Test');
updateManager.setManager(usdcAddress, managerAddr);

try {
  const newManager = '0x1234567890123456789012345678901234567890';
  const updated = updateManager.updateManager(usdcAddress, newManager);
  assert(updated.managerAddress === newManager.toLowerCase(), 'updateManager updates manager address');
  assert(updated.tokenAddress === usdcAddress.toLowerCase(), 'updateManager keeps token address');
} catch (error) {
  console.log(`✗ updateManager failed: ${error.message}`);
  failCount++;
}

// Test: Update Manager with metadata
console.log('\n=== Update Manager Metadata Tests ===');
try {
  const updateManager2 = new TokenManager('Update Test 2');
  updateManager2.setManager(usdcAddress, managerAddr, { version: 'v1' });
  const updated = updateManager2.updateManager(usdcAddress, managerAddr, { version: 'v2', notes: 'Updated' });
  assert(updated.metadata.version === 'v2', 'updateManager updates existing metadata');
  assert(updated.metadata.notes === 'Updated', 'updateManager adds new metadata fields');
} catch (error) {
  console.log(`✗ updateManager metadata failed: ${error.message}`);
  failCount++;
}

// Test: Remove Manager
console.log('\n=== Remove Manager Tests ===');
const removeManager = new TokenManager('Remove Test');
removeManager.setManager(usdcAddress, managerAddr);

try {
  const removed = removeManager.removeManager(usdcAddress);
  assert(removed === true, 'removeManager returns true on success');
  assert(removeManager.getManagerCount() === 0, 'Manager count decreases after remove');
  assert(!removeManager.hasManager(usdcAddress), 'hasManager returns false after remove');
} catch (error) {
  console.log(`✗ removeManager failed: ${error.message}`);
  failCount++;
}

// Test: Remove non-existent manager
console.log('\n=== Remove Manager Error Handling Tests ===');
try {
  removeManager.removeManager(usdcAddress);
  console.log('✗ Should throw error for removing non-existent manager');
  failCount++;
} catch (error) {
  assert(error.message.includes('No manager found'), 'removeManager throws error for non-existent manager');
}

// Test: Get All Managers
console.log('\n=== Get All Managers Tests ===');
const multiManager = new TokenManager('Multi Test');
const token1 = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const token2 = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const manager1 = '0x6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253';
const manager2 = '0x1234567890123456789012345678901234567890';

multiManager.setManager(token1, manager1);
multiManager.setManager(token2, manager2);

const allManagers = multiManager.getAllManagers();
assert(allManagers.length === 2, 'getAllManagers returns correct count');
assert(allManagers[0].tokenAddress !== undefined, 'getAllManagers returns manager info objects');

// Test: Manager Count
console.log('\n=== Manager Count Tests ===');
assertEqual(multiManager.getManagerCount(), 2, 'getManagerCount returns correct count');

// Test: Clear All
console.log('\n=== Clear All Tests ===');
multiManager.clearAll();
assertEqual(multiManager.getManagerCount(), 0, 'clearAll removes all managers');
assert(!multiManager.hasManager(token1), 'clearAll removes all manager mappings');

// Test: toJSON
console.log('\n=== toJSON Tests ===');
const jsonManager = new TokenManager('JSON Test');
jsonManager.setManager(usdcAddress, managerAddr, { test: 'data' });

const json = jsonManager.toJSON();
assert(json.name === 'JSON Test', 'toJSON exports name');
assert(json.managerCount === 1, 'toJSON exports manager count');
assert(Array.isArray(json.managers), 'toJSON exports managers array');
assert(json.managers[0].tokenAddress === usdcAddress.toLowerCase(), 'toJSON exports token address');
assert(json.managers[0].metadata.test === 'data', 'toJSON exports metadata');

// Test: fromJSON
console.log('\n=== fromJSON Tests ===');
const importManager = new TokenManager('Import Test');
const testData = {
  name: 'Test',
  managers: [
    {
      tokenAddress: usdcAddress,
      managerAddress: managerAddr,
      metadata: { imported: true }
    }
  ]
};

try {
  importManager.fromJSON(testData);
  assert(importManager.hasManager(usdcAddress), 'fromJSON imports managers');
  const imported = importManager.getManager(usdcAddress);
  assert(imported.managerAddress === managerAddr.toLowerCase(), 'fromJSON imports manager address');
  assert(imported.metadata.imported === true, 'fromJSON imports metadata');
} catch (error) {
  console.log(`✗ fromJSON failed: ${error.message}`);
  failCount++;
}

// Test: fromJSON validation
console.log('\n=== fromJSON Validation Tests ===');
try {
  importManager.fromJSON(null);
  console.log('✗ Should throw error for null data');
  failCount++;
} catch (error) {
  assert(error.message.includes('Invalid JSON data'), 'fromJSON validates data parameter');
}

// Test: fromJSON duplicate tokenAddress detection
console.log('\n=== fromJSON Duplicate Detection Tests ===');
try {
  const dupManager = new TokenManager('Duplicate Test');
  const dupData = {
    managers: [
      {
        tokenAddress: usdcAddress,
        managerAddress: managerAddr,
        metadata: { version: 'v1' }
      },
      {
        tokenAddress: usdcAddress,
        managerAddress: managerAddr,
        metadata: { version: 'v2' }
      }
    ]
  };
  dupManager.fromJSON(dupData);
  console.log('✗ Should throw error for duplicate token address');
  failCount++;
} catch (error) {
  assert(error.message.includes('Duplicate token address'), 'fromJSON throws error for duplicate token address');
}

// Test: fromJSON duplicate detection is case-insensitive
try {
  const dupManager2 = new TokenManager('Duplicate Case Test');
  const dupData2 = {
    managers: [
      {
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        managerAddress: managerAddr
      },
      {
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        managerAddress: managerAddr
      }
    ]
  };
  dupManager2.fromJSON(dupData2);
  console.log('✗ Should throw error for case-insensitive duplicate token address');
  failCount++;
} catch (error) {
  assert(error.message.includes('Duplicate token address'), 'fromJSON duplicate detection is case-insensitive');
}

// Test: fromJSON preserves setAt timestamp
console.log('\n=== fromJSON setAt Preservation Tests ===');
try {
  const tsManager = new TokenManager('Timestamp Test');
  const originalSetAt = '2026-01-15T10:00:00.000Z';
  const tsData = {
    managers: [
      {
        tokenAddress: usdcAddress,
        managerAddress: managerAddr,
        metadata: {},
        setAt: originalSetAt
      }
    ]
  };
  tsManager.fromJSON(tsData);
  const imported = tsManager.getManager(usdcAddress);
  assert(imported.setAt === originalSetAt, 'fromJSON preserves original setAt timestamp');
} catch (error) {
  console.log(`✗ fromJSON setAt preservation failed: ${error.message}`);
  failCount++;
}

// Test: Case insensitivity
console.log('\n=== Case Insensitivity Tests ===');
const caseManager = new TokenManager('Case Test');
const upperAddress = '0xA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48';
const lowerAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

caseManager.setManager(upperAddress, managerAddr);
assert(caseManager.hasManager(lowerAddress), 'Address comparison is case-insensitive');

try {
  const retrieved = caseManager.getManager(lowerAddress);
  assert(retrieved.tokenAddress === lowerAddress, 'Addresses are normalized to lowercase');
} catch (error) {
  console.log(`✗ Case insensitivity test failed: ${error.message}`);
  failCount++;
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`Total Tests: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n✅ All tests passed!');
  process.exit(0);
} else {
  console.log(`\n❌ ${failCount} test(s) failed`);
  process.exit(1);
}
