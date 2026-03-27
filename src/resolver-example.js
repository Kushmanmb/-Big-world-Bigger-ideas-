/**
 * Example usage of Resolver Module
 * Demonstrates address-to-resolver mapping functionality
 */

const Resolver = require('./resolver');

console.log('='.repeat(60));
console.log('Resolver Module - Example Usage');
console.log('='.repeat(60));
console.log();

// Example 1: Create a resolver instance
console.log('Example 1: Creating a Resolver Instance');
console.log('-'.repeat(60));
const resolver = new Resolver('Main Resolver');
console.log(`Resolver Name: ${resolver.name}`);
console.log(`Created At: ${resolver.createdAt}`);
console.log(`Initial Resolver Count: ${resolver.getResolverCount()}`);
console.log();

// Example 2: Set resolver for an address
console.log('Example 2: Setting a Resolver');
console.log('-'.repeat(60));
const address = '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055';
const resolverAddress = '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB';
const metadata = {
  network: 'Ethereum Mainnet',
  chainId: 1,
  type: 'Address Resolver',
  notes: 'Primary resolver for this address'
};

console.log(`Setting resolver for: ${address}`);
console.log(`Resolver address: ${resolverAddress}`);
const result = resolver.setResolver(address, resolverAddress, metadata);
console.log('✓ Resolver set successfully');
console.log(`Set At: ${result.setAt}`);
console.log();

// Example 3: Get resolver for an address
console.log('Example 3: Getting Resolver Information');
console.log('-'.repeat(60));
const info = resolver.getResolver(address);
console.log(`Address: ${info.address}`);
console.log(`Resolver Address: ${info.resolverAddress}`);
console.log(`Network: ${info.metadata.network}`);
console.log(`Chain ID: ${info.metadata.chainId}`);
console.log(`Type: ${info.metadata.type}`);
console.log(`Notes: ${info.metadata.notes}`);
console.log();

// Example 4: Check if address has resolver
console.log('Example 4: Checking Resolver Existence');
console.log('-'.repeat(60));
console.log(`Has resolver for ${address}?`, resolver.hasResolver(address));
console.log(`Has resolver for 0x1234567890123456789012345678901234567890?`, 
  resolver.hasResolver('0x1234567890123456789012345678901234567890'));
console.log();

// Example 5: Set multiple resolvers
console.log('Example 5: Setting Multiple Resolvers');
console.log('-'.repeat(60));
resolver.setResolver(
  '0x1234567890123456789012345678901234567890',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  { network: 'Ethereum Mainnet', type: 'Secondary Resolver' }
);
resolver.setResolver(
  '0x9876543210987654321098765432109876543210',
  '0x1111111111111111111111111111111111111111',
  { network: 'Polygon', type: 'Cross-chain Resolver' }
);
console.log(`Total resolvers set: ${resolver.getResolverCount()}`);
console.log();

// Example 6: Get all resolvers
console.log('Example 6: Listing All Resolvers');
console.log('-'.repeat(60));
const allResolvers = resolver.getAllResolvers();
allResolvers.forEach((r, index) => {
  console.log(`Resolver ${index + 1}:`);
  console.log(`  Address: ${r.address}`);
  console.log(`  Resolver: ${r.resolverAddress}`);
  console.log(`  Network: ${r.metadata.network || 'N/A'}`);
  console.log(`  Type: ${r.metadata.type || 'N/A'}`);
  console.log();
});

// Example 7: Update resolver
console.log('Example 7: Updating a Resolver');
console.log('-'.repeat(60));
const newResolverAddress = '0x2222222222222222222222222222222222222222';
console.log(`Updating resolver for ${address}`);
console.log(`New resolver address: ${newResolverAddress}`);
resolver.updateResolver(address, newResolverAddress, { notes: 'Updated resolver' });
const updated = resolver.getResolver(address);
console.log('✓ Resolver updated successfully');
console.log(`Updated At: ${updated.updatedAt}`);
console.log(`New Resolver Address: ${updated.resolverAddress}`);
console.log();

// Example 8: JSON export
console.log('Example 8: Exporting to JSON');
console.log('-'.repeat(60));
const jsonData = resolver.toJSON();
console.log('Exported JSON:');
console.log(JSON.stringify(jsonData, null, 2));
console.log();

// Example 9: JSON import
console.log('Example 9: Importing from JSON');
console.log('-'.repeat(60));
const newResolver = new Resolver('Imported Resolver');
const importData = {
  resolvers: [
    {
      address: '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055',
      resolverAddress: '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB',
      metadata: { network: 'Ethereum Mainnet' }
    }
  ]
};
newResolver.fromJSON(importData);
console.log(`Imported ${newResolver.getResolverCount()} resolver(s)`);
console.log();

// Example 10: Remove resolver
console.log('Example 10: Removing a Resolver');
console.log('-'.repeat(60));
const removeAddr = '0x9876543210987654321098765432109876543210';
console.log(`Removing resolver for: ${removeAddr}`);
resolver.removeResolver(removeAddr);
console.log('✓ Resolver removed successfully');
console.log(`Remaining resolvers: ${resolver.getResolverCount()}`);
console.log();

// Example 11: Clear all resolvers
console.log('Example 11: Clearing All Resolvers');
console.log('-'.repeat(60));
const testResolver = new Resolver('Test Resolver');
testResolver.setResolver('0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222');
testResolver.setResolver('0x3333333333333333333333333333333333333333', '0x4444444444444444444444444444444444444444');
console.log(`Resolvers before clear: ${testResolver.getResolverCount()}`);
testResolver.clearAll();
console.log(`Resolvers after clear: ${testResolver.getResolverCount()}`);
console.log();

// Example 12: Error handling
console.log('Example 12: Error Handling');
console.log('-'.repeat(60));
try {
  resolver.getResolver('0x9999999999999999999999999999999999999999');
} catch (error) {
  console.log('✓ Caught expected error:');
  console.log(`  ${error.message}`);
}
console.log();

try {
  resolver.setResolver('invalid-address', '0x1234567890123456789012345678901234567890');
} catch (error) {
  console.log('✓ Caught expected error for invalid address:');
  console.log(`  ${error.message}`);
}
console.log();

// Summary
console.log('='.repeat(60));
console.log('Summary');
console.log('='.repeat(60));
console.log();
console.log('This module provides:');
console.log('  ✓ Address-to-resolver mapping management');
console.log('  ✓ Ethereum address validation');
console.log('  ✓ Metadata support for resolvers');
console.log('  ✓ JSON import/export functionality');
console.log('  ✓ CRUD operations (Create, Read, Update, Delete)');
console.log('  ✓ Batch operations (getAllResolvers, clearAll)');
console.log();
console.log('Use cases:');
console.log('  - ENS resolver management');
console.log('  - Address resolution services');
console.log('  - Cross-chain resolver mapping');
console.log('  - Custom resolver configurations');
console.log();
console.log('✅ Examples completed successfully!');
console.log();
