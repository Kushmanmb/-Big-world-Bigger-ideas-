/**
 * Tests for the Authentication Module
 *
 * SECURITY NOTE: Passwords in this file are for testing purposes only.
 * They are not real credentials.
 */

'use strict';

const {
  AuthManager,
  InMemoryUserStore,
  validatePasswordStrength,
  validateUsername
} = require('./auth');

const {
  test,
  testAsync,
  assertEqual,
  assertNotNull,
  assertThrows,
  printSummary
} = require('./test-helpers');

console.log('Running Authentication Module Tests...\n');

// Use a reduced salt round for tests so they complete quickly.
// SECURITY NOTE: Do NOT use saltRounds < 10 in production code.
// 8 is the minimum acceptable for test environments.
const TEST_SALT_ROUNDS = 8;

// ---------------------------------------------------------------------------
// validatePasswordStrength
// ---------------------------------------------------------------------------

test('should accept a strong password', () => {
  const result = validatePasswordStrength('P@ssw0rd!2026');
  assertEqual(result.valid, true, 'Strong password should be valid');
  assertEqual(result.errors.length, 0, 'Should have no errors');
});

test('should reject a password shorter than 8 characters', () => {
  const result = validatePasswordStrength('Sh0rt!');
  assertEqual(result.valid, false, 'Short password should be invalid');
  if (!result.errors.some(e => e.includes('at least'))) {
    throw new Error('Expected a "too short" error message');
  }
});

test('should reject a password without uppercase letter', () => {
  const result = validatePasswordStrength('p@ssw0rd!');
  assertEqual(result.valid, false, 'Password without uppercase should be invalid');
  if (!result.errors.some(e => e.includes('uppercase'))) {
    throw new Error('Expected an "uppercase" error message');
  }
});

test('should reject a password without lowercase letter', () => {
  const result = validatePasswordStrength('P@SSW0RD!');
  assertEqual(result.valid, false, 'Password without lowercase should be invalid');
  if (!result.errors.some(e => e.includes('lowercase'))) {
    throw new Error('Expected a "lowercase" error message');
  }
});

test('should reject a password without a number', () => {
  const result = validatePasswordStrength('P@ssword!');
  assertEqual(result.valid, false, 'Password without number should be invalid');
  if (!result.errors.some(e => e.includes('number'))) {
    throw new Error('Expected a "number" error message');
  }
});

test('should reject a password without a special character', () => {
  const result = validatePasswordStrength('Passw0rd1');
  assertEqual(result.valid, false, 'Password without special char should be invalid');
  if (!result.errors.some(e => e.includes('special character'))) {
    throw new Error('Expected a "special character" error message');
  }
});

test('should reject a non-string password', () => {
  const result = validatePasswordStrength(12345678);
  assertEqual(result.valid, false, 'Non-string password should be invalid');
});

test('should reject a password exceeding max length', () => {
  const result = validatePasswordStrength('A'.repeat(130) + '1@');
  assertEqual(result.valid, false, 'Over-length password should be invalid');
  if (!result.errors.some(e => e.includes('at most'))) {
    throw new Error('Expected a "too long" error message');
  }
});

// ---------------------------------------------------------------------------
// validateUsername
// ---------------------------------------------------------------------------

test('should accept a valid username', () => {
  const result = validateUsername('alice_123');
  assertEqual(result.valid, true, 'Valid username should be accepted');
});

test('should reject a username shorter than 3 characters', () => {
  const result = validateUsername('ab');
  assertEqual(result.valid, false, 'Short username should be rejected');
});

test('should reject a username with invalid characters', () => {
  const result = validateUsername('alice smith!');
  assertEqual(result.valid, false, 'Username with spaces and ! should be rejected');
});

test('should reject a non-string username', () => {
  const result = validateUsername(42);
  assertEqual(result.valid, false, 'Non-string username should be rejected');
});

// ---------------------------------------------------------------------------
// Async tests — run inside a main async function so printSummary() is
// called only after all bcrypt operations have completed.
// ---------------------------------------------------------------------------

