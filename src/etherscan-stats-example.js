/**
 * Etherscan Stats Demo
 * Demonstrates fetching daily block rewards from Etherscan API
 */

const EtherscanStats = require('./etherscan-stats.js');

console.log('='.repeat(70));
console.log('📊 Etherscan Stats - Daily Block Rewards Demo');
console.log('='.repeat(70));

// IMPORTANT: Use environment variable for API key or replace with your key
const apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';
const chainId = 1; // Ethereum mainnet

// Demo 1: Create stats instance
console.log('\n📦 Creating Etherscan Stats instance:\n');

let stats;
try {
  stats = new EtherscanStats(apiKey, chainId);
  console.log(`✓ Created stats instance for chain ID ${chainId}`);
  console.log(`✓ API Base URL: ${stats.apiBaseUrl}`);
} catch (error) {
  console.error(`✗ Failed to create instance: ${error.message}`);
  process.exit(1);
}

// Demo 2: Get API information
console.log('\n' + '='.repeat(70));
console.log('\n📡 API Configuration:\n');

const apiInfo = stats.getAPIInfo();
console.log(`Base URL: ${apiInfo.baseUrl}`);
console.log(`Chain ID: ${apiInfo.chainId}`);
const apiKeyStatus = apiInfo.hasApiKey ? 'configured' : 'not configured';
console.log(`API Key Status: ${apiKeyStatus}`);
console.log(`Cache Timeout: ${apiInfo.cacheTimeout}ms`);

// Demo 3: Validate dates
console.log('\n' + '='.repeat(70));
console.log('\n✅ Validating Date Inputs:\n');

try {
  const start = stats.validateDate('2019-02-01');
  const end = stats.validateDate('2019-02-28');
  console.log(`✓ Start date: ${start}`);
  console.log(`✓ End date:   ${end}`);
} catch (error) {
  console.error(`✗ Date validation failed: ${error.message}`);
}

// Demo 4: Fetch daily block rewards (requires valid API key and network)
console.log('\n' + '='.repeat(70));
console.log('\n🔍 Fetching Daily Block Rewards:\n');
console.log('Note: This requires a valid Etherscan API key and network connection.\n');

async function fetchDailyBlockRewards() {
  try {
    console.log('Fetching daily block rewards for February 2019...');
    console.log('Please wait...\n');

    // Matches the problem statement curl command:
    // module=stats&action=dailyblockrewards&startdate=2019-02-01&enddate=2019-02-28&sort=desc
    const data = await stats.getDailyBlockRewards('2019-02-01', '2019-02-28', 'desc');

    console.log('✓ Successfully fetched daily block rewards!\n');
    console.log('='.repeat(70));
    console.log(stats.formatDailyBlockRewards(data));
    console.log('='.repeat(70));

    // Demo 5: Cache statistics
    console.log('\n📊 Cache Statistics:\n');
    const cacheStats = stats.getCacheStats();
    console.log(`Cache Size: ${cacheStats.size} entries`);
    console.log(`Cache Timeout: ${cacheStats.timeout}ms`);
    console.log(`Cached Keys: ${cacheStats.keys.length}`);

    // Demo 6: Fetch again (should use cache)
    console.log('\n' + '='.repeat(70));
    console.log('\n🔄 Fetching Again (Using Cache):\n');
    const cachedData = await stats.getDailyBlockRewards('2019-02-01', '2019-02-28', 'desc');
    console.log('✓ Retrieved from cache!');
    console.log(`Total Entries: ${cachedData.rewards.length}`);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    console.log('Common Issues:');
    console.log('  1. Invalid or missing Etherscan API key');
    console.log('  2. Network connection issues');
    console.log('  3. Rate limiting (too many requests)');
    console.log('  4. Date range too large\n');
    console.log('To get an Etherscan API key:');
    console.log('  1. Visit https://etherscan.io/');
    console.log('  2. Create a free account');
    console.log('  3. Generate an API key in your account settings');
  }
}

// Demo 7: Show example data format
console.log('\n' + '='.repeat(70));
console.log('\n📋 Expected Data Format:\n');
console.log(`
{
  "chainId": 1,
  "startdate": "2019-02-01",
  "enddate": "2019-02-28",
  "sort": "desc",
  "rewards": [
    {
      "UTCDate": "2019-02-28",
      "unixTimeStamp": "1551312000",
      "blockRewards_Eth": "13500.123456789",
      "blockCount": "5760",
      "uncleInclusionRewards_Eth": "50.123456789"
    },
    ...
  ],
  "status": "1",
  "message": "OK",
  "timestamp": 1234567890
}
`);

// Run the demo
console.log('='.repeat(70));
console.log('\n▶️  Starting Daily Block Rewards Fetch Demo...\n');

fetchDailyBlockRewards().then(() => {
  console.log('\n' + '='.repeat(70));
  console.log('\n✨ Demo Complete!');
  console.log('='.repeat(70));
}).catch(error => {
  console.error('\n💥 Demo failed:', error.message);
});
