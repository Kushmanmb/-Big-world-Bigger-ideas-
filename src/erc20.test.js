/**
 * Tests for ERC-20 Token Balance Fetcher Module
 */

const ERC20Fetcher = require('./erc20.js');

// Test counters
let passed = 0;
let failed = 0;

/**
 * Test helper to run a test and log results
 */
function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  Error: ${error.message}`);
    failed++;
  }
}

/**
 * Async test helper
 */
async function testAsync(description, fn) {
  try {
    await fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  Error: ${error.message}`);
    failed++;
  }
}

console.log('\nRunning ERC-20 Token Balance Fetcher Tests...\n');

// Constructor Tests
test('ERC20Fetcher constructor creates instance with default baseUrl', () => {
  const fetcher = new ERC20Fetcher();
  if (fetcher.baseUrl !== 'api.blockchair.com') {
    throw new Error('Default baseUrl not set correctly');
  }
});

test('ERC20Fetcher constructor creates instance with custom baseUrl', () => {
  const customUrl = 'custom.api.com';
  const fetcher = new ERC20Fetcher(customUrl);
  if (fetcher.baseUrl !== customUrl) {
    throw new Error('Custom baseUrl not set correctly');
  }
});

test('ERC20Fetcher has cache and cacheTimeout properties', () => {
  const fetcher = new ERC20Fetcher();
  if (!(fetcher.cache instanceof Map)) {
    throw new Error('Cache is not a Map');
  }
  if (typeof fetcher.cacheTimeout !== 'number') {
    throw new Error('cacheTimeout is not a number');
  }
});

// Address Validation Tests
test('validateAddress accepts valid Ethereum address with 0x prefix', () => {
  const fetcher = new ERC20Fetcher();
  const address = '0x1234567890123456789012345678901234567890';
  const validated = fetcher.validateAddress(address);
  if (validated !== address.toLowerCase()) {
    throw new Error('Address not validated correctly');
  }
});

test('validateAddress accepts valid Ethereum address without 0x prefix', () => {
  const fetcher = new ERC20Fetcher();
  const address = '1234567890123456789012345678901234567890';
  const validated = fetcher.validateAddress(address);
  if (validated !== '0x' + address.toLowerCase()) {
    throw new Error('Address not normalized correctly');
  }
});

test('validateAddress accepts ENS names', () => {
  const fetcher = new ERC20Fetcher();
  const ens = 'kushmanmb.eth';
  const validated = fetcher.validateAddress(ens);
  if (validated !== ens.toLowerCase()) {
    throw new Error('ENS name not validated correctly');
  }
});

test('validateAddress rejects invalid address - too short', () => {
  const fetcher = new ERC20Fetcher();
  try {
    fetcher.validateAddress('0x12345');
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('Invalid Ethereum address')) {
      throw error;
    }
  }
});

test('validateAddress rejects invalid address - non-hex characters', () => {
  const fetcher = new ERC20Fetcher();
  try {
    fetcher.validateAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG');
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('Invalid Ethereum address')) {
      throw error;
    }
  }
});

test('validateAddress rejects null address', () => {
  const fetcher = new ERC20Fetcher();
  try {
    fetcher.validateAddress(null);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('must be a non-empty string')) {
      throw error;
    }
  }
});

test('validateAddress rejects empty string', () => {
  const fetcher = new ERC20Fetcher();
  try {
    fetcher.validateAddress('');
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('must be a non-empty string')) {
      throw error;
    }
  }
});

// ABI Tests
test('getABI returns correct ABI for balanceOf', () => {
  const abi = ERC20Fetcher.getABI('balanceOf');
  if (!abi || abi.name !== 'balanceOf') {
    throw new Error('balanceOf ABI not returned correctly');
  }
  if (abi.signature !== '0x70a08231') {
    throw new Error('balanceOf signature incorrect');
  }
});

test('getABI returns correct ABI for name', () => {
  const abi = ERC20Fetcher.getABI('name');
  if (!abi || abi.name !== 'name') {
    throw new Error('name ABI not returned correctly');
  }
  if (abi.signature !== '0x06fdde03') {
    throw new Error('name signature incorrect');
  }
});

test('getABI returns correct ABI for symbol', () => {
  const abi = ERC20Fetcher.getABI('symbol');
  if (!abi || abi.name !== 'symbol') {
    throw new Error('symbol ABI not returned correctly');
  }
  if (abi.signature !== '0x95d89b41') {
    throw new Error('symbol signature incorrect');
  }
});

test('getABI returns correct ABI for decimals', () => {
  const abi = ERC20Fetcher.getABI('decimals');
  if (!abi || abi.name !== 'decimals') {
    throw new Error('decimals ABI not returned correctly');
  }
  if (abi.signature !== '0x313ce567') {
    throw new Error('decimals signature incorrect');
  }
});

test('getABI returns correct ABI for totalSupply', () => {
  const abi = ERC20Fetcher.getABI('totalSupply');
  if (!abi || abi.name !== 'totalSupply') {
    throw new Error('totalSupply ABI not returned correctly');
  }
  if (abi.signature !== '0x18160ddd') {
    throw new Error('totalSupply signature incorrect');
  }
});

