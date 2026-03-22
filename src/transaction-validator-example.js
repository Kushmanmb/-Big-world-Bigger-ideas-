/**
 * Transaction Validator Example
 * Demonstrates how to use the TransactionValidator module
 */

const TransactionValidator = require('./transaction-validator.js');

async function runExample() {
  console.log('Transaction Validator – Usage Examples\n');
  console.log('='.repeat(50) + '\n');

  // -----------------------------------------------------------------------
  // 1. Constructor options
  // -----------------------------------------------------------------------
  console.log('1️⃣  Creating a validator instance...\n');
  const validator = new TransactionValidator({
    // Provide your Etherscan API key for Ethereum transaction lookups.
    // Leave null to skip Etherscan validation.
    etherscanApiKey: process.env.ETHERSCAN_API_KEY || null,

    // Optional: override API base URLs (useful for testing / private nodes)
    // mempoolBaseUrl:    'mempool.space',
    // blockchairBaseUrl: 'api.blockchair.com',

    // Optional: cache timeout in milliseconds (default 60 000 ms)
    cacheTimeout: 60000
  });

  console.log('Supported chains:\n', TransactionValidator.getSupportedChains());
  console.log();

  // -----------------------------------------------------------------------
  // 2. Validate a Bitcoin transaction via Mempool.space
  // -----------------------------------------------------------------------
  // NOTE: Replace with a real txid for live testing.
  const btcTxId = process.env.BTC_TX_HASH ||
    'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d'; // genesis coinbase

  console.log('2️⃣  Validating Bitcoin transaction via Mempool.space...');
  console.log(`   txHash: ${btcTxId}\n`);
  try {
    const result = await validator.validateBitcoinTransaction(btcTxId);
    console.log(validator.formatResult(result));
  } catch (err) {
    console.error('Mempool.space error (live API call):', err.message);
  }

  // -----------------------------------------------------------------------
  // 3. Validate an Ethereum transaction via Blockchair
  // -----------------------------------------------------------------------
  const ethTxHash = process.env.ETH_TX_HASH ||
    '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060'; // DAO hack

  console.log('3️⃣  Validating Ethereum transaction via Blockchair...');
  console.log(`   txHash: ${ethTxHash}\n`);
  try {
    const result = await validator.validateBlockchairTransaction(ethTxHash, 'ethereum');
    console.log(validator.formatResult(result));
  } catch (err) {
    console.error('Blockchair error (live API call):', err.message);
  }

  // -----------------------------------------------------------------------
  // 4. Validate an Ethereum transaction via Etherscan (requires API key)
  // -----------------------------------------------------------------------
  if (validator.etherscanApiKey) {
    console.log('4️⃣  Validating Ethereum transaction via Etherscan...');
    console.log(`   txHash: ${ethTxHash}\n`);
    try {
      const result = await validator.validateEthereumTransaction(ethTxHash, 1);
      console.log(validator.formatResult(result));
    } catch (err) {
      console.error('Etherscan error:', err.message);
    }
  } else {
    console.log('4️⃣  Skipping Etherscan example (ETHERSCAN_API_KEY not set)\n');
  }

  // -----------------------------------------------------------------------
  // 5. Aggregated cross-API validation
  // -----------------------------------------------------------------------
  console.log('5️⃣  Aggregated validation (all available APIs)...');
  console.log(`   txHash: ${btcTxId}  chain: bitcoin\n`);
  try {
    const result = await validator.validateTransaction(btcTxId, 'bitcoin');
    console.log(validator.formatAggregatedResult(result));
  } catch (err) {
    console.error('Aggregated validation error (live API call):', err.message);
  }

  // -----------------------------------------------------------------------
  // 6. Cache statistics
  // -----------------------------------------------------------------------
  console.log('6️⃣  Cache statistics after all lookups:\n');
  const cacheStats = validator.getCacheStats();
  console.log(`  Cached entries : ${cacheStats.size}`);
  console.log(`  Cache timeout  : ${cacheStats.timeout} ms`);
  console.log(`  Cached keys    : ${cacheStats.keys.join(', ') || '(none)'}`);
  console.log();

  // Clear the cache
  validator.clearCache();
  console.log('Cache cleared.\n');
}

runExample().catch(err => {
  console.error('Example failed:', err);
  process.exit(1);
});
