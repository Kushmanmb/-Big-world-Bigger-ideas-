/**
 * Git Fetch Rewards Example
 * Demonstrates how to use the GitFetchRewards module
 */

const { GitFetchRewards } = require('./git-fetch-rewards');

async function runExample() {
  console.log('🌏 Big World Bigger Ideas — Git Fetch Rewards Example\n');
  console.log('='.repeat(60));

  const gfr = new GitFetchRewards();

  // -------------------------------------------------------------------------
  // Example 1: Inject sample Bitcoin commits and display logs
  // -------------------------------------------------------------------------
  console.log('\n📊 Example 1: Bitcoin block rewards (sample data)\n');
  console.log('='.repeat(60));

  // Sample data uses BTC units for avgRewards, matching mempool reward docs/examples
  const sampleBtcData = [
    { timestamp: 1609459200, blockHeight: 665000, avgRewards: 6.25, blockCount: 144 },
    { timestamp: 1609545600, blockHeight: 665144, avgRewards: 6.24875, blockCount: 143 },
    { timestamp: 1609632000, blockHeight: 665287, avgRewards: 6.25125, blockCount: 145 }
  ];

  // Simulate what fetch() does internally without hitting the network
  const btcCommits = gfr._parseBitcoinRewards(sampleBtcData);
  gfr.commits.push(...btcCommits);

  console.log(`\n✓ Fetched ${btcCommits.length} Bitcoin reward commits\n`);
  console.log('git log:\n');
  console.log(gfr.log());

  // -------------------------------------------------------------------------
  // Example 2: Compact one-line log (git log --oneline)
  // -------------------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Example 2: Compact log (git log --oneline)\n');
  console.log(gfr.shortLog());

  // -------------------------------------------------------------------------
  // Example 3: Limit output (git log -1)
  // -------------------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log('\n🔍 Example 3: Latest commit only (git log -1)\n');
  console.log(gfr.log(1));

  // -------------------------------------------------------------------------
  // Example 4: Statistics
  // -------------------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log('\n📈 Example 4: Repository statistics\n');
  const stats = gfr.getStats();
  console.log(`Total commits : ${stats.totalCommits}`);
  for (const [src, info] of Object.entries(stats.bySource)) {
    const total = info.totalAmount.toFixed(8);
    console.log(`  ${src.padEnd(10)}: ${info.count} commit(s), ${total} ${info.unit} total`);
  }

  // -------------------------------------------------------------------------
  // Example 5: Live fetch from Bitcoin network (requires internet access)
  // -------------------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log('\n🌐 Example 5: Live fetch from mempool.space (1-week period)\n');
  try {
    const liveFetcher = new GitFetchRewards();
    const newCommits = await liveFetcher.fetch('bitcoin', '1w');
    console.log(`✓ Fetched ${newCommits.length} live Bitcoin reward commits\n`);
    console.log(liveFetcher.shortLog(5));
  } catch (error) {
    console.log(`⚠️  Note: ${error.message}`);
    console.log('This is expected in environments without internet access.');
  }

  // -------------------------------------------------------------------------
  // Example 6: Ethereum placeholder
  // -------------------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log('\n⟠  Example 6: Ethereum reward placeholder\n');
  try {
    const ethFetcher = new GitFetchRewards();
    const ethCommits = await ethFetcher.fetch('ethereum');
    console.log(`✓ Fetched ${ethCommits.length} Ethereum reward commit(s)\n`);
    console.log(ethFetcher.log());
  } catch (error) {
    console.log(`⚠️  Note: ${error.message}`);
  }

  // -------------------------------------------------------------------------
  // Example 7: Cache stats and clear
  // -------------------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log('\n💾 Example 7: Cache statistics\n');
  const cacheStats = gfr.getCacheStats();
  console.log(`Cache size    : ${cacheStats.size}`);
  console.log(`Cache timeout : ${cacheStats.timeout}ms`);
  gfr.clearCache();
  console.log('✓ Cache cleared');

  // -------------------------------------------------------------------------
  // Example 8: clearHistory()
  // -------------------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log('\n🧹 Example 8: Clear full history\n');
  gfr.clearHistory();
  console.log(gfr.log()); // Should indicate no commits

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Usage Tips:');
  console.log("  1. Create fetcher : const gfr = new GitFetchRewards()");
  console.log("  2. Fetch rewards  : await gfr.fetch('bitcoin', '1w')");
  console.log("  3. View full log  : gfr.log()");
  console.log("  4. View short log : gfr.shortLog()");
  console.log("  5. Get stats      : gfr.getStats()");
  console.log("  6. Clear history  : gfr.clearHistory()");
  console.log('\n✅ Example completed successfully!');
  console.log('='.repeat(60));
}

runExample().catch(error => {
  console.error('\n❌ Example failed:', error);
  process.exit(1);
});
