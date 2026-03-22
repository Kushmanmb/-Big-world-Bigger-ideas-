#!/usr/bin/env node

/**
 * Fetch Block Rewards Script
 *
 * Fetches Bitcoin mining block rewards from the mempool.space API.
 * Equivalent to: curl -sSL "https://mempool.space/api/v1/mining/blocks/rewards/1d"
 *
 * Usage:
 *   node scripts/fetch-block-rewards.js [period]
 *
 * Periods: 1d (default), 3d, 1w, 1m, 3m, 6m, 1y, 2y, 3y, all
 *
 * Note: Each invocation creates a fresh fetcher instance; the built-in 60-second
 * cache applies only within a single run and does not persist across calls.
 *
 *   node scripts/fetch-block-rewards.js
 *   node scripts/fetch-block-rewards.js 1w
 *   npm run block-rewards
 *   npm run block-rewards -- 1w
 */

const BitcoinMiningFetcher = require('../src/bitcoin-mining');

const period = process.argv[2] || '1d';

async function main() {
  const fetcher = new BitcoinMiningFetcher();

  try {
    const data = await fetcher.getBlockRewards(period);
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
