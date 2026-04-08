/**
 * Token Manager Upgrade Utility
 * Upgrades deprecated tokens back to active status and applies consolidation analysis
 */

const fs = require('fs');
const path = require('path');
const ContractConsolidator = require('./src/contract-consolidator');
const { AddressConsolidator } = require('./src/address-consolidator');

console.log('='.repeat(70));
console.log('Token Manager Upgrade and Consolidation Utility');
console.log('='.repeat(70));
console.log('');

async function upgradeDeprecatedTokens() {
  const tokenManagersPath = path.join(__dirname, 'token-managers.json');
  
  // Load current configuration
  console.log('📂 Loading token managers configuration...\n');
  const config = JSON.parse(fs.readFileSync(tokenManagersPath, 'utf8'));
  
  console.log(`Current state:`);
  console.log(`  Active managers: ${config.managers.length}`);
  console.log(`  Deprecated tokens: ${config.deprecated ? config.deprecated.length : 0}`);
  console.log('');
  
  if (!config.deprecated || config.deprecated.length === 0) {
    console.log('✓ No deprecated tokens found. Nothing to upgrade.');
    return;
  }
  
  // Display deprecated tokens
  console.log('Deprecated tokens to upgrade:');
  console.log('-'.repeat(70));
  config.deprecated.forEach((token, index) => {
    console.log(`${index + 1}. ${token.tokenAddress}`);
    console.log(`   Deprecated: ${token.deprecatedAt}`);
    console.log(`   Reason: ${token.reason}`);
    if (token.metadata) {
      console.log(`   Token: ${token.metadata.tokenName || 'Unknown'} (${token.metadata.tokenSymbol || 'N/A'})`);
    }
    console.log('');
  });
  
  // Upgrade all deprecated tokens back to active
  console.log('⬆️  Upgrading deprecated tokens to active status...\n');
  
  config.deprecated.forEach(token => {
    const upgradedManager = {
      tokenAddress: token.tokenAddress,
      managerAddress: token.managerAddress || config.transferAddressHex,
      metadata: {
        ...(token.metadata || {}),
        tokenName: token.metadata?.tokenName || 'Unknown Token',
        tokenSymbol: token.metadata?.tokenSymbol || 'UNKNOWN',
        network: token.metadata?.network || 'Ethereum Mainnet',
        chainId: token.metadata?.chainId || 1,
        setBy: 'yaketh.eth',
        notes: `Upgraded from deprecated on ${new Date().toISOString()}. Previous deprecation reason: ${token.reason}`
      },
      setAt: token.deprecatedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    config.managers.push(upgradedManager);
    console.log(`✓ Upgraded: ${token.tokenAddress}`);
  });
  
  // Clear deprecated array
  config.deprecated = [];
  config.lastUpdated = new Date().toISOString();
  config.version = '1.4.0';
  
  // Save updated configuration
  console.log('\n💾 Saving updated configuration...\n');
  fs.writeFileSync(tokenManagersPath, JSON.stringify(config, null, 2));
  console.log('✓ Configuration saved');
  
  console.log('\n' + '='.repeat(70));
  console.log('Updated state:');
  console.log(`  Active managers: ${config.managers.length}`);
  console.log(`  Deprecated tokens: ${config.deprecated.length}`);
  console.log('='.repeat(70));
  console.log('');
  
  // Now run consolidation analysis
  console.log('🔍 Running consolidation analysis to identify zero-balance contracts...\n');
  
  try {
    const addressConsolidator = new AddressConsolidator('kushmanmb');
    addressConsolidator.initializeAddresses();
    
    console.log('Fetching token balances from blockchain...\n');
    const consolidated = await addressConsolidator.fetchConsolidatedBalances();
    
    // Analyze contracts
    const contractConsolidator = new ContractConsolidator({
      minBalanceThreshold: 0.001,
      tokenManagersPath
    });
    
    const analysis = contractConsolidator.analyzeContracts(consolidated);
    
    console.log('\n📊 Consolidation Analysis Results:\n');
    const report = contractConsolidator.generateReport(analysis);
    console.log(report);
    
    // Apply automatic deprecation for zero-balance contracts
    const deprecateRecs = analysis.recommendations.filter(r => r.action === 'deprecate');
    
    if (deprecateRecs.length > 0) {
      console.log('\n💡 Applying automatic deprecation for zero-balance contracts...\n');
      
      const results = contractConsolidator.applyDeprecations(deprecateRecs, false);
      const formattedResults = contractConsolidator.formatDeprecationResults(results);
      console.log(formattedResults);
      
      console.log('\n✅ Consolidation applied successfully!');
      console.log(`   - Upgraded ${config.managers.length} tokens to active`);
      console.log(`   - Deprecated ${results.deprecated.length} zero-balance contracts`);
      console.log(`   - Final active contracts: ${config.managers.length - results.deprecated.length}`);
    } else {
      console.log('\n✅ All upgraded tokens have active balances - no deprecation needed!');
    }
    
  } catch (error) {
    console.error('\n⚠️  Warning: Could not fetch live balance data');
    console.error(`   Reason: ${error.message}`);
    console.log('\n   The tokens have been upgraded, but consolidation analysis could not be completed.');
    console.log('   You may want to run consolidation separately once API access is available.');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('Upgrade and consolidation process completed!');
  console.log('='.repeat(70));
  console.log('');
}

// Run the upgrade
upgradeDeprecatedTokens().catch(error => {
  console.error('\n❌ Error during upgrade:', error.message);
  console.error(error.stack);
  process.exit(1);
});
