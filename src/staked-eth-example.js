/**
 * Staked ETH Balance Module - Usage Examples
 *
 * Demonstrates how to fetch staked ETH balances using StakedEthFetcher.
 * Note: Examples that require network access will fail in offline environments.
 */

'use strict';

const StakedEthFetcher = require('./staked-eth.js');

// Example Ethereum address (well-known Ethereum Foundation address)
const EXAMPLE_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

async function main() {
  console.log('Staked ETH Balance Module - Examples');
  console.log('=====================================\n');

  const fetcher = new StakedEthFetcher();

  // ──────────────────────────────────────────────────────────────────────────
  // Example 1: Inspect available liquid staking contracts
  // ──────────────────────────────────────────────────────────────────────────
  console.log('Example 1: Supported Liquid Staking Tokens');
  console.log('-------------------------------------------');
  const contracts = StakedEthFetcher.CONTRACTS;
  for (const [symbol, info] of Object.entries(contracts)) {
    console.log(`  ${symbol} — ${info.name}`);
    console.log(`    Contract: ${info.address}`);
  }
  console.log();

  // ──────────────────────────────────────────────────────────────────────────
  // Example 2: Fetch stETH (Lido) balance
  // ──────────────────────────────────────────────────────────────────────────
  console.log('Example 2: Fetch stETH (Lido) balance');
  console.log('--------------------------------------');
  try {
    const result = await fetcher.getStETHBalance(EXAMPLE_ADDRESS);
    console.log(`  Address:       ${result.address}`);
    console.log(`  Token:         ${result.tokenName} (${result.token})`);
    console.log(`  Balance (Wei): ${result.balanceWei}`);
    console.log(`  Balance (ETH): ${result.balanceEth}`);
  } catch (error) {
    console.log(`  ⚠ Could not fetch stETH balance: ${error.message}`);
  }
  console.log();

  // ──────────────────────────────────────────────────────────────────────────
  // Example 3: Fetch rETH (Rocket Pool) balance
  // ──────────────────────────────────────────────────────────────────────────
  console.log('Example 3: Fetch rETH (Rocket Pool) balance');
  console.log('--------------------------------------------');
  try {
    const result = await fetcher.getRETHBalance(EXAMPLE_ADDRESS);
    console.log(`  Token:         ${result.tokenName} (${result.token})`);
    console.log(`  Balance (ETH): ${result.balanceEth}`);
  } catch (error) {
    console.log(`  ⚠ Could not fetch rETH balance: ${error.message}`);
  }
  console.log();

  // ──────────────────────────────────────────────────────────────────────────
  // Example 4: Fetch all liquid staking balances at once
  // ──────────────────────────────────────────────────────────────────────────
  console.log('Example 4: Fetch all liquid staking balances');
  console.log('--------------------------------------------');
  try {
    const result = await fetcher.getStakedBalance(EXAMPLE_ADDRESS);
    console.log(fetcher.formatBalance(result));
  } catch (error) {
    console.log(`  ⚠ Could not fetch combined balance: ${error.message}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Example 5: Fetch native staked ETH via beacon chain validators
  // ──────────────────────────────────────────────────────────────────────────
  console.log('Example 5: Fetch native staked ETH (Beacon Chain)');
  console.log('-------------------------------------------------');
  try {
    const result = await fetcher.getNativeStakedBalance(EXAMPLE_ADDRESS);
    console.log(fetcher.formatBalance(result));
  } catch (error) {
    console.log(`  ⚠ Could not fetch native staked balance: ${error.message}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Example 6: Use a specific liquid staking token by symbol
  // ──────────────────────────────────────────────────────────────────────────
  console.log('Example 6: Fetch cbETH (Coinbase) and wstETH balances');
  console.log('------------------------------------------------------');
  try {
    const [cbETH, wstETH] = await Promise.all([
      fetcher.getCBETHBalance(EXAMPLE_ADDRESS),
      fetcher.getWSTETHBalance(EXAMPLE_ADDRESS)
    ]);
    console.log(`  cbETH  Balance: ${cbETH.balanceEth} ETH`);
    console.log(`  wstETH Balance: ${wstETH.balanceEth} ETH`);
  } catch (error) {
    console.log(`  ⚠ Could not fetch cbETH/wstETH balance: ${error.message}`);
  }
  console.log();

  // ──────────────────────────────────────────────────────────────────────────
  // Example 7: Cache statistics
  // ──────────────────────────────────────────────────────────────────────────
  console.log('Example 7: Cache Statistics');
  console.log('---------------------------');
  const stats = fetcher.getCacheStats();
  console.log(`  Cached entries: ${stats.size}`);
  console.log(`  Cache timeout:  ${stats.timeout}ms`);
  if (stats.keys.length > 0) {
    console.log(`  Cached keys:    ${stats.keys.join(', ')}`);
  }
  console.log();

  // ──────────────────────────────────────────────────────────────────────────
  // Example 8: Custom RPC endpoint
  // ──────────────────────────────────────────────────────────────────────────
  console.log('Example 8: Custom RPC endpoint');
  console.log('------------------------------');
  const customFetcher = new StakedEthFetcher(
    'https://eth.llamarpc.com',
    'beaconcha.in'
  );
  console.log(`  RPC URL:        ${customFetcher.rpcUrl}`);
  console.log(`  Beacon API URL: ${customFetcher.beaconApiUrl}`);
  console.log();

  console.log('All examples complete.');
}

main().catch(error => {
  console.error('Example runner error:', error.message);
  process.exit(1);
});
