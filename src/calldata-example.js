/**
 * Example usage of the CALLDATA module
 * Demonstrates encoding and decoding Ethereum transaction calldata
 */

const CalldataEncoder = require('./calldata.js');

function runExamples() {
  const enc = new CalldataEncoder();

  console.log('='.repeat(60));
  console.log('CALLDATA Module Examples');
  console.log('='.repeat(60));
  console.log();

  // ------------------------------------------------------------------
  // Example 1: Encoding a no-argument function call
  // ------------------------------------------------------------------
  console.log('Example 1: Encoding totalSupply()');
  console.log('-'.repeat(60));
  try {
    const calldata = enc.encode('totalSupply()');
    console.log(`Function:  totalSupply()`);
    console.log(`Selector:  ${enc.getSelector('totalSupply()')}`);
    console.log(`Calldata:  ${calldata}`);
    console.log(`Bytes:     ${(calldata.length - 2) / 2}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // Example 2: Encoding balanceOf(address)
  // ------------------------------------------------------------------
  console.log('Example 2: Encoding balanceOf(address)');
  console.log('-'.repeat(60));
  try {
    const owner = '0x1234567890123456789012345678901234567890';
    const calldata = enc.encode('balanceOf(address)', [owner]);
    console.log(`Function:  balanceOf(address)`);
    console.log(`Owner:     ${owner}`);
    console.log(`Calldata:  ${calldata}`);
    console.log(`Bytes:     ${(calldata.length - 2) / 2}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // Example 3: Encoding transfer(address,uint256)
  // ------------------------------------------------------------------
  console.log('Example 3: Encoding transfer(address,uint256)');
  console.log('-'.repeat(60));
  try {
    const recipient = '0xAbCdEf1234567890123456789012345678901234';
    const amount = 1_000_000n; // 1 USDC (6 decimals)
    const calldata = enc.encode('transfer(address,uint256)', [recipient, amount]);
    console.log(`Function:  transfer(address,uint256)`);
    console.log(`Recipient: ${recipient}`);
    console.log(`Amount:    ${amount} (raw units)`);
    console.log(`Calldata:  ${calldata}`);
    console.log(`Bytes:     ${(calldata.length - 2) / 2}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // Example 4: Decoding calldata (round-trip)
  // ------------------------------------------------------------------
  console.log('Example 4: Decoding calldata');
  console.log('-'.repeat(60));
  try {
    const rawCalldata =
      '0xa9059cbb' +
      '000000000000000000000000abcdef1234567890123456789012345678901234' +
      '00000000000000000000000000000000000000000000000000000000000f4240';

    console.log(`Raw calldata: ${rawCalldata}`);
    console.log();

    const decoded = enc.decode(rawCalldata);
    console.log(`Selector:  ${decoded.selector}`);
    console.log(`Function:  ${decoded.signature}`);
    decoded.params.forEach((p, i) => {
      console.log(`  Param ${i + 1}: ${p}`);
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // Example 5: Validating calldata
  // ------------------------------------------------------------------
  console.log('Example 5: Validating calldata');
  console.log('-'.repeat(60));
  const samples = [
    '0x18160ddd',                       // totalSupply() – valid
    '0x70a08231' + '00'.repeat(32),     // balanceOf – valid
    '0x1234',                            // too short – invalid
    'not-hex',                           // non-hex – invalid
  ];

  for (const sample of samples) {
    const result = enc.validate(sample);
    const status = result.valid ? '✓ valid' : `✗ invalid (${result.error})`;
    console.log(`  ${sample.slice(0, 18)}…  →  ${status}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // Example 6: Formatted calldata summary
  // ------------------------------------------------------------------
  console.log('Example 6: Formatted calldata summary');
  console.log('-'.repeat(60));
  try {
    const owner = '0x1234567890123456789012345678901234567890';
    const calldata = enc.encode('balanceOf(address)', [owner]);
    console.log(enc.format(calldata));
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // Example 7: Using custom selectors
  // ------------------------------------------------------------------
  console.log('Example 7: Custom function selectors');
  console.log('-'.repeat(60));
  try {
    const customEnc = new CalldataEncoder({
      extraSelectors: {
        'deposit(uint256)': '0xb6b55f25'
      }
    });
    const amount = 5_000_000_000_000_000_000n; // 5 ETH in wei
    const calldata = customEnc.encode('deposit(uint256)', [amount]);
    console.log(`Function:  deposit(uint256)`);
    console.log(`Amount:    ${amount} wei (5 ETH)`);
    console.log(`Calldata:  ${calldata}`);

    const decoded = customEnc.decode(calldata, 'deposit(uint256)');
    console.log(`Decoded:   ${decoded.params[0]} (${Number(decoded.params[0]) / 1e18} ETH)`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  console.log();

  // ------------------------------------------------------------------
  // Example 8: Listing known selectors
  // ------------------------------------------------------------------
  console.log('Example 8: Known function selectors');
  console.log('-'.repeat(60));
  const known = enc.getKnownSelectors();
  for (const [sig, sel] of Object.entries(known)) {
    console.log(`  ${sel}  ${sig}`);
  }
  console.log();

  console.log('='.repeat(60));
  console.log('Done.');
  console.log('='.repeat(60));
}

runExamples();
