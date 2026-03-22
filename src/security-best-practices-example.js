/**
 * Security Best Practices Example
 * Demonstrates secure usage of the Wallet module with new security features
 * 
 * SECURITY NOTE: This example shows proper handling of sensitive data
 */

const Wallet = require('./wallet');

console.log('🔒 Wallet Security Best Practices Demo\n');
console.log('='.repeat(70));

// Example 1: Generate and use a wallet securely
console.log('\n📋 Example 1: Secure Wallet Usage\n');

const wallet = new Wallet();

try {
  // Generate a new wallet
  console.log('1. Generating new wallet...');
  const walletData = wallet.generate();
  console.log('   ✓ Wallet generated');
  console.log('   Address:', walletData.address);
  console.log('   Private Key:', '[REDACTED]');
  
  // Encrypt with a strong password
  console.log('\n2. Encrypting wallet with strong password...');
  const password = 'MyV3ryS3cur3P@ssw0rd!2026';
  const encryptedData = wallet.encrypt(password);
  console.log('   ✓ Wallet encrypted successfully');
  console.log('   Algorithm:', encryptedData.algorithm);
  console.log('   KDF:', encryptedData.kdf);
  console.log('   Iterations:', encryptedData.iterations.toLocaleString());
  
  // Clear sensitive data from memory (NEW SECURITY FEATURE)
  console.log('\n3. Clearing sensitive data from memory...');
  wallet.clearSensitiveData();
  console.log('   ✓ Private key cleared from memory');
  console.log('   Private Key in memory:', wallet.privateKey === null ? 'NULL (secure)' : 'STILL IN MEMORY (insecure)');
  
  // Demonstrate safe decryption
  console.log('\n4. Re-importing and decrypting when needed...');
  const newWallet = new Wallet();
  newWallet.import(encryptedData);
  const decrypted = newWallet.decrypt(password);
  console.log('   ✓ Wallet decrypted successfully');
  console.log('   Address:', decrypted.address);
  console.log('   Private Key:', '[REDACTED]');
  
  // Clear again after use
  console.log('\n5. Clearing sensitive data after use...');
  newWallet.clearSensitiveData();
  console.log('   ✓ Sensitive data cleared again');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

// Example 2: What NOT to do
console.log('\n\n📋 Example 2: Common Security Mistakes to AVOID\n');

console.log('❌ DON\'T: Use weak passwords');
console.log('   Bad: "password123"');
console.log('   Good: "MyV3ryS3cur3P@ssw0rd!2026"');

console.log('\n❌ DON\'T: Log private keys to console');
console.log('   Bad: console.log(privateKey)');
console.log('   Good: console.log("[REDACTED]") // never log any portion of the key');

console.log('\n❌ DON\'T: Store private keys in plain text');
console.log('   Bad: localStorage.setItem("key", privateKey)');
console.log('   Good: Always encrypt before storage');

console.log('\n❌ DON\'T: Leave sensitive data in memory');
console.log('   Bad: Just letting variables exist until GC');
console.log('   Good: Call wallet.clearSensitiveData() when done');

console.log('\n❌ DON\'T: Hardcode passwords in source code');
console.log('   Bad: const password = "mysecret123"');
console.log('   Good: Get from secure input or environment variables');

// Example 3: API Key Protection
console.log('\n\n📋 Example 3: API Key Protection\n');

console.log('✅ DO: Use environment variables for API keys');
console.log('   const apiKey = process.env.ETHERSCAN_API_KEY;');

console.log('\n✅ DO: Redact API keys in logs');
const apiKey = process.env.ETHERSCAN_API_KEY || 'YOUR_API_KEY_HERE';
const redactedKey = apiKey === 'YOUR_API_KEY_HERE' ? 'YOUR_API_KEY_HERE' : '***REDACTED***';
console.log('   API Key:', redactedKey);

console.log('\n✅ DO: Never commit .env files');
console.log('   Add .env to .gitignore');

// Example 4: Secure random number generation
console.log('\n\n📋 Example 4: Cryptographic Randomness\n');

console.log('The wallet module validates cryptographic randomness:');
console.log('✓ Uses crypto.randomBytes() for key generation');
console.log('✓ Validates CSPRNG availability before encryption');
console.log('✓ Fails securely if randomness is unavailable');

// Summary
console.log('\n' + '='.repeat(70));
console.log('\n🎉 Security Best Practices Demo Complete!\n');
console.log('Key Takeaways:');
console.log('  1. Always use strong passwords (12+ characters)');
console.log('  2. Clear sensitive data from memory with clearSensitiveData()');
console.log('  3. Never log private keys or API keys in full');
console.log('  4. Use environment variables for secrets');
console.log('  5. Encrypt all sensitive data before storage');
console.log('  6. Verify cryptographic randomness is available');
console.log('\nFor more information, see:');
console.log('  - SECURITY-GUIDE.md');
console.log('  - SECURITY-AUDIT-2026-02.md');
console.log('\n' + '='.repeat(70));
