/**
 * Address Sanitization Demo
 * 
 * This example demonstrates the proper use of address sanitization
 * to prevent blockchain address leaks in logs and error messages.
 */

const {
  safeConsole,
  sanitize,
  sanitizeText,
  sanitizeObject,
  defaultSanitizer
} = require('./address-sanitizer');

console.log('Address Sanitization Security Demo\n');
console.log('='.repeat(70));

// Example 1: Basic Address Sanitization
console.log('\n1. Basic Address Sanitization');
console.log('-'.repeat(70));

const userAddress = '0x1234567890123456789012345678901234567890';
const contractAddress = '0xabcdef1234567890123456789012345678901234';

console.log('❌ UNSAFE - Original address exposed:');
console.log('   User address:', userAddress);

console.log('\n✅ SAFE - Address sanitized:');
console.log('   User address:', sanitize(userAddress));

// Example 2: Safe Console Usage
console.log('\n2. Safe Console Logger');
console.log('-'.repeat(70));

console.log('❌ UNSAFE - Regular console.log:');
console.log('   Transaction from', userAddress, 'to', contractAddress);

console.log('\n✅ SAFE - Using safeConsole:');
safeConsole.log('   Transaction from', userAddress, 'to', contractAddress);

// Example 3: Text Sanitization
console.log('\n3. Text with Embedded Addresses');
console.log('-'.repeat(70));

const message = `Transfer 100 tokens from ${userAddress} to ${contractAddress}`;

console.log('❌ UNSAFE - Original message:');
console.log('  ', message);

console.log('\n✅ SAFE - Sanitized message:');
console.log('  ', sanitizeText(message));

// Example 4: Object Sanitization
console.log('\n4. Complex Object Sanitization');
console.log('-'.repeat(70));

const transaction = {
  from: userAddress,
  to: contractAddress,
  amount: '100',
  timestamp: Date.now(),
  metadata: {
    sender: userAddress,
    receiver: contractAddress
  }
};

console.log('❌ UNSAFE - Original object:');
console.log(JSON.stringify(transaction, null, 2));

console.log('\n✅ SAFE - Sanitized object:');
console.log(JSON.stringify(sanitizeObject(transaction), null, 2));

// Example 5: Error Handling
console.log('\n5. Error Message Sanitization');
console.log('-'.repeat(70));

try {
  throw new Error(`Transaction failed for address ${userAddress}`);
} catch (error) {
  console.log('❌ UNSAFE - Raw error message:');
  console.log('  ', error.message);
  
  const sanitizedError = new Error(sanitizeText(error.message));
  console.log('\n✅ SAFE - Sanitized error message:');
  console.log('  ', sanitizedError.message);
}

// Example 6: API Response Sanitization
console.log('\n6. API Response Sanitization');
console.log('-'.repeat(70));

const apiResponse = {
  success: true,
  data: {
    walletAddress: userAddress,
    balance: '1000',
    transactions: [
      { from: userAddress, to: contractAddress, value: '100' },
      { from: contractAddress, to: userAddress, value: '50' }
    ]
  }
};

console.log('❌ UNSAFE - API response for logging:');
console.log(JSON.stringify(apiResponse, null, 2).substring(0, 200) + '...');

console.log('\n✅ SAFE - Sanitized API response:');
console.log(JSON.stringify(sanitizeObject(apiResponse), null, 2).substring(0, 200) + '...');

// Example 7: Leak Detection
console.log('\n7. Address Leak Detection');
console.log('-'.repeat(70));

const suspiciousLog = `User 0x1234567890123456789012345678901234567890 logged in`;
const cleanLog = sanitizeText(suspiciousLog);

const leakCheck1 = defaultSanitizer.validateNoAddressLeaks(suspiciousLog);
const leakCheck2 = defaultSanitizer.validateNoAddressLeaks(cleanLog);

console.log('Suspicious log:', suspiciousLog);
console.log('  Has leaks?', !leakCheck1.valid);
console.log('  Exposed addresses:', leakCheck1.exposedAddresses);

console.log('\nSanitized log:', cleanLog);
console.log('  Has leaks?', !leakCheck2.valid);
console.log('  Exposed addresses:', leakCheck2.exposedAddresses);

// Example 8: Whitelisted Addresses
console.log('\n8. Whitelisted Addresses');
console.log('-'.repeat(70));

const zeroAddress = '0x0000000000000000000000000000000000000000';
const burnAddress = '0x000000000000000000000000000000000000dead';

console.log('Zero address (whitelisted):', sanitize(zeroAddress));
console.log('Burn address (whitelisted):', sanitize(burnAddress));
console.log('User address (not whitelisted):', sanitize(userAddress));

// Example 9: Production vs Development
console.log('\n9. Environment-Aware Usage');
console.log('-'.repeat(70));

function logTransaction(tx) {
  if (process.env.NODE_ENV === 'production') {
    // Production: Always sanitize
    safeConsole.log('Transaction:', sanitizeObject(tx));
  } else {
    // Development: Can show full details
    console.log('Transaction (dev mode):', tx);
  }
}

console.log('Setting NODE_ENV=production...');
process.env.NODE_ENV = 'production';
logTransaction(transaction);

// Example 10: Best Practice Summary
console.log('\n10. Best Practice Summary');
console.log('='.repeat(70));

console.log(`
✅ DO:
  - Use safeConsole instead of console in production
  - Sanitize all user-facing error messages
  - Sanitize objects before logging
  - Use validateNoAddressLeaks() in tests
  - Keep SANITIZE_ADDRESSES=true in production
  
❌ DON'T:
  - Log raw addresses in production
  - Concatenate addresses into strings before sanitizing
  - Disable sanitization in production
  - Expose addresses in error messages
  - Share logs containing full addresses

📚 Resources:
  - Security Config: SECURITY-CONFIG.md
  - Best Practices: docs/ADDRESS-SANITIZATION-BEST-PRACTICES.md
  - Audit Report: SECURITY-AUDIT-ADDRESS-LOCKDOWN.md
`);

console.log('\n' + '='.repeat(70));
console.log('✅ Demo completed successfully!');
console.log('='.repeat(70) + '\n');
