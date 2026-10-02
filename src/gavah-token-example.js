/**
 * Gavah Token Module Example
 * Demonstrates how to use the GavahToken module
 */

const GavahToken = require('./gavah-token');

console.log('=== Gavah Token Module Example ===\n');

// Example 1: Create a GavahToken instance
console.log('Example 1: Creating a GavahToken instance');
console.log('-------------------------------------------');

// Replace with actual deployed contract address
const contractAddress = '0x0000000000000000000000000000000000000000'; // Placeholder
const gavah = new GavahToken(contractAddress);

console.log(`Contract Address: ${gavah.contractAddress}`);
console.log(`RPC URL: ${gavah.rpcUrl}`);
console.log('');

// Example 2: Format and parse amounts
console.log('Example 2: Formatting and parsing token amounts');
console.log('------------------------------------------------');

// Parse human-readable amount to smallest unit
const humanAmount = '100.5';
const smallestUnit = gavah.parseAmount(humanAmount);
console.log(`Human-readable: ${humanAmount} GAVAH`);
console.log(`Smallest unit: ${smallestUnit}`);
console.log('');

// Format smallest unit to human-readable
const formattedAmount = gavah.formatAmount(smallestUnit);
console.log(`Smallest unit: ${smallestUnit}`);
console.log(`Formatted: ${formattedAmount} GAVAH`);
console.log('');

// Example 3: Working with different decimals
console.log('Example 3: Working with different decimal values');
console.log('--------------------------------------------------');

// 6 decimals (like USDC)
const amount6 = gavah.parseAmount('1000', 6);
const formatted6 = gavah.formatAmount(amount6, 6);
console.log(`6 decimals: ${amount6} -> ${formatted6}`);

// 18 decimals (standard ERC20)
const amount18 = gavah.parseAmount('1000', 18);
const formatted18 = gavah.formatAmount(amount18, 18);
console.log(`18 decimals: ${amount18} -> ${formatted18}`);
console.log('');

// Example 4: Fetching token information (requires deployed contract)
console.log('Example 4: Fetching token information');
console.log('---------------------------------------');
console.log('NOTE: The following examples require a deployed Gavah Token contract');
console.log('');

async function fetchTokenInfo() {
  try {
    // This would work with a real deployed contract
    // Uncomment and use with actual deployed contract address
    
    /*
    const info = await gavah.getTokenInfo();
    console.log('Token Information:');
    console.log(`  Name: ${info.name}`);
    console.log(`  Symbol: ${info.symbol}`);
    console.log(`  Decimals: ${info.decimals}`);
    console.log(`  Total Supply: ${info.totalSupply}`);
    console.log(`  Total Supply (formatted): ${info.totalSupplyFormatted}`);
    console.log(`  Owner: ${info.owner}`);
    */
    
    console.log('(Skipped - requires deployed contract)');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Example 5: Checking balance
console.log('');
console.log('Example 5: Checking token balance');
console.log('-----------------------------------');

async function checkBalance() {
  try {
    // This would work with a real deployed contract
    // Uncomment and use with actual deployed contract address
    
    /*
    const userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'; // kushmanmb.base.eth
    const balance = await gavah.getBalance(userAddress);
    const decimals = await gavah.getDecimals();
    const formattedBalance = gavah.formatAmount(balance, decimals);
    
    console.log(`Address: ${userAddress}`);
    console.log(`Balance (smallest unit): ${balance}`);
    console.log(`Balance (formatted): ${formattedBalance} GAVAH`);
    */
    
    console.log('(Skipped - requires deployed contract)');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Example 6: Using with Token Manager
console.log('');
console.log('Example 6: Integration with Token Manager');
console.log('-------------------------------------------');

const TokenManager = require('./token-manager');

// Create a token manager and set the Gavah token manager
const tokenManager = new TokenManager('Gavah Manager');

// Set manager for Gavah token (using placeholder addresses)
const gavahTokenAddress = '0x0000000000000000000000000000000000000000'; // Replace with actual
const managerAddress = '0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17'; // yaketh.eth

const managerInfo = tokenManager.setManager(gavahTokenAddress, managerAddress, {
  tokenName: 'Gavah Token',
  tokenSymbol: 'GAVAH',
  network: 'Ethereum Mainnet',
  chainId: 1,
  decimals: 18,
  type: 'Governance Token',
  setBy: 'yaketh.eth',
  notes: 'Gavah token manager assignment'
});

console.log('Manager set successfully:');
console.log(`  Token: ${managerInfo.tokenAddress}`);
console.log(`  Manager: ${managerInfo.managerAddress}`);
console.log(`  Token Name: ${managerInfo.metadata.tokenName}`);
console.log(`  Token Symbol: ${managerInfo.metadata.tokenSymbol}`);
console.log('');

// Export manager configuration
const exportedConfig = tokenManager.toJSON();
console.log('Exported Configuration:');
console.log(JSON.stringify(exportedConfig, null, 2));
console.log('');

// Run async examples
(async () => {
  await fetchTokenInfo();
  await checkBalance();
  
  console.log('');
  console.log('=== Example Complete ===');
  console.log('');
  console.log('Next Steps:');
  console.log('1. Deploy the GavahToken.sol contract to your chosen network');
  console.log('2. Update the contractAddress in this example with the deployed address');
  console.log('3. Add the Gavah token to token-managers.json');
  console.log('4. Run apply-token-managers.js to verify the configuration');
})();
