/**
 * Test file for CALLDATA module
 */

const CalldataEncoder = require('./calldata.js');

let testsPassed = 0;
let testsFailed = 0;

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}`);
    testsPassed++;
    return true;
  } else {
    console.log(`✗ ${message}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual:   ${actual}`);
    testsFailed++;
    return false;
  }
}

function assertTrue(condition, message) {
  return assertEqual(condition, true, message);
}

function assertNotNull(value, message) {
  if (value !== null && value !== undefined) {
    console.log(`✓ ${message}`);
    testsPassed++;
    return true;
  } else {
    console.log(`✗ ${message}`);
    console.log(`  Value was null or undefined`);
    testsFailed++;
    return false;
  }
}

function assertThrows(fn, message) {
  try {
    fn();
    console.log(`✗ ${message} (no error thrown)`);
    testsFailed++;
    return false;
  } catch (_) {
    console.log(`✓ ${message}`);
    testsPassed++;
    return true;
  }
}

function runTests() {
  console.log('='.repeat(60));
  console.log('Running CALLDATA Module Tests');
  console.log('='.repeat(60));
  console.log();

  // ------------------------------------------------------------------
  // Test 1: Constructor
  // ------------------------------------------------------------------
  console.log('Test 1: Constructor');
  try {
    const enc = new CalldataEncoder();
    assertNotNull(enc, 'Instance should be created');
    assertNotNull(enc.selectors, 'selectors map should exist');
  } catch (error) {
    console.log(`✗ Constructor test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 2: getSelector – known signatures
  // ------------------------------------------------------------------
  console.log('Test 2: getSelector - known signatures');
  try {
    const enc = new CalldataEncoder();
    assertEqual(enc.getSelector('balanceOf(address)'), '0x70a08231', 'balanceOf selector');
    assertEqual(enc.getSelector('totalSupply()'), '0x18160ddd', 'totalSupply selector');
    assertEqual(enc.getSelector('transfer(address,uint256)'), '0xa9059cbb', 'transfer selector');
    assertEqual(enc.getSelector('name()'), '0x06fdde03', 'name selector');
    assertEqual(enc.getSelector('symbol()'), '0x95d89b41', 'symbol selector');
    assertEqual(enc.getSelector('decimals()'), '0x313ce567', 'decimals selector');
    assertEqual(enc.getSelector('owner()'), '0x8da5cb5b', 'owner selector');
    assertEqual(enc.getSelector('ownerOf(uint256)'), '0x6352211e', 'ownerOf selector');
  } catch (error) {
    console.log(`✗ getSelector test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 3: getSelector – unknown signature throws
  // ------------------------------------------------------------------
  console.log('Test 3: getSelector - unknown signature throws');
  try {
    const enc = new CalldataEncoder();
    assertThrows(
      () => enc.getSelector('unknownFn()'),
      'Should throw for unknown function signature'
    );
  } catch (error) {
    console.log(`✗ getSelector error handling test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 4: getSignature – reverse lookup
  // ------------------------------------------------------------------
  console.log('Test 4: getSignature - reverse lookup');
  try {
    const enc = new CalldataEncoder();
    assertEqual(enc.getSignature('0x70a08231'), 'balanceOf(address)', 'balanceOf reverse lookup');
    assertEqual(enc.getSignature('0x18160ddd'), 'totalSupply()', 'totalSupply reverse lookup');
    assertEqual(enc.getSignature('0xdeadbeef'), null, 'Unknown selector should return null');
  } catch (error) {
    console.log(`✗ getSignature test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 5: encode – no parameters (totalSupply)
  // ------------------------------------------------------------------
  console.log('Test 5: encode - no parameters');
  try {
    const enc = new CalldataEncoder();
    const cd = enc.encode('totalSupply()');
    assertEqual(cd, '0x18160ddd', 'totalSupply calldata should be just the selector');
  } catch (error) {
    console.log(`✗ encode no-params test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 6: encode – address parameter (balanceOf)
  // ------------------------------------------------------------------
  console.log('Test 6: encode - address parameter');
  try {
    const enc = new CalldataEncoder();
    const address = '0x1234567890123456789012345678901234567890';
    const cd = enc.encode('balanceOf(address)', [address]);
    assertTrue(cd.startsWith('0x70a08231'), 'Should start with balanceOf selector');
    assertTrue(
      cd.includes('1234567890123456789012345678901234567890'),
      'Encoded calldata should contain the address'
    );
    assertEqual(cd.length, 2 + 8 + 64, 'Length: 0x + 4-byte selector + 32-byte param');
  } catch (error) {
    console.log(`✗ encode address test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 7: encode – address + uint256 parameters (transfer)
  // ------------------------------------------------------------------
  console.log('Test 7: encode - address + uint256 parameters');
  try {
    const enc = new CalldataEncoder();
    const address = '0xAbCdEf1234567890123456789012345678901234';
    const amount = 1000n;
    const cd = enc.encode('transfer(address,uint256)', [address, amount]);
    assertTrue(cd.startsWith('0xa9059cbb'), 'Should start with transfer selector');
    assertEqual(cd.length, 2 + 8 + 64 + 64, 'Correct total length');
    // Last 16 hex chars of the amount word should be 3e8 (1000 in hex)
    assertTrue(cd.endsWith('00000000000000000000000000000000000000000000000000000000000003e8'), 'Amount encoded correctly');
  } catch (error) {
    console.log(`✗ encode address+uint256 test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 8: encode – bool parameter (setApprovalForAll)
  // ------------------------------------------------------------------
  console.log('Test 8: encode - bool parameter');
  try {
    const enc = new CalldataEncoder();
    const operator = '0xAbCdEf1234567890123456789012345678901234';
    const cdTrue = enc.encode('setApprovalForAll(address,bool)', [operator, true]);
    const cdFalse = enc.encode('setApprovalForAll(address,bool)', [operator, false]);
    assertTrue(cdTrue.endsWith('0000000000000000000000000000000000000000000000000000000000000001'), 'true encoded as 1');
    assertTrue(cdFalse.endsWith('0000000000000000000000000000000000000000000000000000000000000000'), 'false encoded as 0');
  } catch (error) {
    console.log(`✗ encode bool test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 9: encode – parameter count mismatch throws
  // ------------------------------------------------------------------
  console.log('Test 9: encode - parameter count mismatch');
  try {
    const enc = new CalldataEncoder();
    assertThrows(
      () => enc.encode('transfer(address,uint256)', ['0x1234567890123456789012345678901234567890']),
      'Should throw when param count does not match signature'
    );
  } catch (error) {
    console.log(`✗ encode param count test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 10: split
  // ------------------------------------------------------------------
  console.log('Test 10: split');
  try {
    const enc = new CalldataEncoder();
    const cd = '0x70a082310000000000000000000000001234567890123456789012345678901234567890';
    const { selector, params } = enc.split(cd);
    assertEqual(selector, '0x70a08231', 'Selector extracted correctly');
    assertEqual(params, '0000000000000000000000001234567890123456789012345678901234567890', 'Params extracted correctly');
  } catch (error) {
    console.log(`✗ split test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 11: split – too-short calldata throws
  // ------------------------------------------------------------------
  console.log('Test 11: split - too-short calldata throws');
  try {
    const enc = new CalldataEncoder();
    assertThrows(() => enc.split('0x1234'), 'Should throw for < 4-byte calldata');
    assertThrows(() => enc.split(''), 'Should throw for empty calldata');
  } catch (error) {
    console.log(`✗ split error test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 12: decode – known signature round-trip
  // ------------------------------------------------------------------
  console.log('Test 12: decode - known signature round-trip');
  try {
    const enc = new CalldataEncoder();
    const address = '0x1234567890123456789012345678901234567890';
    const encoded = enc.encode('balanceOf(address)', [address]);
    const decoded = enc.decode(encoded);
    assertEqual(decoded.selector, '0x70a08231', 'Selector matches');
    assertEqual(decoded.signature, 'balanceOf(address)', 'Signature matches');
    assertEqual(decoded.params[0], address.toLowerCase(), 'Address decoded correctly');
  } catch (error) {
    console.log(`✗ decode round-trip test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 13: decode – unknown selector returns raw
  // ------------------------------------------------------------------
  console.log('Test 13: decode - unknown selector returns raw params');
  try {
    const enc = new CalldataEncoder();
    const cd = '0xdeadbeef0000000000000000000000001234567890123456789012345678901234567890';
    const decoded = enc.decode(cd);
    assertEqual(decoded.selector, '0xdeadbeef', 'Selector extracted');
    assertEqual(decoded.signature, null, 'Signature should be null for unknown selector');
    assertTrue(decoded.params.length > 0, 'Raw params should be returned');
  } catch (error) {
    console.log(`✗ decode unknown selector test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 14: decode – with explicit signature override
  // ------------------------------------------------------------------
  console.log('Test 14: decode - explicit signature override');
  try {
    const enc = new CalldataEncoder();
    const address = '0xAbCdEf1234567890123456789012345678901234';
    const amount = 500n;
    const encoded = enc.encode('transfer(address,uint256)', [address, amount]);
    const decoded = enc.decode(encoded, 'transfer(address,uint256)');
    assertEqual(decoded.params[0], address.toLowerCase(), 'Address decoded');
    assertEqual(decoded.params[1], '500', 'Amount decoded');
  } catch (error) {
    console.log(`✗ decode with signature test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 15: decodeParams – address
  // ------------------------------------------------------------------
  console.log('Test 15: decodeParams - address type');
  try {
    const enc = new CalldataEncoder();
    const paramsHex = '0000000000000000000000001234567890123456789012345678901234567890';
    const decoded = enc.decodeParams(paramsHex, ['address']);
    assertEqual(decoded[0], '0x1234567890123456789012345678901234567890', 'Address decoded');
  } catch (error) {
    console.log(`✗ decodeParams address test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 16: decodeParams – uint256
  // ------------------------------------------------------------------
  console.log('Test 16: decodeParams - uint256 type');
  try {
    const enc = new CalldataEncoder();
    const paramsHex = '0000000000000000000000000000000000000000000000000000000000000064';
    const decoded = enc.decodeParams(paramsHex, ['uint256']);
    assertEqual(decoded[0], '100', 'uint256 decoded as decimal string');
  } catch (error) {
    console.log(`✗ decodeParams uint256 test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 17: decodeParams – bool
  // ------------------------------------------------------------------
  console.log('Test 17: decodeParams - bool type');
  try {
    const enc = new CalldataEncoder();
    const trueHex = '0000000000000000000000000000000000000000000000000000000000000001';
    const falseHex = '0000000000000000000000000000000000000000000000000000000000000000';
    assertEqual(enc.decodeParams(trueHex, ['bool'])[0], true, 'bool true');
    assertEqual(enc.decodeParams(falseHex, ['bool'])[0], false, 'bool false');
  } catch (error) {
    console.log(`✗ decodeParams bool test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 18: decodeParams – string (dynamic)
  // ------------------------------------------------------------------
  console.log('Test 18: decodeParams - string (dynamic type)');
  try {
    const enc = new CalldataEncoder();
    // Manually build ABI-encoded string "Hello"
    // offset: 0x20 (32 bytes)
    // length: 5
    // data: "Hello" = 0x48656c6c6f, right-padded to 32 bytes
    const paramsHex =
      '0000000000000000000000000000000000000000000000000000000000000020' + // offset
      '0000000000000000000000000000000000000000000000000000000000000005' + // length
      '48656c6c6f000000000000000000000000000000000000000000000000000000';  // "Hello"

    const decoded = enc.decodeParams(paramsHex, ['string']);
    assertEqual(decoded[0], 'Hello', 'String decoded correctly');
  } catch (error) {
    console.log(`✗ decodeParams string test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 19: validate – valid calldata
  // ------------------------------------------------------------------
  console.log('Test 19: validate - valid calldata');
  try {
    const enc = new CalldataEncoder();
    const cd = '0x70a082310000000000000000000000001234567890123456789012345678901234567890';
    const result = enc.validate(cd);
    assertEqual(result.valid, true, 'Valid calldata should pass validation');
    assertEqual(result.bytes, 36, 'Byte count should be 36');
    assertEqual(result.selector, '0x70a08231', 'Selector extracted in validation');
    assertEqual(result.knownSignature, 'balanceOf(address)', 'Known signature identified');
  } catch (error) {
    console.log(`✗ validate valid test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 20: validate – invalid inputs
  // ------------------------------------------------------------------
  console.log('Test 20: validate - invalid inputs');
  try {
    const enc = new CalldataEncoder();
    assertTrue(!enc.validate('').valid, 'Empty string should be invalid');
    assertTrue(!enc.validate('0x').valid, 'Only 0x prefix should be invalid');
    assertTrue(!enc.validate('0x1234').valid, 'Less than 4 bytes should be invalid');
    assertTrue(!enc.validate('0xGGGGGGGG').valid, 'Non-hex chars should be invalid');
    assertTrue(!enc.validate(null).valid, 'null should be invalid');
  } catch (error) {
    console.log(`✗ validate invalid test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 21: format – known function
  // ------------------------------------------------------------------
  console.log('Test 21: format - known function');
  try {
    const enc = new CalldataEncoder();
    const address = '0x1234567890123456789012345678901234567890';
    const cd = enc.encode('balanceOf(address)', [address]);
    const summary = enc.format(cd);
    assertTrue(typeof summary === 'string', 'format returns a string');
    assertTrue(summary.includes('balanceOf(address)'), 'Summary includes function name');
    assertTrue(summary.includes('0x70a08231'), 'Summary includes selector');
  } catch (error) {
    console.log(`✗ format test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 22: format – invalid calldata
  // ------------------------------------------------------------------
  console.log('Test 22: format - invalid calldata');
  try {
    const enc = new CalldataEncoder();
    const result = enc.format('0x12');
    assertTrue(result.includes('Invalid'), 'Should return invalid message for bad calldata');
  } catch (error) {
    console.log(`✗ format invalid test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 23: extraSelectors via constructor
  // ------------------------------------------------------------------
  console.log('Test 23: extraSelectors via constructor');
  try {
    const enc = new CalldataEncoder({
      extraSelectors: {
        'myCustomFn(uint256)': '0xaabbccdd'
      }
    });
    assertEqual(enc.getSelector('myCustomFn(uint256)'), '0xaabbccdd', 'Custom selector retrieved');
    assertEqual(enc.getSignature('0xaabbccdd'), 'myCustomFn(uint256)', 'Custom reverse lookup works');
  } catch (error) {
    console.log(`✗ extraSelectors test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 24: getKnownSelectors
  // ------------------------------------------------------------------
  console.log('Test 24: getKnownSelectors');
  try {
    const enc = new CalldataEncoder();
    const known = enc.getKnownSelectors();
    assertTrue(typeof known === 'object', 'Should return an object');
    assertTrue('balanceOf(address)' in known, 'Should contain balanceOf');
    assertTrue('transfer(address,uint256)' in known, 'Should contain transfer');
  } catch (error) {
    console.log(`✗ getKnownSelectors test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Test 25: encode/decode round-trip for transferFrom
  // ------------------------------------------------------------------
  console.log('Test 25: encode/decode round-trip - transferFrom');
  try {
    const enc = new CalldataEncoder();
    const from = '0x1111111111111111111111111111111111111111';
    const to = '0x2222222222222222222222222222222222222222';
    const amount = 999999n;
    const encoded = enc.encode('transferFrom(address,address,uint256)', [from, to, amount]);
    const decoded = enc.decode(encoded, 'transferFrom(address,address,uint256)');
    assertEqual(decoded.params[0], from.toLowerCase(), 'from address round-trip');
    assertEqual(decoded.params[1], to.toLowerCase(), 'to address round-trip');
    assertEqual(decoded.params[2], amount.toString(), 'amount round-trip');
  } catch (error) {
    console.log(`✗ transferFrom round-trip test failed: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  console.log('='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);
  console.log();

  if (testsFailed === 0) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

runTests();
