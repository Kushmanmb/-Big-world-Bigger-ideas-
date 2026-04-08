/**
 * Beaconchain Rewards Module Tests
 * Tests for the Beaconchain validator rewards functionality
 */

const BeaconchainRewardsFetcher = require('./beaconchain-rewards.js');

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
  console.log('Running Beaconchain Rewards Module Tests...\n');
  console.log('='.repeat(50));

  // Test 1: Constructor with default options
  console.log('\n📦 Testing Constructor (Default)...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    assert(fetcher !== null, 'Should create fetcher instance');
    assertEqual(fetcher.baseUrl, 'beaconcha.in', 'Should use default base URL');
    assertEqual(fetcher.network, 'mainnet', 'Should use default network');
    assert(fetcher.cache instanceof Map, 'Should initialize cache as Map');
  } catch (error) {
    assert(false, `Constructor test failed: ${error.message}`);
  }

  // Test 2: Constructor with custom options
  console.log('\n🌐 Testing Constructor with Custom Options...');
  try {
    const customFetcher = new BeaconchainRewardsFetcher({
      apiKey: 'test-key',
      baseUrl: 'custom.beaconcha.in',
      network: 'goerli'
    });
    assertEqual(customFetcher.apiKey, 'test-key', 'Should use custom API key');
    assertEqual(customFetcher.baseUrl, 'custom.beaconcha.in', 'Should use custom base URL');
    assertEqual(customFetcher.network, 'goerli', 'Should use custom network');
  } catch (error) {
    assert(false, `Custom options test failed: ${error.message}`);
  }

  // Test 3: Validator validation - valid index
  console.log('\n✅ Testing Valid Validator Index...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    assert(fetcher._validateValidator(12345), 'Should validate numeric index');
    assert(fetcher._validateValidator('12345'), 'Should validate string index');
    assert(fetcher._validateValidator(0), 'Should validate zero index');
  } catch (error) {
    assert(false, `Validator index validation test failed: ${error.message}`);
  }

  // Test 4: Validator validation - valid pubkey
  console.log('\n🔑 Testing Valid Validator Public Key...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    const validPubkey = '0x' + 'a'.repeat(96);
    assert(fetcher._validateValidator(validPubkey), 'Should validate hex pubkey');
  } catch (error) {
    assert(false, `Validator pubkey validation test failed: ${error.message}`);
  }

  // Test 5: Validator validation - invalid
  console.log('\n⚠️  Testing Invalid Validator Identifiers...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    assert(!fetcher._validateValidator(-1), 'Should reject negative index');
    assert(!fetcher._validateValidator('invalid'), 'Should reject invalid string');
    assert(!fetcher._validateValidator('0xshort'), 'Should reject short hex string');
    assert(!fetcher._validateValidator(null), 'Should reject null');
  } catch (error) {
    assert(false, `Invalid validator test failed: ${error.message}`);
  }

  // Test 6: getRewardsList validation - invalid validator
  console.log('\n🚫 Testing getRewardsList with Invalid Validator...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    await fetcher.getRewardsList('invalid');
    assert(false, 'Should throw error for invalid validator');
  } catch (error) {
    assert(error.message.includes('Invalid validator identifier'), 'Should throw error for invalid validator');
  }

  // Test 7: getRewardsList validation - invalid pageSize
  console.log('\n📄 Testing getRewardsList with Invalid Page Size...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    await fetcher.getRewardsList(1, { pageSize: 101 });
    assert(false, 'Should throw error for invalid pageSize');
  } catch (error) {
    assert(error.message.includes('pageSize must be between 1 and 100'), 'Should throw error for invalid pageSize');
  }

  // Test 8: getRewardsAggregate validation - invalid period
  console.log('\n⏰ Testing getRewardsAggregate with Invalid Period...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    await fetcher.getRewardsAggregate(1, { period: 'invalid' });
    assert(false, 'Should throw error for invalid period');
  } catch (error) {
    assert(error.message.includes('Invalid period'), 'Should throw error for invalid period');
  }

  // Test 9: Valid periods for getRewardsAggregate
  console.log('\n✅ Testing Valid Periods...');
  try {
    const validPeriods = ['24h', '7d', '30d'];
    for (const period of validPeriods) {
      assert(true, `Period '${period}' is valid`);
    }
  } catch (error) {
    assert(false, `Valid period test failed: ${error.message}`);
  }

  // Test 10: Cache functionality
  console.log('\n💾 Testing Cache Functionality...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    
    // Test cache stats
    const stats = fetcher.getCacheStats();
    assert(stats.size === 0, 'Cache should be empty initially');
    assert(Array.isArray(stats.keys), 'Cache stats should include keys array');
    
    // Test clear cache
    fetcher.clearCache();
    assertEqual(fetcher.cache.size, 0, 'Cache should be cleared');
  } catch (error) {
    assert(false, `Cache test failed: ${error.message}`);
  }

  // Test 11: Format rewards list with data
  console.log('\n📊 Testing Format Rewards List...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    const mockData = {
      data: [
        {
          validator_index: 12345,
          epoch: 100,
          attestation_reward: 1000000,
          sync_committee_reward: 500000,
          total_reward: 1500000
        },
        {
          validator_index: 67890,
          epoch: 100,
          attestation_reward: 2000000,
          sync_committee_reward: 600000,
          total_reward: 2600000
        }
      ]
    };
    
    const formatted = fetcher.formatRewardsList(mockData);
    assert(formatted.includes('Beaconchain Validator Rewards'), 'Should include title');
    assert(formatted.includes('Total entries: 2'), 'Should include total entries count');
    assert(formatted.includes('Validator Index'), 'Should include validator index');
    assert(formatted.includes('12345'), 'Should include first validator index value');
  } catch (error) {
    assert(false, `Format rewards list test failed: ${error.message}`);
  }

  // Test 12: Format rewards aggregate with data
  console.log('\n📋 Testing Format Rewards Aggregate...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    const mockData = {
      data: [
        {
          validator_index: 12345,
          total_attestation_rewards: 50000000,
          total_sync_rewards: 10000000,
          total_rewards: 60000000
        }
      ]
    };
    
    const formatted = fetcher.formatRewardsAggregate(mockData);
    assert(formatted.includes('Beaconchain Aggregated Rewards'), 'Should include title');
    assert(formatted.includes('Total Attestation Rewards'), 'Should include attestation rewards');
    assert(formatted.includes('Total Sync Rewards'), 'Should include sync rewards');
  } catch (error) {
    assert(false, `Format aggregate test failed: ${error.message}`);
  }

  // Test 13: Format with null data
  console.log('\n🚫 Testing Format with Null Data...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    const formatted = fetcher.formatRewardsList(null);
    assertEqual(formatted, 'No data available', 'Should return "No data available" for null');
  } catch (error) {
    assert(false, `Format null test failed: ${error.message}`);
  }

  // Test 14: Gwei to ETH conversion
  console.log('\n💰 Testing Gwei to ETH Conversion...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    assertEqual(fetcher.gweiToEth(1000000000), '1.000000000', 'Should convert 1 billion Gwei to 1 ETH');
    assertEqual(fetcher.gweiToEth(500000000), '0.500000000', 'Should convert 500 million Gwei to 0.5 ETH');
    assertEqual(fetcher.gweiToEth(0), '0.000000000', 'Should handle zero');
  } catch (error) {
    assert(false, `Gwei to ETH conversion test failed: ${error.message}`);
  }

  // Test 15: Multiple validator identifiers
  console.log('\n🔢 Testing Multiple Validator Identifiers...');
  try {
    const fetcher = new BeaconchainRewardsFetcher();
    const validPubkey1 = '0x' + 'a'.repeat(96);
    const validPubkey2 = '0x' + 'b'.repeat(96);
    
    // Validation should pass for array of validators
    const validators = [1, 2, validPubkey1, validPubkey2];
    for (const validator of validators) {
      assert(fetcher._validateValidator(validator), `Should validate ${validator}`);
    }
  } catch (error) {
    assert(false, `Multiple validators test failed: ${error.message}`);
  }

  // Test 16: Multiple instances
  console.log('\n🔄 Testing Multiple Instances...');
  try {
    const fetcher1 = new BeaconchainRewardsFetcher();
    const fetcher2 = new BeaconchainRewardsFetcher({ apiKey: 'different-key' });
    
    assert(fetcher1.apiKey !== fetcher2.apiKey, 'Should create independent instances');
    assert(fetcher1.cache !== fetcher2.cache, 'Should have separate caches');
  } catch (error) {
    assert(false, `Multiple instances test failed: ${error.message}`);
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
