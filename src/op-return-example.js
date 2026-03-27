/**
 * OP_RETURN Module Example
 * Demonstrates encoding, decoding, and working with OP_RETURN data
 * across Bitcoin, Litecoin, and Ethereum platforms
 */

const OPReturnFetcher = require('./op-return.js');

console.log('='.repeat(60));
console.log('OP_RETURN Module - Cross-Platform Examples');
console.log('='.repeat(60));
console.log();

// Example 1: Bitcoin OP_RETURN
console.log('Example 1: Bitcoin OP_RETURN Data Encoding\n');
console.log('-'.repeat(60));

const btcFetcher = new OPReturnFetcher('bitcoin');
const btcMessage = 'Hello Bitcoin Blockchain!';

console.log(`Original message: "${btcMessage}"`);
console.log(`Message length: ${btcMessage.length} characters\n`);

try {
  const encoded = btcFetcher.encodeData(btcMessage);
  console.log(`Encoded (hex): ${encoded}`);
  console.log(`Hex length: ${encoded.length} characters (${encoded.length / 2} bytes)\n`);

  const script = btcFetcher.createOpReturnScript(btcMessage);
  console.log('OP_RETURN Script:');
  console.log(`  Opcode: ${script.opcode}`);
  console.log(`  Platform: ${script.platform}`);
  console.log(`  Data bytes: ${script.bytes}`);
  console.log(`  Script: ${script.script}\n`);

  const decoded = btcFetcher.decodeData(encoded);
  console.log(`Decoded message: "${decoded}"`);
  console.log(`Match: ${decoded === btcMessage ? '✓ Success' : '✗ Failed'}\n`);
} catch (error) {
  console.error(`Error: ${error.message}\n`);
}

// Example 2: Litecoin OP_RETURN
console.log('Example 2: Litecoin OP_RETURN Data Encoding\n');
console.log('-'.repeat(60));

const ltcFetcher = new OPReturnFetcher('litecoin');
const ltcMessage = 'Litecoin timestamp: ' + new Date().toISOString();

console.log(`Original message: "${ltcMessage}"`);
console.log(`Message length: ${ltcMessage.length} characters\n`);

try {
  const validation = ltcFetcher.validateDataSize(ltcMessage);
  console.log('Data validation:');
  console.log(`  Valid: ${validation.valid}`);
  console.log(`  Size: ${validation.size} bytes`);
  console.log(`  Max size: ${validation.maxSize} bytes\n`);

  if (validation.valid) {
    const script = ltcFetcher.createOpReturnScript(ltcMessage);
    console.log('OP_RETURN Script created successfully');
    console.log(`  Platform: ${script.platform}`);
    console.log(`  Data: ${script.data}`);
    console.log(`  Bytes: ${script.bytes}\n`);
  }
} catch (error) {
  console.error(`Error: ${error.message}\n`);
}

// Example 3: Ethereum Transaction Data
console.log('Example 3: Ethereum Transaction Data\n');
console.log('-'.repeat(60));

const ethFetcher = new OPReturnFetcher('ethereum');
const ethMessage = 'This is a longer message that would not fit in Bitcoin OP_RETURN (80 bytes max), but works perfectly fine in Ethereum transaction data!';

console.log(`Original message: "${ethMessage}"`);
console.log(`Message length: ${ethMessage.length} characters\n`);

try {
  const validation = ethFetcher.validateDataSize(ethMessage);
  console.log('Data validation:');
  console.log(`  Valid: ${validation.valid}`);
  console.log(`  Size: ${validation.size} bytes`);
  console.log(`  Max size: ${validation.maxSize}\n`);

  const ethData = ethFetcher.createEthereumData(ethMessage);
  console.log('Ethereum Transaction Data:');
  console.log(`  Platform: ${ethData.platform}`);
  console.log(`  Field: ${ethData.field}`);
  console.log(`  Bytes: ${ethData.bytes}`);
  console.log(`  Hex (first 50 chars): ${ethData.hex.substring(0, 50)}...\n`);
} catch (error) {
  console.error(`Error: ${error.message}\n`);
}

// Example 4: Size Limit Demonstration
console.log('Example 4: Platform Size Limits\n');
console.log('-'.repeat(60));

const testSizes = [20, 50, 80, 100, 150];

console.log('Testing different data sizes across platforms:\n');

testSizes.forEach(size => {
  const testData = 'a'.repeat(size);
  
  console.log(`${size} bytes:`);
  
  const btcValidation = btcFetcher.validateDataSize(testData);
  console.log(`  Bitcoin: ${btcValidation.valid ? '✓ Valid' : '✗ Too large'}`);
  
  const ltcValidation = ltcFetcher.validateDataSize(testData);
  console.log(`  Litecoin: ${ltcValidation.valid ? '✓ Valid' : '✗ Too large'}`);
  
  const ethValidation = ethFetcher.validateDataSize(testData);
  console.log(`  Ethereum: ${ethValidation.valid ? '✓ Valid' : '✗ Too large'}\n`);
});

