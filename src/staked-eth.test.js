/**
 * Staked ETH Balance Module Tests
 * Tests for the StakedEthFetcher class (non-network tests)
 */

'use strict';

const StakedEthFetcher = require('./staked-eth.js');

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
    console.error(`  Actual:   ${actual}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('Running Staked ETH Module Tests...\n');
  console.log('='.repeat(50));

  // ── Test 1: Constructor ──────────────────────────────────
  console.log('\n📦 Testing Constructor...');
  try {
    const fetcher = new StakedEthFetcher();
    assert(fetcher !== null, 'Should create fetcher instance');
    assertEqual(fetcher.rpcUrl, 'https://ethereum.publicnode.com', 'Should use default RPC URL');
    assertEqual(fetcher.beaconApiUrl, 'beaconcha.in', 'Should use default beacon API URL');
    assert(fetcher.cacheManager !== null, 'Should initialize cache manager');
  } catch (error) {
    assert(false, `Constructor test failed: ${error.message}`);
  }

  // ── Test 2: Constructor with custom URLs ─────────────────
  console.log('\n🌐 Testing Constructor with Custom URLs...');
  try {
    const fetcher = new StakedEthFetcher('https://mainnet.infura.io/v3/key', 'beaconcha.in');
    assertEqual(fetcher.rpcUrl, 'https://mainnet.infura.io/v3/key', 'Should use custom RPC URL');
    assertEqual(fetcher.beaconApiUrl, 'beaconcha.in', 'Should use custom beacon API URL');
  } catch (error) {
    assert(false, `Custom URL test failed: ${error.message}`);
  }

  // ── Test 3: Address validation ───────────────────────────
  console.log('\n🔍 Testing Address Validation...');
  try {
    const fetcher = new StakedEthFetcher();

    assert(fetcher._validateAddress('0x1234567890123456789012345678901234567890'), 'Valid lowercase address should pass');
    assert(fetcher._validateAddress('0xAbCdEf1234567890123456789012345678901234'), 'Mixed-case address should pass');
    assert(!fetcher._validateAddress('0x123'), 'Short address should fail');
    assert(!fetcher._validateAddress('not-an-address'), 'Non-hex string should fail');
    assert(!fetcher._validateAddress(''), 'Empty string should fail');
    assert(!fetcher._validateAddress(null), 'null should fail');
    assert(!fetcher._validateAddress(undefined), 'undefined should fail');
    assert(!fetcher._validateAddress('1234567890123456789012345678901234567890'), 'Address without 0x should fail');
  } catch (error) {
    assert(false, `Address validation test failed: ${error.message}`);
  }

  // ── Test 4: _encodeBalanceOf ─────────────────────────────
  console.log('\n🔐 Testing _encodeBalanceOf...');
  try {
    const fetcher = new StakedEthFetcher();
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const encoded = fetcher._encodeBalanceOf(address);

    assert(encoded.startsWith('0x70a08231'), 'Should use balanceOf selector');
    assertEqual(encoded.length, 10 + 64, 'Encoded data should be 74 characters (4 bytes selector + 32 bytes param)');
    assert(encoded.includes(address.slice(2).toLowerCase()), 'Should include the address');
  } catch (error) {
    assert(false, `_encodeBalanceOf test failed: ${error.message}`);
  }

  // ── Test 5: _decodeUint256 ───────────────────────────────
  console.log('\n🔢 Testing _decodeUint256...');
  try {
    const fetcher = new StakedEthFetcher();

    assertEqual(fetcher._decodeUint256('0x'), '0', 'Should return 0 for 0x');
    assertEqual(fetcher._decodeUint256(''), '0', 'Should return 0 for empty string');
    assertEqual(fetcher._decodeUint256(null), '0', 'Should return 0 for null');
    assertEqual(fetcher._decodeUint256('0x0000000000000000000000000000000000000000000000000de0b6b3a7640000'), '1000000000000000000', 'Should decode 1 ETH in wei');
    assertEqual(fetcher._decodeUint256('0x0000000000000000000000000000000000000000000000000000000000000001'), '1', 'Should decode 1');
  } catch (error) {
    assert(false, `_decodeUint256 test failed: ${error.message}`);
  }

  // ── Test 6: _weiToEth ────────────────────────────────────
  console.log('\n💱 Testing _weiToEth...');
  try {
    const fetcher = new StakedEthFetcher();

    assertEqual(fetcher._weiToEth('0'), '0.000000000000000000', 'Should format 0 wei');
    assertEqual(fetcher._weiToEth('1000000000000000000'), '1.000000000000000000', 'Should format 1 ETH');
    assertEqual(fetcher._weiToEth('2500000000000000000'), '2.500000000000000000', 'Should format 2.5 ETH');
    assertEqual(fetcher._weiToEth(null), '0.000000000000000000', 'Should handle null');
  } catch (error) {
    assert(false, `_weiToEth test failed: ${error.message}`);
  }

  // ── Test 7: _gweiToEth ───────────────────────────────────
  console.log('\n💱 Testing _gweiToEth...');
  try {
    const fetcher = new StakedEthFetcher();

    assertEqual(fetcher._gweiToEth(0), '0.000000000', 'Should format 0 gwei');
    assertEqual(fetcher._gweiToEth(1000000000), '1.000000000', 'Should format 1 ETH from gwei');
    assertEqual(fetcher._gweiToEth(32000000000), '32.000000000', 'Should format 32 ETH (minimum validator stake)');
    assertEqual(fetcher._gweiToEth(null), '0.000000000', 'Should handle null');
  } catch (error) {
    assert(false, `_gweiToEth test failed: ${error.message}`);
  }

  // ── Test 8: getLiquidTokenBalance — invalid address ──────
  console.log('\n⚠️  Testing getLiquidTokenBalance with invalid address...');
  try {
    const fetcher = new StakedEthFetcher();
    await fetcher.getLiquidTokenBalance('not-an-address', 'stETH');
    assert(false, 'Should throw error for invalid address');
  } catch (error) {
    assert(error.message.includes('Invalid Ethereum address'), 'Should throw address validation error');
  }

  // ── Test 9: getLiquidTokenBalance — unknown token ────────
  console.log('\n⚠️  Testing getLiquidTokenBalance with unknown token...');
  try {
    const fetcher = new StakedEthFetcher();
    await fetcher.getLiquidTokenBalance('0x1234567890123456789012345678901234567890', 'UNKNOWN');
    assert(false, 'Should throw error for unknown token');
  } catch (error) {
    assert(error.message.includes('Unknown liquid staking token'), 'Should throw unknown token error');
    assert(error.message.includes('stETH'), 'Error should list valid tokens');
  }

  // ── Test 10: getNativeStakedBalance — invalid address ────
  console.log('\n⚠️  Testing getNativeStakedBalance with invalid address...');
  try {
    const fetcher = new StakedEthFetcher();
    await fetcher.getNativeStakedBalance('bad-address');
    assert(false, 'Should throw error for invalid address');
  } catch (error) {
    assert(error.message.includes('Invalid Ethereum address'), 'Should throw address validation error');
  }

  // ── Test 11: getStakedBalance — invalid address ──────────
  console.log('\n⚠️  Testing getStakedBalance with invalid address...');
  try {
    const fetcher = new StakedEthFetcher();
    await fetcher.getStakedBalance('0xinvalid');
    assert(false, 'Should throw error for invalid address');
  } catch (error) {
    assert(error.message.includes('Invalid Ethereum address'), 'Should throw address validation error');
  }

  // ── Test 12: Cache functionality ─────────────────────────
  console.log('\n💾 Testing Cache Functionality...');
  try {
    const fetcher = new StakedEthFetcher();

    const stats = fetcher.getCacheStats();
    assertEqual(stats.size, 0, 'Cache should be empty initially');
    assert(Array.isArray(stats.keys), 'Cache stats should include keys array');
    assert(typeof stats.timeout === 'number', 'Cache stats should include timeout');

    fetcher.clearCache();
    assertEqual(fetcher.cacheManager.cache.size, 0, 'Cache should be cleared');
  } catch (error) {
    assert(false, `Cache test failed: ${error.message}`);
  }

  // ── Test 13: formatBalance — no data ─────────────────────
  console.log('\n📋 Testing formatBalance with no data...');
  try {
    const fetcher = new StakedEthFetcher();
    const result = fetcher.formatBalance(null);
    assertEqual(result, 'No balance data available', 'Should handle null input gracefully');
    const result2 = fetcher.formatBalance(undefined);
    assertEqual(result2, 'No balance data available', 'Should handle undefined input gracefully');
  } catch (error) {
    assert(false, `formatBalance null test failed: ${error.message}`);
  }

  // ── Test 14: formatBalance — liquid staking result ───────
  console.log('\n📋 Testing formatBalance with liquid staking data...');
  try {
    const fetcher = new StakedEthFetcher();
    const mockData = {
      address: '0x1234567890123456789012345678901234567890',
      liquidStaking: {
        stETH: { token: 'stETH', balanceWei: '1000000000000000000', balanceEth: '1.000000000000000000' },
        rETH: { token: 'rETH', balanceWei: '0', balanceEth: '0.000000000000000000' },
        cbETH: { token: 'cbETH', balanceWei: '0', balanceEth: '0.000000000000000000' },
        wstETH: { token: 'wstETH', balanceWei: '0', balanceEth: '0.000000000000000000' }
      },
      totalLiquidBalanceWei: '1000000000000000000',
      totalLiquidBalanceEth: '1.000000000000000000'
    };
    const output = fetcher.formatBalance(mockData);
    assert(output.includes('Staked ETH Balance'), 'Output should include title');
    assert(output.includes(mockData.address), 'Output should include address');
    assert(output.includes('stETH'), 'Output should include stETH');
    assert(output.includes('Total Liquid Staked'), 'Output should include total');
  } catch (error) {
    assert(false, `formatBalance liquid test failed: ${error.message}`);
  }

  // ── Test 15: formatBalance — native staking result ───────
  console.log('\n📋 Testing formatBalance with native staking data...');
  try {
    const fetcher = new StakedEthFetcher();
    const mockData = {
      address: '0x1234567890123456789012345678901234567890',
      validatorCount: 2,
      validators: [
        { index: 1, status: 'active_online', balanceGwei: 32100000000, balanceEth: '32.100000000' },
        { index: 2, status: 'active_online', balanceGwei: 31900000000, balanceEth: '31.900000000' }
      ],
      totalBalanceGwei: '64000000000',
      totalBalanceEth: '64.000000000'
    };
    const output = fetcher.formatBalance(mockData);
    assert(output.includes('Native Staking'), 'Output should include Native Staking section');
    assert(output.includes('Validators: 2'), 'Output should include validator count');
    assert(output.includes('64.000000000'), 'Output should include total balance');
  } catch (error) {
    assert(false, `formatBalance native test failed: ${error.message}`);
  }

  // ── Test 16: formatBalance — single token result ─────────
  console.log('\n📋 Testing formatBalance with single token data...');
  try {
    const fetcher = new StakedEthFetcher();
    const mockData = {
      address: '0x1234567890123456789012345678901234567890',
      token: 'stETH',
      tokenName: 'Lido Staked ETH',
      tokenContract: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      balanceWei: '5000000000000000000',
      balanceEth: '5.000000000000000000'
    };
    const output = fetcher.formatBalance(mockData);
    assert(output.includes('Lido Staked ETH'), 'Output should include token name');
    assert(output.includes('stETH'), 'Output should include token symbol');
    assert(output.includes('5.000000000000000000'), 'Output should include balance');
  } catch (error) {
    assert(false, `formatBalance single token test failed: ${error.message}`);
  }

  // ── Test 17: CONTRACTS static property ───────────────────
  console.log('\n🏦 Testing CONTRACTS static property...');
  try {
    const contracts = StakedEthFetcher.CONTRACTS;
    assert(contracts !== null, 'CONTRACTS should be defined');
    assert(typeof contracts === 'object', 'CONTRACTS should be an object');
    assert('stETH' in contracts, 'CONTRACTS should include stETH');
    assert('rETH' in contracts, 'CONTRACTS should include rETH');
    assert('cbETH' in contracts, 'CONTRACTS should include cbETH');
    assert('wstETH' in contracts, 'CONTRACTS should include wstETH');
    assertEqual(contracts.stETH.address, '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', 'stETH contract address should be correct');
  } catch (error) {
    assert(false, `CONTRACTS test failed: ${error.message}`);
  }

  // ── Summary ──────────────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log(`Tests complete: ${testsPassed} passed, ${testsFailed} failed`);

  if (testsFailed === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.error(`\n❌ ${testsFailed} test(s) failed`);
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test runner error:', error.message);
  process.exit(1);
});
