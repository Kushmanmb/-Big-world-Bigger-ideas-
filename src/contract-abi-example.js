/**
 * Contract ABI Fetcher Example
 * Demonstrates fetching contract ABIs from Etherscan API
 */

const ContractABIFetcher = require('./contract-abi');

console.log('🔍 Contract ABI Fetcher - Example Usage\n');
console.log('='.repeat(60));

// Example 1: Basic usage
async function basicExample() {
  console.log('\n📋 Example 1: Basic Usage');
  console.log('-'.repeat(60));
  
  // SECURITY: Never commit real API keys to version control.
  // Use environment variables in production: process.env.ETHERSCAN_API_KEY
  // Get your free API key from: https://etherscan.io/apis
  const apiKey = process.env.ETHERSCAN_API_KEY || 'YOUR_API_KEY_HERE';
  const chainId = 1; // Ethereum Mainnet
  const contractAddress = '0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43';
  
  // SECURITY: Never log API keys or sensitive credentials
  console.log(`API Key: ${apiKey === 'YOUR_API_KEY_HERE' ? 'YOUR_API_KEY_HERE' : '***REDACTED***'}`);
  console.log(`Chain ID: ${chainId} (Ethereum Mainnet)`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log('\nCreating fetcher instance...');
  
  const fetcher = new ContractABIFetcher(apiKey, chainId);
  
  console.log('✅ Fetcher created successfully');
  console.log('\nAPI Info:', fetcher.getAPIInfo());
}

// Example 2: Fetching ABI (requires real API call)
async function fetchABIExample() {
  console.log('\n\n📋 Example 2: Fetching Contract ABI');
  console.log('-'.repeat(60));
  
  // SECURITY: Never commit real API keys to version control.
  // Use environment variables in production: process.env.ETHERSCAN_API_KEY
  // Get your free API key from: https://etherscan.io/apis
  const apiKey = process.env.ETHERSCAN_API_KEY || 'YOUR_API_KEY_HERE';
  const contractAddress = '0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43';
  
  const fetcher = new ContractABIFetcher(apiKey, 1);
  
  console.log('Fetching ABI from Etherscan API...');
  console.log(`Contract: ${contractAddress}`);
  
  try {
    const result = await fetcher.getContractABI(contractAddress);
    
    console.log('\n✅ ABI fetched successfully!');
    console.log(`Address: ${result.address}`);
    console.log(`Chain ID: ${result.chainId}`);
    console.log(`Status: ${result.status}`);
    console.log(`Message: ${result.message}`);
    console.log(`ABI Functions: ${result.abi.filter(item => item.type === 'function').length}`);
    console.log(`ABI Events: ${result.abi.filter(item => item.type === 'event').length}`);
    console.log(`Timestamp: ${new Date(result.timestamp).toISOString()}`);
    
    // Extract and display function signatures
    console.log('\n📝 Function Signatures:');
    const functions = ContractABIFetcher.extractFunctionSignatures(result.abi);
    functions.slice(0, 5).forEach((func, index) => {
      console.log(`  ${index + 1}. ${func.signature} [${func.stateMutability}]`);
    });
    if (functions.length > 5) {
      console.log(`  ... and ${functions.length - 5} more functions`);
    }
    
    // Extract and display event signatures
    console.log('\n🔔 Event Signatures:');
    const events = ContractABIFetcher.extractEventSignatures(result.abi);
    events.slice(0, 5).forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.signature}`);
    });
    if (events.length > 5) {
      console.log(`  ... and ${events.length - 5} more events`);
    }
    
  } catch (error) {
    console.error('\n❌ Error fetching ABI:', error.message);
    console.log('\nNote: This example requires a valid Etherscan API key and network connection.');
  }
}

// Example 3: Address validation
async function addressValidationExample() {
  console.log('\n\n📋 Example 3: Address Validation');
  console.log('-'.repeat(60));
  
  const fetcher = new ContractABIFetcher();
  
  const testAddresses = [
    { address: '0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43', valid: true },
    { address: 'a9d1e08c7793af67e9d92fe308d5697fb81d3e43', valid: true },
    { address: '0x123', valid: false },
    { address: 'not-an-address', valid: false },
    { address: '', valid: false }
  ];
  
  console.log('Testing address validation:\n');
  
  testAddresses.forEach(test => {
    try {
      const validated = fetcher.validateAddress(test.address);
      console.log(`✅ "${test.address}" → ${validated}`);
    } catch (error) {
      console.log(`❌ "${test.address}" → ${error.message}`);
    }
  });
}

// Example 4: Working with mock ABI
async function mockABIExample() {
  console.log('\n\n📋 Example 4: Extracting Signatures from Mock ABI');
  console.log('-'.repeat(60));
  
  const mockABI = [
    {
      type: 'function',
      name: 'balanceOf',
      inputs: [{ name: 'owner', type: 'address' }],
      outputs: [{ name: 'balance', type: 'uint256' }],
      stateMutability: 'view'
    },
    {
      type: 'function',
      name: 'transfer',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: 'success', type: 'bool' }],
      stateMutability: 'nonpayable'
    },
    {
      type: 'event',
      name: 'Transfer',
      inputs: [
        { name: 'from', type: 'address', indexed: true },
        { name: 'to', type: 'address', indexed: true },
        { name: 'value', type: 'uint256', indexed: false }
      ]
    }
  ];
  
  console.log('Mock ABI with 2 functions and 1 event\n');
  
  const functions = ContractABIFetcher.extractFunctionSignatures(mockABI);
  console.log('Function Signatures:');
  functions.forEach((func, index) => {
    console.log(`  ${index + 1}. ${func.signature} [${func.stateMutability}]`);
  });
  
  const events = ContractABIFetcher.extractEventSignatures(mockABI);
  console.log('\nEvent Signatures:');
  events.forEach((event, index) => {
    console.log(`  ${index + 1}. ${event.signature}`);
  });
}

// Example 5: Cache demonstration
async function cacheExample() {
  console.log('\n\n📋 Example 5: Cache Management');
  console.log('-'.repeat(60));
  
  const fetcher = new ContractABIFetcher('test-key', 1);
  
  console.log('Initial cache size:', fetcher.cache.size);
  
  // Manually add some cache entries for demonstration
  fetcher.cache.set('abi_1_0xabc', { data: 'cached abi 1' });
  fetcher.cache.set('abi_1_0xdef', { data: 'cached abi 2' });
  
  console.log('Cache size after adding entries:', fetcher.cache.size);
  
  fetcher.clearCache();
  console.log('Cache size after clearing:', fetcher.cache.size);
  console.log('✅ Cache cleared successfully');
}

// Example 6: Multi-network support (Goerli testnet)
async function multiNetworkExample() {
  console.log('\n\n📋 Example 6: Multi-Network Support (Testnets)');
  console.log('-'.repeat(60));
  
  const networks = [
    { chainId: 1, name: 'Ethereum Mainnet' },
    { chainId: 5, name: 'Goerli Testnet' },
    { chainId: 11155111, name: 'Sepolia Testnet' },
    { chainId: 8453, name: 'Base Mainnet' },
    { chainId: 84531, name: 'Base Goerli' },
    { chainId: 137, name: 'Polygon Mainnet' },
    { chainId: 42161, name: 'Arbitrum One' }
  ];
  
  console.log('Demonstrating automatic API endpoint selection:\n');
  
  networks.forEach(network => {
    const fetcher = new ContractABIFetcher('test-key', network.chainId);
    const info = fetcher.getAPIInfo();
    console.log(`${network.name.padEnd(20)} (${network.chainId.toString().padStart(8)}): ${info.baseUrl}`);
  });
  
  console.log('\n✅ API endpoints are automatically selected based on chain ID');
}

// Run all examples
async function runAllExamples() {
  try {
    await basicExample();
    await addressValidationExample();
    await mockABIExample();
    await cacheExample();
    await multiNetworkExample();
    await fetchABIExample();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All examples completed!');
    console.log('\nNote: The actual API call (Example 2) requires:');
    console.log('  1. A valid Etherscan API key');
    console.log('  2. Network connectivity');
    console.log('  3. The contract to exist on the specified chain');
    console.log('\nFor testing purposes, examples 1, 3, 4, 5, and 6 demonstrate');
    console.log('the functionality without requiring an API call.');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Error running examples:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runAllExamples();
}

module.exports = { runAllExamples };
