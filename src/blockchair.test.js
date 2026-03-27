/**
 * Blockchair Multi-Chain Module Tests
 * Tests for the Blockchair API functionality across multiple chains
 */

const BlockchairFetcher = require('./blockchair.js');

// Test utilities
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
    console.error(`  Expected: ${expected}`);
    console.error(`  Actual: ${actual}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('Running Blockchair Multi-Chain Module Tests...\n');
  console.log('='.repeat(50));

  // Test 1: Constructor with chain
  console.log('\n📦 Testing Constructor with Chain...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    assert(fetcher !== null, 'Should create fetcher instance');
    assertEqual(fetcher.chain, 'bitcoin', 'Should set chain to bitcoin');
    assertEqual(fetcher.baseUrl, 'api.blockchair.com', 'Should use default base URL');
    assert(fetcher.cache instanceof Map, 'Should initialize cache as Map');
  } catch (error) {
    assert(false, `Constructor test failed: ${error.message}`);
  }

  // Test 2: Constructor without chain
  console.log('\n⚠️  Testing Constructor without Chain...');
  try {
    const fetcher = new BlockchairFetcher();
    assert(false, 'Should throw error when chain is not provided');
  } catch (error) {
    assert(error.message.includes('Valid chain name is required'), 'Should throw error for missing chain');
  }

  // Test 3: Constructor with custom URL
  console.log('\n🌐 Testing Constructor with Custom URL...');
  try {
    const customFetcher = new BlockchairFetcher('ethereum', 'custom.api.blockchair.com');
    assertEqual(customFetcher.baseUrl, 'custom.api.blockchair.com', 'Should use custom base URL');
    assertEqual(customFetcher.chain, 'ethereum', 'Should set chain to ethereum');
  } catch (error) {
    assert(false, `Custom URL test failed: ${error.message}`);
  }

  // Test 4: Multiple chains
  console.log('\n🔗 Testing Multiple Chains...');
  try {
    const btcFetcher = new BlockchairFetcher('bitcoin');
    const ethFetcher = new BlockchairFetcher('ethereum');
    const ltcFetcher = new BlockchairFetcher('litecoin');
    
    assertEqual(btcFetcher.chain, 'bitcoin', 'Should set bitcoin chain');
    assertEqual(ethFetcher.chain, 'ethereum', 'Should set ethereum chain');
    assertEqual(ltcFetcher.chain, 'litecoin', 'Should set litecoin chain');
    
    assert(btcFetcher.cache !== ethFetcher.cache, 'Should have separate caches');
  } catch (error) {
    assert(false, `Multiple chains test failed: ${error.message}`);
  }

  // Test 5: Case insensitive chain names
  console.log('\n🔤 Testing Case Insensitive Chain Names...');
  try {
    const fetcher1 = new BlockchairFetcher('BITCOIN');
    const fetcher2 = new BlockchairFetcher('Bitcoin');
    const fetcher3 = new BlockchairFetcher('bitcoin');
    
    assertEqual(fetcher1.chain, 'bitcoin', 'Should convert BITCOIN to lowercase');
    assertEqual(fetcher2.chain, 'bitcoin', 'Should convert Bitcoin to lowercase');
    assertEqual(fetcher3.chain, 'bitcoin', 'Should keep bitcoin as lowercase');
  } catch (error) {
    assert(false, `Case insensitive test failed: ${error.message}`);
  }

  // Test 6: Block ID validation
  console.log('\n⚠️  Testing Block ID Validation...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    await fetcher.getBlock(null);
    assert(false, 'Should throw error for null block ID');
  } catch (error) {
    assert(error.message.includes('Block ID is required'), 'Should throw error for null block ID');
  }

  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    await fetcher.getBlock('');
    assert(false, 'Should throw error for empty block ID');
  } catch (error) {
    assert(error.message.includes('Block ID is required'), 'Should throw error for empty block ID');
  }

  // Test 7: Address validation
  console.log('\n🔐 Testing Address Validation...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    await fetcher.getAddress('');
    assert(false, 'Should throw error for empty address');
  } catch (error) {
    assert(error.message.includes('Valid address string is required'), 'Should throw error for empty address');
  }

  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    await fetcher.getAddress(null);
    assert(false, 'Should throw error for null address');
  } catch (error) {
    assert(error.message.includes('Valid address string is required'), 'Should throw error for null address');
  }

  // Test 8: Transaction hash validation
  console.log('\n📝 Testing Transaction Hash Validation...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    await fetcher.getTransaction('');
    assert(false, 'Should throw error for empty transaction hash');
  } catch (error) {
    assert(error.message.includes('Valid transaction hash string is required'), 'Should throw error for empty hash');
  }

  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    await fetcher.getTransaction('invalid_hash');
    assert(false, 'Should throw error for invalid transaction hash format');
  } catch (error) {
    assert(error.message.includes('Invalid transaction hash format'), 'Should throw error for invalid hash format');
  }

  // Test 9: Valid transaction hash format
  console.log('\n🔑 Testing Valid Transaction Hash Format...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    const validHash = 'a'.repeat(64); // 64 hex characters
    
    // Verify the hash passes validation (will fail on network call, but validation should pass)
    try {
      await fetcher.getTransaction(validHash);
      // If we get here, validation passed (API call may fail, that's expected)
      assert(true, 'Transaction hash format validation works for 64 hex chars');
    } catch (error) {
      // If error is not about hash format, validation passed
      if (!error.message.includes('Invalid transaction hash format')) {
        assert(true, 'Transaction hash format validation works for 64 hex chars');
      } else {
        assert(false, `Valid hash should pass format validation: ${error.message}`);
      }
    }
    
    // Test with 0x prefix (Ethereum style)
    const ethFetcher = new BlockchairFetcher('ethereum');
    const ethHash = '0x' + 'b'.repeat(64);
    try {
      await ethFetcher.getTransaction(ethHash);
      // If we get here, validation passed (API call may fail, that's expected)
      assert(true, 'Transaction hash format validation works with 0x prefix');
    } catch (error) {
      // If error is not about hash format, validation passed
      if (!error.message.includes('Invalid transaction hash format')) {
        assert(true, 'Transaction hash format validation works with 0x prefix');
      } else {
        assert(false, `Valid hash with 0x prefix should pass format validation: ${error.message}`);
      }
    }
  } catch (error) {
    assert(false, `Valid hash format test failed: ${error.message}`);
  }

  // Test 10: Recent blocks limit validation
  console.log('\n📊 Testing Recent Blocks Limit Validation...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    await fetcher.getRecentBlocks(0);
    assert(false, 'Should throw error for limit < 1');
  } catch (error) {
    assert(error.message.includes('Limit must be between 1 and 100'), 'Should throw error for limit < 1');
  }

  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    await fetcher.getRecentBlocks(101);
    assert(false, 'Should throw error for limit > 100');
  } catch (error) {
    assert(error.message.includes('Limit must be between 1 and 100'), 'Should throw error for limit > 100');
  }

  // Test 11: Recent transactions limit validation
  console.log('\n📝 Testing Recent Transactions Limit Validation...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    await fetcher.getRecentTransactions(0);
    assert(false, 'Should throw error for limit < 1');
  } catch (error) {
    assert(error.message.includes('Limit must be between 1 and 100'), 'Should throw error for limit < 1');
  }

  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    await fetcher.getRecentTransactions(101);
    assert(false, 'Should throw error for limit > 100');
  } catch (error) {
    assert(error.message.includes('Limit must be between 1 and 100'), 'Should throw error for limit > 100');
  }

  // Test 12: Cache functionality
  console.log('\n💾 Testing Cache Functionality...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    
    // Test cache stats
    const stats = fetcher.getCacheStats();
    assert(stats.size === 0, 'Cache should be empty initially');
    assert(Array.isArray(stats.keys), 'Cache stats should include keys array');
    assertEqual(stats.timeout, 60000, 'Cache timeout should be 60000ms');
    assertEqual(stats.chain, 'bitcoin', 'Cache stats should include chain name');
    
    // Test clear cache
    fetcher.clearCache();
    assertEqual(fetcher.cache.size, 0, 'Cache should be cleared');
  } catch (error) {
    assert(false, `Cache test failed: ${error.message}`);
  }

  // Test 13: Format stats with mock data
  console.log('\n📈 Testing Format Stats...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    const mockData = {
      data: {
        blocks: 800000,
        transactions: 850000000,
        circulation: 1900000000000000,
        difficulty: 50000000000000,
        hashrate_24h: '400 EH/s',
        blockchain_size: 500000000000,
        nodes: 15000,
        market_price_usd: 45000.50,
        market_cap_usd: 850000000000
      }
    };
    
    const formatted = fetcher.formatStats(mockData);
    assert(formatted.includes('Bitcoin Blockchain Statistics'), 'Should include title with chain name');
    assert(formatted.includes('Latest Block'), 'Should include latest block');
    assert(formatted.includes('800,000'), 'Should format block number with commas');
  } catch (error) {
    assert(false, `Format stats test failed: ${error.message}`);
  }

  // Test 14: Format block with mock data
  console.log('\n🧱 Testing Format Block...');
  try {
    const fetcher = new BlockchairFetcher('ethereum');
    const mockData = {
      data: {
        '0xabc123': {
          id: 18000000,
          hash: '0xabc123def456',
          time: '2024-01-01T00:00:00Z',
          transaction_count: 150,
          size: 120000,
          difficulty: 12000000
        }
      }
    };
    
    const formatted = fetcher.formatBlock(mockData);
    assert(formatted.includes('Ethereum Block Information'), 'Should include title with chain name');
    assert(formatted.includes('Block Height'), 'Should include block height');
    assert(formatted.includes('18000000'), 'Should include block ID');
  } catch (error) {
    assert(false, `Format block test failed: ${error.message}`);
  }

  // Test 15: Format address with mock data
  console.log('\n💼 Testing Format Address...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    const mockData = {
      data: {
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh': {
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          balance: 100000000,
          transaction_count: 50,
          received: 500000000,
          spent: 400000000
        }
      }
    };
    
    const formatted = fetcher.formatAddress(mockData);
    assert(formatted.includes('Bitcoin Address Information'), 'Should include title with chain name');
    assert(formatted.includes('Address'), 'Should include address');
    assert(formatted.includes('Balance'), 'Should include balance');
  } catch (error) {
    assert(false, `Format address test failed: ${error.message}`);
  }

  // Test 16: Format transaction with mock data
  console.log('\n📝 Testing Format Transaction...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    const mockData = {
      data: {
        'abc123def456': {
          hash: 'abc123def456',
          time: '2024-01-01T00:00:00Z',
          block_id: 800000,
          size: 250,
          fee: 5000,
          input_count: 2,
          output_count: 2,
          input_total: 100000000,
          output_total: 99995000
        }
      }
    };
    
    const formatted = fetcher.formatTransaction(mockData);
    assert(formatted.includes('Bitcoin Transaction Information'), 'Should include title with chain name');
    assert(formatted.includes('Transaction Hash'), 'Should include transaction hash');
    assert(formatted.includes('Block'), 'Should include block ID');
    assert(formatted.includes('Fee'), 'Should include fee');
  } catch (error) {
    assert(false, `Format transaction test failed: ${error.message}`);
  }

  // Test 17: Format with null data
  console.log('\n🚫 Testing Format with Null Data...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    assertEqual(fetcher.formatStats(null), 'No data available', 'Should return "No data available" for null');
    assertEqual(fetcher.formatBlock(null), 'No data available', 'Should return "No data available" for null');
    assertEqual(fetcher.formatAddress(null), 'No data available', 'Should return "No data available" for null');
    assertEqual(fetcher.formatTransaction(null), 'No data available', 'Should return "No data available" for null');
  } catch (error) {
    assert(false, `Format null test failed: ${error.message}`);
  }

  // Test 18: Get supported chains
  console.log('\n🔗 Testing Get Supported Chains...');
  try {
    const fetcher = new BlockchairFetcher('bitcoin');
    const chains = fetcher.getSupportedChains();
    
    assert(Array.isArray(chains), 'Should return array of chains');
    assert(chains.includes('bitcoin'), 'Should include bitcoin');
    assert(chains.includes('ethereum'), 'Should include ethereum');
    assert(chains.includes('litecoin'), 'Should include litecoin');
    assert(chains.length > 0, 'Should have at least one supported chain');
  } catch (error) {
    assert(false, `Get supported chains test failed: ${error.message}`);
  }

  // Test 19: Multiple instances with different chains
  console.log('\n🔄 Testing Multiple Instances with Different Chains...');
  try {
    const btcFetcher = new BlockchairFetcher('bitcoin');
    const ethFetcher = new BlockchairFetcher('ethereum');
    
    assert(btcFetcher.chain !== ethFetcher.chain, 'Should create independent instances');
    assert(btcFetcher.cache !== ethFetcher.cache, 'Should have separate caches');
    
    const btcStats = btcFetcher.getCacheStats();
    const ethStats = ethFetcher.getCacheStats();
    
    assertEqual(btcStats.chain, 'bitcoin', 'BTC fetcher should track bitcoin');
    assertEqual(ethStats.chain, 'ethereum', 'ETH fetcher should track ethereum');
  } catch (error) {
    assert(false, `Multiple instances test failed: ${error.message}`);
  }

  // Test 20: Unsupported chain warning (should not throw, just warn)
  console.log('\n⚠️  Testing Unsupported Chain Warning...');
  try {
    const fetcher = new BlockchairFetcher('unsupported-chain');
    assertEqual(fetcher.chain, 'unsupported-chain', 'Should allow unsupported chains');
    assert(true, 'Should create fetcher with unsupported chain (with warning)');
  } catch (error) {
    assert(false, `Unsupported chain test failed: ${error.message}`);
  }

  // Summary
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

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
