/**
 * Beaconchain Rewards Module Example
 * Demonstrates how to use the Beaconchain Validator Rewards fetcher
 */

const BeaconchainRewardsFetcher = require('./beaconchain-rewards.js');

async function runExample() {
  console.log('🌏 Big World Bigger Ideas - Beaconchain Rewards Example\n');
  console.log('='.repeat(60));
  
  // Create a fetcher instance
  console.log('\n📦 Creating Beaconchain Rewards fetcher...');
  const fetcher = new BeaconchainRewardsFetcher({
    // apiKey: 'YOUR_API_KEY_HERE', // Uncomment and add your API key for production use
    network: 'mainnet'
  });
  console.log('✓ Fetcher created successfully');
  console.log('  Note: Some endpoints require an API key from beaconcha.in');
  
  // Example 1: Fetch rewards list for a validator
  console.log('\n' + '='.repeat(60));
  console.log('📊 Example 1: Fetching rewards list for validator...');
  console.log('='.repeat(60));
  try {
    // Using validator index 1 as an example
    const rewardsList = await fetcher.getRewardsList(1, {
      pageSize: 5,
      epoch: 347566
    });
    console.log('\n✓ Rewards list fetched successfully!');
    console.log('\nFormatted Output:');
    console.log(fetcher.formatRewardsList(rewardsList));
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This endpoint requires an API key or may be unavailable without network access.');
    console.log('The module is ready to use in production with proper authentication.\n');
  }
  
  // Example 2: Fetch aggregated rewards
  console.log('\n' + '='.repeat(60));
  console.log('💰 Example 2: Fetching aggregated rewards (24h)...');
  console.log('='.repeat(60));
  try {
    const aggregateRewards = await fetcher.getRewardsAggregate([1, 2, 3], {
      period: '24h'
    });
    console.log('\n✓ Aggregated rewards fetched successfully!');
    console.log('\nFormatted Output:');
    console.log(fetcher.formatRewardsAggregate(aggregateRewards));
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This endpoint requires an API key or may be unavailable without network access.');
  }
  
  // Example 3: Fetch validator information
  console.log('\n' + '='.repeat(60));
  console.log('ℹ️  Example 3: Fetching validator information...');
  console.log('='.repeat(60));
  try {
    const validatorInfo = await fetcher.getValidatorInfo(1);
    console.log('\n✓ Validator info fetched successfully!');
    console.log('\nSample data structure:');
    console.log(JSON.stringify(validatorInfo, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This endpoint requires an API key or may be unavailable without network access.');
  }
  
  // Example 4: Fetch total rewards using V1 API
  console.log('\n' + '='.repeat(60));
  console.log('📈 Example 4: Fetching total rewards (V1 API - no auth)...');
  console.log('='.repeat(60));
  try {
    const totalRewards = await fetcher.getTotalRewards([1, 2]);
    console.log('\n✓ Total rewards fetched successfully!');
    console.log('\nSample data structure:');
    console.log(JSON.stringify(totalRewards, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This is expected in environments without internet access.');
  }
  
  // Example 5: Demonstrate formatting with mock data
  console.log('\n' + '='.repeat(60));
  console.log('🎨 Example 5: Formatting mock rewards data...');
  console.log('='.repeat(60));
  
  const mockRewardsList = {
    data: [
      {
        validator_index: 12345,
        epoch: 100,
        attestation_reward: 15000000,
        sync_committee_reward: 5000000,
        total_reward: 20000000
      },
      {
        validator_index: 12345,
        epoch: 101,
        attestation_reward: 16000000,
        sync_committee_reward: 4000000,
        total_reward: 20000000
      },
      {
        validator_index: 12345,
        epoch: 102,
        attestation_reward: 14000000,
        sync_committee_reward: 6000000,
        total_reward: 20000000
      }
    ]
  };
  
  console.log('\nMock rewards list formatting:');
  console.log(fetcher.formatRewardsList(mockRewardsList));
  
  // Example 6: Demonstrate aggregated rewards formatting
  console.log('\n' + '='.repeat(60));
  console.log('📊 Example 6: Formatting mock aggregated rewards...');
  console.log('='.repeat(60));
  
  const mockAggregateRewards = {
    data: [
      {
        validator_index: 12345,
        total_attestation_rewards: 450000000,
        total_sync_rewards: 150000000,
        total_rewards: 600000000
      },
      {
        validator_index: 67890,
        total_attestation_rewards: 480000000,
        total_sync_rewards: 140000000,
        total_rewards: 620000000
      }
    ]
  };
  
  console.log('\nMock aggregated rewards formatting:');
  console.log(fetcher.formatRewardsAggregate(mockAggregateRewards));
  
  // Example 7: Gwei to ETH conversion
  console.log('\n' + '='.repeat(60));
  console.log('💱 Example 7: Converting Gwei to ETH...');
  console.log('='.repeat(60));
  
  const gweiAmounts = [1000000000, 500000000, 20000000, 15000000];
  console.log('\nGwei to ETH conversions:');
  gweiAmounts.forEach(gwei => {
    const eth = fetcher.gweiToEth(gwei);
    console.log(`  ${gwei.toLocaleString()} Gwei = ${eth} ETH`);
  });
  
  // Example 8: Cache statistics
  console.log('\n' + '='.repeat(60));
  console.log('💾 Example 8: Cache statistics...');
  console.log('='.repeat(60));
  
  const cacheStats = fetcher.getCacheStats();
  console.log('\nCache Statistics:');
  console.log(`  Size: ${cacheStats.size} entries`);
  console.log(`  Timeout: ${cacheStats.timeout / 1000} seconds`);
  console.log(`  Keys: ${cacheStats.keys.length > 0 ? cacheStats.keys.join(', ') : 'None'}`);
  
  // Example 9: Using different time periods
  console.log('\n' + '='.repeat(60));
  console.log('📅 Example 9: Available time periods for aggregated rewards...');
  console.log('='.repeat(60));
  
  console.log('\nSupported time periods:');
  const periods = ['24h', '7d', '30d'];
  periods.forEach(period => {
    console.log(`  • ${period.padEnd(4)} - ${getPeriodDescription(period)}`);
  });
  
  // Example 10: Multiple validators
  console.log('\n' + '='.repeat(60));
  console.log('👥 Example 10: Working with multiple validators...');
  console.log('='.repeat(60));
  
  console.log('\nYou can query multiple validators at once:');
  console.log('  const validators = [1, 2, 3, 4, 5];');
  console.log('  await fetcher.getRewardsList(validators, { pageSize: 10 });');
  console.log('  await fetcher.getRewardsAggregate(validators, { period: "7d" });');
  
  console.log('\nYou can also use validator public keys:');
  console.log('  const pubkey = "0xabcd..."; // 96-character hex string');
  console.log('  await fetcher.getRewardsList(pubkey);');
  
  // Clear cache at the end
  fetcher.clearCache();
  console.log('\n✓ Cache cleared');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Example completed successfully!');
  console.log('='.repeat(60));
  console.log('\n💡 Usage Tips:');
  console.log('  1. Get an API key from beaconcha.in for full access');
  console.log('  2. Create fetcher: const fetcher = new BeaconchainRewardsFetcher({ apiKey: "..." })');
  console.log('  3. Fetch rewards: await fetcher.getRewardsList(validatorIndex)');
  console.log('  4. Format output: fetcher.formatRewardsList(data)');
  console.log('  5. Convert units: fetcher.gweiToEth(amount)');
  console.log('\n🔗 API Documentation: https://docs.beaconcha.in/');
  console.log('📚 Get your API key at: https://beaconcha.in/pricing');
}

function getPeriodDescription(period) {
  const descriptions = {
    '24h': 'Last 24 hours',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days'
  };
  return descriptions[period] || 'Unknown period';
}

// Run the example
runExample().catch(error => {
  console.error('\n❌ Example failed:', error);
  process.exit(1);
});