async function runAsyncTests() {
  // AuthManager.register

  await testAsync('should register a new user successfully', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    const user = await auth.register('TestUser1', 'Str0ng@Pass!');

    assertNotNull(user.id, 'Registered user should have an id');
    assertNotNull(user.username, 'Registered user should have a username');
    assertNotNull(user.createdAt, 'Registered user should have a createdAt timestamp');
    assertEqual(user.username, 'testuser1', 'Username should be normalised to lowercase');
  });

  await testAsync('should reject registration with a weak password', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    let threw = false;
    try {
      await auth.register('NewUser', 'weakpassword');
    } catch (err) {
      threw = true;
      if (!err.message.includes('Weak password')) {
        throw new Error(`Expected "Weak password" error, got: ${err.message}`);
      }
    }
    if (!threw) throw new Error('Expected registration to fail with weak password');
  });

  await testAsync('should reject registration with an invalid username', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    let threw = false;
    try {
      await auth.register('ab', 'Str0ng@Pass!');
    } catch (err) {
      threw = true;
      if (!err.message.includes('Invalid username')) {
        throw new Error(`Expected "Invalid username" error, got: ${err.message}`);
      }
    }
    if (!threw) throw new Error('Expected registration to fail with short username');
  });

  await testAsync('should reject duplicate usernames (case-insensitive)', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    await auth.register('UniqueUser', 'Str0ng@Pass!');
    let threw = false;
    try {
      await auth.register('uniqueuser', 'Str0ng@Pass!');
    } catch (err) {
      threw = true;
      if (!err.message.includes('already taken')) {
        throw new Error(`Expected "already taken" error, got: ${err.message}`);
      }
    }
    if (!threw) throw new Error('Expected registration to fail on duplicate username');
  });

  await testAsync('should not expose passwordHash in the returned user object', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    const user = await auth.register('SecureUser', 'Str0ng@Pass!');
    if ('passwordHash' in user) {
      throw new Error('passwordHash should not be returned from register()');
    }
  });

  // AuthManager.login

  await testAsync('should login with correct credentials', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    await auth.register('LoginUser', 'C0rrectPass!');
    const user = await auth.login('loginuser', 'C0rrectPass!');
    assertNotNull(user.id, 'Logged-in user should have an id');
    assertEqual(user.username, 'loginuser', 'Logged-in username should match');
  });

  await testAsync('should reject login with wrong password', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    await auth.register('WrongPassUser', 'C0rrectPass!');
    let threw = false;
    try {
      await auth.login('wrongpassuser', 'Wr0ngPass!');
    } catch (err) {
      threw = true;
      if (!err.message.includes('Invalid username or password')) {
        throw new Error(`Expected "Invalid username or password" error, got: ${err.message}`);
      }
    }
    if (!threw) throw new Error('Expected login to fail with wrong password');
  });

  await testAsync('should reject login for non-existent user', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    let threw = false;
    try {
      await auth.login('nosuchuser', 'Str0ng@Pass!');
    } catch (err) {
      threw = true;
      if (!err.message.includes('Invalid username or password')) {
        throw new Error(`Expected generic "Invalid username or password" error, got: ${err.message}`);
      }
    }
    if (!threw) throw new Error('Expected login to fail for non-existent user');
  });

  await testAsync('should reject login with non-string inputs', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    let threw = false;
    try {
      await auth.login(null, null);
    } catch (err) {
      threw = true;
    }
    if (!threw) throw new Error('Expected login to throw for null inputs');
  });

  await testAsync('login should be case-insensitive for username', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    await auth.register('CaseUser', 'Str0ng@Pass!');
    const user = await auth.login('CASEUSER', 'Str0ng@Pass!');
    assertEqual(user.username, 'caseuser', 'Username should match lowercased form');
  });

  // AuthManager.isUsernameAvailable

  await testAsync('should report username as available before registration', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    const available = auth.isUsernameAvailable('brandnewuser');
    assertEqual(available, true, 'Username should be available');
  });

  await testAsync('should report username as taken after registration', async () => {
    const auth = new AuthManager({ saltRounds: TEST_SALT_ROUNDS });
    await auth.register('TakenUser', 'Str0ng@Pass!');
    const available = auth.isUsernameAvailable('takenuser');
    assertEqual(available, false, 'Username should not be available after registration');
  });
}

// ---------------------------------------------------------------------------
// Run all async tests then print summary
// ---------------------------------------------------------------------------

runAsyncTests().then(() => {
  printSummary();
}).catch((err) => {
  console.error('Unexpected test runner error:', err);
  process.exit(1);
});
