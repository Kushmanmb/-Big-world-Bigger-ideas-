/**
 * Contract Consolidator Module Tests
 * Tests for contract consolidation and deprecation functionality
 */

const ContractConsolidator = require('./contract-consolidator');
const path = require('path');

// Test utilities
let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✓ ${testName}`);
    passCount++;
  } else {
    console.log(`✗ ${testName}`);
    failCount++;
  }
}

function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`✓ ${testName}`);
    passCount++;
  } else {
    console.log(`✗ ${testName}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual: ${actual}`);
    failCount++;
  }
}

// Mock consolidated data for testing
const mockConsolidatedData = {
  totalAddresses: 2,
  uniqueTokens: 4,
  addresses: ['0x1234...', '0x5678...'],
  tokens: [
    {
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      totalBalance: 100.5,
      totalUsdValue: 100.5,
      holders: ['0x1234...']
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
      totalBalance: 0.000001,
      totalUsdValue: 0.003,
      holders: ['0x5678...']
    },
    {
      tokenAddress: '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055',
      tokenName: 'Test Token',
      tokenSymbol: 'TEST',
      totalBalance: 0,
      totalUsdValue: 0,
      holders: []
    }
  ],
  timestamp: Date.now()
};

// Test: Constructor
console.log('\n=== Constructor Tests ===');
try {
  const consolidator = new ContractConsolidator();
  assert(consolidator.minBalanceThreshold === 0, 'Constructor sets default threshold');
  assert(consolidator.recommendations.length === 0, 'Constructor initializes empty recommendations');
} catch (error) {
  console.log(`✗ Constructor test failed: ${error.message}`);
  failCount++;
}

// Test: Constructor with custom options
console.log('\n=== Constructor Options Tests ===');
try {
  const consolidator = new ContractConsolidator({
    minBalanceThreshold: 0.001,
    tokenManagersPath: '/custom/path/token-managers.json'
  });
  assertEqual(consolidator.minBalanceThreshold, 0.001, 'Constructor accepts custom threshold');
  assert(consolidator.tokenManagersPath.includes('custom'), 'Constructor accepts custom path');
} catch (error) {
  console.log(`✗ Constructor options test failed: ${error.message}`);
  failCount++;
}

// Test: analyzeContracts with valid data
console.log('\n=== Contract Analysis Tests ===');
try {
  const consolidator = new ContractConsolidator();
  const analysis = consolidator.analyzeContracts(mockConsolidatedData);
  
  assert(analysis.totalContracts === 4, 'Analysis counts total contracts correctly');
  // With threshold 0, any balance > 0 is considered active (USDC: 100.5 and WETH: 0.000001)
  assert(analysis.activeContracts.length === 2, 'Analysis identifies active contracts with any positive balance');
  assert(analysis.zeroBalanceContracts.length === 2, 'Analysis identifies zero balance contracts (USDT, TEST)');
  assert(analysis.minimalBalanceContracts.length === 0, 'Analysis identifies no minimal balance with threshold 0');
  assert(analysis.timestamp > 0, 'Analysis includes timestamp');
  assert(Array.isArray(analysis.recommendations), 'Analysis includes recommendations');
} catch (error) {
  console.log(`✗ Analysis test failed: ${error.message}`);
  failCount++;
}

// Test: analyzeContracts with threshold
console.log('\n=== Analysis with Threshold Tests ===');
try {
  const consolidator = new ContractConsolidator({ minBalanceThreshold: 0.01 });
  const analysis = consolidator.analyzeContracts(mockConsolidatedData);
  
  // WETH (0.000001) should now be in minimal balance since it's below 0.01
  assert(analysis.minimalBalanceContracts.length === 1, 'Threshold affects minimal balance classification');
  assert(analysis.activeContracts.length === 1, 'Active contracts correctly identified with threshold');
} catch (error) {
  console.log(`✗ Threshold analysis test failed: ${error.message}`);
  failCount++;
}

// Test: Recommendations generation
console.log('\n=== Recommendations Tests ===');
try {
  const consolidator = new ContractConsolidator({ minBalanceThreshold: 0.001 });
  const analysis = consolidator.analyzeContracts(mockConsolidatedData);
  
  const deprecateRecs = analysis.recommendations.filter(r => r.action === 'deprecate');
  const reviewRecs = analysis.recommendations.filter(r => r.action === 'review');
  
  assert(deprecateRecs.length === 2, 'Generates deprecate recommendations for zero balance contracts');
  assert(reviewRecs.length === 1, 'Generates review recommendations for minimal balance contracts (WETH < 0.001)');
  
  // Check recommendation structure
  const firstRec = deprecateRecs[0];
  assert(firstRec.tokenAddress !== undefined, 'Recommendation includes token address');
  assert(firstRec.action === 'deprecate', 'Recommendation includes action');
  assert(firstRec.reason !== undefined, 'Recommendation includes reason');
  assert(firstRec.priority !== undefined, 'Recommendation includes priority');
} catch (error) {
  console.log(`✗ Recommendations test failed: ${error.message}`);
  failCount++;
}

// Test: Invalid data handling
console.log('\n=== Error Handling Tests ===');
try {
  const consolidator = new ContractConsolidator();
  
  try {
    consolidator.analyzeContracts(null);
    console.log('✗ Should throw error for null data');
    failCount++;
  } catch (error) {
    assert(error.message.includes('Invalid consolidated data'), 'Throws error for null data');
  }
  
  try {
    consolidator.analyzeContracts({});
    console.log('✗ Should throw error for missing tokens');
    failCount++;
  } catch (error) {
    assert(error.message.includes('tokens array is required'), 'Throws error for missing tokens array');
  }
} catch (error) {
  console.log(`✗ Error handling test failed: ${error.message}`);
  failCount++;
}

// Test: Report generation
console.log('\n=== Report Generation Tests ===');
try {
  const consolidator = new ContractConsolidator({ minBalanceThreshold: 0.001 });
  const analysis = consolidator.analyzeContracts(mockConsolidatedData);
  const report = consolidator.generateReport(analysis);
  
  assert(report.includes('Contract Consolidation Analysis Report'), 'Report includes title');
  assert(report.includes('Total Contracts Analyzed'), 'Report includes summary');
  assert(report.includes('DEPRECATE'), 'Report includes deprecation section');
  assert(report.includes('REVIEW'), 'Report includes review section (when threshold creates minimal balances)');
  assert(report.includes('Active Contracts'), 'Report includes active contracts section');
  assert(typeof report === 'string', 'Report is a string');
  assert(report.length > 100, 'Report has substantial content');
} catch (error) {
  console.log(`✗ Report generation test failed: ${error.message}`);
  failCount++;
}

// Test: Dry run deprecation (without actual file changes)
console.log('\n=== Dry Run Deprecation Tests ===');
try {
  const consolidator = new ContractConsolidator();
  consolidator.analyzeContracts(mockConsolidatedData);
  
  // Filter for deprecate recommendations
  const deprecateRecs = consolidator.recommendations.filter(r => r.action === 'deprecate');
  
  // Perform dry run (won't modify files)
  const results = consolidator.applyDeprecations(deprecateRecs, true);
  
  assert(results.dryRun === true, 'Dry run flag is set');
  assert(typeof results.success === 'boolean', 'Results include success flag');
  assert(Array.isArray(results.deprecated) || Array.isArray(results.skipped), 'Results include action lists');
} catch (error) {
  console.log(`✗ Dry run test failed: ${error.message}`);
  failCount++;
}

// Test: Empty recommendations
console.log('\n=== Empty Recommendations Tests ===');
try {
  const consolidator = new ContractConsolidator();
  const emptyData = {
    tokens: [
      {
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        tokenName: 'USD Coin',
        tokenSymbol: 'USDC',
        totalBalance: 100,
        holders: ['0x1234...']
      }
    ]
  };
  
  const analysis = consolidator.analyzeContracts(emptyData);
  assert(analysis.zeroBalanceContracts.length === 0, 'No zero balance contracts when all have balances');
  assert(analysis.recommendations.filter(r => r.action === 'deprecate').length === 0, 'No deprecate recommendations when all contracts active');
} catch (error) {
  console.log(`✗ Empty recommendations test failed: ${error.message}`);
  failCount++;
}

// Test: Deprecation results formatting
console.log('\n=== Results Formatting Tests ===');
try {
  const consolidator = new ContractConsolidator();
  
  const mockResults = {
    success: true,
    deprecated: [
      {
        tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        tokenName: 'Tether USD',
        tokenSymbol: 'USDT',
        reason: 'Zero balance across all addresses'
      }
    ],
    skipped: [],
    errors: [],
    dryRun: true
  };
  
  const formatted = consolidator.formatDeprecationResults(mockResults);
  
  assert(formatted.includes('DRY RUN'), 'Formatted output indicates dry run');
  assert(formatted.includes('Deprecated'), 'Formatted output shows deprecated count');
  assert(formatted.includes('USDT'), 'Formatted output includes token details');
  assert(typeof formatted === 'string', 'Formatted output is a string');
} catch (error) {
  console.log(`✗ Results formatting test failed: ${error.message}`);
  failCount++;
}

// Summary
console.log('\n' + '='.repeat(70));
console.log(`Total Tests: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n✅ All tests passed!');
  process.exit(0);
} else {
  console.log(`\n❌ ${failCount} test(s) failed`);
  process.exit(1);
}