test('getABI returns null for invalid function name', () => {
  const abi = ERC20Fetcher.getABI('invalidFunction');
  if (abi !== null) {
    throw new Error('Should return null for invalid function');
  }
});

test('getAllABIs returns all ERC-20 ABIs', () => {
  const abis = ERC20Fetcher.getAllABIs();
  if (typeof abis !== 'object') {
    throw new Error('getAllABIs should return an object');
  }
  const expectedFunctions = ['balanceOf', 'name', 'symbol', 'decimals', 'totalSupply'];
  for (const func of expectedFunctions) {
    if (!abis[func]) {
      throw new Error(`Missing ABI for ${func}`);
    }
  }
});

// Cache Tests
test('clearCache clears the cache', () => {
  const fetcher = new ERC20Fetcher();
  fetcher.cache.set('test', { data: 'test', timestamp: Date.now() });
  fetcher.clearCache();
  if (fetcher.cache.size !== 0) {
    throw new Error('Cache not cleared');
  }
});

test('getCacheStats returns cache statistics', () => {
  const fetcher = new ERC20Fetcher();
  const stats = fetcher.getCacheStats();
  if (typeof stats !== 'object') {
    throw new Error('Stats should be an object');
  }
  if (!('size' in stats) || !('timeout' in stats) || !('keys' in stats)) {
    throw new Error('Stats missing required properties');
  }
});

// Format Tests
test('formatTokenBalances formats data correctly with tokens', () => {
  const fetcher = new ERC20Fetcher();
  const data = {
    address: '0x1234567890123456789012345678901234567890',
    tokenCount: 2,
    tokens: [
      {
        tokenAddress: '0xabc',
        tokenName: 'Test Token',
        tokenSymbol: 'TEST',
        tokenDecimals: 18,
        balance: '1000',
        usdValue: 100.5
      },
      {
        tokenAddress: '0xdef',
        tokenName: 'Another Token',
        tokenSymbol: 'ANO',
        tokenDecimals: 6,
        balance: '5000',
        usdValue: null
      }
    ],
    timestamp: Date.now()
  };
  
  const formatted = fetcher.formatTokenBalances(data);
  if (!formatted.includes('ERC-20 Token Balances')) {
    throw new Error('Formatted output missing title');
  }
  if (!formatted.includes('Test Token')) {
    throw new Error('Formatted output missing token name');
  }
  if (!formatted.includes('TEST')) {
    throw new Error('Formatted output missing token symbol');
  }
});

test('formatTokenBalances handles empty token list', () => {
  const fetcher = new ERC20Fetcher();
  const data = {
    address: '0x1234567890123456789012345678901234567890',
    tokenCount: 0,
    tokens: [],
    timestamp: Date.now()
  };
  
  const formatted = fetcher.formatTokenBalances(data);
  if (!formatted.includes('No ERC-20 tokens found')) {
    throw new Error('Should indicate no tokens found');
  }
});

test('formatTokenBalances handles null data', () => {
  const fetcher = new ERC20Fetcher();
  const formatted = fetcher.formatTokenBalances(null);
  if (!formatted.includes('No data available')) {
    throw new Error('Should handle null data gracefully');
  }
});

test('formatConsolidatedTokens formats consolidated data correctly', () => {
  const fetcher = new ERC20Fetcher();
  const data = {
    addresses: ['0xabc', '0xdef'],
    totalAddresses: 2,
    uniqueTokens: 1,
    tokens: [
      {
        tokenAddress: '0x123',
        tokenName: 'Test Token',
        tokenSymbol: 'TEST',
        totalBalance: 1500,
        totalUsdValue: 150,
        holders: [
          { address: '0xabc', balance: '1000', usdValue: 100 },
          { address: '0xdef', balance: '500', usdValue: 50 }
        ]
      }
    ],
    timestamp: Date.now()
  };
  
  const formatted = fetcher.formatConsolidatedTokens(data);
  if (!formatted.includes('Consolidated ERC-20 Token Report')) {
    throw new Error('Formatted output missing title');
  }
  if (!formatted.includes('Unique Tokens: 1')) {
    throw new Error('Formatted output missing token count');
  }
  if (!formatted.includes('Test Token')) {
    throw new Error('Formatted output missing token name');
  }
});

// consolidateTokens Tests
testAsync('consolidateTokens rejects empty array', async () => {
  const fetcher = new ERC20Fetcher();
  try {
    await fetcher.consolidateTokens([]);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('non-empty array')) {
      throw error;
    }
  }
});

testAsync('consolidateTokens rejects non-array input', async () => {
  const fetcher = new ERC20Fetcher();
  try {
    await fetcher.consolidateTokens('not an array');
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('non-empty array')) {
      throw error;
    }
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Total Tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('='.repeat(50) + '\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ All tests passed!\n');
  process.exit(0);
}