// Example 5: Special Characters and Unicode
console.log('Example 5: Unicode and Special Characters\n');
console.log('-'.repeat(60));

const specialMessages = [
  'Hello 🌍',
  '你好世界',
  'Привет мир',
  '{"type":"metadata","value":123}',
  'https://example.com/tx?id=abc123'
];

specialMessages.forEach((msg, index) => {
  console.log(`Test ${index + 1}: "${msg}"`);
  try {
    const encoded = btcFetcher.encodeData(msg);
    const decoded = btcFetcher.decodeData(encoded);
    const match = decoded === msg;
    console.log(`  Encoded: ${encoded.substring(0, 40)}${encoded.length > 40 ? '...' : ''}`);
    console.log(`  Decoded: "${decoded}"`);
    console.log(`  Match: ${match ? '✓ Success' : '✗ Failed'}\n`);
  } catch (error) {
    console.error(`  Error: ${error.message}\n`);
  }
});

// Example 6: Practical Use Cases
console.log('Example 6: Practical Use Cases\n');
console.log('-'.repeat(60));

console.log('Use Case 1: Document Timestamp\n');
const docHash = 'sha256:a3b5c8d9e2f1...';
const timestamp = new Date().toISOString();
const timestampData = `DOC:${docHash}:${timestamp}`;

try {
  const script = btcFetcher.createOpReturnScript(timestampData);
  console.log(`  Data: ${timestampData}`);
  console.log(`  Size: ${script.bytes} bytes`);
  console.log(`  Valid for Bitcoin: ✓\n`);
} catch (error) {
  console.error(`  Error: ${error.message}\n`);
}

console.log('Use Case 2: NFT Metadata Link\n');
const nftMetadata = 'ipfs://QmX7Y8Z9...';

try {
  const script = btcFetcher.createOpReturnScript(nftMetadata);
  console.log(`  IPFS Link: ${nftMetadata}`);
  console.log(`  Size: ${script.bytes} bytes`);
  console.log(`  Valid for Bitcoin: ✓\n`);
} catch (error) {
  console.error(`  Error: ${error.message}\n`);
}

console.log('Use Case 3: Simple Message\n');
const simpleMsg = 'GM from blockchain!';

try {
  const script = btcFetcher.createOpReturnScript(simpleMsg);
  console.log(`  Message: ${simpleMsg}`);
  console.log(`  Size: ${script.bytes} bytes`);
  console.log(`  Valid for Bitcoin: ✓\n`);
} catch (error) {
  console.error(`  Error: ${error.message}\n`);
}

// Example 7: Platform Comparison
console.log('Example 7: Platform Comparison Summary\n');
console.log('-'.repeat(60));

const comparisonData = 'Test message for comparison';

console.log('Creating equivalent data across all platforms:\n');

try {
  const btcScript = btcFetcher.createOpReturnScript(comparisonData);
  console.log('Bitcoin:');
  console.log(`  Method: OP_RETURN script`);
  console.log(`  Max size: 80 bytes`);
  console.log(`  Opcode: ${btcScript.opcode}`);
  console.log(`  Current size: ${btcScript.bytes} bytes\n`);

  const ltcScript = ltcFetcher.createOpReturnScript(comparisonData);
  console.log('Litecoin:');
  console.log(`  Method: OP_RETURN script`);
  console.log(`  Max size: 80 bytes`);
  console.log(`  Opcode: ${ltcScript.opcode}`);
  console.log(`  Current size: ${ltcScript.bytes} bytes\n`);

  const ethData = ethFetcher.createEthereumData(comparisonData);
  console.log('Ethereum:');
  console.log(`  Method: Transaction input data`);
  console.log(`  Max size: Unlimited (gas limited)`);
  console.log(`  Field: ${ethData.field}`);
  console.log(`  Current size: ${ethData.bytes} bytes\n`);
} catch (error) {
  console.error(`Error: ${error.message}\n`);
}

// Example 8: Cache Statistics
console.log('Example 8: Cache Information\n');
console.log('-'.repeat(60));

const cacheStats = btcFetcher.getCacheStats();
console.log('Cache statistics:');
console.log(`  Platform: ${cacheStats.platform}`);
console.log(`  Cache size: ${cacheStats.size} entries`);
console.log(`  Timeout: ${cacheStats.timeout / 1000} seconds`);
console.log(`  Cached keys: ${cacheStats.keys.length > 0 ? cacheStats.keys.join(', ') : 'None'}\n`);

console.log('='.repeat(60));
console.log('Examples completed!');
console.log('='.repeat(60));
console.log();
console.log('Note: These examples demonstrate encoding/decoding only.');
console.log('To fetch actual transaction data, use getTransactionData(txHash)');
console.log('with a valid transaction hash from the respective blockchain.\n');
