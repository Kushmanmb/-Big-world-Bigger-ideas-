/**
 * Authentication Module — Example Usage
 *
 * Demonstrates how to use the AuthManager for user registration and login.
 *
 * SECURITY NOTE: The passwords used below are for demonstration only.
 * In production, never hardcode credentials.
 */

'use strict';

const { AuthManager, validatePasswordStrength } = require('./auth');

console.log('='.repeat(60));
console.log('Authentication Module — Example Usage');
console.log('='.repeat(60));
console.log();

// ---------------------------------------------------------------------------
// Example 1: Password strength validation
// ---------------------------------------------------------------------------
console.log('Example 1: Password strength validation');
console.log('-'.repeat(60));

const passwords = [
  'weak',
  'BetterButNoNumber!',
  'G00dP@ssword!'
];

for (const pw of passwords) {
  const result = validatePasswordStrength(pw);
  console.log(`Password: "${pw}"`);
  console.log(`  Valid: ${result.valid ? '✓' : '✗'}`);
  if (!result.valid) {
    result.errors.forEach(e => console.log(`  - ${e}`));
  }
  console.log();
}

// ---------------------------------------------------------------------------
// Example 2: Register and login
// ---------------------------------------------------------------------------
async function main() {
  console.log('Example 2: User registration and login');
  console.log('-'.repeat(60));

  const auth = new AuthManager();

  // Register a new user
  try {
    const newUser = await auth.register('alice', 'S3cur3P@ss!');
    console.log('Registered user:');
    console.log(`  ID:        ${newUser.id}`);
    console.log(`  Username:  ${newUser.username}`);
    console.log(`  CreatedAt: ${newUser.createdAt}`);
  } catch (err) {
    console.error('Registration failed:', err.message);
  }
  console.log();

  // Attempt duplicate registration
  console.log('Example 3: Duplicate registration (should fail)');
  console.log('-'.repeat(60));
  try {
    await auth.register('Alice', 'AnotherP@ss1!');
    console.error('✗ Should have thrown');
  } catch (err) {
    console.log(`✓ Correctly rejected duplicate: ${err.message}`);
  }
  console.log();

  // Successful login
  console.log('Example 4: Successful login');
  console.log('-'.repeat(60));
  try {
    const loggedIn = await auth.login('alice', 'S3cur3P@ss!');
    console.log(`✓ Login successful — welcome, ${loggedIn.username}!`);
  } catch (err) {
    console.error('Login failed:', err.message);
  }
  console.log();

  // Failed login (wrong password)
  console.log('Example 5: Login with wrong password (should fail)');
  console.log('-'.repeat(60));
  try {
    await auth.login('alice', 'Wr0ngP@ss!');
    console.error('✗ Should have thrown');
  } catch (err) {
    console.log(`✓ Correctly rejected: ${err.message}`);
  }
  console.log();

  // Check username availability
  console.log('Example 6: Username availability');
  console.log('-'.repeat(60));
  console.log(`  "alice"   available: ${auth.isUsernameAvailable('alice')}`);
  console.log(`  "bob"     available: ${auth.isUsernameAvailable('bob')}`);
  console.log();

  console.log('='.repeat(60));
  console.log('Done.');
}

main().catch(console.error);
