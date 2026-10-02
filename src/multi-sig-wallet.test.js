/**
 * Test suite for the MultiSigWallet module
 *
 * Tests cover:
 *  - Module exports (class, abi, bytecode)
 *  - Constructor validation
 *  - Input validation for read methods
 *  - ABI structure
 *  - Bytecode presence
 */

'use strict';

const MultiSigWallet = require('./multi-sig-wallet');
const { test, assertEqual, assertNotNull, assertThrows, printSummary } = require('./test-helpers');

console.log('Running MultiSigWallet Tests...\n');

// ── Module shape ─────────────────────────────────────────────────────────────

test('should export MultiSigWallet class', () => {
  assertNotNull(MultiSigWallet, 'MultiSigWallet export should not be null');
  assertEqual(typeof MultiSigWallet, 'function', 'MultiSigWallet should be a constructor function');
});

test('should export abi array', () => {
  assertNotNull(MultiSigWallet.abi, 'abi should not be null');
  assertEqual(Array.isArray(MultiSigWallet.abi), true, 'abi should be an array');
  if (MultiSigWallet.abi.length === 0) {
    throw new Error('abi array should not be empty');
  }
});

test('should export bytecode string starting with 0x', () => {
  assertNotNull(MultiSigWallet.bytecode, 'bytecode should not be null');
  assertEqual(typeof MultiSigWallet.bytecode, 'string', 'bytecode should be a string');
  if (!MultiSigWallet.bytecode.startsWith('0x')) {
    throw new Error('bytecode should start with 0x');
  }
  if (MultiSigWallet.bytecode.length <= 2) {
    throw new Error('bytecode should have content beyond the 0x prefix');
  }
});

// ── ABI structure ─────────────────────────────────────────────────────────────

test('abi should include constructor', () => {
  const ctor = MultiSigWallet.abi.find((entry) => entry.type === 'constructor');
  assertNotNull(ctor, 'ABI should contain a constructor entry');
  assertEqual(ctor.inputs.length, 2, 'Constructor should have 2 inputs');
  assertEqual(ctor.inputs[0].name, '_owners', 'First constructor input should be _owners');
  assertEqual(ctor.inputs[1].name, '_numConfirmationsRequired', 'Second constructor input should be _numConfirmationsRequired');
});

test('abi should include submitTransaction function', () => {
  const fn = MultiSigWallet.abi.find((e) => e.type === 'function' && e.name === 'submitTransaction');
  assertNotNull(fn, 'ABI should include submitTransaction');
  assertEqual(fn.inputs.length, 3, 'submitTransaction should have 3 inputs');
});

test('abi should include confirmTransaction function', () => {
  const fn = MultiSigWallet.abi.find((e) => e.type === 'function' && e.name === 'confirmTransaction');
  assertNotNull(fn, 'ABI should include confirmTransaction');
  assertEqual(fn.inputs.length, 1, 'confirmTransaction should have 1 input');
});

test('abi should include executeTransaction function', () => {
  const fn = MultiSigWallet.abi.find((e) => e.type === 'function' && e.name === 'executeTransaction');
  assertNotNull(fn, 'ABI should include executeTransaction');
});

test('abi should include revokeConfirmation function', () => {
  const fn = MultiSigWallet.abi.find((e) => e.type === 'function' && e.name === 'revokeConfirmation');
  assertNotNull(fn, 'ABI should include revokeConfirmation');
});

test('abi should include getOwners view function', () => {
  const fn = MultiSigWallet.abi.find((e) => e.type === 'function' && e.name === 'getOwners');
  assertNotNull(fn, 'ABI should include getOwners');
  assertEqual(fn.stateMutability, 'view', 'getOwners should be a view function');
});

test('abi should include getTransaction view function', () => {
  const fn = MultiSigWallet.abi.find((e) => e.type === 'function' && e.name === 'getTransaction');
  assertNotNull(fn, 'ABI should include getTransaction');
  assertEqual(fn.stateMutability, 'view', 'getTransaction should be a view function');
  assertEqual(fn.outputs.length, 5, 'getTransaction should return 5 fields');
});

