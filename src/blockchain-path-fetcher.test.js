/**
 * Tests for Blockchain Path Fetcher Module
 */

const { BlockchainPathFetcher, DEFAULT_OWNER } = require('./blockchain-path-fetcher');

// Test counters
let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  Error: ${error.message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\nRunning Blockchain Path Fetcher Tests...\n');

  // ─── DEFAULT_OWNER ─────────────────────────────────────────────────────────
  test('DEFAULT_OWNER is kushmanmb.eth', () => {
    if (DEFAULT_OWNER !== 'kushmanmb.eth') {
      throw new Error(`Expected 'kushmanmb.eth', got '${DEFAULT_OWNER}'`);
    }
  });

  // ─── Constructor ───────────────────────────────────────────────────────────
  test('Constructor creates instance with default owner', () => {
    const fetcher = new BlockchainPathFetcher();
    if (fetcher.owner !== 'kushmanmb.eth') {
      throw new Error(`Expected 'kushmanmb.eth', got '${fetcher.owner}'`);
    }
  });

  test('Constructor creates instance with custom owner', () => {
    const fetcher = new BlockchainPathFetcher('yaketh.eth');
    if (fetcher.owner !== 'yaketh.eth') {
      throw new Error(`Expected 'yaketh.eth', got '${fetcher.owner}'`);
    }
  });

  test('Constructor throws on invalid owner (null)', () => {
    try {
      new BlockchainPathFetcher(null);
      throw new Error('Should have thrown');
    } catch (error) {
      if (!error.message.includes('Owner')) {
        throw new Error(`Unexpected error message: ${error.message}`);
      }
    }
  });

  test('Constructor throws on invalid owner (empty string)', () => {
    try {
      new BlockchainPathFetcher('');
      throw new Error('Should have thrown');
    } catch (error) {
      if (!error.message.includes('Owner')) {
        throw new Error(`Unexpected error message: ${error.message}`);
      }
    }
  });

  test('Constructor sets custom baseUrl', () => {
    const fetcher = new BlockchainPathFetcher('kushmanmb.eth', 'custom.api.com');
    if (fetcher.baseUrl !== 'custom.api.com') {
      throw new Error(`Expected 'custom.api.com', got '${fetcher.baseUrl}'`);
    }
  });

  // ─── Path definitions ───────────────────────────────────────────────────────
  test('getRelevantPaths returns an object', () => {
    const fetcher = new BlockchainPathFetcher();
    const paths = fetcher.getRelevantPaths();
    if (typeof paths !== 'object' || paths === null) {
      throw new Error('Expected paths to be an object');
    }
  });

  test('getRelevantPaths includes stats path', () => {
    const fetcher = new BlockchainPathFetcher();
    const paths = fetcher.getRelevantPaths();
    if (!paths.stats) {
      throw new Error('Missing stats path');
    }
    if (!paths.stats.includes('/ethereum/stats')) {
      throw new Error(`Unexpected stats path: ${paths.stats}`);
    }
  });

  test('getRelevantPaths includes address path with owner', () => {
    const fetcher = new BlockchainPathFetcher('yaketh.eth');
    const paths = fetcher.getRelevantPaths();
    if (!paths.address) {
      throw new Error('Missing address path');
    }
    if (!paths.address.includes('yaketh.eth')) {
      throw new Error(`Address path does not contain owner: ${paths.address}`);
    }
  });

  test('getRelevantPaths includes recentBlocks path', () => {
    const fetcher = new BlockchainPathFetcher();
    const paths = fetcher.getRelevantPaths();
    if (!paths.recentBlocks) {
      throw new Error('Missing recentBlocks path');
    }
  });

  test('getRelevantPaths includes recentTransactions path', () => {
    const fetcher = new BlockchainPathFetcher();
    const paths = fetcher.getRelevantPaths();
    if (!paths.recentTransactions) {
      throw new Error('Missing recentTransactions path');
    }
  });

  test('getRelevantPaths returns a copy, not the internal object', () => {
    const fetcher = new BlockchainPathFetcher();
    const paths = fetcher.getRelevantPaths();
    paths.stats = 'tampered';
    if (fetcher.paths.stats === 'tampered') {
      throw new Error('getRelevantPaths should return a copy');
    }
  });

  test('getPathKeys returns array of strings', () => {
    const fetcher = new BlockchainPathFetcher();
    const keys = fetcher.getPathKeys();
    if (!Array.isArray(keys)) {
      throw new Error('Expected keys to be an array');
    }
    if (keys.length === 0) {
      throw new Error('Expected at least one key');
    }
    keys.forEach(k => {
      if (typeof k !== 'string') {
        throw new Error(`Expected string key, got ${typeof k}`);
      }
    });
  });

  test('getPathKeys returns keys matching getRelevantPaths', () => {
    const fetcher = new BlockchainPathFetcher();
    const keys = fetcher.getPathKeys();
    const paths = fetcher.getRelevantPaths();
    const expectedKeys = Object.keys(paths);
    if (keys.length !== expectedKeys.length) {
      throw new Error(`Key count mismatch: ${keys.length} vs ${expectedKeys.length}`);
    }
    keys.forEach(k => {
      if (!expectedKeys.includes(k)) {
        throw new Error(`Unexpected key: ${k}`);
      }
    });
  });

  // ─── fetchPath validation ───────────────────────────────────────────────────
  try {
    await new BlockchainPathFetcher().fetchPath(null);
    console.error('✗ fetchPath throws on null pathKey');
    failed++;
  } catch (error) {
    if (error.message.includes('Path key')) {
      console.log('✓ fetchPath throws on null pathKey');
      passed++;
    } else {
      console.error('✗ fetchPath throws on null pathKey');
      console.error(`  Unexpected error: ${error.message}`);
      failed++;
    }
  }

  try {
    await new BlockchainPathFetcher().fetchPath('');
    console.error('✗ fetchPath throws on empty string');
    failed++;
  } catch (error) {
    if (error.message.includes('Path key')) {
      console.log('✓ fetchPath throws on empty string');
      passed++;
    } else {
      console.error('✗ fetchPath throws on empty string');
      console.error(`  Unexpected error: ${error.message}`);
      failed++;
    }
  }

  try {
    await new BlockchainPathFetcher().fetchPath('unknownKey');
    console.error('✗ fetchPath throws on unknown path key');
    failed++;
  } catch (error) {
    if (error.message.includes('Unknown path key')) {
      console.log('✓ fetchPath throws on unknown path key');
      passed++;
    } else {
      console.error('✗ fetchPath throws on unknown path key');
      console.error(`  Unexpected error: ${error.message}`);
      failed++;
    }
  }

  try {
    await new BlockchainPathFetcher().fetchPath('unknownKey');
    console.error('✗ fetchPath error message lists valid keys');
    failed++;
  } catch (error) {
    if (error.message.includes('stats')) {
      console.log('✓ fetchPath error message lists valid keys');
      passed++;
    } else {
      console.error('✗ fetchPath error message lists valid keys');
      console.error(`  Unexpected error: ${error.message}`);
      failed++;
    }
  }

  // ─── formatResults ──────────────────────────────────────────────────────────
  test('formatResults returns string', () => {
    const fetcher = new BlockchainPathFetcher();
    const result = fetcher.formatResults({});
    if (typeof result !== 'string') {
      throw new Error('Expected string output');
    }
  });

  test('formatResults includes owner name', () => {
    const fetcher = new BlockchainPathFetcher('yaketh.eth');
    const result = fetcher.formatResults({});
    if (!result.includes('yaketh.eth')) {
      throw new Error('Expected owner name in output');
    }
  });

  test('formatResults handles null gracefully', () => {
    const fetcher = new BlockchainPathFetcher();
    const result = fetcher.formatResults(null);
    if (result !== 'No results available') {
      throw new Error(`Unexpected output: ${result}`);
    }
  });

  test('formatResults handles error values in results', () => {
    const fetcher = new BlockchainPathFetcher();
    const results = { stats: new Error('timeout') };
    const output = fetcher.formatResults(results);
    if (!output.includes('Error')) {
      throw new Error('Expected error label in output');
    }
    if (!output.includes('timeout')) {
      throw new Error('Expected error message in output');
    }
  });

  test('formatResults displays path for each key', () => {
    const fetcher = new BlockchainPathFetcher();
    const results = { stats: { data: { blocks: 12345678 } } };
    const output = fetcher.formatResults(results);
    if (!output.includes('/ethereum/stats')) {
      throw new Error('Expected path in output');
    }
  });

  test('formatResults shows stats block count when available', () => {
    const fetcher = new BlockchainPathFetcher();
    const results = { stats: { data: { blocks: 19000000, transactions: 2000000000 } } };
    const output = fetcher.formatResults(results);
    if (!output.includes('19,000,000') && !output.includes('19000000')) {
      throw new Error('Expected block count in output');
    }
  });

  test('formatResults shows address balance when available', () => {
    const fetcher = new BlockchainPathFetcher();
    const mockAddress = '0x1234567890123456789012345678901234567890';
    const results = {
      address: {
        data: {
          [mockAddress]: {
            address: mockAddress,
            balance: 1000000000000000000,
            transaction_count: 42
          }
        }
      }
    };
    const output = fetcher.formatResults(results);
    if (!output.includes('ETH')) {
      throw new Error('Expected ETH balance in output');
    }
    if (!output.includes('42')) {
      throw new Error('Expected transaction count in output');
    }
  });

  // ─── Cache ──────────────────────────────────────────────────────────────────
  test('clearCache does not throw', () => {
    const fetcher = new BlockchainPathFetcher();
    fetcher.clearCache();
  });

  test('getCacheStats returns object with expected fields', () => {
    const fetcher = new BlockchainPathFetcher();
    const stats = fetcher.getCacheStats();
    if (typeof stats.size !== 'number') {
      throw new Error('Missing size in cache stats');
    }
    if (typeof stats.timeout !== 'number') {
      throw new Error('Missing timeout in cache stats');
    }
    if (stats.owner !== fetcher.owner) {
      throw new Error('Incorrect owner in cache stats');
    }
    if (!Array.isArray(stats.keys)) {
      throw new Error('Missing keys array in cache stats');
    }
  });

  test('getCacheStats size starts at 0', () => {
    const fetcher = new BlockchainPathFetcher();
    const stats = fetcher.getCacheStats();
    if (stats.size !== 0) {
      throw new Error(`Expected size 0, got ${stats.size}`);
    }
  });

  // ─── Summary ────────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('='.repeat(50) + '\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
