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
  console.log(`  Transfer Address: ${config.transferAddress} (${config.transferAddressHex})`);
  console.log(`  Active Managers: ${config.managers.length}`);
  if (config.deprecated && config.deprecated.length > 0) {
    console.log(`  Deprecated Entries: ${config.deprecated.length}`);
    config.deprecated.forEach(d => {
      console.log(`    - ${d.tokenAddress}: ${d.reason}`);
    });
  }
  console.log('');
  
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
  
  // Verify the transfer address is yaketh.eth for all active managers
  console.log('=== Verification ===\n');
  
  const yakethAddress = config.transferAddressHex;
  
  // Verify USDC manager is yaketh.eth
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  
  if (manager.hasManager(usdcAddress)) {
    const usdcManager = manager.getManager(usdcAddress);
    console.log(`✓ Manager found for USDC token`);
    console.log(`  Token:   ${usdcManager.tokenAddress}`);
    console.log(`  Manager: ${usdcManager.managerAddress}`);
    
    if (usdcManager.managerAddress.toLowerCase() === yakethAddress.toLowerCase()) {
      console.log(`✅ SUCCESS: USDC manager correctly set to yaketh.eth (${yakethAddress})`);
    } else {
      console.log(`❌ ERROR: Manager mismatch`);
      console.log(`  Expected: ${yakethAddress}`);
      console.log(`  Actual:   ${usdcManager.managerAddress}`);
      process.exit(1);
    }
  } else {
    console.log(`❌ ERROR: No manager found for USDC token`);
    process.exit(1);
  }
  
  // Verify the token contract address 0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055
  console.log();
  const tokenContractAddress = '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055';
  
  if (manager.hasManager(tokenContractAddress)) {
    const tokenManager = manager.getManager(tokenContractAddress);
    console.log(`✓ Manager found for token ${tokenContractAddress}`);
    console.log(`  Token:   ${tokenManager.tokenAddress}`);
    console.log(`  Manager: ${tokenManager.managerAddress}`);
    
    if (tokenManager.managerAddress.toLowerCase() === yakethAddress.toLowerCase()) {
      console.log(`✅ SUCCESS: Token contract manager correctly set to yaketh.eth (${yakethAddress})`);
    } else {
      console.log(`❌ ERROR: Manager mismatch`);
      console.log(`  Expected: ${yakethAddress}`);
      console.log(`  Actual:   ${tokenManager.managerAddress}`);
      process.exit(1);
    }
  } else {
    console.log(`❌ ERROR: No manager found for token ${tokenContractAddress}`);
    process.exit(1);
  }

  // Verify deprecated tokens are NOT in active managers
  console.log();
  const deprecatedAddresses = (config.deprecated || []).map(d => d.tokenAddress.toLowerCase());
  let allDeprecatedClean = true;
  deprecatedAddresses.forEach(addr => {
    if (manager.hasManager(addr)) {
      console.log(`❌ ERROR: Deprecated token ${addr} is still in active manager list`);
      allDeprecatedClean = false;
    }
  });
  if (allDeprecatedClean && deprecatedAddresses.length > 0) {
    console.log(`✅ SUCCESS: All ${deprecatedAddresses.length} deprecated token(s) removed from active configuration`);
  }
  
  console.log('\n✅ Token manager configuration applied successfully!');
  process.exit(0);
  
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}
