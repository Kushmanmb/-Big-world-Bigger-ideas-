/**
 * Secure Authentication Module
 *
 * Provides user registration and login functionality with bcrypt password
 * hashing following OWASP recommendations.
 *
 * SECURITY NOTE: User records are stored in-memory by default. For persistent
 * storage, provide a custom store adapter. Never store plaintext passwords.
 */

'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/** bcrypt work factor — OWASP recommends ≥ 10; 12 is a safe default */
const BCRYPT_SALT_ROUNDS = 12;

/**
 * Password-strength requirements (OWASP minimum baseline).
 * All conditions must be satisfied for a password to be considered strong.
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128, // guard against bcrypt-truncation DoS
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Validate password strength according to OWASP recommendations.
 *
 * @param {string} password - Password to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePasswordStrength(password) {
  if (typeof password !== 'string') {
    return { valid: false, errors: ['Password must be a string'] };
  }

  const errors = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must be at most ${PASSWORD_REQUIREMENTS.maxLength} characters long`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecial) {
    const specialRegex = new RegExp(
      `[${PASSWORD_REQUIREMENTS.specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`
    );
    if (!specialRegex.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*...)');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a username.
 *
 * @param {string} username
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateUsername(username) {
  if (typeof username !== 'string') {
    return { valid: false, errors: ['Username must be a string'] };
  }

  const errors = [];
  const trimmed = username.trim();

  if (trimmed.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (trimmed.length > 64) {
    errors.push('Username must be at most 64 characters long');
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    errors.push('Username may only contain letters, numbers, underscores, hyphens, and dots');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * In-memory user store — a plain Map keyed by normalised username.
 * Swap this out for a database adapter in production.
 *
 * Each entry: { username: string, passwordHash: string, createdAt: string, id: string }
 */
class InMemoryUserStore {
  constructor() {
    this._users = new Map();
  }

  /**
   * Find a user by username (case-insensitive).
   * @param {string} username
   * @returns {object|null}
   */
  findByUsername(username) {
    return this._users.get(username.toLowerCase()) || null;
  }

  /**
   * Persist a new user record.
   * @param {object} user
   */
  save(user) {
    this._users.set(user.username.toLowerCase(), user);
  }

  /**
   * Number of registered users.
   * @returns {number}
   */
  count() {
    return this._users.size;
  }

  /**
   * Remove all users (useful in tests).
   */
  clear() {
    this._users.clear();
  }
}

/**
 * Authentication manager.
 *
 * @example
 * const { AuthManager } = require('./auth');
 * const auth = new AuthManager();
 * await auth.register('alice', 'P@ssw0rd!');
 * const user = await auth.login('alice', 'P@ssw0rd!');
 */
class AuthManager {
  /**
   * @param {{ store?: object, saltRounds?: number }} [options]
   */
  constructor(options = {}) {
    this._store = options.store || new InMemoryUserStore();
    this._saltRounds = options.saltRounds || BCRYPT_SALT_ROUNDS;
    // Pre-compute a dummy hash with the same work factor so that login timing
    // for non-existent users matches that of real (failed) login attempts.
    this._dummyHash = bcrypt.hashSync('__dummy_password__', this._saltRounds);
  }

  /**
   * Register a new user.
   *
   * @param {string} username - Desired username
   * @param {string} password - Plaintext password (never stored)
   * @returns {Promise<{ id: string, username: string, createdAt: string }>}
   * @throws {Error} If validation fails or username is already taken
   */
  async register(username, password) {
    // --- Input validation ---
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      throw new Error(`Invalid username: ${usernameValidation.errors.join('; ')}`);
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new Error(`Weak password: ${passwordValidation.errors.join('; ')}`);
    }

    const normalised = username.trim().toLowerCase();

    // --- Duplicate check ---
    if (this._store.findByUsername(normalised)) {
      throw new Error('Username is already taken');
    }

    // --- Hash the password with bcrypt ---
    const passwordHash = await bcrypt.hash(password, this._saltRounds);

    // --- Persist ---
    const user = {
      id: crypto.randomUUID(),
      username: normalised,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    this._store.save(user);

    // Return a safe (no hash) representation
    return { id: user.id, username: user.username, createdAt: user.createdAt };
  }

  /**
   * Authenticate a user.
   *
   * Uses a constant-time compare (provided by bcrypt) to prevent timing attacks.
   * A dummy hash is compared when the user does not exist so the response time
   * matches a real (failed) login attempt, preventing user-enumeration.
   *
   * @param {string} username
   * @param {string} password - Plaintext password to verify
   * @returns {Promise<{ id: string, username: string, createdAt: string }>}
   * @throws {Error} If credentials are invalid
   */
  async login(username, password) {
    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new Error('Username and password must be strings');
    }

    const normalised = username.trim().toLowerCase();
    const user = this._store.findByUsername(normalised);

    // SECURITY: always run bcrypt.compare even when the user doesn't exist to
    // prevent user-enumeration via timing differences.  The dummy hash is built
    // with the same work factor as production hashes so compare times match.
    const hashToCompare = user
      ? user.passwordHash
      : this._dummyHash;

    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !isMatch) {
      throw new Error('Invalid username or password');
    }

    return { id: user.id, username: user.username, createdAt: user.createdAt };
  }

  /**
   * Check if a username is available.
   *
   * @param {string} username
   * @returns {boolean}
   */
  isUsernameAvailable(username) {
    if (typeof username !== 'string') return false;
    return this._store.findByUsername(username.trim().toLowerCase()) === null;
  }
}

module.exports = {
  AuthManager,
  InMemoryUserStore,
  validatePasswordStrength,
  validateUsername,
  PASSWORD_REQUIREMENTS,
  BCRYPT_SALT_ROUNDS
};
