/**
 * Test suite for Ethereum Blockchair Module
 */

const EthereumBlockchairFetcher = require('./ethereum-blockchair.js');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✓ ${testName}`);
    passedTests++;
  } else {
    console.log(`✗ ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('Running Ethereum Blockchair Module Tests...\n');

  // Test 1: Constructor
  console.log('--- Constructor Tests ---');
  const fetcher = new EthereumBlockchairFetcher();
  assert(fetcher instanceof EthereumBlockchairFetcher, 'Should create instance with default baseUrl');
  assert(fetcher.baseUrl === 'api.blockchair.com', 'Should use default baseUrl');
  assert(fetcher.cacheTimeout === 60000, 'Should have default cache timeout of 60 seconds');

  const customFetcher = new EthereumBlockchairFetcher('custom.api.com');
  assert(customFetcher.baseUrl === 'custom.api.com', 'Should accept custom baseUrl');

  // Test 2: Address validation
  console.log('\n--- Address Validation Tests ---');
  assert(fetcher._isValidEthereumAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'), 'Should accept valid Ethereum address');
  assert(fetcher._isValidEthereumAddress('kushmanmb.eth'), 'Should accept ENS name');
  assert(fetcher._isValidEthereumAddress('vitalik.eth'), 'Should accept ENS name');
  assert(!fetcher._isValidEthereumAddress('invalid'), 'Should reject invalid address');
  assert(!fetcher._isValidEthereumAddress('0x123'), 'Should reject short address');
  assert(!fetcher._isValidEthereumAddress(''), 'Should reject empty address');
  assert(!fetcher._isValidEthereumAddress(null), 'Should reject null address');

  // Test 3: Cache operations
  console.log('\n--- Cache Tests ---');
  const initialStats = fetcher.getCacheStats();
  assert(initialStats.size === 0, 'Cache should start empty');
  assert(initialStats.timeout === 60000, 'Cache timeout should be 60000ms');
  assert(Array.isArray(initialStats.keys), 'Cache keys should be an array');

  fetcher.cache.set('test-key', { data: 'test', timestamp: Date.now() });
  const statsAfterSet = fetcher.getCacheStats();
  assert(statsAfterSet.size === 1, 'Cache size should be 1 after adding entry');
  assert(statsAfterSet.keys.includes('test-key'), 'Cache keys should include test-key');

  fetcher.clearCache();
  const statsAfterClear = fetcher.getCacheStats();
  assert(statsAfterClear.size === 0, 'Cache should be empty after clearing');

  // Test 4: Input validation
  console.log('\n--- Input Validation Tests ---');
  
  try {
    await fetcher.getBlock();
    assert(false, 'Should throw error for missing block ID');
  } catch (error) {
    assert(error.message === 'Block ID is required', 'Should throw correct error for missing block ID');
  }

  try {
    await fetcher.getAddress('invalid-address');
    assert(false, 'Should throw error for invalid address');
  } catch (error) {
    assert(error.message === 'Invalid Ethereum address or ENS name format', 'Should throw correct error for invalid address');
  }

  try {
    await fetcher.getTransaction('');
    assert(false, 'Should throw error for empty transaction hash');
  } catch (error) {
    assert(error.message === 'Valid transaction hash string is required', 'Should throw correct error for empty tx hash');
  }

  try {
    await fetcher.getTransaction('invalid-hash');
    assert(false, 'Should throw error for invalid transaction hash');
  } catch (error) {
    assert(error.message === 'Invalid transaction hash format', 'Should throw correct error for invalid tx hash format');
  }

  try {
    await fetcher.getRecentBlocks(0);
    assert(false, 'Should throw error for limit = 0');
  } catch (error) {
    assert(error.message === 'Limit must be between 1 and 100', 'Should throw correct error for limit = 0');
  }

  try {
    await fetcher.getRecentBlocks(101);
    assert(false, 'Should throw error for limit > 100');
  } catch (error) {
    assert(error.message === 'Limit must be between 1 and 100', 'Should throw correct error for limit > 100');
  }

  // Test 5: Formatting functions
  console.log('\n--- Formatting Tests ---');
  
  const mockStatsData = {
    data: {
      blocks: 18000000,
      transactions: 2000000000,
      circulation: 120000000000000000000000000n,
      difficulty: 0,
      market_price_usd: 2000.50,
      market_cap_usd: 240000000000
    }
  };
  
  const formattedStats = fetcher.formatStats(mockStatsData);
  assert(formattedStats.includes('Ethereum Blockchain Statistics'), 'Stats format should include title');
  assert(formattedStats.includes('Latest Block:'), 'Stats format should include block number');
  assert(formattedStats.includes('18,000,000'), 'Stats should format numbers with commas');
  assert(formattedStats.includes('Market Price:'), 'Stats format should include market price');

  const mockBlockData = {
    data: {
      id: 18000000,
      hash: '0xabc123',
      time: '2024-01-01T00:00:00Z',
      transaction_count: 150,
      size: 131072,
      difficulty: 0
    }
  };
  
  const formattedBlock = fetcher.formatBlock(mockBlockData);
  assert(formattedBlock.includes('Ethereum Block Information'), 'Block format should include title');
  assert(formattedBlock.includes('Block Height:'), 'Block format should include height');
  assert(formattedBlock.includes('18000000'), 'Block should show correct height');
  assert(formattedBlock.includes('128.00 KB'), 'Block should format size');

  const mockAddressData = {
    data: {
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0': {
        address: {
          balance: 1000000000000000000n,
          transaction_count: 100,
          received_approximate: 5000000000000000000n,
          spent_approximate: 4000000000000000000n,
          first_seen_receiving: '2020-01-01T00:00:00Z'
        }
      }
    }
  };
  
  const formattedAddress = fetcher.formatAddress(mockAddressData);
  assert(formattedAddress.includes('Ethereum Address Information'), 'Address format should include title');
  assert(formattedAddress.includes('Address:'), 'Address format should include address field');
  assert(formattedAddress.includes('Balance:'), 'Address format should include balance');
  assert(formattedAddress.includes('Transaction Count:'), 'Address format should include tx count');

  const mockTokenData = {
    data: {
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0': {
        layer_2: {
          erc_20: [
            {
              token_name: 'Test Token',
              token_symbol: 'TEST',
              balance: '1000000000000000000',
              token_address: '0xabc123'
            }
          ]
        }
      }
    }
  };
  
  const formattedTokens = fetcher.formatTokenBalances(mockTokenData);
  assert(formattedTokens.includes('ERC-20 Token Balances'), 'Token format should include title');
  assert(formattedTokens.includes('Test Token'), 'Token format should include token name');
  assert(formattedTokens.includes('TEST'), 'Token format should include token symbol');

  const emptyTokenData = {
    data: {
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0': {
        layer_2: {
          erc_20: []
        }
      }
    }
  };
  
  const formattedEmptyTokens = fetcher.formatTokenBalances(emptyTokenData);
  assert(formattedEmptyTokens.includes('No ERC-20 tokens found'), 'Should show message for empty token list');

  // Test 6: Empty/null data formatting
  console.log('\n--- Edge Case Formatting Tests ---');
  assert(fetcher.formatStats(null) === 'No data available', 'Should handle null stats data');
  assert(fetcher.formatStats({}).includes('Ethereum Blockchain Statistics'), 'Should handle empty stats data with header');
  assert(fetcher.formatBlock(null) === 'No data available', 'Should handle null block data');
  assert(fetcher.formatAddress(null) === 'No data available', 'Should handle null address data');
  assert(fetcher.formatTokenBalances(null) === 'No data available', 'Should handle null token data');

  // Test 7: Transaction hash validation
  console.log('\n--- Transaction Hash Validation Tests ---');
  const validHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const validHashNoPrefix = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  
  try {
    await fetcher.getTransaction(validHash);
    assert(false, 'Network call would fail but format validation should pass');
  } catch (error) {
    // Expected to fail on network call, not validation
    assert(!error.message.includes('Invalid transaction hash format'), 'Should accept valid hash with 0x prefix');
  }

  try {
    await fetcher.getTransaction(validHashNoPrefix);
    assert(false, 'Network call would fail but format validation should pass');
  } catch (error) {
    // Expected to fail on network call, not validation
    assert(!error.message.includes('Invalid transaction hash format'), 'Should accept valid hash without 0x prefix');
  }

  // Print summary
  console.log('\n=================================');
  console.log('Test Summary:');
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log('=================================\n');

  if (failedTests === 0) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed!');
    process.exit(1);
  }
}

runTests();
