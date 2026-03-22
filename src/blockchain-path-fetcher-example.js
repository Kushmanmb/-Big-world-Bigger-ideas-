/**
 * Example usage of Blockchain Path Fetcher Module
 * Demonstrates fetching blockchain data for paths relevant to kushmanmb.eth
 */

const { BlockchainPathFetcher, DEFAULT_OWNER } = require('./blockchain-path-fetcher');

async function runExamples() {
  console.log('Blockchain Path Fetcher Examples');
  console.log('='.repeat(60));
  console.log(`Default owner: ${DEFAULT_OWNER}\n`);

  const fetcher = new BlockchainPathFetcher();

  // Example 1: List all relevant paths
  console.log('Example 1: Relevant API Paths for kushmanmb.eth');
  console.log('-'.repeat(60));
  const paths = fetcher.getRelevantPaths();
  const keys = fetcher.getPathKeys();
  console.log(`Found ${keys.length} paths:\n`);
  keys.forEach(key => {
    console.log(`  [${key}] ${paths[key]}`);
  });
  console.log();

  // Example 2: Fetch a single path (stats)
  console.log('Example 2: Fetch Ethereum Statistics');
  console.log('-'.repeat(60));
  try {
    const stats = await fetcher.getStats();
    const inner = stats.data || stats;
    console.log(`Latest Block: ${inner.blocks ? inner.blocks.toLocaleString() : 'N/A'}`);
    if (inner.market_price_usd) {
      console.log(`ETH Price: $${inner.market_price_usd.toFixed(2)} USD`);
    }
    console.log('Fetch succeeded.\n');
  } catch (error) {
    console.log(`Note: Unable to fetch stats: ${error.message}`);
    console.log('This is expected in environments without internet access.\n');
  }

  // Example 3: Fetch owner address data
  console.log(`Example 3: Fetch Address Data for ${fetcher.owner}`);
  console.log('-'.repeat(60));
  try {
    const addressData = await fetcher.getOwnerAddress();
    const inner = addressData.data || addressData;
    const firstKey = Object.keys(inner)[0];
    const addr = inner[firstKey] || {};
    if (addr.balance !== undefined) {
      console.log(`Balance: ${(addr.balance / 1e18).toFixed(6)} ETH`);
    }
    if (addr.transaction_count !== undefined) {
      console.log(`Transactions: ${addr.transaction_count.toLocaleString()}`);
    }
    console.log('Fetch succeeded.\n');
  } catch (error) {
    console.log(`Note: Unable to fetch address data: ${error.message}`);
    console.log('This is expected in environments without internet access.\n');
  }

  // Example 4: Fetch all paths at once
  console.log('Example 4: Fetch All Paths Concurrently');
  console.log('-'.repeat(60));
  try {
    const results = await fetcher.fetchAllPaths();
    const pathKeys = Object.keys(results);
    pathKeys.forEach(key => {
      const val = results[key];
      const status = val instanceof Error ? `Error: ${val.message}` : 'OK';
      console.log(`  [${key}] ${status}`);
    });
    console.log();

    // Example 5: Format all results
    console.log('Example 5: Formatted Report');
    console.log('-'.repeat(60));
    console.log(fetcher.formatResults(results));
    console.log();
  } catch (error) {
    console.log(`Note: Unable to fetch all paths: ${error.message}`);
    console.log('This is expected in environments without internet access.\n');
  }

  // Example 6: Using a different owner
  console.log('Example 6: Custom Owner (yaketh.eth)');
  console.log('-'.repeat(60));
  const yakethFetcher = new BlockchainPathFetcher('yaketh.eth');
  const yakethPaths = yakethFetcher.getRelevantPaths();
  console.log(`Address path: ${yakethPaths.address}`);
  console.log();

  // Example 7: Cache statistics
  console.log('Example 7: Cache Statistics');
  console.log('-'.repeat(60));
  const cacheStats = fetcher.getCacheStats();
  console.log(`Cache size: ${cacheStats.size} entries`);
  console.log(`Cache timeout: ${cacheStats.timeout / 1000}s`);
  console.log(`Owner: ${cacheStats.owner}`);
  console.log(`Cached keys: [${cacheStats.keys.join(', ')}]`);
  console.log();
}

runExamples().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
