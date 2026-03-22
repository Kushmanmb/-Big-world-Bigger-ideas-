/**
 * Simple test suite for Wallet encryption functionality
 * 
 * SECURITY NOTE: The passwords in this test file are intentionally hardcoded
 * for testing purposes only. This is acceptable for test files as they are
 * not real credentials and are only used to verify encryption functionality.
 * In production code, NEVER hardcode passwords, API keys, or private keys.
 */

const Wallet = require('./wallet');
const { test, assertEqual, assertNotNull, assertThrows, printSummary } = require('./test-helpers');

console.log('Running Wallet Encryption Tests...\n');

// Test 1: Wallet generation
test('should generate a wallet with address and private key', () => {
  const wallet = new Wallet();
  const data = wallet.generate();
  
  assertNotNull(data.address, 'Address should not be null');
  assertNotNull(data.privateKey, 'Private key should not be null');
  assertEqual(data.address.substring(0, 2), '0x', 'Address should start with 0x');
  assertEqual(data.address.length, 42, 'Address should be 42 characters');
  assertEqual(data.privateKey.length, 64, 'Private key should be 64 characters');
});

// Test 2: Wallet encryption with valid password
test('should encrypt wallet with valid password', () => {
  const wallet = new Wallet();
  wallet.generate();
  
  const encryptedData = wallet.encrypt('SecurePassword123');
  
  assertNotNull(encryptedData, 'Encrypted data should not be null');
  assertNotNull(encryptedData.data, 'Encrypted data.data should not be null');
  assertNotNull(encryptedData.salt, 'Salt should not be null');
  assertNotNull(encryptedData.iv, 'IV should not be null');
  assertEqual(encryptedData.algorithm, 'aes-256-cbc', 'Algorithm should be aes-256-cbc');
  assertEqual(encryptedData.kdf, 'pbkdf2', 'KDF should be pbkdf2');
  assertEqual(encryptedData.iterations, 100000, 'Iterations should be 100000');
});

// Test 3: Password validation - empty password
test('should reject empty password', () => {
  const wallet = new Wallet();
  wallet.generate();
  
  assertThrows(() => wallet.encrypt(''), 'non-empty string');
});

// Test 4: Password validation - short password
test('should reject password shorter than 8 characters', () => {
  const wallet = new Wallet();
  wallet.generate();
  
  assertThrows(() => wallet.encrypt('short'), 'at least 8 characters');
});

// Test 5: Password validation - non-string password
test('should reject non-string password', () => {
  const wallet = new Wallet();
  wallet.generate();
  
  assertThrows(() => wallet.encrypt(12345), 'non-empty string');
});

// Test 6: Successful decryption with correct password
test('should decrypt wallet with correct password', () => {
  const wallet = new Wallet();
  const originalData = wallet.generate();
  const password = 'TestPassword123';
  
  wallet.encrypt(password);
  const decryptedData = wallet.decrypt(password);
  
  assertEqual(decryptedData.address, originalData.address, 'Decrypted address should match original');
  assertEqual(decryptedData.privateKey, originalData.privateKey, 'Decrypted private key should match original');
});

// Test 7: Failed decryption with wrong password
test('should fail to decrypt with wrong password', () => {
  const wallet = new Wallet();
  wallet.generate();
  wallet.encrypt('CorrectPassword123');
  
  assertThrows(() => wallet.decrypt('WrongPassword123'), 'Invalid password');
});

// Test 8: Export encrypted wallet
test('should export encrypted wallet', () => {
  const wallet = new Wallet();
  wallet.generate();
  wallet.encrypt('ExportPassword123');
  
  const exported = wallet.export();
  
  assertNotNull(exported, 'Exported data should not be null');
  assertNotNull(exported.data, 'Exported encrypted data should not be null');
});

// Test 9: Export before encryption should fail
test('should fail to export before encryption', () => {
  const wallet = new Wallet();
  wallet.generate();
  
  assertThrows(() => wallet.export(), 'must be encrypted before exporting');
});

// Test 10: Import and decrypt
test('should import and decrypt encrypted wallet', () => {
  const wallet1 = new Wallet();
  const originalData = wallet1.generate();
  const password = 'ImportPassword123';
  
  wallet1.encrypt(password);
  const exported = wallet1.export();
  
  const wallet2 = new Wallet();
  wallet2.import(exported);
  const decryptedData = wallet2.decrypt(password);
  
  assertEqual(decryptedData.address, originalData.address, 'Imported wallet address should match');
  assertEqual(decryptedData.privateKey, originalData.privateKey, 'Imported wallet private key should match');
});

