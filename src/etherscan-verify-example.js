/**
 * Etherscan Contract Verification Example
 * Demonstrates how to use the Etherscan verification module
 * 
 * SECURITY NOTE:
 * This is an example file. In production:
 * - Never hardcode API keys
 * - Use environment variables (process.env.ETHERSCAN_API_KEY)
 * - Store sensitive data in secure configuration management
 */

const EtherscanVerifier = require('./etherscan-verify');

async function runExample() {
  console.log('Etherscan Contract Verification Example\n');
  console.log('='.repeat(50));

  // Example 1: Initialize with environment variable
  console.log('\n📦 Example 1: Initialize with Environment Variable');
  console.log('─'.repeat(50));
  const verifier = new EtherscanVerifier();
  console.log('Verifier created, checking configuration...');
  const info = verifier.getAPIInfo();
  console.log('API Base URL:', info.baseUrl);
  console.log('Has API Key:', info.hasApiKey ? 'Yes' : 'No (set ETHERSCAN_API_KEY)');

  // Example 2: Initialize with custom API key and network
  console.log('\n\n🔧 Example 2: Initialize with Custom API Key and Network');
  console.log('─'.repeat(50));
  console.log('For Sepolia testnet:');
  const sepoliaVerifier = new EtherscanVerifier('YOUR_API_KEY', 'api-sepolia.etherscan.io');
  const sepoliaInfo = sepoliaVerifier.getAPIInfo();
  console.log('API Base URL:', sepoliaInfo.baseUrl);
  console.log('Custom API key and network have been configured for this verifier.');

  // Example 3: Validate Ethereum addresses
  console.log('\n\n✅ Example 3: Address Validation');
  console.log('─'.repeat(50));
  try {
    const addr1 = verifier.validateAddress('0x983e3660c0bE01991785F80f266A84B911ab59b0');
    console.log('Valid address with 0x:', addr1);

    const addr2 = verifier.validateAddress('983e3660c0bE01991785F80f266A84B911ab59b0');
    console.log('Valid address without 0x:', addr2);
  } catch (error) {
    console.error('Validation error:', error.message);
  }

  // Example 4: Prepare contract verification parameters
  console.log('\n\n📝 Example 4: Contract Verification Parameters');
  console.log('─'.repeat(50));
  const verificationParams = {
    contractAddress: '0xYourContractAddress',
    sourceCode: `pragma solidity ^0.8.20;

contract MyContract {
    uint256 public value;
    
    constructor(uint256 _initialValue) {
        value = _initialValue;
    }
    
    function setValue(uint256 _value) public {
        value = _value;
    }
}`,
    contractName: 'MyContract',
    compilerVersion: 'v0.8.20+commit.a1b79de6',
    optimizationUsed: 1,
    runs: 200,
    constructorArguments: '0000000000000000000000000000000000000000000000000000000000000064', // ABI-encoded 100
    evmVersion: 'paris',
    licenseType: '3' // MIT License
  };

  console.log('Contract Address:', verificationParams.contractAddress);
  console.log('Contract Name:', verificationParams.contractName);
  console.log('Compiler Version:', verificationParams.compilerVersion);
  console.log('Optimization:', verificationParams.optimizationUsed ? `Enabled (${verificationParams.runs} runs)` : 'Disabled');
  console.log('EVM Version:', verificationParams.evmVersion);
  console.log('License Type:', verificationParams.licenseType);

  // Example 5: Submit contract for verification (requires API key)
  console.log('\n\n🚀 Example 5: Submit Contract for Verification');
  console.log('─'.repeat(50));
  console.log('Note: This requires a valid API key and deployed contract');
  console.log('\nCode example:');
  console.log(`
const result = await verifier.verifyContract({
  contractAddress: '0xYourAddress',
  sourceCode: 'pragma solidity ^0.8.20; contract MyContract { ... }',
  contractName: 'MyContract',
  compilerVersion: 'v0.8.20+commit.a1b79de6',
  optimizationUsed: 1,
  runs: 200,
  constructorArguments: '0000...', // ABI-encoded
  evmVersion: 'paris',
  licenseType: '3' // MIT License
});

console.log('Verification GUID:', result.guid);
console.log('Status:', result.status);
console.log('Message:', result.message);
`);

  // Example 6: Check verification status (requires API key and GUID)
  console.log('\n\n🔍 Example 6: Check Verification Status');
  console.log('─'.repeat(50));
  console.log('Note: This requires a valid API key and verification GUID');
  console.log('\nCode example:');
  console.log(`
const status = await verifier.checkVerificationStatus(result.guid);

console.log('Status:', status.status);
console.log('Message:', status.message);
console.log('Result:', status.result);

// Status responses:
// - "Pending in queue"
// - "Pass - Verified"
// - "Fail - Unable to verify"
// - "Already Verified"
`);

  // Example 7: Common license types
  console.log('\n\n📜 Example 7: Common License Types');
  console.log('─'.repeat(50));
  console.log('1  = No License (None)');
  console.log('2  = The Unlicense');
  console.log('3  = MIT License');
  console.log('4  = GNU GPLv2');
  console.log('5  = GNU GPLv3');
  console.log('6  = GNU LGPLv2.1');
  console.log('7  = GNU LGPLv3');
  console.log('8  = BSD-2-Clause');
  console.log('9  = BSD-3-Clause');
  console.log('10 = MPL-2.0');
  console.log('11 = OSL-3.0');
  console.log('12 = Apache-2.0');
  console.log('13 = GNU AGPLv3');
  console.log('14 = BSL 1.1');

  // Example 8: Common compiler versions
  console.log('\n\n🔨 Example 8: Compiler Version Format');
  console.log('─'.repeat(50));
  console.log('Format: v{version}+commit.{commit_hash}');
  console.log('Examples:');
  console.log('  - v0.8.20+commit.a1b79de6');
  console.log('  - v0.8.19+commit.7dd6d404');
  console.log('  - v0.8.18+commit.87f61d96');
  console.log('\nFind exact versions at: https://etherscan.io/solcversions');

  // Example 9: EVM versions
  console.log('\n\n⚙️  Example 9: EVM Versions');
  console.log('─'.repeat(50));
  console.log('Common EVM versions:');
  console.log('  - default (compiler default)');
  console.log('  - paris (Ethereum mainnet current)');
  console.log('  - london (Ethereum with EIP-1559)');
  console.log('  - berlin');
  console.log('  - istanbul');

  // Example 10: Constructor arguments encoding
  console.log('\n\n🔢 Example 10: Constructor Arguments Encoding');
  console.log('─'.repeat(50));
  console.log('Constructor arguments must be ABI-encoded in hex format.');
  console.log('\nExamples:');
  console.log('  uint256(100):');
  console.log('    0000000000000000000000000000000000000000000000000000000000000064');
  console.log('\n  address(0x1234...5678):');
  console.log('    0000000000000000000000001234567890123456789012345678901234567890');
  console.log('\nUse tools like ethers.js or web3.js to encode arguments:');
  console.log('  ethers.utils.defaultAbiCoder.encode(["uint256"], [100])');

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Example completed!');
  console.log('\nTo verify a real contract:');
  console.log('1. Set ETHERSCAN_API_KEY environment variable');
  console.log('2. Deploy your contract and get its address');
  console.log('3. Use verifyContract() with your parameters');
  console.log('4. Use checkVerificationStatus() to monitor progress');
}

