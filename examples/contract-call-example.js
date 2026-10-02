/**
 * Example: Making eth_call to contract 0xDC6cA15395cE459C1a617721400588c5e7682351
 * 
 * This example demonstrates how to interact with a smart contract using eth_call.
 * The eth_call method allows reading contract state without sending transactions.
 */

const EthCallClient = require('../src/eth-call.js');

// Contract address from the request
const CONTRACT_ADDRESS = '0xDC6cA15395cE459C1a617721400588c5e7682351';

async function demonstrateContractCalls() {
  console.log('='.repeat(70));
  console.log('ETH_CALL Example for Contract');
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('='.repeat(70));
  console.log();

  // Create eth_call client (using default Ethereum mainnet RPC)
  const client = new EthCallClient();
  
  console.log('Client Configuration:');
  console.log('  RPC Endpoint:', client.rpcUrl);
  console.log();

  // ========================================
  // Example 1: Check if it's an ERC-20 Token
  // ========================================
  console.log('Example 1: Checking ERC-20 Token Information');
  console.log('-'.repeat(70));
  try {
    console.log('Querying token info (name, symbol, decimals, totalSupply)...');
    const tokenInfo = await client.getERC20Info(CONTRACT_ADDRESS);
    
    console.log('✓ Contract is an ERC-20 token!');
    console.log();
    console.log('Token Details:');
    console.log('  Name:', tokenInfo.name);
    console.log('  Symbol:', tokenInfo.symbol);
    console.log('  Decimals:', tokenInfo.decimals);
    console.log('  Total Supply:', tokenInfo.totalSupply);
    console.log();
  } catch (error) {
    console.log('Note:', error.message);
    console.log('(This is expected if no network connection or not an ERC-20 token)');
    console.log();
  }

  // ========================================
  // Example 2: Check Balance for an Address
  // ========================================
  console.log('Example 2: Checking Token Balance');
  console.log('-'.repeat(70));
  try {
    // Check balance for kushmanmb.base.eth (as an example)
    const ownerAddress = 'kushmanmb.base.eth';
    console.log(`Querying balance for: ${ownerAddress}`);
    
    const balance = await client.getERC20Balance(CONTRACT_ADDRESS, ownerAddress);
    
    console.log('✓ Balance retrieved!');
    console.log();
    console.log('Balance Details:');
    console.log('  Owner:', balance.owner);
    console.log('  Contract:', balance.contract);
    console.log('  Balance (raw):', balance.balance);
    console.log('  Block:', balance.block);
    console.log();
  } catch (error) {
    console.log('Note:', error.message);
    console.log('(This is expected if no network connection)');
    console.log();
  }

  // ========================================
  // Example 3: Manual eth_call Construction
  // ========================================
  console.log('Example 3: Manual eth_call Construction');
  console.log('-'.repeat(70));
  try {
    // Encode a balanceOf call manually
    const testAddress = '0x1234567890123456789012345678901234567890';
    const encodedData = client.encodeFunctionCall('balanceOf(address)', [testAddress]);
    
    console.log('Encoded function call:');
    console.log('  Function: balanceOf(address)');
    console.log('  Parameter:', testAddress);
    console.log('  Encoded data:', encodedData);
    console.log();
    
    console.log('Making eth_call...');
    const result = await client.call({
      to: CONTRACT_ADDRESS,
      data: encodedData,
      block: 'latest'
    });
    
    const decodedBalance = client.decodeUint256(result);
    console.log('✓ Call successful!');
    console.log('  Raw result:', result);
    console.log('  Decoded balance:', decodedBalance);
    console.log();
  } catch (error) {
    console.log('Note:', error.message);
    console.log('(This is expected if no network connection)');
    console.log();
  }

  // ========================================
  // Example 4: Check Contract Owner
  // ========================================
  console.log('Example 4: Checking Contract Owner');
  console.log('-'.repeat(70));
  try {
    const ownerData = client.encodeFunctionCall('owner()');
    console.log('Encoded owner() call:', ownerData);
    
    const result = await client.call({
      to: CONTRACT_ADDRESS,
      data: ownerData
    });
    
    const owner = client.decodeAddress(result);
    console.log('✓ Owner retrieved!');
    console.log('  Contract owner:', owner);
    console.log();
  } catch (error) {
    console.log('Note:', error.message);
    console.log('(This is expected if contract doesn\'t have owner() method)');
    console.log();
  }

  // ========================================
  // Example 5: Calling FROM a Specific Address
  // ========================================
  console.log('Example 5: Making Calls FROM kushmanmb.base.eth');
  console.log('-'.repeat(70));
  console.log('When making eth_call, you can specify a "from" address.');
  console.log('This is useful for:');
  console.log('  • View functions that check msg.sender permissions');
  console.log('  • Simulating calls from a specific address');
  console.log('  • Testing access control without transactions');
  console.log();
  
  try {
    const data = client.encodeFunctionCall('balanceOf(address)', [
      '0x0000000000000000000000000000000000000000'
    ]);
    
    console.log('Call structure:');
    console.log('  from: kushmanmb.base.eth');
    console.log('  to:', CONTRACT_ADDRESS);
    console.log('  data:', data.substring(0, 20) + '...');
    console.log();
    
    const result = await client.call({
      from: 'kushmanmb.base.eth',  // Calling FROM this address
      to: CONTRACT_ADDRESS,
      data: data
    });
    
    console.log('✓ Call successful!');
    console.log('  Result:', result);
    console.log();
  } catch (error) {
    console.log('Note:', error.message);
    console.log();
  }

  // ========================================
  // Example 6: Batch Calls with Promise.all
  // ========================================
  console.log('Example 6: Efficient Batch Calls');
  console.log('-'.repeat(70));
  console.log('For efficiency, make multiple calls in parallel:');
  console.log();
  
  const batchCalls = [
    { method: 'name()', desc: 'Get token name' },
    { method: 'symbol()', desc: 'Get token symbol' },
    { method: 'decimals()', desc: 'Get token decimals' },
    { method: 'totalSupply()', desc: 'Get total supply' }
  ];
  
  try {
    console.log('Preparing batch calls:');
    batchCalls.forEach(call => {
      console.log(`  • ${call.method} - ${call.desc}`);
    });
    console.log();
    
    const promises = batchCalls.map(({ method }) => 
      client.call({
        to: CONTRACT_ADDRESS,
        data: client.encodeFunctionCall(method)
      })
    );
    
    console.log('Executing all calls in parallel...');
    const results = await Promise.all(promises);
    
    console.log('✓ All calls completed!');
    console.log();
    results.forEach((result, i) => {
      console.log(`  ${batchCalls[i].method}:`, result.substring(0, 20) + '...');
    });
    console.log();
  } catch (error) {
    console.log('Note:', error.message);
    console.log();
  }

  // ========================================
  // Summary
  // ========================================
  console.log('='.repeat(70));
  console.log('Summary');
  console.log('='.repeat(70));
  console.log();
  console.log('The eth-call module provides:');
  console.log('  ✓ Read contract state without gas costs');
  console.log('  ✓ Support for ENS names (e.g., kushmanmb.base.eth)');
  console.log('  ✓ Function call encoding/decoding');
  console.log('  ✓ Convenience methods for ERC-20 and ERC-721');
  console.log('  ✓ Batch operations with Promise.all');
  console.log();
  console.log('To use with real data:');
  console.log('  1. Ensure network connectivity to an RPC endpoint');
  console.log('  2. Use default public nodes or provide your own RPC URL');
  console.log('  3. All operations are read-only (no gas required)');
  console.log();
  console.log('Contract Address Used:', CONTRACT_ADDRESS);
  console.log();
}

// Run the demonstration
if (require.main === module) {
  demonstrateContractCalls().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { CONTRACT_ADDRESS, demonstrateContractCalls };