// Test 11: Import invalid data
test('should fail to import invalid data', () => {
  const wallet = new Wallet();
  
  assertThrows(() => wallet.import(null), 'Invalid encrypted data');
  assertThrows(() => wallet.import('not an object'), 'Invalid encrypted data');
});

// Test 12: Decrypt without encrypted data
test('should fail to decrypt without encrypted data', () => {
  const wallet = new Wallet();
  
  assertThrows(() => wallet.decrypt('SomePassword123'), 'No encrypted data found');
});

// Test 13: Different passwords produce different encrypted data
test('should produce different encrypted data with different passwords', () => {
  const wallet1 = new Wallet();
  const wallet2 = new Wallet();
  
  const data = wallet1.generate();
  wallet2.address = data.address;
  wallet2.privateKey = data.privateKey;
  
  const encrypted1 = wallet1.encrypt('Password1');
  const encrypted2 = wallet2.encrypt('Password2');
  
  if (encrypted1.data === encrypted2.data) {
    throw new Error('Different passwords should produce different encrypted data');
  }
});

// Test 14: Same wallet encrypted twice produces different encrypted data (due to random salt/IV)
test('should produce different encrypted data on repeated encryption', () => {
  const wallet = new Wallet();
  const data = wallet.generate();
  const password = 'SamePassword123';
  
  const encrypted1 = wallet.encrypt(password);
  
  // Reset wallet to same state
  wallet.address = data.address;
  wallet.privateKey = data.privateKey;
  
  const encrypted2 = wallet.encrypt(password);
  
  if (encrypted1.data === encrypted2.data) {
    throw new Error('Repeated encryption should produce different encrypted data');
  }
});

// Test 15: Clear sensitive data
test('should clear private key when clearSensitiveData is called', () => {
  const wallet = new Wallet();
  const data = wallet.generate();
  
  assertNotNull(wallet.privateKey, 'Private key should exist before clearing');
  
  wallet.clearSensitiveData();
  
  assertEqual(wallet.privateKey, null, 'Private key should be null after clearing');
  assertNotNull(wallet.address, 'Address should still exist after clearing');
});

// Test 16: Verify cryptographic randomness validation
test('should validate cryptographic random number generator availability', () => {
  const wallet = new Wallet();
  wallet.generate();
  
  // This should not throw if crypto.randomBytes is available
  // which it should be in a Node.js environment
  const encryptedData = wallet.encrypt('TestPassword123');
  assertNotNull(encryptedData, 'Should encrypt successfully with available CSPRNG');
});

// Test 17: Wallet starts unlocked
test('should start in unlocked state', () => {
  const wallet = new Wallet();
  assertEqual(wallet.isLocked, false, 'Wallet should start unlocked');
});

// Test 18: Lock wallet
test('should lock the wallet and clear private key', () => {
  const wallet = new Wallet();
  wallet.generate();

  assertNotNull(wallet.privateKey, 'Private key should exist before locking');
  wallet.lock();

  assertEqual(wallet.isLocked, true, 'Wallet should be locked after lock()');
  assertEqual(wallet.privateKey, null, 'Private key should be cleared after lock()');
});

// Test 19: Send is blocked when locked
test('should block send when wallet is locked', () => {
  const wallet = new Wallet();
  wallet.generate();
  wallet.lock();

  assertThrows(() => wallet.send('0xRecipient1234567890', 1.0), 'Wallet is locked');
});

// Test 20: Unlock wallet
test('should unlock the wallet with correct password', () => {
  const wallet = new Wallet();
  wallet.generate();
  const password = 'UnlockPassword123';
  wallet.encrypt(password);
  wallet.lock();

  assertEqual(wallet.isLocked, true, 'Wallet should be locked');
  wallet.unlock(password);
  assertEqual(wallet.isLocked, false, 'Wallet should be unlocked after unlock()');
  assertNotNull(wallet.privateKey, 'Private key should be restored after unlock()');
});

// Test 21: Unlock with wrong password should fail
test('should fail to unlock with wrong password', () => {
  const wallet = new Wallet();
  wallet.generate();
  wallet.encrypt('CorrectPassword123');
  wallet.lock();

  assertThrows(() => wallet.unlock('WrongPassword123'), 'Invalid password');
  assertEqual(wallet.isLocked, true, 'Wallet should remain locked after failed unlock');
});

// Test 22: Send succeeds when unlocked
test('should allow send when wallet is unlocked', () => {
  const wallet = new Wallet();
  wallet.generate();

  const tx = wallet.send('0xRecipient1234567890123456789012345678', 0.5);
  assertNotNull(tx, 'Transaction should be returned');
  assertEqual(tx.to, '0xRecipient1234567890123456789012345678', 'Recipient should match');
  assertEqual(tx.amount, 0.5, 'Amount should match');
  assertEqual(tx.from, wallet.address, 'From address should match wallet address');
});

