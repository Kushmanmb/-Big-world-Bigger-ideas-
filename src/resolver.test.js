/**
 * Test suite for Resolver Module
 * Tests address-to-resolver mapping functionality
 */

const Resolver = require('./resolver');

// Test counters
let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${description}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

console.log('Running Resolver Module Tests...\n');

// Test 1: Constructor
test('Constructor creates a new resolver instance', () => {
  const resolver = new Resolver('Test Resolver');
  if (resolver.name !== 'Test Resolver') throw new Error('Name not set correctly');
  if (resolver.getResolverCount() !== 0) throw new Error('Initial count should be 0');
});

test('Constructor requires valid name', () => {
  try {
    new Resolver('');
    throw new Error('Should have thrown error for empty name');
  } catch (error) {
    if (!error.message.includes('non-empty string')) throw error;
  }
});

// Test 2: Address validation
test('Validates valid Ethereum addresses', () => {
  const resolver = new Resolver();
  const testAddr = '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055';
  const result = resolver._validateAddress(testAddr);
  if (!result.startsWith('0x')) throw new Error('Should have 0x prefix');
  if (result.length !== 42) throw new Error('Should be 42 characters');
});

test('Rejects invalid addresses', () => {
  const resolver = new Resolver();
  try {
    resolver._validateAddress('invalid');
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('Invalid Ethereum address')) throw error;
  }
});

test('Handles addresses with and without 0x prefix', () => {
  const resolver = new Resolver();
  const addr1 = resolver._validateAddress('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055');
  const addr2 = resolver._validateAddress('Ee7aE85f2Fe2239E27D9c1E23fFFe168D63b4055');
  if (addr1.toLowerCase() !== addr2.toLowerCase()) {
    throw new Error('Addresses should match');
  }
});

// Test 3: Set resolver
test('Sets resolver for an address', () => {
  const resolver = new Resolver();
  const address = '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055';
  const resolverAddr = '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB';
  
  const result = resolver.setResolver(address, resolverAddr);
  if (!result.address) throw new Error('Should return resolver info');
  if (result.resolverAddress.toLowerCase() !== resolverAddr.toLowerCase()) {
    throw new Error('Resolver address not set correctly');
  }
});

test('Sets resolver with metadata', () => {
  const resolver = new Resolver();
  const metadata = { network: 'Ethereum Mainnet', type: 'ENS Resolver' };
  
  resolver.setResolver(
    '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055',
    '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB',
    metadata
  );
  
  const info = resolver.getResolver('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055');
  if (info.metadata.network !== 'Ethereum Mainnet') {
    throw new Error('Metadata not set correctly');
  }
});

// Test 4: Get resolver
test('Gets resolver for an address', () => {
  const resolver = new Resolver();
  const address = '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055';
  const resolverAddr = '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB';
  
  resolver.setResolver(address, resolverAddr);
  const info = resolver.getResolver(address);
  
  if (info.address.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Address mismatch');
  }
  if (info.resolverAddress.toLowerCase() !== resolverAddr.toLowerCase()) {
    throw new Error('Resolver address mismatch');
  }
});

test('Throws error when resolver not found', () => {
  const resolver = new Resolver();
  try {
    resolver.getResolver('0x1234567890123456789012345678901234567890');
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('No resolver found')) throw error;
  }
});

// Test 5: Has resolver
test('Checks if address has resolver', () => {
  const resolver = new Resolver();
  const address = '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055';
  
  if (resolver.hasResolver(address)) throw new Error('Should not have resolver initially');
  
  resolver.setResolver(address, '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB');
  
  if (!resolver.hasResolver(address)) throw new Error('Should have resolver after setting');
});

// Test 6: Update resolver
test('Updates resolver for an address', () => {
  const resolver = new Resolver();
  const address = '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055';
  const oldResolver = '0x1234567890123456789012345678901234567890';
  const newResolver = '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB';
  
  resolver.setResolver(address, oldResolver);
  resolver.updateResolver(address, newResolver);
  
  const info = resolver.getResolver(address);
  if (info.resolverAddress.toLowerCase() !== newResolver.toLowerCase()) {
    throw new Error('Resolver not updated');
  }
});

// Test 7: Remove resolver
test('Removes resolver for an address', () => {
  const resolver = new Resolver();
  const address = '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055';
  
  resolver.setResolver(address, '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB');
  const removed = resolver.removeResolver(address);
  
  if (!removed) throw new Error('Should return true when removed');
  if (resolver.hasResolver(address)) throw new Error('Resolver should be removed');
});

test('Throws error when removing non-existent resolver', () => {
  const resolver = new Resolver();
  try {
    resolver.removeResolver('0x1234567890123456789012345678901234567890');
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('No resolver found')) throw error;
  }
});

// Test 8: Get all resolvers
test('Gets all resolver mappings', () => {
  const resolver = new Resolver();
  
  resolver.setResolver('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055', '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB');
  resolver.setResolver('0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
  
  const all = resolver.getAllResolvers();
  if (all.length !== 2) throw new Error('Should have 2 resolvers');
});

// Test 9: Resolver count
test('Counts resolvers correctly', () => {
  const resolver = new Resolver();
  
  if (resolver.getResolverCount() !== 0) throw new Error('Initial count should be 0');
  
  resolver.setResolver('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055', '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB');
  if (resolver.getResolverCount() !== 1) throw new Error('Count should be 1');
  
  resolver.setResolver('0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
  if (resolver.getResolverCount() !== 2) throw new Error('Count should be 2');
});

// Test 10: Clear all
test('Clears all resolvers', () => {
  const resolver = new Resolver();
  
  resolver.setResolver('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055', '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB');
  resolver.setResolver('0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
  
  resolver.clearAll();
  if (resolver.getResolverCount() !== 0) throw new Error('Count should be 0 after clear');
});

// Test 11: JSON export/import
test('Exports to JSON format', () => {
  const resolver = new Resolver('Test Resolver');
  resolver.setResolver('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055', '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB');
  
  const json = resolver.toJSON();
  if (json.name !== 'Test Resolver') throw new Error('Name not exported');
  if (json.resolverCount !== 1) throw new Error('Count not exported');
  if (!Array.isArray(json.resolvers)) throw new Error('Resolvers should be array');
});

test('Imports from JSON format', () => {
  const resolver = new Resolver();
  
  const data = {
    resolvers: [
      {
        address: '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055',
        resolverAddress: '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB',
        metadata: { network: 'Ethereum' }
      }
    ]
  };
  
  resolver.fromJSON(data);
  
  if (resolver.getResolverCount() !== 1) throw new Error('Should have 1 resolver');
  if (!resolver.hasResolver('0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055')) {
    throw new Error('Should have imported resolver');
  }
});

// Test 12: Specific test case from problem statement
test('Sets resolver for 0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055 to 0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB', () => {
  const resolver = new Resolver();
  const address = '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055';
  const resolverAddr = '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB';
  
  resolver.setResolver(address, resolverAddr);
  const info = resolver.getResolver(address);
  
  if (info.address.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Address does not match');
  }
  if (info.resolverAddress.toLowerCase() !== resolverAddr.toLowerCase()) {
    throw new Error('Resolver address does not match');
  }
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log('Test Summary');
console.log('='.repeat(50));
console.log(`Total: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✅ All tests passed!');
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed`);
  process.exit(1);
}
