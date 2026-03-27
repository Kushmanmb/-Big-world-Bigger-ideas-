/**
 * Example usage of Ethereum Blockchair Module
 * Demonstrates fetching data for kushmanmb.eth and other Ethereum addresses
 */

const EthereumBlockchairFetcher = require('./ethereum-blockchair.js');

async function runExamples() {
  console.log('='.repeat(60));
  console.log('Ethereum Blockchair Module - Example Usage');
  console.log('='.repeat(60));
  console.log();

  // Create a fetcher instance
  const fetcher = new EthereumBlockchairFetcher();

  try {
    // Example 1: Fetch Ethereum blockchain statistics
    console.log('Example 1: Fetching Ethereum Blockchain Statistics');
    console.log('-'.repeat(60));
    try {
      const stats = await fetcher.getStats();
      console.log(fetcher.formatStats(stats));
    } catch (error) {
      console.log(`Note: Unable to fetch real stats: ${error.message}`);
      console.log('This is expected in environments without internet access.\n');
    }

    // Example 2: Fetch address information for kushmanmb.eth
    console.log('\nExample 2: Fetching Address Info for kushmanmb.eth');
    console.log('-'.repeat(60));
    try {
      const addressData = await fetcher.getAddress('kushmanmb.eth');
      console.log(fetcher.formatAddress(addressData));
    } catch (error) {
      console.log(`Note: Unable to fetch address data: ${error.message}`);
      console.log('This is expected in environments without internet access.\n');
    }

    // Example 3: Fetch ERC-20 token balances for kushmanmb.eth
    console.log('\nExample 3: Fetching Token Balances for kushmanmb.eth');
    console.log('-'.repeat(60));
    try {
      const tokenData = await fetcher.getTokenBalances('kushmanmb.eth');
      console.log(fetcher.formatTokenBalances(tokenData));
    } catch (error) {
      console.log(`Note: Unable to fetch token data: ${error.message}`);
      console.log('This is expected in environments without internet access.\n');
    }

    // Example 4: Fetch a specific block
    console.log('\nExample 4: Fetching Specific Block Information');
    console.log('-'.repeat(60));
    try {
      const block = await fetcher.getBlock(18000000);
      console.log(fetcher.formatBlock(block));
    } catch (error) {
      console.log(`Note: Unable to fetch block data: ${error.message}`);
      console.log('This is expected in environments without internet access.\n');
    }

    // Example 5: Fetch recent blocks
    console.log('\nExample 5: Fetching Recent Blocks');
    console.log('-'.repeat(60));
    try {
      const recentBlocks = await fetcher.getRecentBlocks(5);
      console.log('Recent blocks fetched successfully.');
      if (recentBlocks.data && Array.isArray(recentBlocks.data)) {
        console.log(`Total blocks returned: ${recentBlocks.data.length}`);
        recentBlocks.data.forEach((block, index) => {
          console.log(`  Block ${index + 1}: Height ${block.id}, Txs: ${block.transaction_count}`);
        });
      }
      console.log();
    } catch (error) {
      console.log(`Note: Unable to fetch recent blocks: ${error.message}`);
      console.log('This is expected in environments without internet access.\n');
    }

    // Example 6: Demonstrate cache functionality
    console.log('\nExample 6: Cache Management');
    console.log('-'.repeat(60));
    const cacheStats = fetcher.getCacheStats();
    console.log('Cache Statistics:');
    console.log(`  Size: ${cacheStats.size} entries`);
    console.log(`  Timeout: ${cacheStats.timeout}ms`);
    if (cacheStats.keys.length > 0) {
      console.log('  Cached keys:');
      cacheStats.keys.forEach(key => console.log(`    - ${key}`));
    } else {
      console.log('  No cached entries (network calls may have failed)');
    }
    console.log();

    // Example 7: Address validation
    console.log('\nExample 7: Address Validation');
    console.log('-'.repeat(60));
    const testAddresses = [
      'kushmanmb.eth',
      'vitalik.eth',
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      'invalid-address',
      '0x123'
    ];

    testAddresses.forEach(address => {
      const isValid = fetcher._isValidEthereumAddress(address);
      console.log(`  ${address}: ${isValid ? '✓ Valid' : '✗ Invalid'}`);
    });
    console.log();

    // Example 8: Transaction hash validation
    console.log('\nExample 8: Transaction Hash Format Validation');
    console.log('-'.repeat(60));
    const testHashes = [
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      'invalid-hash',
      '0x123'
    ];

    testHashes.forEach(hash => {
      try {
        const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;
        const isValid = cleanHash.match(/^[a-fA-F0-9]{64}$/) !== null;
        console.log(`  ${hash.substring(0, 20)}...: ${isValid ? '✓ Valid' : '✗ Invalid'}`);
      } catch (error) {
        console.log(`  ${hash}: ✗ Invalid`);
      }
    });
    console.log();

    // Example 9: Multiple ENS names
    console.log('\nExample 9: Working with Different ENS Names');
    console.log('-'.repeat(60));
    const ensNames = ['kushmanmb.eth', 'vitalik.eth', 'brantly.eth'];
    
    console.log('Supported ENS names:');
    ensNames.forEach(name => {
      console.log(`  - ${name}`);
    });
    console.log('\nNote: All .eth ENS names are supported by the API.');
    console.log('      The API will resolve them to Ethereum addresses.');
    console.log();

    // Clear cache at the end
    console.log('\nCleaning up...');
    fetcher.clearCache();
    console.log('Cache cleared.');

  } catch (error) {
    console.error('An unexpected error occurred:', error.message);
  }

  console.log();
  console.log('='.repeat(60));
  console.log('Examples completed!');
  console.log('='.repeat(60));
  console.log();
  console.log('Usage Notes:');
  console.log('- The module supports both Ethereum addresses (0x...) and ENS names (.eth)');
  console.log('- Data is cached for 60 seconds to reduce API calls');
  console.log('- All API calls include timeout protection (10 seconds)');
  console.log('- kushmanmb.eth is automatically resolved by the Blockchair API');
  console.log();
  console.log('For more information, see: https://blockchair.com/api/docs');
}

// Run the examples
runExamples().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
