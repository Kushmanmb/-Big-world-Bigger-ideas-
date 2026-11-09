/**
 * Tests for secure-id.js
 */
'use strict';

const assert = require('assert');
const { secureId, timingSafeEqualString } = require('./secure-id');

let passed = 0;
function check(name, fn) { fn(); passed++; console.log(`✓ ${name}`); }

check('secureId keeps the prefix and timestamp format', () => {
  const id = secureId('announce_badge');
  assert.match(id, /^announce_badge_\d{13}_[0-9a-f]{12}$/);
});

check('secureId is not derived from Math.random', () => {
  const original = Math.random;
  Math.random = () => 0.5;
  try {
    const ids = new Set(Array.from({ length: 50 }, () => secureId('x')));
    assert.strictEqual(ids.size, 50, 'IDs must stay unique even if Math.random is constant');
  } finally {
    Math.random = original;
  }
});

check('secureId rejects an empty or non-string prefix', () => {
  assert.throws(() => secureId(''), TypeError);
  assert.throws(() => secureId(undefined), TypeError);
});

check('timingSafeEqualString compares equal and unequal digests', () => {
  const h = 'a'.repeat(64);
  assert.strictEqual(timingSafeEqualString(h, 'a'.repeat(64)), true);
  assert.strictEqual(timingSafeEqualString(h, 'b' + 'a'.repeat(63)), false);
});

check('timingSafeEqualString returns false for length mismatch and non-strings', () => {
  assert.strictEqual(timingSafeEqualString('abc', 'abcd'), false);
  assert.strictEqual(timingSafeEqualString(undefined, 'abc'), false);
  assert.strictEqual(timingSafeEqualString('abc', null), false);
});

console.log(`\n${passed} secure-id tests passed`);
