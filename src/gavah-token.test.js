/**
 * Gavah Token Module Tests
 * Tests for the Gavah Token utility module
 */

const GavahToken = require('./gavah-token');

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function test(description, fn) {
  testsRun++;
  try {
    fn();
    console.log(`✓ ${description}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('Running Gavah Token Module Tests...\n');

// Test: Constructor validates contract address
test('Constructor requires contract address', () => {
  assert(() => {
    try {
      new GavahToken();
      return false;
    } catch (error) {
      return error.message.includes('Contract address must be a non-empty string');
    }
  }(), 'Should throw error for missing address');
});

test('Constructor validates address format', () => {
  assert(() => {
    try {
      new GavahToken('invalid-address');
      return false;
    } catch (error) {
      return error.message.includes('Invalid Ethereum address format');
    }
  }(), 'Should throw error for invalid address format');
});

test('Constructor accepts valid address with 0x prefix', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  assert(gavah.contractAddress === '0x1234567890123456789012345678901234567890', 'Should accept valid address with 0x');
});

test('Constructor accepts valid address without 0x prefix', () => {
  const gavah = new GavahToken('1234567890123456789012345678901234567890');
  assert(gavah.contractAddress === '0x1234567890123456789012345678901234567890', 'Should add 0x prefix');
});

test('Constructor normalizes address to lowercase', () => {
  const gavah = new GavahToken('0xABCDEF1234567890123456789012345678901234');
  assert(gavah.contractAddress === '0xabcdef1234567890123456789012345678901234', 'Should normalize to lowercase');
});

test('Constructor uses default RPC URL', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  assert(gavah.rpcUrl === 'https://ethereum.publicnode.com', 'Should use default RPC URL');
});

test('Constructor accepts custom RPC URL', () => {
  const customRpc = 'https://custom.rpc.url';
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890', customRpc);
  assert(gavah.rpcUrl === customRpc, 'Should use custom RPC URL');
});

test('Has correct ABI with ERC20 standard methods', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  assert(Array.isArray(gavah.abi), 'ABI should be an array');
  assert(gavah.abi.length > 0, 'ABI should not be empty');
  
  // Check for key ERC20 methods
  const abiString = gavah.abi.join(' ');
  assert(abiString.includes('name()'), 'Should have name method');
  assert(abiString.includes('symbol()'), 'Should have symbol method');
  assert(abiString.includes('decimals()'), 'Should have decimals method');
  assert(abiString.includes('totalSupply()'), 'Should have totalSupply method');
  assert(abiString.includes('balanceOf'), 'Should have balanceOf method');
  assert(abiString.includes('transfer'), 'Should have transfer method');
});

test('Has Gavah-specific methods in ABI', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  const abiString = gavah.abi.join(' ');
  
  assert(abiString.includes('mint'), 'Should have mint method');
  assert(abiString.includes('burn'), 'Should have burn method');
  assert(abiString.includes('owner()'), 'Should have owner method');
  assert(abiString.includes('transferOwnership'), 'Should have transferOwnership method');
});

test('formatAmount converts from smallest unit to human-readable', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  
  // Test with 18 decimals (default)
  const formatted = gavah.formatAmount('1000000000000000000');
  assert(formatted === '1.0', 'Should format 1e18 as 1.0');
});

test('formatAmount handles different decimal values', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  
  // Test with 6 decimals (like USDC)
  const formatted = gavah.formatAmount('1000000', 6);
  assert(formatted === '1.0', 'Should format 1e6 as 1.0 with 6 decimals');
});

test('parseAmount converts from human-readable to smallest unit', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  
  // Test with 18 decimals (default)
  const parsed = gavah.parseAmount('1.0');
  assert(parsed === '1000000000000000000', 'Should parse 1.0 as 1e18');
});

test('parseAmount handles different decimal values', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  
  // Test with 6 decimals (like USDC)
  const parsed = gavah.parseAmount('1.0', 6);
  assert(parsed === '1000000', 'Should parse 1.0 as 1e6 with 6 decimals');
});

test('_validateAddress is private method', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  assert(typeof gavah._validateAddress === 'function', '_validateAddress should be a function');
});

test('_getProvider is private method', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  assert(typeof gavah._getProvider === 'function', '_getProvider should be a function');
});

test('_getContract is private method', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  assert(typeof gavah._getContract === 'function', '_getContract should be a function');
});

test('Public methods are defined', () => {
  const gavah = new GavahToken('0x1234567890123456789012345678901234567890');
  
  assert(typeof gavah.getName === 'function', 'getName should be a function');
  assert(typeof gavah.getSymbol === 'function', 'getSymbol should be a function');
  assert(typeof gavah.getDecimals === 'function', 'getDecimals should be a function');
  assert(typeof gavah.getTotalSupply === 'function', 'getTotalSupply should be a function');
  assert(typeof gavah.getBalance === 'function', 'getBalance should be a function');
  assert(typeof gavah.getOwner === 'function', 'getOwner should be a function');
  assert(typeof gavah.getAllowance === 'function', 'getAllowance should be a function');
  assert(typeof gavah.getTokenInfo === 'function', 'getTokenInfo should be a function');
});

// Print summary
console.log(`\n${'='.repeat(50)}`);
console.log(`Tests run: ${testsRun}`);
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✅ All tests passed!');
  process.exit(0);
} else {
  console.log(`\n❌ ${testsFailed} test(s) failed`);
  process.exit(1);
}
