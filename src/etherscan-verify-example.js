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
