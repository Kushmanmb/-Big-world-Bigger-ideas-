/**
 * Contract Consolidator Example
 * Demonstrates how to use the ContractConsolidator to analyze and consolidate token contracts
 */

const ContractConsolidator = require('./contract-consolidator');

console.log('='.repeat(70));
console.log('Contract Consolidator Example');
console.log('='.repeat(70));
console.log('');

// Example 1: Basic usage with mock data
console.log('Example 1: Analyzing contracts with mock data\n');

const mockConsolidatedData = {
  totalAddresses: 2,
  uniqueTokens: 5,
  addresses: ['kushmanmb.eth', 'yaketh.eth'],
  tokens: [
    {
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      totalBalance: 1250.50,
      totalUsdValue: 1250.50,
      holders: ['kushmanmb.eth']
    },
    {
      tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      totalBalance: 0,
      totalUsdValue: 0,
      holders: []
    },
    {
      tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      tokenName: 'Wrapped Ether',
      tokenSymbol: 'WETH',
      totalBalance: 0.5,
      totalUsdValue: 1200.00,
      holders: ['yaketh.eth']
    },
    {
      tokenAddress: '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055',
      tokenName: 'Legacy Token',
      tokenSymbol: 'LEGACY',
      totalBalance: 0,
      totalUsdValue: 0,
      holders: []
    },
    {
      tokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      tokenName: 'Dai Stablecoin',
      tokenSymbol: 'DAI',
      totalBalance: 0.000001,
      totalUsdValue: 0.000001,
      holders: ['kushmanmb.eth']
    }
  ],
  timestamp: Date.now()
};

// Create consolidator instance
const consolidator = new ContractConsolidator({
  minBalanceThreshold: 0.001 // Consider balances below 0.001 as minimal
});

console.log('Analyzing contracts...\n');

// Analyze contracts
const analysis = consolidator.analyzeContracts(mockConsolidatedData);

console.log(`Total Contracts: ${analysis.totalContracts}`);
console.log(`Active Contracts: ${analysis.activeContracts.length}`);
console.log(`Zero Balance Contracts: ${analysis.zeroBalanceContracts.length}`);
console.log(`Minimal Balance Contracts: ${analysis.minimalBalanceContracts.length}`);
console.log('');

// Display recommendations
console.log('Recommendations:');
console.log('-'.repeat(70));
if (analysis.recommendations.length > 0) {
  analysis.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. [${rec.action.toUpperCase()}] ${rec.tokenName} (${rec.tokenSymbol})`);
    console.log(`   Address: ${rec.tokenAddress}`);
    console.log(`   Reason: ${rec.reason}`);
    console.log(`   Priority: ${rec.priority}, Impact: ${rec.impact}`);
    console.log('');
  });
} else {
  console.log('No recommendations - all contracts have active balances.');
}
console.log('');

// Example 2: Generate full report
console.log('Example 2: Generating consolidation report\n');
console.log('-'.repeat(70));
const report = consolidator.generateReport(analysis);
console.log(report);
console.log('-'.repeat(70));
console.log('');

// Example 3: Dry run deprecation
console.log('Example 3: Dry run deprecation (preview only)\n');

const deprecateRecs = analysis.recommendations.filter(r => r.action === 'deprecate');
if (deprecateRecs.length > 0) {
  console.log(`Found ${deprecateRecs.length} contract(s) recommended for deprecation`);
  console.log('Running dry run to preview changes...\n');
  
  const dryRunResults = consolidator.applyDeprecations(deprecateRecs, true);
  const formattedResults = consolidator.formatDeprecationResults(dryRunResults);
  console.log(formattedResults);
} else {
  console.log('No contracts recommended for deprecation.');
}

// Example 4: Different threshold scenarios
console.log('\nExample 4: Impact of different thresholds\n');

const thresholds = [0, 0.001, 0.01, 0.1, 1.0];

console.log('Threshold Analysis:');
console.log('-'.repeat(70));
console.log('Threshold | Active | Zero Balance | Minimal Balance');
console.log('-'.repeat(70));

thresholds.forEach(threshold => {
  const testConsolidator = new ContractConsolidator({ minBalanceThreshold: threshold });
  const testAnalysis = testConsolidator.analyzeContracts(mockConsolidatedData);
  
  console.log(
    `${threshold.toString().padEnd(9)} | ` +
    `${testAnalysis.activeContracts.length.toString().padEnd(6)} | ` +
    `${testAnalysis.zeroBalanceContracts.length.toString().padEnd(12)} | ` +
    `${testAnalysis.minimalBalanceContracts.length}`
  );
});

console.log('\n' + '='.repeat(70));
console.log('Usage Instructions:');
console.log('='.repeat(70));
console.log(`
1. Integrate with Address Consolidator:
   const { AddressConsolidator } = require('./address-consolidator');
   const consolidator = new AddressConsolidator();
   const consolidated = await consolidator.fetchConsolidatedBalances();

2. Analyze contracts:
   const contractConsolidator = new ContractConsolidator();
   const analysis = contractConsolidator.analyzeContracts(consolidated);

3. Review recommendations:
   const report = contractConsolidator.generateReport(analysis);
   console.log(report);

4. Apply deprecations (dry run first):
   const dryRun = contractConsolidator.applyDeprecations(null, true);
   console.log(contractConsolidator.formatDeprecationResults(dryRun));

5. Apply actual deprecations:
   const results = contractConsolidator.applyDeprecations(null, false);
   console.log(contractConsolidator.formatDeprecationResults(results));
`);

console.log('Example completed successfully!\n');
