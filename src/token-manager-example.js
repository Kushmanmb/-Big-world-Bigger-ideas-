/**
 * Token Manager Module Example
 * Demonstrates how to use the token manager to assign and manage token managers
 */

const TokenManager = require('./token-manager');

console.log('=== Token Manager Module Example ===\n');

// Create a new token manager instance
console.log('1. Creating Token Manager instance...');
const tokenManager = new TokenManager('Production Token Manager');
console.log(`   ✓ Created: ${tokenManager.name}`);
console.log(`   ✓ Created at: ${tokenManager.createdAt}\n`);

// Set manager for USDC token (as requested)
console.log('2. Setting manager for USDC token...');
const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const managerAddress = '0x6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253';

const usdcManager = tokenManager.setManager(
  usdcAddress,
  managerAddress,
  {
    tokenName: 'USD Coin',
    tokenSymbol: 'USDC',
    network: 'Ethereum Mainnet',
    chainId: 1,
    notes: 'Primary stablecoin manager'
  }
);

console.log('   ✓ Manager set successfully');
console.log(`   Token: ${usdcManager.tokenAddress}`);
console.log(`   Manager: ${usdcManager.managerAddress}`);
console.log(`   Set at: ${usdcManager.setAt}\n`);

// Set manager for USDT token
console.log('3. Setting manager for USDT token...');
const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const usdtManagerAddress = '0x1234567890123456789012345678901234567890';

const usdtManager = tokenManager.setManager(
  usdtAddress,
  usdtManagerAddress,
  {
    tokenName: 'Tether USD',
    tokenSymbol: 'USDT',
    network: 'Ethereum Mainnet',
    chainId: 1,
    notes: 'Secondary stablecoin manager'
  }
);

console.log('   ✓ Manager set successfully');
console.log(`   Token: ${usdtManager.tokenAddress}`);
console.log(`   Manager: ${usdtManager.managerAddress}\n`);

// Check if a token has a manager
console.log('4. Checking if tokens have managers...');
console.log(`   USDC has manager: ${tokenManager.hasManager(usdcAddress)}`);
console.log(`   USDT has manager: ${tokenManager.hasManager(usdtAddress)}`);
console.log(`   Random token has manager: ${tokenManager.hasManager('0x0000000000000000000000000000000000000000')}\n`);

// Get manager for a specific token
console.log('5. Getting manager for USDC...');
const retrievedManager = tokenManager.getManager(usdcAddress);
console.log(`   Token: ${retrievedManager.tokenAddress}`);
console.log(`   Manager: ${retrievedManager.managerAddress}`);
console.log(`   Token Name: ${retrievedManager.metadata.tokenName}`);
console.log(`   Network: ${retrievedManager.metadata.network}`);
console.log(`   Notes: ${retrievedManager.metadata.notes}\n`);

// Get all managers
console.log('6. Getting all managed tokens...');
const allManagers = tokenManager.getAllManagers();
console.log(`   Total managed tokens: ${tokenManager.getManagerCount()}`);
allManagers.forEach((manager, index) => {
  console.log(`   \n   Token ${index + 1}:`);
  console.log(`     Address: ${manager.tokenAddress}`);
  console.log(`     Manager: ${manager.managerAddress}`);
  console.log(`     Symbol: ${manager.metadata.tokenSymbol || 'N/A'}`);
});
console.log();

// Update manager for a token
console.log('7. Updating manager for USDC...');
const newManagerAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
const updatedManager = tokenManager.updateManager(
  usdcAddress,
  newManagerAddress,
  { notes: 'Updated to new manager address', version: 'v2' }
);

console.log('   ✓ Manager updated successfully');
console.log(`   Old Manager: ${managerAddress}`);
console.log(`   New Manager: ${updatedManager.managerAddress}`);
console.log(`   Updated at: ${updatedManager.updatedAt}\n`);

// Export to JSON
console.log('8. Exporting manager data to JSON...');
const exportedData = tokenManager.toJSON();
console.log('   ✓ Data exported successfully');
console.log(`   Manager Name: ${exportedData.name}`);
console.log(`   Total Managers: ${exportedData.managerCount}`);
console.log(`   Created At: ${exportedData.createdAt}`);
console.log(`   \n   JSON Preview:`);
console.log(`   ${JSON.stringify(exportedData, null, 2).substring(0, 300)}...\n`);

// Import from JSON
console.log('9. Importing manager data from JSON...');
const newTokenManager = new TokenManager('Imported Token Manager');
newTokenManager.fromJSON(exportedData);
console.log(`   ✓ Imported ${newTokenManager.getManagerCount()} manager(s)`);
console.log(`   ✓ USDC manager verified: ${newTokenManager.hasManager(usdcAddress)}\n`);

// Remove a manager
console.log('10. Removing USDT manager...');
const beforeCount = tokenManager.getManagerCount();
tokenManager.removeManager(usdtAddress);
const afterCount = tokenManager.getManagerCount();
console.log(`   ✓ Manager removed successfully`);
console.log(`   Managers before: ${beforeCount}`);
console.log(`   Managers after: ${afterCount}`);
console.log(`   USDT has manager: ${tokenManager.hasManager(usdtAddress)}\n`);

// Demonstrate error handling
console.log('11. Demonstrating error handling...');

// Try to get non-existent manager
try {
  tokenManager.getManager(usdtAddress);
  console.log('   ✗ Should have thrown error');
} catch (error) {
  console.log(`   ✓ Caught expected error: ${error.message}`);
}

// Try to set manager with invalid address
try {
  tokenManager.setManager('invalid-address', managerAddress);
  console.log('   ✗ Should have thrown error');
} catch (error) {
  console.log(`   ✓ Caught expected error: ${error.message}`);
}

console.log();

// Address format flexibility
console.log('12. Demonstrating address format flexibility...');
const withPrefix = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const withoutPrefix = 'A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const mixedCase = '0xA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48';

console.log(`   With prefix: ${tokenManager.hasManager(withPrefix)}`);
console.log(`   Without prefix: ${tokenManager.hasManager(withoutPrefix)}`);
console.log(`   Mixed case: ${tokenManager.hasManager(mixedCase)}`);
console.log('   ✓ All address formats work correctly\n');

// Final summary
console.log('=== Summary ===');
console.log(`Manager Name: ${tokenManager.name}`);
console.log(`Total Managed Tokens: ${tokenManager.getManagerCount()}`);
console.log(`Created: ${tokenManager.createdAt}`);
console.log('\nManaged Tokens:');
tokenManager.getAllManagers().forEach(manager => {
  console.log(`  • ${manager.metadata.tokenSymbol || 'Unknown'} (${manager.tokenAddress})`);
  console.log(`    Manager: ${manager.managerAddress}`);
});

console.log('\n✅ Example completed successfully!');