// Run the example
runExample().catch(error => {
async function main() {
  console.log('Etherscan Contract Verification Module Example\n');
  console.log('='.repeat(70));
  
  // SECURITY: In production, use environment variables
  // const apiKey = process.env.ETHERSCAN_API_KEY;
  const apiKey = 'YOUR_ETHERSCAN_API_KEY_HERE';
  
  if (apiKey === 'YOUR_ETHERSCAN_API_KEY_HERE') {
    console.log('\n⚠️  WARNING: Please set your Etherscan API key');
    console.log('Get your API key from: https://etherscan.io/myapikey');
    console.log('\nFor production, use environment variables:');
    console.log('  const apiKey = process.env.ETHERSCAN_API_KEY;\n');
    console.log('This example will demonstrate the API structure without making real calls.\n');
  }

  // Example 1: Create verifier for Ethereum mainnet
  console.log('\n📦 Example 1: Create Verifier Instance');
  console.log('-'.repeat(70));
  try {
    const verifier = new EtherscanVerifier(apiKey || 'demo-key', 1);
    console.log('✓ Created Etherscan verifier for Ethereum mainnet');
    console.log('  API URL:', verifier.apiBaseUrl);
    console.log('  Chain ID:', verifier.chainId);
    console.log('  Has API Key:', verifier.getAPIInfo().hasApiKey);
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Example 2: Create verifier for different networks
  console.log('\n🌐 Example 2: Multi-Chain Support');
  console.log('-'.repeat(70));
  try {
    const networks = [
      { name: 'Ethereum Mainnet', chainId: 1 },
      { name: 'Base', chainId: 8453 },
      { name: 'Polygon', chainId: 137 },
      { name: 'Optimism', chainId: 10 },
      { name: 'Arbitrum One', chainId: 42161 }
    ];

    for (const network of networks) {
      const verifier = new EtherscanVerifier(apiKey || 'demo-key', network.chainId);
      console.log(`✓ ${network.name} (Chain ${network.chainId}): ${verifier.apiBaseUrl}`);
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Example 3: Address validation
  console.log('\n🔍 Example 3: Address Validation');
  console.log('-'.repeat(70));
  try {
    const verifier = new EtherscanVerifier(apiKey || 'demo-key');
    
    // Valid addresses
    const addresses = [
      '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      'BC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
    ];

    for (const addr of addresses) {
      const validated = verifier.validateAddress(addr);
      console.log(`✓ Valid: ${addr}`);
      console.log(`  Normalized: ${validated}`);
    }

    // Invalid address example
    try {
      verifier.validateAddress('invalid');
    } catch (error) {
      console.log('✓ Correctly rejected invalid address');
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Example 4: Compiler version validation
  console.log('\n🔨 Example 4: Compiler Version Validation');
  console.log('-'.repeat(70));
  try {
    const verifier = new EtherscanVerifier(apiKey || 'demo-key');
    
    const versions = [
      'v0.8.0+commit.c7dfd78e',
      'v0.8.19+commit.7dd6d404',
      'v0.7.6'
    ];

    for (const version of versions) {
      const validated = verifier.validateCompilerVersion(version);
      console.log(`✓ Valid compiler version: ${validated}`);
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  // Example 5: Contract verification structure
  console.log('\n📝 Example 5: Contract Verification Structure');
  console.log('-'.repeat(70));
  console.log('To verify a contract, you would call:');
  console.log(`
const result = await verifier.verifyContract({
  contractAddress: '0xYourContractAddress',
  sourceCode: 'pragma solidity ^0.8.0; contract MyContract { ... }',
  contractName: 'MyContract',
  compilerVersion: 'v0.8.19+commit.7dd6d404',
  optimizationUsed: 1,      // 0 or 1
  runs: 200,                 // Number of optimization runs
  constructorArguments: '',  // ABI-encoded constructor args
  evmVersion: 'paris',       // EVM version
  licenseType: '3'          // 1=No License, 3=MIT, etc.
});

// Returns:
// {
//   status: 'submitted',
//   message: 'Source code submitted for verification',
//   guid: 'unique-guid-for-status-check',
//   contractAddress: '0x...',
//   timestamp: 1234567890
// }
  `);

  // Example 6: Check verification status
  console.log('\n📊 Example 6: Check Verification Status');
  console.log('-'.repeat(70));
  console.log('After submitting for verification, check status:');
  console.log(`
const status = await verifier.checkVerificationStatus('your-guid-from-verification');

// Returns:
// {
//   guid: 'your-guid',
//   status: 'verified' or 'pending',
//   result: 'Pass - Verified' or error message,
//   message: '...',
//   timestamp: 1234567890
// }
  `);

  // Example 7: Get verified source code
  console.log('\n📄 Example 7: Get Verified Source Code');
  console.log('-'.repeat(70));
  console.log('Retrieve source code from a verified contract:');
  console.log(`
const sourceCode = await verifier.getSourceCode('0xContractAddress');

// Returns comprehensive contract information:
// {
//   contractAddress: '0x...',
//   sourceCode: 'pragma solidity ...',
//   abi: '[...]',
//   contractName: 'MyContract',
//   compilerVersion: 'v0.8.19',
//   optimizationUsed: '1',
//   runs: '200',
//   verified: true,
//   ...
// }
  `);

  // Example 8: Get contract ABI
  console.log('\n📋 Example 8: Get Contract ABI');
  console.log('-'.repeat(70));
  console.log('Get just the ABI of a verified contract:');
  console.log(`
const abiData = await verifier.getContractABI('0xContractAddress');

// Returns:
// {
//   contractAddress: '0x...',
//   abi: [...], // Parsed JSON array
//   status: 'success',
//   timestamp: 1234567890
// }
  `);

  // Example 9: Get contract creation info
  console.log('\n🏗️ Example 9: Get Contract Creation Info');
  console.log('-'.repeat(70));
  console.log('Find out who deployed a contract and when:');
  console.log(`
const creation = await verifier.getContractCreation('0xContractAddress');

// Returns:
// {
//   contractAddress: '0x...',
//   contractCreator: '0x...',
//   txHash: '0x...',
//   timestamp: 1234567890
// }
  `);

  // Example 10: Security best practices
  console.log('\n🔒 Example 10: Security Best Practices');
  console.log('-'.repeat(70));
  console.log(`
SECURITY CHECKLIST:

✓ API Key Management:
  - Never commit API keys to version control
  - Use environment variables: process.env.ETHERSCAN_API_KEY
  - Rotate keys regularly
  - Use different keys for dev/prod

✓ Source Code:
  - Review code before verification
  - Ensure no sensitive data in comments
  - Verify compiler settings match deployment
  - Test on testnets first

✓ Input Validation:
  - All inputs are automatically validated
  - Addresses are normalized and checked
  - Source code size limits enforced
  - Compiler versions validated

✓ Network Configuration:
  - Verify correct chain ID
  - Use correct API endpoint
  - Check network before verification

✓ Error Handling:
  - Always use try-catch blocks
  - Log errors appropriately
  - Don't expose sensitive data in errors
  `);

  // Example 11: Complete workflow
  console.log('\n🔄 Example 11: Complete Verification Workflow');
  console.log('-'.repeat(70));
  console.log(`
// Step 1: Deploy your contract
// (done separately with your deployment tool)

// Step 2: Prepare verification
const verifier = new EtherscanVerifier(process.env.ETHERSCAN_API_KEY, 1);

// Step 3: Submit for verification
try {
  const verification = await verifier.verifyContract({
    contractAddress: deployedAddress,
    sourceCode: fs.readFileSync('./MyContract.sol', 'utf8'),
    contractName: 'MyContract',
    compilerVersion: 'v0.8.19+commit.7dd6d404',
    optimizationUsed: 1,
    runs: 200,
    constructorArguments: encodedConstructorArgs,
    evmVersion: 'paris',
    licenseType: '3'
  });
  
  console.log('Submitted for verification');
  console.log('GUID:', verification.guid);
  
  // Step 4: Wait and check status (poll every 5 seconds)
  let attempts = 0;
  let verified = false;
  
  while (attempts < 12 && !verified) { // Max 1 minute
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const status = await verifier.checkVerificationStatus(verification.guid);
    console.log('Status:', status.status);
    
    if (status.status === 'verified') {
      console.log('✓ Contract verified successfully!');
      verified = true;
    }
    
    attempts++;
  }
  
  // Step 5: Retrieve verified source
  if (verified) {
    const sourceCode = await verifier.getSourceCode(deployedAddress);
    console.log('Contract name:', sourceCode.contractName);
    console.log('Verified:', sourceCode.verified);
  }
  
} catch (error) {
  console.error('Verification failed:', error.message);
}
  `);

  // Example 12: Cache management
  console.log('\n💾 Example 12: Cache Management');
  console.log('-'.repeat(70));
  try {
    const verifier = new EtherscanVerifier(apiKey || 'demo-key');
    
    const stats = verifier.getCacheStats();
    console.log('Cache statistics:');
    console.log('  Size:', stats.size);
    console.log('  Timeout:', stats.timeout, 'ms');
    console.log('  Keys:', stats.keys.length);
    
    console.log('\nTo clear cache: verifier.clearCache()');
  } catch (error) {
    console.log('✗ Error:', error.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('Example completed! Review the output above for usage patterns.\n');
}

// Run the example
main().catch(error => {
  console.error('Example failed:', error);
  process.exit(1);
});
