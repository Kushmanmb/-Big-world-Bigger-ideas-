/**
 * Validator Rewards Module Tests
 */

const ValidatorRewards = require('./validator-rewards.js');

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
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual  : ${JSON.stringify(actual)}`);
    testsFailed++;
  }
}

// ---------------------------------------------------------------------------
// Sample data (mirrors the structure from the problem statement)
// ---------------------------------------------------------------------------
const SAMPLE_ENTRY = {
  total: '80660680222696592',
  validator: {
    index: 1,
    public_key:
      '0xa1d1ad0714035353258038e964ae9675dc0252ee22cea896825c01458e1807bfad2f9969338798548d9858a571f7425c'
  },
  total_reward: '80660680222696592',
  total_penalty: '0',
  total_missed: '132644000000000',
  attestation: {
    total: '9371000000000',
    head: {
      total: '2408000000000',
      reward: '2408000000000',
      penalty: '0',
      missed_reward: '0'
    },
    source: {
      total: '2437000000000',
      reward: '2437000000000',
      penalty: '0',
      missed_reward: '0'
    },
    target: {
      total: '4526000000000',
      reward: '4526000000000',
      penalty: '0',
      missed_reward: '0'
    },
    inactivity_leak_penalty: '0',
    inclusion_delay: null
  },
  sync_committee: {
    total: '0',
    reward: '0',
    penalty: '0',
    missed_reward: '0'
  },
  proposal: {
    total: '80651309222696592',
    execution_layer_reward: '35087332222696592',
    attestation_inclusion_reward: '43946801000000000',
    sync_inclusion_reward: '1617176000000000',
    slashing_inclusion_reward: '0',
    missed_cl_reward: '132644000000000',
    missed_el_reward: '0'
  },
  finality: 'finalized'
};

const SAMPLE_RESPONSE = {
  data: [SAMPLE_ENTRY],
  paging: {},
  range: {
    slot: { start: 11122112, end: 11122143 },
    epoch: { start: 347566, end: 347566 },
    timestamp: { start: 1740289367, end: 1740289750 }
  }
};

// ---------------------------------------------------------------------------

async function runTests() {
  console.log('Running Validator Rewards Module Tests...\n');
  console.log('='.repeat(50));

  // ------------------------------------------------------------------
  // weiToEth
  // ------------------------------------------------------------------
  console.log('\n💱 Testing weiToEth...');

  try {
    assertEqual(ValidatorRewards.weiToEth('0'), '0', 'weiToEth(0) should be "0"');
    assertEqual(
      ValidatorRewards.weiToEth('1000000000000000000'),
      '1',
      'weiToEth(1e18) should be "1"'
    );
    assert(
      ValidatorRewards.weiToEth('500000000000000000').startsWith('0.5'),
      'weiToEth(0.5 ETH) starts with "0.5"'
    );
    assert(
      ValidatorRewards.weiToEth(null) === '0',
      'weiToEth(null) should return "0"'
    );
    assert(
      ValidatorRewards.weiToEth(undefined) === '0',
      'weiToEth(undefined) should return "0"'
    );
  } catch (error) {
    assert(false, `weiToEth test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // validatePublicKey
  // ------------------------------------------------------------------
  console.log('\n🔑 Testing validatePublicKey...');

  try {
    // Valid key (96 hex chars without 0x prefix)
    assert(
      ValidatorRewards.validatePublicKey(SAMPLE_ENTRY.validator.public_key),
      'Should accept valid BLS public key with 0x prefix'
    );
    // Valid key without 0x prefix
    assert(
      ValidatorRewards.validatePublicKey('a1d1ad0714035353258038e964ae9675dc0252ee22cea896825c01458e1807bfad2f9969338798548d9858a571f7425c'),
      'Should accept valid BLS public key without 0x prefix'
    );
    assert(!ValidatorRewards.validatePublicKey(''), 'Should reject empty string');
    assert(!ValidatorRewards.validatePublicKey(null), 'Should reject null');
    assert(!ValidatorRewards.validatePublicKey('0xdeadbeef'), 'Should reject short hex string');
    assert(!ValidatorRewards.validatePublicKey('gg' + '0'.repeat(94)), 'Should reject non-hex characters');
    assert(
      !ValidatorRewards.validatePublicKey('zz' + '0'.repeat(94)),
      'Should reject non-hex characters without 0x prefix'
    );
    assert(
      !ValidatorRewards.validatePublicKey('a1d1ad' + '0'.repeat(80)),
      'Should reject key without 0x prefix that is too short'
    );
  } catch (error) {
    assert(false, `validatePublicKey test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // validateEntry
  // ------------------------------------------------------------------
  console.log('\n✅ Testing validateEntry...');

  try {
    const result = ValidatorRewards.validateEntry(SAMPLE_ENTRY);
    assert(result.valid, 'Should accept a valid entry');
    assertEqual(result.errors.length, 0, 'Should have no errors for a valid entry');

    const badResult = ValidatorRewards.validateEntry(null);
    assert(!badResult.valid, 'Should reject null entry');
    assert(badResult.errors.length > 0, 'Should have errors for null entry');

    const missingValidator = { ...SAMPLE_ENTRY, validator: null };
    const mvResult = ValidatorRewards.validateEntry(missingValidator);
    assert(!mvResult.valid, 'Should reject entry with null validator');

    const missingReward = { ...SAMPLE_ENTRY };
    delete missingReward.total_reward;
    const mrResult = ValidatorRewards.validateEntry(missingReward);
    assert(!mrResult.valid, 'Should reject entry missing total_reward');
  } catch (error) {
    assert(false, `validateEntry test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // validateResponse
  // ------------------------------------------------------------------
  console.log('\n📋 Testing validateResponse...');

  try {
    const result = ValidatorRewards.validateResponse(SAMPLE_RESPONSE);
    assert(result.valid, 'Should accept a valid response');

    const noData = { paging: {}, range: {} };
    const ndResult = ValidatorRewards.validateResponse(noData);
    assert(!ndResult.valid, 'Should reject response without data array');

    const badRange = { data: [SAMPLE_ENTRY], range: 'bad' };
    const brResult = ValidatorRewards.validateResponse(badRange);
    assert(!brResult.valid, 'Should reject response with non-object range');
  } catch (error) {
    assert(false, `validateResponse test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // parseEntry
  // ------------------------------------------------------------------
  console.log('\n🔄 Testing parseEntry...');

  try {
    const parsed = ValidatorRewards.parseEntry(SAMPLE_ENTRY);
    assertEqual(parsed.validator.index, 1, 'Should parse validator index');
    assertEqual(
      parsed.validator.publicKey,
      SAMPLE_ENTRY.validator.public_key,
      'Should parse public key'
    );
    assertEqual(parsed.finality, 'finalized', 'Should parse finality');

    // Check totals are present
    assert(parsed.totals.rewardEth !== undefined, 'Should include rewardEth');
    assert(parsed.totals.penaltyEth !== undefined, 'Should include penaltyEth');
    assert(parsed.totals.missedEth !== undefined, 'Should include missedEth');

    // Attestation
    assert(parsed.attestation !== null, 'Should parse attestation rewards');
    assert(parsed.attestation.head.rewardEth !== undefined, 'Should parse head reward ETH');
    assert(parsed.attestation.source.rewardEth !== undefined, 'Should parse source reward ETH');
    assert(parsed.attestation.target.rewardEth !== undefined, 'Should parse target reward ETH');

    // Sync committee
    assert(parsed.syncCommittee !== null, 'Should parse sync committee');
    assertEqual(parsed.syncCommittee.totalEth, '0', 'Sync committee total should be 0 ETH');

    // Proposal
    assert(parsed.proposal !== null, 'Should parse proposal');
    assert(
      parsed.proposal.executionLayerRewardEth !== undefined,
      'Should parse execution layer reward ETH'
    );

    // Reject invalid entry
    try {
      ValidatorRewards.parseEntry(null);
      assert(false, 'Should throw for null entry');
    } catch (e) {
      assert(e.message.includes('Invalid'), 'Should throw with descriptive message for null entry');
    }
  } catch (error) {
    assert(false, `parseEntry test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // parseResponse
  // ------------------------------------------------------------------
  console.log('\n📦 Testing parseResponse...');

  try {
    const parsed = ValidatorRewards.parseResponse(SAMPLE_RESPONSE);
    assert(Array.isArray(parsed.data), 'Parsed response should have data array');
    assertEqual(parsed.data.length, 1, 'Should have one entry');
    assert(parsed.range !== null, 'Should include range');
    assertEqual(parsed.range.epoch.start, 347566, 'Should preserve epoch start');

    // Invalid response
    try {
      ValidatorRewards.parseResponse({ paging: {} });
      assert(false, 'Should throw for invalid response');
    } catch (e) {
      assert(e.message.includes('Invalid'), 'Should throw with descriptive message');
    }
  } catch (error) {
    assert(false, `parseResponse test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // isFinalized
  // ------------------------------------------------------------------
  console.log('\n🏁 Testing isFinalized...');

  try {
    assert(ValidatorRewards.isFinalized(SAMPLE_ENTRY), 'Should be finalized for sample entry');
    assert(
      !ValidatorRewards.isFinalized({ finality: 'pending' }),
      'Should not be finalized for pending entry'
    );
    assert(!ValidatorRewards.isFinalized(null), 'Should return false for null');
  } catch (error) {
    assert(false, `isFinalized test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // getTopRewards
  // ------------------------------------------------------------------
  console.log('\n🏆 Testing getTopRewards...');

  try {
    const entries = [
      { ...SAMPLE_ENTRY, total_reward: '1000' },
      { ...SAMPLE_ENTRY, total_reward: '3000' },
      { ...SAMPLE_ENTRY, total_reward: '2000' }
    ];

    const top2 = ValidatorRewards.getTopRewards(entries, 2);
    assertEqual(top2.length, 2, 'Should return 2 entries');
    assertEqual(top2[0].total_reward, '3000', 'Top entry should have highest reward');
    assertEqual(top2[1].total_reward, '2000', 'Second entry should have second-highest reward');

    // With full sample response
    const top = ValidatorRewards.getTopRewards(SAMPLE_RESPONSE.data, 5);
    assertEqual(top.length, 1, 'Should return all entries when fewer than n');

    // Edge cases
    assertEqual(ValidatorRewards.getTopRewards(null).length, 0, 'Should return [] for null');
    assertEqual(ValidatorRewards.getTopRewards([]).length, 0, 'Should return [] for empty array');
  } catch (error) {
    assert(false, `getTopRewards test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // getSummary
  // ------------------------------------------------------------------
  console.log('\n📊 Testing getSummary...');

  try {
    const summary = ValidatorRewards.getSummary(SAMPLE_RESPONSE);
    assertEqual(summary.validatorCount, 1, 'Should count one validator');
    assertEqual(summary.finalizedCount, 1, 'Should count one finalized entry');
    assert(summary.totalRewardEth !== '0', 'Total reward ETH should be non-zero');
    assertEqual(summary.totalPenaltyEth, '0', 'Total penalty should be 0');
    assert(summary.range !== null, 'Should include range');

    // Empty response
    const emptySummary = ValidatorRewards.getSummary({ data: [] });
    assertEqual(emptySummary.validatorCount, 0, 'Empty response should have 0 validators');
    assertEqual(emptySummary.totalRewardWei, '0', 'Empty response should have 0 total reward');

    // Null response
    const nullSummary = ValidatorRewards.getSummary(null);
    assertEqual(nullSummary.validatorCount, 0, 'Null response should have 0 validators');
  } catch (error) {
    assert(false, `getSummary test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // formatEntry
  // ------------------------------------------------------------------
  console.log('\n🖨️  Testing formatEntry...');

  try {
    const parsed = ValidatorRewards.parseEntry(SAMPLE_ENTRY);
    const formatted = ValidatorRewards.formatEntry(parsed);
    assert(formatted.includes('Validator #1'), 'Should include validator index');
    assert(formatted.includes('finalized'), 'Should include finality status');
    assert(formatted.includes('ETH'), 'Should include ETH denomination');
    assert(formatted.includes('Attestation'), 'Should include attestation section');
    assert(formatted.includes('Proposal'), 'Should include proposal section');

    // Null entry
    assertEqual(ValidatorRewards.formatEntry(null), 'No entry data available', 'Should handle null');
  } catch (error) {
    assert(false, `formatEntry test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // formatResponse
  // ------------------------------------------------------------------
  console.log('\n📄 Testing formatResponse...');

  try {
    const parsed = ValidatorRewards.parseResponse(SAMPLE_RESPONSE);
    const formatted = ValidatorRewards.formatResponse(parsed);
    assert(formatted.includes('Validator Rewards Report'), 'Should include report title');
    assert(formatted.includes('347566'), 'Should include epoch number');
    assert(formatted.includes('Validators: 1'), 'Should include validator count');

    // Null response
    assertEqual(ValidatorRewards.formatResponse(null), 'No data available', 'Should handle null');
  } catch (error) {
    assert(false, `formatResponse test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // formatSummary
  // ------------------------------------------------------------------
  console.log('\n📝 Testing formatSummary...');

  try {
    const summary = ValidatorRewards.getSummary(SAMPLE_RESPONSE);
    const formatted = ValidatorRewards.formatSummary(summary);
    assert(formatted.includes('Validator Rewards Summary'), 'Should include summary title');
    assert(formatted.includes('Validators'), 'Should include validator count label');
    assert(formatted.includes('ETH'), 'Should include ETH denomination');

    // Null summary
    assertEqual(ValidatorRewards.formatSummary(null), 'No summary available', 'Should handle null');
  } catch (error) {
    assert(false, `formatSummary test failed: ${error.message}`);
  }

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
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

runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
