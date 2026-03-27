/**
 * Apply Token Manager Configuration
 * Loads token manager configuration from token-managers.json and applies it
 */

const TokenManager = require('./src/token-manager');
const fs = require('fs');
const path = require('path');

console.log('=== Applying Token Manager Configuration ===\n');

// Load configuration
const configPath = path.join(__dirname, 'token-managers.json');
console.log(`Loading configuration from: ${configPath}`);

try {
  const configData = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configData);
  
  console.log(`✓ Configuration loaded successfully`);
  console.log(`  Version: ${config.version}`);
  console.log(`  Last Updated: ${config.lastUpdated}`);
  console.log(`  Total Managers: ${config.managers.length}\n`);
  
  // Create token manager instance
  const manager = new TokenManager('Production Token Manager');
  
  // Import managers from config
  manager.fromJSON(config);
  
  console.log('=== Configured Managers ===\n');
  
  // Display all configured managers
  const allManagers = manager.getAllManagers();
  allManagers.forEach((mgr, index) => {
    console.log(`Manager ${index + 1}:`);
    console.log(`  Token Address:   ${mgr.tokenAddress}`);
    console.log(`  Manager Address: ${mgr.managerAddress}`);
    if (mgr.metadata) {
      console.log(`  Token Name:      ${mgr.metadata.tokenName || 'N/A'}`);
      console.log(`  Token Symbol:    ${mgr.metadata.tokenSymbol || 'N/A'}`);
      console.log(`  Network:         ${mgr.metadata.network || 'N/A'}`);
      if (mgr.metadata.notes) {
        console.log(`  Notes:           ${mgr.metadata.notes}`);
      }
    }
    console.log(`  Set At:          ${mgr.setAt}`);
    console.log();
  });
  
  // Verify the specific manager requested in the problem statement
  console.log('=== Verification ===\n');
  
  // Verify USDC manager
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const expectedManager = '0x6fb9e80dDd0f5DC99D7cB38b07e8b298A57bF253';
  
  if (manager.hasManager(usdcAddress)) {
    const usdcManager = manager.getManager(usdcAddress);
    console.log(`✓ Manager found for USDC token`);
    console.log(`  Token:   ${usdcManager.tokenAddress}`);
    console.log(`  Manager: ${usdcManager.managerAddress}`);
    
    // Verify it matches the expected manager
    if (usdcManager.managerAddress.toLowerCase() === expectedManager.toLowerCase()) {
      console.log(`✅ SUCCESS: Manager for ${usdcAddress} is correctly set to ${expectedManager}`);
    } else {
      console.log(`❌ ERROR: Manager mismatch`);
      console.log(`  Expected: ${expectedManager}`);
      console.log(`  Actual:   ${usdcManager.managerAddress}`);
      process.exit(1);
    }
  } else {
    console.log(`❌ ERROR: No manager found for USDC token`);
    process.exit(1);
  }
  
  // Verify the newly added manager for 0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055
  console.log();
  const newTokenAddress = '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055';
  
  if (manager.hasManager(newTokenAddress)) {
    const tokenManager = manager.getManager(newTokenAddress);
    console.log(`✓ Manager found for token ${newTokenAddress}`);
    console.log(`  Token:   ${tokenManager.tokenAddress}`);
    console.log(`  Manager: ${tokenManager.managerAddress}`);
    
    // Verify it matches the expected manager
    if (tokenManager.managerAddress.toLowerCase() === expectedManager.toLowerCase()) {
      console.log(`✅ SUCCESS: Manager for ${newTokenAddress} is correctly set to ${expectedManager}`);
    } else {
      console.log(`❌ ERROR: Manager mismatch`);
      console.log(`  Expected: ${expectedManager}`);
      console.log(`  Actual:   ${tokenManager.managerAddress}`);
      process.exit(1);
    }
  } else {
    console.log(`❌ ERROR: No manager found for token ${newTokenAddress}`);
    process.exit(1);
  }
  
  console.log('\n✅ Token manager configuration applied successfully!');
  process.exit(0);
  
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}