test('abi should include getTransactionCount view function', () => {
  const fn = MultiSigWallet.abi.find((e) => e.type === 'function' && e.name === 'getTransactionCount');
  assertNotNull(fn, 'ABI should include getTransactionCount');
  assertEqual(fn.stateMutability, 'view', 'getTransactionCount should be a view function');
});

test('abi should include required events', () => {
  const eventNames = ['Deposit', 'SubmitTransaction', 'ConfirmTransaction', 'RevokeConfirmation', 'ExecuteTransaction'];
  eventNames.forEach((name) => {
    const ev = MultiSigWallet.abi.find((e) => e.type === 'event' && e.name === name);
    assertNotNull(ev, `ABI should include ${name} event`);
  });
});

test('abi should include payable receive function', () => {
  const recv = MultiSigWallet.abi.find((e) => e.type === 'receive');
  assertNotNull(recv, 'ABI should include receive fallback');
  assertEqual(recv.stateMutability, 'payable', 'receive should be payable');
});

// ── Constructor validation ────────────────────────────────────────────────────

test('should construct with valid address and rpcUrl', () => {
  const client = new MultiSigWallet(
    '0x1234567890123456789012345678901234567890',
    'https://ethereum.publicnode.com'
  );
  assertNotNull(client, 'Client should be created');
  assertEqual(
    client.contractAddress,
    '0x1234567890123456789012345678901234567890',
    'Contract address should be stored'
  );
});

test('should construct with only contract address (uses default rpcUrl)', () => {
  const client = new MultiSigWallet('0xAbCdEf0123456789AbCdEf0123456789AbCdEf01');
  assertNotNull(client, 'Client should be created with default rpcUrl');
});

test('should throw on missing contract address', () => {
  assertThrows(() => new MultiSigWallet(), 'valid contract address is required');
  assertThrows(() => new MultiSigWallet(null), 'valid contract address is required');
  assertThrows(() => new MultiSigWallet(''), 'valid contract address is required');
});

test('should throw on invalid contract address', () => {
  assertThrows(() => new MultiSigWallet('not-an-address'), 'valid contract address is required');
  assertThrows(() => new MultiSigWallet('0xinvalid'), 'valid contract address is required');
  assertThrows(() => new MultiSigWallet('1234567890123456789012345678901234567890'), 'valid contract address is required');
});

test('should throw on invalid rpcUrl', () => {
  assertThrows(
    () => new MultiSigWallet('0x1234567890123456789012345678901234567890', ''),
    'rpcUrl must be a non-empty string'
  );
  assertThrows(
    () => new MultiSigWallet('0x1234567890123456789012345678901234567890', null),
    'rpcUrl must be a non-empty string'
  );
});

test('should accept custom requestTimeout', () => {
  const client = new MultiSigWallet(
    '0x1234567890123456789012345678901234567890',
    'https://ethereum.publicnode.com',
    60000
  );
  assertEqual(client.requestTimeout, 60000, 'Custom timeout should be stored');
});

test('should use default requestTimeout of 30000ms', () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  assertEqual(client.requestTimeout, 30000, 'Default timeout should be 30000');
});

test('should throw on invalid requestTimeout', () => {
  assertThrows(
    () => new MultiSigWallet('0x1234567890123456789012345678901234567890', 'https://ethereum.publicnode.com', 0),
    'requestTimeout must be a positive number'
  );
  assertThrows(
    () => new MultiSigWallet('0x1234567890123456789012345678901234567890', 'https://ethereum.publicnode.com', -1),
    'requestTimeout must be a positive number'
  );
});

// ── isOwner input validation ──────────────────────────────────────────────────

test('isOwner should throw on invalid address', async () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  let threw = false;
  try {
    await client.isOwner('invalid-address');
  } catch (e) {
    threw = true;
    if (!e.message.includes('Invalid Ethereum address')) {
      throw new Error(`Expected "Invalid Ethereum address" but got: ${e.message}`);
    }
  }
  if (!threw) throw new Error('Expected isOwner to throw for invalid address');
});

