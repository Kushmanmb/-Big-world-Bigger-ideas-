/**
 * Git Fetch Rewards Module Tests
 * Tests for the GitFetchRewards and RewardCommit classes
 */

const { GitFetchRewards, RewardCommit } = require('./git-fetch-rewards');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    testsFailed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual:   ${JSON.stringify(actual)}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('Running Git Fetch Rewards Module Tests...\n');
  console.log('='.repeat(50));

  // -------------------------------------------------------------------------
  // RewardCommit tests
  // -------------------------------------------------------------------------

  console.log('\n📦 Testing RewardCommit construction...');
  try {
    const commit = new RewardCommit({
      source: 'bitcoin',
      timestamp: 1609459200,
      blockHeight: 665000,
      amount: '6.25',
      unit: 'BTC',
      extra: { blockCount: 144 }
    });
    assert(commit.source === 'bitcoin', 'Source is set correctly');
    assert(commit.timestamp === 1609459200, 'Timestamp is set correctly');
    assert(commit.blockHeight === 665000, 'Block height is set correctly');
    assert(commit.amount === '6.25', 'Amount is set correctly');
    assert(commit.unit === 'BTC', 'Unit is set correctly');
    assert(typeof commit.hash === 'string', 'Hash is generated');
    assert(commit.hash.length === 8, 'Hash is 8 characters');
  } catch (error) {
    assert(false, `RewardCommit construction failed: ${error.message}`);
  }

  console.log('\n📝 Testing RewardCommit.toGitLog()...');
  try {
    const commit = new RewardCommit({
      source: 'bitcoin',
      timestamp: 1609459200,
      blockHeight: 665000,
      amount: '6.25',
      unit: 'BTC'
    });
    const log = commit.toGitLog();
    assert(log.includes('commit'), 'toGitLog includes "commit"');
    assert(log.includes('Source: bitcoin'), 'toGitLog includes source');
    assert(log.includes('Date:'), 'toGitLog includes date');
    assert(log.includes('#665000'), 'toGitLog includes block height');
    assert(log.includes('6.25 BTC'), 'toGitLog includes amount and unit');
  } catch (error) {
    assert(false, `toGitLog test failed: ${error.message}`);
  }

  console.log('\n📋 Testing RewardCommit.toShortLog()...');
  try {
    const commit = new RewardCommit({
      source: 'ethereum',
      timestamp: 1609459200,
      blockHeight: 11565019,
      amount: '2.00',
      unit: 'ETH'
    });
    const short = commit.toShortLog();
    assert(typeof short === 'string', 'toShortLog returns a string');
    assert(short.includes('#11565019'), 'toShortLog includes block height');
    assert(short.includes('2.00 ETH'), 'toShortLog includes amount and unit');
    assert(short.includes('ethereum'), 'toShortLog includes source');
  } catch (error) {
    assert(false, `toShortLog test failed: ${error.message}`);
  }

  console.log('\n🔑 Testing RewardCommit hash determinism...');
  try {
    const params = {
      source: 'bitcoin',
      timestamp: 1609459200,
      blockHeight: 665000,
      amount: '6.25',
      unit: 'BTC'
    };
    const c1 = new RewardCommit(params);
    const c2 = new RewardCommit(params);
    assertEqual(c1.hash, c2.hash, 'Same inputs produce same hash');

    const c3 = new RewardCommit({ ...params, blockHeight: 665001 });
    assert(c1.hash !== c3.hash, 'Different inputs produce different hashes');
  } catch (error) {
    assert(false, `Hash determinism test failed: ${error.message}`);
  }

  // -------------------------------------------------------------------------
  // GitFetchRewards construction
  // -------------------------------------------------------------------------

  console.log('\n🏗️  Testing GitFetchRewards constructor (defaults)...');
  try {
    const gfr = new GitFetchRewards();
    assertEqual(gfr.bitcoinBaseUrl, 'mempool.space', 'Default Bitcoin base URL');
    assert(gfr.cache instanceof Map, 'Cache initialised as Map');
    assert(Array.isArray(gfr.commits), 'Commits initialised as array');
    assertEqual(gfr.commits.length, 0, 'No commits initially');
  } catch (error) {
    assert(false, `Constructor defaults failed: ${error.message}`);
  }

  console.log('\n🔧 Testing GitFetchRewards constructor (custom options)...');
  try {
    const gfr = new GitFetchRewards({ bitcoinBaseUrl: 'custom.mempool.space', cacheTimeout: 5000 });
    assertEqual(gfr.bitcoinBaseUrl, 'custom.mempool.space', 'Custom Bitcoin base URL');
    assertEqual(gfr.cacheTimeout, 5000, 'Custom cache timeout');
  } catch (error) {
    assert(false, `Custom constructor options failed: ${error.message}`);
  }

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  console.log('\n✅ Testing validatePeriod — valid periods...');
  try {
    const gfr = new GitFetchRewards();
    const validPeriods = ['1d', '3d', '1w', '1m', '3m', '6m', '1y', '2y', '3y', 'all'];
    for (const p of validPeriods) {
      assertEqual(gfr.validatePeriod(p), p, `Period '${p}' is valid`);
    }
  } catch (error) {
    assert(false, `Valid period test failed: ${error.message}`);
  }

  console.log('\n⚠️  Testing validatePeriod — invalid period...');
  try {
    const gfr = new GitFetchRewards();
    gfr.validatePeriod('5d');
    assert(false, 'Should have thrown for invalid period');
  } catch (error) {
    assert(error.message.includes('Invalid period'), 'Throws for invalid period');
  }

  console.log('\n✅ Testing validateSource — valid sources...');
  try {
    const gfr = new GitFetchRewards();
    assertEqual(gfr.validateSource('bitcoin'), 'bitcoin', "Source 'bitcoin' is valid");
    assertEqual(gfr.validateSource('ethereum'), 'ethereum', "Source 'ethereum' is valid");
  } catch (error) {
    assert(false, `Valid source test failed: ${error.message}`);
  }

  console.log('\n⚠️  Testing validateSource — invalid source...');
  try {
    const gfr = new GitFetchRewards();
    gfr.validateSource('litecoin');
    assert(false, 'Should have thrown for unsupported source');
  } catch (error) {
    assert(error.message.includes("Unsupported source"), 'Throws for unsupported source');
  }

  // -------------------------------------------------------------------------
  // fetch() with invalid source / period
  // -------------------------------------------------------------------------

  console.log('\n⚠️  Testing fetch() — invalid source...');
  try {
    const gfr = new GitFetchRewards();
    await gfr.fetch('dogecoin');
    assert(false, 'Should have thrown for unsupported source');
  } catch (error) {
    assert(error.message.includes('Unsupported source'), 'fetch() throws for unsupported source');
  }

  console.log('\n⚠️  Testing fetch() — invalid period...');
  try {
    const gfr = new GitFetchRewards();
    await gfr.fetch('bitcoin', '99d');
    assert(false, 'Should have thrown for invalid period');
  } catch (error) {
    assert(error.message.includes('Invalid period'), 'fetch() throws for invalid period');
  }

  // -------------------------------------------------------------------------
  // _parseBitcoinRewards
  // -------------------------------------------------------------------------

  console.log('\n🔍 Testing _parseBitcoinRewards with mock data...');
  try {
    const gfr = new GitFetchRewards();
    const mockData = [
      { timestamp: 1609459200, blockHeight: 665000, avgRewards: 6.25, blockCount: 144 },
      { timestamp: 1609372800, blockHeight: 664856, avgRewards: 6.25, blockCount: 143 }
    ];
    const commits = gfr._parseBitcoinRewards(mockData);
    assertEqual(commits.length, 2, 'Returns 2 commits for 2 entries');
    assert(commits[0] instanceof RewardCommit, 'Returns RewardCommit instances');
    assertEqual(commits[0].source, 'bitcoin', 'Source is bitcoin');
    assertEqual(commits[0].unit, 'BTC', 'Unit is BTC');
    assert(parseFloat(commits[0].amount) > 0, 'Amount is positive');
  } catch (error) {
    assert(false, `_parseBitcoinRewards test failed: ${error.message}`);
  }

  console.log('\n🚫 Testing _parseBitcoinRewards with non-array data...');
  try {
    const gfr = new GitFetchRewards();
    const commits = gfr._parseBitcoinRewards(null);
    assertEqual(commits.length, 0, 'Returns empty array for null input');
    const commits2 = gfr._parseBitcoinRewards({});
    assertEqual(commits2.length, 0, 'Returns empty array for object input');
  } catch (error) {
    assert(false, `_parseBitcoinRewards null test failed: ${error.message}`);
  }

  // -------------------------------------------------------------------------
  // log() / shortLog() with injected commits
  // -------------------------------------------------------------------------

  console.log('\n📜 Testing log() with no commits...');
  try {
    const gfr = new GitFetchRewards();
    const output = gfr.log();
    assert(output.includes('no rewards fetched'), 'log() reports no commits when empty');
  } catch (error) {
    assert(false, `log() empty test failed: ${error.message}`);
  }

  console.log('\n📜 Testing shortLog() with no commits...');
  try {
    const gfr = new GitFetchRewards();
    const output = gfr.shortLog();
    assert(output.includes('no rewards fetched'), 'shortLog() reports no commits when empty');
  } catch (error) {
    assert(false, `shortLog() empty test failed: ${error.message}`);
  }

  console.log('\n📜 Testing log() and shortLog() with injected commits...');
  try {
    const gfr = new GitFetchRewards();
    gfr.commits.push(
      new RewardCommit({ source: 'bitcoin', timestamp: 1609459200, blockHeight: 665000, amount: '6.25', unit: 'BTC' }),
      new RewardCommit({ source: 'bitcoin', timestamp: 1609545600, blockHeight: 665144, amount: '6.25', unit: 'BTC' })
    );

    const fullLog = gfr.log();
    assert(fullLog.includes('commit'), 'log() includes commit entries');
    assert(fullLog.includes('#665000') || fullLog.includes('#665144'), 'log() includes block heights');

    const short = gfr.shortLog();
    assert(short.includes('BTC'), 'shortLog() includes BTC');

    // limit parameter
    const limitedLog = gfr.log(1);
    const limitedShort = gfr.shortLog(1);
    // A single log entry contains exactly one "commit" keyword
    assert(limitedLog.split('commit ').length === 2, 'log(1) contains only one commit entry');
    assert(limitedShort.split('\n').length === 1, 'shortLog(1) contains only one line');
  } catch (error) {
    assert(false, `log/shortLog with commits failed: ${error.message}`);
  }

  // -------------------------------------------------------------------------
  // getStats()
  // -------------------------------------------------------------------------

  console.log('\n📊 Testing getStats()...');
  try {
    const gfr = new GitFetchRewards();
    gfr.commits.push(
      new RewardCommit({ source: 'bitcoin', timestamp: 1609459200, blockHeight: 665000, amount: '6.25', unit: 'BTC' }),
      new RewardCommit({ source: 'ethereum', timestamp: 1609459200, blockHeight: 11565019, amount: '2.0', unit: 'ETH' })
    );
    const stats = gfr.getStats();
    assertEqual(stats.totalCommits, 2, 'getStats reports correct total commit count');
    assert('bitcoin' in stats.bySource, 'getStats includes bitcoin source');
    assert('ethereum' in stats.bySource, 'getStats includes ethereum source');
    assertEqual(stats.bySource.bitcoin.count, 1, 'Bitcoin commit count is 1');
    assertEqual(stats.bySource.ethereum.count, 1, 'Ethereum commit count is 1');
  } catch (error) {
    assert(false, `getStats() test failed: ${error.message}`);
  }

  // -------------------------------------------------------------------------
  // clearHistory() / clearCache()
  // -------------------------------------------------------------------------

  console.log('\n🧹 Testing clearHistory()...');
  try {
    const gfr = new GitFetchRewards();
    gfr.commits.push(new RewardCommit({ source: 'bitcoin', timestamp: 1609459200, blockHeight: 1, amount: '6.25', unit: 'BTC' }));
    gfr.cacheManager.set('test-key', { data: 1 });

    gfr.clearHistory();
    assertEqual(gfr.commits.length, 0, 'clearHistory removes all commits');
    assertEqual(gfr.cache.size, 0, 'clearHistory also clears the cache');
  } catch (error) {
    assert(false, `clearHistory() test failed: ${error.message}`);
  }

  console.log('\n🧹 Testing clearCache()...');
  try {
    const gfr = new GitFetchRewards();
    gfr.commits.push(new RewardCommit({ source: 'bitcoin', timestamp: 1609459200, blockHeight: 1, amount: '6.25', unit: 'BTC' }));
    gfr.cacheManager.set('test-key', { data: 1 });

    gfr.clearCache();
    assertEqual(gfr.cache.size, 0, 'clearCache clears the cache');
    assertEqual(gfr.commits.length, 1, 'clearCache leaves commits intact');
  } catch (error) {
    assert(false, `clearCache() test failed: ${error.message}`);
  }

  // -------------------------------------------------------------------------
  // getCacheStats()
  // -------------------------------------------------------------------------

  console.log('\n💾 Testing getCacheStats()...');
  try {
    const gfr = new GitFetchRewards();
    const stats = gfr.getCacheStats();
    assertEqual(stats.size, 0, 'Cache is empty initially');
    assert(Array.isArray(stats.keys), 'getCacheStats includes keys array');
    assert(typeof stats.timeout === 'number', 'getCacheStats includes timeout');
  } catch (error) {
    assert(false, `getCacheStats() test failed: ${error.message}`);
  }

  // -------------------------------------------------------------------------
  // Multiple instances are independent
  // -------------------------------------------------------------------------

  console.log('\n🔄 Testing multiple independent instances...');
  try {
    const gfr1 = new GitFetchRewards();
    const gfr2 = new GitFetchRewards({ bitcoinBaseUrl: 'other.mempool.space' });
    gfr1.commits.push(new RewardCommit({ source: 'bitcoin', timestamp: 1, blockHeight: 1, amount: '1', unit: 'BTC' }));

    assertEqual(gfr1.commits.length, 1, 'Instance 1 has 1 commit');
    assertEqual(gfr2.commits.length, 0, 'Instance 2 is unaffected');
    assert(gfr1.cache !== gfr2.cache, 'Instances have separate caches');
  } catch (error) {
    assert(false, `Multiple instances test failed: ${error.message}`);
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed.');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
