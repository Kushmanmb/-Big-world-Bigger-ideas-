/**
 * Blockchair Multi-Chain Module Example
 * Demonstrates usage of the Blockchair API across multiple blockchains
 */

const BlockchairFetcher = require('./blockchair.js');

async function runExamples() {
  console.log('🌐 Blockchair Multi-Chain API Demo\n');
  console.log('='.repeat(70));

  try {
    // Example 1: Bitcoin blockchain
    console.log('\n📊 Example 1: Bitcoin Blockchain Statistics');
    console.log('-'.repeat(70));
    const btcFetcher = new BlockchairFetcher('bitcoin');
    console.log(`Fetcher created for chain: ${btcFetcher.chain}`);
    console.log('Note: Actual API calls are commented out to avoid rate limits');
    console.log('Uncomment to make real API requests\n');
    
    // Uncomment to make actual API call:
    // const btcStats = await btcFetcher.getStats();
    // console.log(btcFetcher.formatStats(btcStats));

    // Example 2: Ethereum blockchain
    console.log('\n📊 Example 2: Ethereum Blockchain');
    console.log('-'.repeat(70));
    const ethFetcher = new BlockchairFetcher('ethereum');
    console.log(`Fetcher created for chain: ${ethFetcher.chain}`);
    
    // Uncomment to make actual API call:
    // const ethStats = await ethFetcher.getStats();
    // console.log(ethFetcher.formatStats(ethStats));

    // Example 3: Get transaction information
    console.log('\n📝 Example 3: Transaction Dashboard (Primary Feature)');
    console.log('-'.repeat(70));
    const txFetcher = new BlockchairFetcher('bitcoin');
    console.log('API Endpoint: /{chain}/dashboards/transaction/{hash}');
    console.log('Example hash: a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d\n');
    
    // Uncomment to make actual API call:
    // const txHash = 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d';
    // const txInfo = await txFetcher.getTransaction(txHash);
    // console.log(txFetcher.formatTransaction(txInfo));

    // Example 4: Multiple chains
    console.log('\n🔗 Example 4: Working with Multiple Chains');
    console.log('-'.repeat(70));
    const chains = ['bitcoin', 'ethereum', 'litecoin', 'dogecoin'];
    console.log('Supported chains include:');
    chains.forEach(chain => {
      const fetcher = new BlockchairFetcher(chain);
      console.log(`  ✓ ${chain.charAt(0).toUpperCase() + chain.slice(1)}`);
    });
    
    // Example 5: Get block information
    console.log('\n🧱 Example 5: Block Information');
    console.log('-'.repeat(70));
    const blockFetcher = new BlockchairFetcher('bitcoin');
    console.log('API Endpoint: /{chain}/dashboards/block/{id}');
    console.log('Example: Block 800000\n');
    
    // Uncomment to make actual API call:
    // const blockInfo = await blockFetcher.getBlock(800000);
    // console.log(blockFetcher.formatBlock(blockInfo));

    // Example 6: Get address information
    console.log('\n💼 Example 6: Address Information');
    console.log('-'.repeat(70));
    const addressFetcher = new BlockchairFetcher('bitcoin');
    console.log('API Endpoint: /{chain}/dashboards/address/{address}');
    console.log('Example: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\n');
    
    // Uncomment to make actual API call:
    // const addressInfo = await addressFetcher.getAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
    // console.log(addressFetcher.formatAddress(addressInfo));

    // Example 7: Cache management
    console.log('\n💾 Example 7: Cache Management');
    console.log('-'.repeat(70));
    const cacheFetcher = new BlockchairFetcher('bitcoin');
    const cacheStats = cacheFetcher.getCacheStats();
    console.log('Cache Statistics:');
    console.log(`  Chain: ${cacheStats.chain}`);
    console.log(`  Size: ${cacheStats.size} entries`);
    console.log(`  Timeout: ${cacheStats.timeout / 1000} seconds`);
    console.log(`  Keys: ${cacheStats.keys.length > 0 ? cacheStats.keys.join(', ') : 'None'}`);

    // Example 8: List supported chains
    console.log('\n🌍 Example 8: All Supported Chains');
    console.log('-'.repeat(70));
    const allChains = new BlockchairFetcher('bitcoin').getSupportedChains();
    console.log('Blockchair API supports the following chains:');
    allChains.forEach((chain, index) => {
      console.log(`  ${index + 1}. ${chain}`);
    });

    // Example 9: Error handling
    console.log('\n⚠️  Example 9: Error Handling');
    console.log('-'.repeat(70));
    console.log('Demonstrating input validation:\n');
    
    try {
      const errorFetcher = new BlockchairFetcher('bitcoin');
      await errorFetcher.getTransaction('invalid_hash');
    } catch (error) {
      console.log(`✓ Caught expected error: ${error.message}`);
    }

    try {
      const errorFetcher = new BlockchairFetcher('bitcoin');
      await errorFetcher.getBlock('');
    } catch (error) {
      console.log(`✓ Caught expected error: ${error.message}`);
    }

    try {
      const errorFetcher = new BlockchairFetcher('bitcoin');
      await errorFetcher.getRecentBlocks(101);
    } catch (error) {
      console.log(`✓ Caught expected error: ${error.message}`);
    }

    // Example 10: Transaction hash formats
    console.log('\n🔑 Example 10: Transaction Hash Formats');
    console.log('-'.repeat(70));
    console.log('Valid transaction hash formats:');
    console.log('  Bitcoin: 64 hexadecimal characters');
    console.log('  Example: a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d\n');
    console.log('  Ethereum: 64 hexadecimal characters (with optional 0x prefix)');
    console.log('  Example: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');

    // Example 11: Usage patterns
    console.log('\n📚 Example 11: Common Usage Patterns');
    console.log('-'.repeat(70));
    console.log(`
// Pattern 1: Quick transaction lookup
const fetcher = new BlockchairFetcher('bitcoin');
const tx = await fetcher.getTransaction(txHash);
console.log(fetcher.formatTransaction(tx));

// Pattern 2: Monitor multiple chains
const btc = new BlockchairFetcher('bitcoin');
const eth = new BlockchairFetcher('ethereum');
const [btcData, ethData] = await Promise.all([
  btc.getStats(),
  eth.getStats()
]);

// Pattern 3: Cache-aware fetching
const fetcher = new BlockchairFetcher('bitcoin');
const data1 = await fetcher.getTransaction(hash); // API call
const data2 = await fetcher.getTransaction(hash); // From cache
fetcher.clearCache(); // Clear when needed
`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ Demo completed successfully!');
    console.log('\nTo make actual API calls:');
    console.log('1. Uncomment the API call lines in this file');
    console.log('2. Run: node src/blockchair-example.js');
    console.log('3. Be mindful of API rate limits (30 requests/minute for free tier)\n');

  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the examples
if (require.main === module) {
  runExamples();
}

module.exports = runExamples;
