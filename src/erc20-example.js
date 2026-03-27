/**
 * ERC-20 Token Balance Fetcher Example
 * Demonstrates usage of the ERC-20 token balance fetcher module
 */

const ERC20Fetcher = require('./erc20.js');

async function runExamples() {
  console.log('\n' + '='.repeat(70));
  console.log('ERC-20 Token Balance Fetcher Demo');
  console.log('='.repeat(70) + '\n');

  // Create a new fetcher instance
  const fetcher = new ERC20Fetcher();

  // Example 1: Validate addresses
  console.log('Example 1: Address Validation\n');
  
  try {
    const address1 = fetcher.validateAddress('0x1234567890123456789012345678901234567890');
    console.log(`✓ Valid address: ${address1}`);
    
    const address2 = fetcher.validateAddress('1234567890123456789012345678901234567890');
    console.log(`✓ Valid address (normalized): ${address2}`);
    
    const ens = fetcher.validateAddress('kushmanmb.eth');
    console.log(`✓ Valid ENS name: ${ens}`);
  } catch (error) {
    console.error(`✗ Validation error: ${error.message}`);
  }

  console.log('\n' + '-'.repeat(70) + '\n');

  // Example 2: Get ERC-20 ABIs
  console.log('Example 2: ERC-20 Standard ABIs\n');
  
  const balanceOfABI = ERC20Fetcher.getABI('balanceOf');
  console.log('balanceOf ABI:', JSON.stringify(balanceOfABI, null, 2));
  
  const symbolABI = ERC20Fetcher.getABI('symbol');
  console.log('\nsymbol ABI:', JSON.stringify(symbolABI, null, 2));

  console.log('\n' + '-'.repeat(70) + '\n');

  // Example 3: Get all ABIs
  console.log('Example 3: All ERC-20 ABIs\n');
  
  const allABIs = ERC20Fetcher.getAllABIs();
  console.log('Available ERC-20 functions:');
  Object.keys(allABIs).forEach(func => {
    console.log(`  - ${func} (${allABIs[func].signature})`);
  });

  console.log('\n' + '-'.repeat(70) + '\n');

  // Example 4: Format empty token data
  console.log('Example 4: Format Empty Token Balances\n');
  
  const emptyData = {
    address: '0x0000000000000000000000000000000000000000',
    tokenCount: 0,
    tokens: [],
    timestamp: Date.now()
  };
  
  console.log(fetcher.formatTokenBalances(emptyData));

  console.log('-'.repeat(70) + '\n');

  // Example 5: Format sample token data
  console.log('Example 5: Format Sample Token Balances\n');
  
  const sampleData = {
    address: '0x1234567890123456789012345678901234567890',
    tokenCount: 3,
    tokens: [
      {
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        tokenName: 'USD Coin',
        tokenSymbol: 'USDC',
        tokenDecimals: 6,
        balance: '1000000000',
        usdValue: 1000.00
      },
      {
        tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        tokenName: 'Tether USD',
        tokenSymbol: 'USDT',
        tokenDecimals: 6,
        balance: '500000000',
        usdValue: 500.00
      },
      {
        tokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        tokenName: 'Dai Stablecoin',
        tokenSymbol: 'DAI',
        tokenDecimals: 18,
        balance: '250000000000000000000',
        usdValue: 250.00
      }
    ],
    timestamp: Date.now()
  };
  
  console.log(fetcher.formatTokenBalances(sampleData));

  console.log('-'.repeat(70) + '\n');

  // Example 6: Format consolidated token data
  console.log('Example 6: Format Consolidated Token Balances\n');
  
  const consolidatedData = {
    addresses: [
      '0x1234567890123456789012345678901234567890',
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
    ],
    totalAddresses: 2,
    uniqueTokens: 2,
    tokens: [
      {
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        tokenName: 'USD Coin',
        tokenSymbol: 'USDC',
        tokenDecimals: 6,
        totalBalance: 1500,
        totalUsdValue: 1500.00,
        holders: [
          {
            address: '0x1234567890123456789012345678901234567890',
            balance: '1000',
            usdValue: 1000.00
          },
          {
            address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            balance: '500',
            usdValue: 500.00
          }
        ]
      },
      {
        tokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        tokenName: 'Dai Stablecoin',
        tokenSymbol: 'DAI',
        tokenDecimals: 18,
        totalBalance: 750,
        totalUsdValue: 750.00,
        holders: [
          {
            address: '0x1234567890123456789012345678901234567890',
            balance: '750',
            usdValue: 750.00
          }
        ]
      }
    ],
    timestamp: Date.now()
  };
  
  console.log(fetcher.formatConsolidatedTokens(consolidatedData));

  console.log('-'.repeat(70) + '\n');

  // Example 7: Cache statistics
  console.log('Example 7: Cache Information\n');
  
  const cacheStats = fetcher.getCacheStats();
  console.log('Cache Statistics:');
  console.log(`  Size: ${cacheStats.size} items`);
  console.log(`  Timeout: ${cacheStats.timeout}ms`);
  console.log(`  Keys: ${cacheStats.keys.length > 0 ? cacheStats.keys.join(', ') : '(empty)'}`);

  console.log('\n' + '='.repeat(70));
  console.log('Demo Complete!');
  console.log('='.repeat(70) + '\n');

  console.log('Note: To fetch real data, use:');
  console.log('  const balances = await fetcher.getTokenBalances("kushmanmb.eth");');
  console.log('  console.log(fetcher.formatTokenBalances(balances));');
  console.log('\nOr to consolidate multiple addresses:');
  console.log('  const addresses = ["kushmanmb.eth", "yaketh.eth"];');
  console.log('  const consolidated = await fetcher.consolidateTokens(addresses);');
  console.log('  console.log(fetcher.formatConsolidatedTokens(consolidated));\n');
}

// Run the examples
runExamples().catch(error => {
  console.error('\n❌ Error running examples:', error.message);
  process.exit(1);
});
