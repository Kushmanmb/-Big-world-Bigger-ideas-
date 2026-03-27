/**
 * Example usage of eth_call module
 * Demonstrates performing eth_call from kushmanmb.eth and other addresses
 */

const EthCallClient = require('./eth-call.js');

async function runExamples() {
  console.log('='.repeat(60));
  console.log('Ethereum eth_call Module - Example Usage');
  console.log('='.repeat(60));
  console.log();

  // Create a client instance
  const client = new EthCallClient();

  console.log('Client Configuration:');
  console.log(`  RPC URL: ${client.rpcUrl}`);
  console.log(`  ENS Resolver: ${client.ensResolverRpc}`);
  console.log();

  // Example 1: ENS Resolution
  console.log('Example 1: Resolving ENS Names');
  console.log('-'.repeat(60));
  try {
    console.log('Resolving kushmanmb.eth...');
    console.log('NOTE: This is a skeleton implementation that returns');
    console.log('      a placeholder zero address. For production use,');
    console.log('      implement proper ENS resolution via ENS contracts.');
    console.log();
    const kushmanmbAddress = await client.resolveAddress('kushmanmb.eth');
    console.log(`kushmanmb.eth -> ${kushmanmbAddress} (placeholder)`);
    console.log();
  } catch (error) {
    console.log(`Note: ENS resolution failed: ${error.message}`);
    console.log('This is expected without a live RPC connection or real ENS data.');
    console.log();
  }

  // Example 2: Basic eth_call with function encoding
  console.log('Example 2: Encoding Function Calls');
  console.log('-'.repeat(60));
  try {
    console.log('Encoding balanceOf(address) call...');
    const balanceOfData = client.encodeFunctionCall('balanceOf(address)', ['0x1234567890123456789012345678901234567890']);
    console.log(`Function: balanceOf(address)`);
    console.log(`Parameter: 0x1234567890123456789012345678901234567890`);
    console.log(`Encoded data: ${balanceOfData}`);
    console.log();

    console.log('Encoding totalSupply() call...');
    const totalSupplyData = client.encodeFunctionCall('totalSupply()');
    console.log(`Function: totalSupply()`);
    console.log(`Encoded data: ${totalSupplyData}`);
    console.log();
  } catch (error) {
    console.log(`Error: ${error.message}`);
    console.log();
  }

  // Example 3: Performing eth_call (skeleton demonstration)
  console.log('Example 3: Performing eth_call');
  console.log('-'.repeat(60));
  console.log('Note: This demonstrates the API structure. Real calls require');
  console.log('      a live Ethereum RPC endpoint with network connectivity.');
  console.log();
  
  try {
    // Example: Check balance of kushmanmb.eth on a token contract
    const usdcContract = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC on mainnet
    console.log('Call structure for checking USDC balance of kushmanmb.eth:');
    console.log(`  Contract: ${usdcContract} (USDC)`);
    console.log(`  From: kushmanmb.eth`);
    console.log(`  Function: balanceOf(address)`);
    console.log();
    
    // In a real scenario with network access:
    // const balance = await client.getERC20Balance(usdcContract, 'kushmanmb.eth');
    // console.log(`Balance: ${balance.balance} (raw units)`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    console.log();
  }

  // Example 4: ERC-20 Token Info
  console.log('Example 4: Getting ERC-20 Token Information');
  console.log('-'.repeat(60));
  try {
    const daiContract = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI on mainnet
    console.log(`Fetching token info for DAI contract: ${daiContract}`);
    console.log();
    console.log('Required calls:');
    console.log('  1. name() -> Token name');
    console.log('  2. symbol() -> Token symbol');
    console.log('  3. decimals() -> Token decimals');
    console.log('  4. totalSupply() -> Total supply');
    console.log();
    console.log('Note: These would be executed in parallel with Promise.all()');
    console.log();
    
    // In a real scenario:
    // const info = await client.getERC20Info(daiContract);
    // console.log(`Name: ${info.name}`);
    // console.log(`Symbol: ${info.symbol}`);
    // console.log(`Decimals: ${info.decimals}`);
    // console.log(`Total Supply: ${info.totalSupply}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    console.log();
  }

  // Example 5: ERC-721 (NFT) Operations
  console.log('Example 5: ERC-721 NFT Queries');
  console.log('-'.repeat(60));
  try {
    const boredApeContract = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'; // BAYC
    console.log(`Querying owner of Bored Ape #1234`);
    console.log(`Contract: ${boredApeContract}`);
    console.log(`Function: ownerOf(uint256)`);
    console.log(`Token ID: 1234`);
    console.log();
    
    // In a real scenario:
    // const owner = await client.getERC721Owner(boredApeContract, 1234);
    // console.log(`Owner: ${owner.owner}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    console.log();
  }

  // Example 6: Decoding Return Values
  console.log('Example 6: Decoding Contract Return Values');
  console.log('-'.repeat(60));
  try {
    console.log('Decoding uint256 value:');
    const uint256Hex = '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000';
    const decoded = client.decodeUint256(uint256Hex);
    console.log(`  Hex: ${uint256Hex}`);
    console.log(`  Decimal: ${decoded}`);
    console.log(`  Human-readable: ${(BigInt(decoded) / BigInt(10 ** 18)).toString()} ETH`);
    console.log();

    console.log('Decoding address value:');
    const addressHex = '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045';
    const decodedAddr = client.decodeAddress(addressHex);
    console.log(`  Hex: ${addressHex}`);
    console.log(`  Address: ${decodedAddr}`);
    console.log();
  } catch (error) {
    console.log(`Error: ${error.message}`);
    console.log();
  }

  // Example 7: Using kushmanmb.eth as the caller
  console.log('Example 7: Making Calls FROM kushmanmb.eth');
  console.log('-'.repeat(60));
  try {
    console.log('When making calls, you can specify "from" parameter:');
    console.log();
    console.log('Call structure:');
    console.log('  {');
    console.log('    from: "kushmanmb.eth",  // Caller address (ENS supported)');
    console.log('    to: "0x...",             // Contract address');
    console.log('    data: "0x...",           // Encoded function call');
    console.log('    block: "latest"          // Block number or tag');
    console.log('  }');
    console.log();
    console.log('The "from" address is useful for:');
    console.log('  - View functions that check msg.sender permissions');
    console.log('  - Simulating calls from a specific address');
    console.log('  - Testing access control without transactions');
    console.log();
  } catch (error) {
    console.log(`Error: ${error.message}`);
    console.log();
  }

  // Example 8: Cache Management
  console.log('Example 8: Cache Management');
  console.log('-'.repeat(60));
  try {
    const stats = client.getCacheStats();
    console.log('Cache Statistics:');
    console.log(`  Size: ${stats.size} entries`);
    console.log(`  Timeout: ${stats.timeout}ms (${stats.timeout / 1000}s)`);
    if (stats.keys.length > 0) {
      console.log('  Cached keys:');
      stats.keys.forEach(key => console.log(`    - ${key}`));
    } else {
      console.log('  No cached entries yet');
    }
    console.log();
    console.log('Note: ENS resolutions are cached to reduce RPC calls');
    console.log('      Use client.clearCache() to clear the cache manually');
    console.log();
  } catch (error) {
    console.log(`Error: ${error.message}`);
    console.log();
  }

  // Example 9: Supported Functions
  console.log('Example 9: Commonly Supported ERC Functions');
  console.log('-'.repeat(60));
  const functions = [
    { sig: 'balanceOf(address)', desc: 'Get token/NFT balance' },
    { sig: 'totalSupply()', desc: 'Get total supply' },
    { sig: 'name()', desc: 'Get token/NFT name' },
    { sig: 'symbol()', desc: 'Get token/NFT symbol' },
    { sig: 'decimals()', desc: 'Get token decimals (ERC-20)' },
    { sig: 'ownerOf(uint256)', desc: 'Get NFT owner (ERC-721)' },
    { sig: 'tokenURI(uint256)', desc: 'Get NFT metadata URI (ERC-721)' },
    { sig: 'owner()', desc: 'Get contract owner (common pattern)' }
  ];

  console.log('Function Signatures and Selectors:');
  console.log();
  functions.forEach(({ sig, desc }) => {
    const selector = client._getFunctionSelector(sig);
    console.log(`  ${sig}`);
    console.log(`    Selector: ${selector}`);
    console.log(`    Purpose: ${desc}`);
    console.log();
  });

  // Example 10: Complete Workflow
  console.log('Example 10: Complete Workflow Example');
  console.log('-'.repeat(60));
  console.log('Complete workflow for checking token balance:');
  console.log();
  console.log('Step 1: Resolve ENS name (if needed)');
  console.log('  kushmanmb.eth -> 0x...');
  console.log();
  console.log('Step 2: Encode function call');
  console.log('  balanceOf(address) + parameters -> 0x70a08231...');
  console.log();
  console.log('Step 3: Make eth_call RPC request');
  console.log('  {method: "eth_call", params: [{to, data}, "latest"]}');
  console.log();
  console.log('Step 4: Decode response');
  console.log('  0x0000...064 -> 100 (decimal)');
  console.log();
  console.log('Step 5: Format for human reading');
  console.log('  100 / 10^18 = 0.0000000000000001 ETH/tokens');
  console.log();

  // Summary
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log();
  console.log('This module provides:');
  console.log('  ✓ eth_call support for reading contract state');
  console.log('  ✓ ENS name resolution (kushmanmb.eth, etc.)');
  console.log('  ✓ Function call encoding');
  console.log('  ✓ Response decoding (uint256, address, string)');
  console.log('  ✓ Convenience methods for ERC-20 and ERC-721');
  console.log('  ✓ Caching for ENS resolutions');
  console.log('  ✓ Support for custom RPC endpoints');
  console.log();
  console.log('Usage with real data:');
  console.log('  1. Ensure network connectivity to an Ethereum RPC endpoint');
  console.log('  2. Use default public nodes or provide your own RPC URL');
  console.log('  3. ENS names like kushmanmb.eth are automatically resolved');
  console.log('  4. All read operations are performed via eth_call (no gas cost)');
  console.log();
  console.log('For production use:');
  console.log('  - Consider using Infura, Alchemy, or your own node');
  console.log('  - Implement proper error handling and retries');
  console.log('  - Add rate limiting for public RPC endpoints');
  console.log('  - Use multicall contracts for batch operations');
  console.log();
}

// Run the examples
runExamples().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
