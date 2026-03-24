/**
 * Validator Rewards Module – Usage Examples
 *
 * Demonstrates how to parse, validate, and format Ethereum beacon chain
 * validator reward data using the ValidatorRewards utility class.
 *
 * Run this file with:
 *   node src/validator-rewards-example.js
 */

const ValidatorRewards = require('./validator-rewards.js');

// ---------------------------------------------------------------------------
// Sample API response (mirrors the structure described in the repository issue)
// ---------------------------------------------------------------------------
const SAMPLE_RESPONSE = {
  data: [
    {
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
    }
  ],
  paging: {},
  range: {
    slot: { start: 11122112, end: 11122143 },
    epoch: { start: 347566, end: 347566 },
    timestamp: { start: 1740289367, end: 1740289750 }
  }
};

function runExample() {
  console.log('Validator Rewards Module – Usage Examples\n');
  console.log('='.repeat(50) + '\n');

  // -----------------------------------------------------------------------
  // 1. Validate a raw API response
  // -----------------------------------------------------------------------
  console.log('1️⃣  Validating raw API response...\n');
  const validation = ValidatorRewards.validateResponse(SAMPLE_RESPONSE);
  console.log('Valid:', validation.valid);
  console.log('Errors:', validation.errors);
  console.log();

  // -----------------------------------------------------------------------
  // 2. Parse the response
  // -----------------------------------------------------------------------
  console.log('2️⃣  Parsing the response...\n');
  const parsed = ValidatorRewards.parseResponse(SAMPLE_RESPONSE);
  console.log('Number of validators:', parsed.data.length);
  console.log('Epoch:', parsed.range.epoch.start);
  console.log('First validator index:', parsed.data[0].validator.index);
  console.log('Total reward (ETH):', parsed.data[0].totals.rewardEth);
  console.log('Total missed (ETH):', parsed.data[0].totals.missedEth);
  console.log();

  // -----------------------------------------------------------------------
  // 3. Convert wei to ETH
  // -----------------------------------------------------------------------
  console.log('3️⃣  Converting wei amounts to ETH...\n');
  const weiAmount = '35087332222696592';
  const ethAmount = ValidatorRewards.weiToEth(weiAmount);
  console.log(`${weiAmount} wei = ${ethAmount} ETH`);
  console.log();

  // -----------------------------------------------------------------------
  // 4. Check finality
  // -----------------------------------------------------------------------
  console.log('4️⃣  Checking finality status...\n');
  const entry = SAMPLE_RESPONSE.data[0];
  console.log('Is finalized:', ValidatorRewards.isFinalized(entry));
  console.log();

  // -----------------------------------------------------------------------
  // 5. Get summary statistics
  // -----------------------------------------------------------------------
  console.log('5️⃣  Summary statistics...\n');
  const summary = ValidatorRewards.getSummary(SAMPLE_RESPONSE);
  console.log(ValidatorRewards.formatSummary(summary));

  // -----------------------------------------------------------------------
  // 6. Format a full response report
  // -----------------------------------------------------------------------
  console.log('6️⃣  Full report...\n');
  console.log(ValidatorRewards.formatResponse(parsed));

  // -----------------------------------------------------------------------
  // 7. Top rewards (useful when response contains multiple validators)
  // -----------------------------------------------------------------------
  console.log('7️⃣  Top validators by reward...\n');
  const top = ValidatorRewards.getTopRewards(SAMPLE_RESPONSE.data, 3);
  console.log(`Top ${top.length} validator(s) by reward:`);
  top.forEach((e, i) => {
    console.log(
      `  ${i + 1}. Validator #${e.validator.index} — ${ValidatorRewards.weiToEth(e.total_reward)} ETH`
    );
  });
  console.log();

  // -----------------------------------------------------------------------
  // 8. Validate a BLS public key
  // -----------------------------------------------------------------------
  console.log('8️⃣  Validating BLS public keys...\n');
  const validKey =
    '0xa1d1ad0714035353258038e964ae9675dc0252ee22cea896825c01458e1807bfad2f9969338798548d9858a571f7425c';
  const invalidKey = '0xdeadbeef';
  console.log('Valid key result  :', ValidatorRewards.validatePublicKey(validKey));
  console.log('Invalid key result:', ValidatorRewards.validatePublicKey(invalidKey));
  console.log();

  console.log('✅ Examples complete.');
}

runExample();
