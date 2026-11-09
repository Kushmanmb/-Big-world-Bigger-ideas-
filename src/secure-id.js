/**
 * Unpredictable identifiers for announcements, proofs and other records.
 *
 * Replaces `Math.random()`-based suffixes, which are predictable and were
 * flagged by code scanning (insufficiently random values).
 */
'use strict';

const crypto = require('crypto');

/**
 * @param {string} prefix - identifier prefix, e.g. "announce"
 * @returns {string} `${prefix}_${Date.now()}_${12 hex chars from a CSPRNG}`
 */
function secureId(prefix) {
  if (typeof prefix !== 'string' || prefix.length === 0) {
    throw new TypeError('secureId prefix must be a non-empty string');
  }
  return `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
}

/**
 * Constant-time equality for hex/string digests. Returns false for
 * non-strings or different lengths without throwing.
 */
function timingSafeEqualString(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = { secureId, timingSafeEqualString };
