/**
 * Example usage of the Wallet encryption functionality
 * 
 * SECURITY NOTE: This is a demonstration file showing how to use the wallet
 * encryption features. The password 'MySecurePassword123!' is used as an
 * example only. In production, users should provide their own strong passwords
 * and NEVER hardcode them in source code.
 */

const Wallet = require('./wallet');

// Create a new wallet instance
const wallet = new Wallet();

// Generate a new wallet
console.log('Generating new wallet...');
const walletData = wallet.generate();
console.log('Wallet Address:', walletData.address);
console.log('Private Key:', '[REDACTED]');

// Encrypt the wallet with a password
console.log('\nEncrypting wallet...');
const newPassword = 'MySecurePassword123!';
const encryptedData = wallet.encrypt(newPassword);
console.log('Wallet encrypted successfully!');
console.log('Encrypted data:', {
  algorithm: encryptedData.algorithm,
  kdf: encryptedData.kdf,
  iterations: encryptedData.iterations,
  dataLength: encryptedData.data.length
});

// Export the encrypted wallet
console.log('\nExporting encrypted wallet...');
const exported = wallet.export();
console.log('Wallet exported successfully!');

// Create a new wallet instance and import the encrypted data
console.log('\nImporting encrypted wallet...');
const importedWallet = new Wallet();
importedWallet.import(exported);
console.log('Wallet imported successfully!');

// Decrypt the wallet
console.log('\nDecrypting wallet...');
try {
  const decryptedData = importedWallet.decrypt(newPassword);
  console.log('Wallet decrypted successfully!');
  console.log('Decrypted Address:', decryptedData.address);
  console.log('Decrypted Private Key:', '[REDACTED]');
} catch (error) {
  console.error('Decryption failed:', error.message);
}

// Try with wrong password
console.log('\nTrying to decrypt with wrong password...');
try {
  const wrongWallet = new Wallet();
  wrongWallet.import(exported);
  wrongWallet.decrypt('WrongPassword');
} catch (error) {
  console.log('Expected error:', error.message);
}

console.log('\n✅ Wallet encryption example completed!');