// Test 23: Send validates recipient address
test('should reject send with invalid recipient address', () => {
  const wallet = new Wallet();
  wallet.generate();

  assertThrows(() => wallet.send('', 1.0), 'non-empty string');
  assertThrows(() => wallet.send(null, 1.0), 'non-empty string');
});

// Test 24: Send validates amount
test('should reject send with invalid amount', () => {
  const wallet = new Wallet();
  wallet.generate();

  assertThrows(() => wallet.send('0xRecipient', 0), 'positive number');
  assertThrows(() => wallet.send('0xRecipient', -1), 'positive number');
  assertThrows(() => wallet.send('0xRecipient', 'abc'), 'positive number');
});

// Test 25: Unlock without encrypted data should fail
test('should fail to unlock without encrypted data', () => {
  const wallet = new Wallet();
  wallet.generate();

  assertThrows(() => wallet.unlock('SomePassword123'), 'No encrypted data found');
});

// Test 26: Wallet starts unpaused with no owner
test('should start unpaused with no owner', () => {
  const wallet = new Wallet();
  assertEqual(wallet.isPaused, false, 'Wallet should start unpaused');
  assertEqual(wallet.ownerAddress, null, 'Owner address should be null before generate()');
});

// Test 27: generate() sets ownerAddress to the wallet address
test('should set ownerAddress to wallet address after generate()', () => {
  const wallet = new Wallet();
  wallet.generate();
  assertEqual(wallet.ownerAddress, wallet.address, 'Owner address should match wallet address');
});

// Test 28: Owner can pause the wallet
test('should allow owner to pause the wallet', () => {
  const wallet = new Wallet();
  wallet.generate();

  wallet.pause(wallet.ownerAddress);
  assertEqual(wallet.isPaused, true, 'Wallet should be paused after owner calls pause()');
});

// Test 29: Owner can unpause the wallet
test('should allow owner to unpause the wallet', () => {
  const wallet = new Wallet();
  wallet.generate();

  wallet.pause(wallet.ownerAddress);
  wallet.unpause(wallet.ownerAddress);
  assertEqual(wallet.isPaused, false, 'Wallet should be unpaused after owner calls unpause()');
});

// Test 30: Non-owner cannot pause the wallet
test('should reject pause from non-owner address', () => {
  const wallet = new Wallet();
  wallet.generate();

  assertThrows(() => wallet.pause('0x0000000000000000000000000000000000000001'), 'Only the owner can pause');
  assertEqual(wallet.isPaused, false, 'Wallet should remain unpaused after failed pause attempt');
});

// Test 31: Non-owner cannot unpause the wallet
test('should reject unpause from non-owner address', () => {
  const wallet = new Wallet();
  wallet.generate();
  wallet.pause(wallet.ownerAddress);

  assertThrows(() => wallet.unpause('0x0000000000000000000000000000000000000001'), 'Only the owner can unpause');
  assertEqual(wallet.isPaused, true, 'Wallet should remain paused after failed unpause attempt');
});

// Test 32: Send is blocked when paused
test('should block send when wallet is paused', () => {
  const wallet = new Wallet();
  wallet.generate();
  wallet.pause(wallet.ownerAddress);

  assertThrows(() => wallet.send('0xRecipient1234567890123456789012345678', 1.0), 'Wallet is paused');
});

// Test 33: Send succeeds after unpausing
test('should allow send after owner unpauses', () => {
  const wallet = new Wallet();
  wallet.generate();
  wallet.pause(wallet.ownerAddress);
  wallet.unpause(wallet.ownerAddress);

  const tx = wallet.send('0xRecipient1234567890123456789012345678', 2.0);
  assertNotNull(tx, 'Transaction should be returned after unpause');
  assertEqual(tx.amount, 2.0, 'Amount should match');
});

// Test 34: pause() requires a valid caller address
test('should reject pause with invalid caller address', () => {
  const wallet = new Wallet();
  wallet.generate();

  assertThrows(() => wallet.pause(''), 'non-empty string');
  assertThrows(() => wallet.pause(null), 'non-empty string');
});

// Test 35: pause() before generate() should fail
test('should fail to pause before wallet is generated', () => {
  const wallet = new Wallet();

  assertThrows(() => wallet.pause('0xAnyAddress'), 'Wallet has no owner');
  assertThrows(() => wallet.unpause('0xAnyAddress'), 'Wallet has no owner');
});

// Summary
printSummary();