// ── isConfirmed input validation ──────────────────────────────────────────────

test('isConfirmed should throw on invalid txIndex', async () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  let threw = false;
  try {
    await client.isConfirmed(-1, '0x1234567890123456789012345678901234567890');
  } catch (e) {
    threw = true;
    if (!e.message.includes('non-negative integer')) {
      throw new Error(`Expected "non-negative integer" but got: ${e.message}`);
    }
  }
  if (!threw) throw new Error('Expected isConfirmed to throw for negative txIndex');
});

test('isConfirmed should throw on invalid owner address', async () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  let threw = false;
  try {
    await client.isConfirmed(0, 'bad-address');
  } catch (e) {
    threw = true;
    if (!e.message.includes('Invalid owner address')) {
      throw new Error(`Expected "Invalid owner address" but got: ${e.message}`);
    }
  }
  if (!threw) throw new Error('Expected isConfirmed to throw for invalid owner address');
});

// ── getTransaction input validation ──────────────────────────────────────────

test('getTransaction should throw on invalid txIndex', async () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  let threw = false;
  try {
    await client.getTransaction(-5);
  } catch (e) {
    threw = true;
    if (!e.message.includes('non-negative integer')) {
      throw new Error(`Expected "non-negative integer" but got: ${e.message}`);
    }
  }
  if (!threw) throw new Error('Expected getTransaction to throw for negative txIndex');
});

// ── Internal helper tests ─────────────────────────────────────────────────────

test('_isValidAddress should return true for valid addresses', () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  assertEqual(client._isValidAddress('0x1234567890123456789012345678901234567890'), true, 'Should be valid');
  assertEqual(client._isValidAddress('0xAbCdEf0123456789AbCdEf0123456789AbCdEf01'), true, 'Should be valid');
});

test('_isValidAddress should return false for invalid addresses', () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  assertEqual(client._isValidAddress(''), false, 'Empty string should be invalid');
  assertEqual(client._isValidAddress('0x123'), false, 'Short address should be invalid');
  assertEqual(client._isValidAddress('not-an-address'), false, 'Non-hex should be invalid');
  assertEqual(client._isValidAddress(null), false, 'null should be invalid');
});

test('_encodeUint256 should pad values to 64 hex chars', () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  const encoded = client._encodeUint256(1);
  assertEqual(encoded.length, 64, 'Should be 64 chars');
  assertEqual(encoded, '0'.repeat(63) + '1', 'Should be padded');
});

test('_encodeUint256 should handle bigint values', () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  const encoded = client._encodeUint256(BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935'));
  assertEqual(encoded, 'f'.repeat(64), 'Max uint256 should be all fs');
});

test('_encodeAddress should pad address to 64 hex chars', () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  const encoded = client._encodeAddress('0x1234567890123456789012345678901234567890');
  assertEqual(encoded.length, 64, 'Should be 64 chars');
  assertEqual(encoded.slice(-40), '1234567890123456789012345678901234567890', 'Last 40 chars should be the address');
});

test('_decodeUint256 should convert hex to decimal string', () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  assertEqual(client._decodeUint256('0'.repeat(63) + '1'), '1', 'Should decode 1');
  assertEqual(client._decodeUint256('0'.repeat(63) + 'a'), '10', 'Should decode 10');
  assertEqual(client._decodeUint256('0'.repeat(64)), '0', 'Should decode 0');
});

test('_decodeAddress should return 0x-prefixed address from 32-byte word', () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  const word = '0'.repeat(24) + '1234567890123456789012345678901234567890';
  const addr = client._decodeAddress(word);
  assertEqual(addr, '0x1234567890123456789012345678901234567890', 'Should decode address correctly');
});

test('_decodeBool should return true for non-zero values', () => {
  const client = new MultiSigWallet('0x1234567890123456789012345678901234567890');
  assertEqual(client._decodeBool('0'.repeat(63) + '1'), true, 'Should be true');
  assertEqual(client._decodeBool('0'.repeat(64)), false, 'Should be false');
});

printSummary();
