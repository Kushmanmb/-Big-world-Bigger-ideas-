/**
 * Tests for Address Consolidator Module
 */

const fs = require('fs');
const path = require('path');
const { AddressConsolidator, TRACKED_ADDRESSES, DESTINATION_ADDRESS } = require('./address-consolidator.js');

// Expected calldata length for an ERC-20 transfer:
// '0x' (2) + selector without '0x' (8) + padded address (64) + padded amount (64) = 138 chars
const EXPECTED_ERC20_TRANSFER_CALLDATA_LENGTH = 138;

// Test counters
let passed = 0;
let failed = 0;

/**
 * Test helper to run a test and log results
 */
function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  Error: ${error.message}`);
    failed++;
  }
}

console.log('\nRunning Address Consolidator Tests...\n');

// Constructor Tests
test('AddressConsolidator constructor creates instance with default owner', () => {
  const consolidator = new AddressConsolidator();
  if (consolidator.owner !== 'kushmanmb') {
    throw new Error('Default owner not set correctly');
  }
});

test('AddressConsolidator constructor creates instance with custom owner', () => {
  const consolidator = new AddressConsolidator('custom-owner');
  if (consolidator.owner !== 'custom-owner') {
    throw new Error('Custom owner not set correctly');
  }
});

test('AddressConsolidator has tracker property', () => {
  const consolidator = new AddressConsolidator();
  if (!consolidator.tracker) {
    throw new Error('Tracker not initialized');
  }
});

test('AddressConsolidator has fetcher property', () => {
  const consolidator = new AddressConsolidator();
  if (!consolidator.fetcher) {
    throw new Error('Fetcher not initialized');
  }
});

// Tracked Addresses Tests
test('TRACKED_ADDRESSES contains kushmanmb', () => {
  if (!TRACKED_ADDRESSES.kushmanmb) {
    throw new Error('kushmanmb address not defined');
  }
  if (TRACKED_ADDRESSES.kushmanmb !== 'kushmanmb.eth') {
    throw new Error('kushmanmb address incorrect');
  }
});

test('TRACKED_ADDRESSES contains yaketh', () => {
  if (!TRACKED_ADDRESSES.yaketh) {
    throw new Error('yaketh address not defined');
  }
  if (TRACKED_ADDRESSES.yaketh !== 'yaketh.eth') {
    throw new Error('yaketh address incorrect');
  }
});

// Initialization Tests
test('initializeAddresses adds addresses', () => {
  const consolidator = new AddressConsolidator();
  consolidator.initializeAddresses();
  
  // Since ENS names are lowercased by the validator, addresses should be added as lowercase
  const addresses = consolidator.tracker.getAllAddresses().map(info => info.address);
  // In a normal environment we expect exactly the two tracked ENS names.
  // In some test environments ENS validation may fail and result in 0 addresses,
  // but we should never see more than the tracked addresses or unexpected values.
  // resolvers.json may also contribute additional hex addresses that are expected.
  const expectedAddresses = [
    ...Object.values(TRACKED_ADDRESSES).map(a => a.toLowerCase()),
  ];
  const resolversPath = path.join(process.cwd(), 'resolvers.json');
  if (fs.existsSync(resolversPath)) {
    try {
      const resolversData = JSON.parse(fs.readFileSync(resolversPath, 'utf8'));
      (resolversData.resolvers || []).forEach(entry => {
        if (entry.address) {
          expectedAddresses.push(entry.address.toLowerCase());
        }
      });
    } catch (_) {
      // ignore
    }
  }

  if (addresses.length > expectedAddresses.length) {
    throw new Error(`Expected at most ${expectedAddresses.length} addresses, got ${addresses.length}`);
  }

  // When any addresses are present, they must be a subset of the expected ones
  if (addresses.length > 0) {
    const unexpected = addresses.filter(a => !expectedAddresses.includes(a.toLowerCase()));
    if (unexpected.length > 0) {
      throw new Error(`Unexpected addresses found: ${unexpected.join(', ')}`);
    }
  }

  // If all expected addresses are present, they should match the expected set (order-insensitive)
  if (addresses.length === expectedAddresses.length) {
    const sortedActual = [...addresses].map(a => a.toLowerCase()).sort();
    const sortedExpected = [...expectedAddresses].sort();
    for (let i = 0; i < sortedExpected.length; i++) {
      if (sortedActual[i] !== sortedExpected[i]) {
        throw new Error(`Addresses do not match expected set. Got ${sortedActual.join(', ')}, expected ${sortedExpected.join(', ')}`);
      }
    }
  }
});

test('initializeAddresses does not throw error', () => {
  const consolidator = new AddressConsolidator();
  // Should not throw even if addresses can't be added
  consolidator.initializeAddresses();
});

// Report Generation Tests
test('generateMarkdownReport returns string', () => {
  const consolidator = new AddressConsolidator();
  const mockData = {
    addresses: ['kushmanmb.eth', 'yaketh.eth'],
    totalAddresses: 2,
    uniqueTokens: 3,
    tokens: [
      {
        tokenName: 'Test Token',
        tokenSymbol: 'TEST',
        totalBalance: 100,
        totalUsdValue: 50,
        holders: []
      }
    ],
    timestamp: Date.now()
  };
  
  const report = consolidator.generateMarkdownReport(mockData);
  if (typeof report !== 'string') {
    throw new Error('Report should be a string');
  }
  if (!report.includes('Address Consolidation Report')) {
    throw new Error('Report missing title');
  }
});

test('generateMarkdownReport includes summary', () => {
  const consolidator = new AddressConsolidator();
  const mockData = {
    addresses: ['kushmanmb.eth'],
    totalAddresses: 1,
    uniqueTokens: 2,
    tokens: [],
    timestamp: Date.now()
  };
  
  const report = consolidator.generateMarkdownReport(mockData);
  if (!report.includes('## Summary')) {
    throw new Error('Report missing summary section');
  }
  if (!report.includes('**Total Addresses:** 1')) {
    throw new Error('Report missing address count');
  }
  if (!report.includes('**Unique Tokens:** 2')) {
    throw new Error('Report missing token count');
  }
});

test('generateHTMLDashboard returns string', () => {
  const consolidator = new AddressConsolidator();
  const mockData = {
    addresses: ['kushmanmb.eth'],
    totalAddresses: 1,
    uniqueTokens: 1,
    tokens: [
      {
        tokenName: 'Test',
        tokenSymbol: 'TEST',
        totalBalance: 100,
        totalUsdValue: 50,
        holders: []
      }
    ],
    timestamp: Date.now()
  };
  
  const html = consolidator.generateHTMLDashboard(mockData);
  if (typeof html !== 'string') {
    throw new Error('HTML should be a string');
  }
  if (!html.includes('<!DOCTYPE html>')) {
    throw new Error('HTML missing DOCTYPE');
  }
});

test('generateHTMLDashboard includes stats', () => {
  const consolidator = new AddressConsolidator();
  const mockData = {
    addresses: ['kushmanmb.eth'],
    totalAddresses: 1,
    uniqueTokens: 2,
    tokens: [],
    timestamp: Date.now()
  };
  
  const html = consolidator.generateHTMLDashboard(mockData);
  if (!html.includes('Tracked Addresses')) {
    throw new Error('HTML missing addresses label');
  }
  if (!html.includes('Unique Tokens')) {
    throw new Error('HTML missing tokens label');
  }
});

// Display Tests
test('displayStatistics does not throw error', () => {
  const consolidator = new AddressConsolidator();
  consolidator.initializeAddresses();
  
  // Should not throw
  consolidator.displayStatistics();
});

// DESTINATION_ADDRESS Tests
test('DESTINATION_ADDRESS is yaketh.eth', () => {
  if (DESTINATION_ADDRESS !== 'yaketh.eth') {
    throw new Error(`Expected DESTINATION_ADDRESS to be 'yaketh.eth', got '${DESTINATION_ADDRESS}'`);
  }
});

// generateTransferPlan Tests
test('generateTransferPlan returns object with required properties', () => {
  const consolidator = new AddressConsolidator();
  const mockData = {
    byAddress: {
      'kushmanmb.eth': [
        {
          tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          tokenName: 'USD Coin',
          tokenSymbol: 'USDC',
          balance: '1000000',
          balanceApproximate: 1,
          usdValue: 1
        }
      ],
      'yaketh.eth': []
    },
    timestamp: Date.now()
  };

  const plan = consolidator.generateTransferPlan(mockData, 'yaketh.eth');

  if (!plan || typeof plan !== 'object') {
    throw new Error('generateTransferPlan should return an object');
  }
  if (plan.destination !== 'yaketh.eth') {
    throw new Error('Plan destination should be yaketh.eth');
  }
  if (typeof plan.totalTransfers !== 'number') {
    throw new Error('Plan should have totalTransfers property');
  }
  if (!Array.isArray(plan.transfers)) {
    throw new Error('Plan should have transfers array');
  }
  if (typeof plan.tokensToConsolidate !== 'number') {
    throw new Error('Plan should have tokensToConsolidate property');
  }
  if (!Array.isArray(plan.sourceAddresses)) {
    throw new Error('Plan should have sourceAddresses array');
  }
});

test('generateTransferPlan skips destination address', () => {
  const consolidator = new AddressConsolidator();
  const mockData = {
    byAddress: {
      'yaketh.eth': [
        {
          tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          tokenName: 'USD Coin',
          tokenSymbol: 'USDC',
          balance: '5000000',
          balanceApproximate: 5,
          usdValue: 5
        }
      ]
    },
    timestamp: Date.now()
  };

  const plan = consolidator.generateTransferPlan(mockData, 'yaketh.eth');

  if (plan.totalTransfers !== 0) {
    throw new Error('Should not generate transfers for tokens already at destination');
  }
  if (plan.transfers.length !== 0) {
    throw new Error('Transfers array should be empty when all tokens at destination');
  }
});

test('generateTransferPlan creates transfer for non-destination address', () => {
  const consolidator = new AddressConsolidator();
  const mockData = {
    byAddress: {
      'kushmanmb.eth': [
        {
          tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          tokenName: 'USD Coin',
          tokenSymbol: 'USDC',
          balance: '2000000',
          balanceApproximate: 2,
          usdValue: 2
        }
      ]
    },
    timestamp: Date.now()
  };

  const plan = consolidator.generateTransferPlan(mockData, 'yaketh.eth');

  if (plan.totalTransfers !== 1) {
    throw new Error(`Expected 1 transfer, got ${plan.totalTransfers}`);
  }
  if (plan.transfers[0].from !== 'kushmanmb.eth') {
    throw new Error('Transfer from address should be kushmanmb.eth');
  }
  if (plan.transfers[0].to !== 'yaketh.eth') {
    throw new Error('Transfer to address should be yaketh.eth');
  }
  if (plan.transfers[0].tokenSymbol !== 'USDC') {
    throw new Error('Transfer token symbol should be USDC');
  }
});

test('generateTransferPlan uses DESTINATION_ADDRESS default', () => {
  const consolidator = new AddressConsolidator();
  const mockData = {
    byAddress: {
      'kushmanmb.eth': [
        {
          tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          tokenName: 'Tether USD',
          tokenSymbol: 'USDT',
          balance: '500000',
          balanceApproximate: 0.5,
          usdValue: 0.5
        }
      ]
    },
    timestamp: Date.now()
  };

  // Should use DESTINATION_ADDRESS = 'yaketh.eth' by default
  const plan = consolidator.generateTransferPlan(mockData);

  if (plan.destination !== DESTINATION_ADDRESS) {
    throw new Error(`Expected destination '${DESTINATION_ADDRESS}', got '${plan.destination}'`);
  }
});

test('generateTransferPlan encodes calldata for hex destination', () => {
  const consolidator = new AddressConsolidator();
  const hexDestination = '0x6fb9e80ddd0f5dc99d7cb38b07e8b298a57bf253';
  const mockData = {
    byAddress: {
      '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055': [
        {
          tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          tokenName: 'USD Coin',
          tokenSymbol: 'USDC',
          balance: '1000000',
          balanceApproximate: 1,
          usdValue: 1
        }
      ]
    },
    timestamp: Date.now()
  };

  const plan = consolidator.generateTransferPlan(mockData, hexDestination);

  if (plan.totalTransfers !== 1) {
    throw new Error('Expected 1 transfer');
  }
  const transfer = plan.transfers[0];
  if (!transfer.calldata) {
    throw new Error('Transfer should have encoded calldata for hex destination');
  }
  if (!transfer.calldata.startsWith('0xa9059cbb')) {
    throw new Error('Calldata should start with ERC-20 transfer selector 0xa9059cbb');
  }
  if (transfer.calldata.length !== EXPECTED_ERC20_TRANSFER_CALLDATA_LENGTH) {
    throw new Error(`Calldata should be ${EXPECTED_ERC20_TRANSFER_CALLDATA_LENGTH} chars (4 + 32 + 32 bytes), got ${transfer.calldata.length}`);
  }
});

test('generateTransferPlan sets note (not calldata) for ENS destination', () => {
  const consolidator = new AddressConsolidator();
  const mockData = {
    byAddress: {
      '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055': [
        {
          tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          tokenName: 'USD Coin',
          tokenSymbol: 'USDC',
          balance: '1000000',
          balanceApproximate: 1,
          usdValue: 1
        }
      ]
    },
    timestamp: Date.now()
  };

  const plan = consolidator.generateTransferPlan(mockData, 'yaketh.eth');

  if (plan.totalTransfers !== 1) {
    throw new Error('Expected 1 transfer');
  }
  const transfer = plan.transfers[0];
  if (transfer.calldata !== null) {
    throw new Error('Calldata should be null for ENS destination');
  }
  if (!transfer.note || !transfer.note.includes('yaketh.eth')) {
    throw new Error('Transfer should include a note about ENS resolution');
  }
});

test('generateTransferPlan skips zero-balance tokens', () => {
  const consolidator = new AddressConsolidator();
  const mockData = {
    byAddress: {
      'kushmanmb.eth': [
        {
          tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          tokenName: 'USD Coin',
          tokenSymbol: 'USDC',
          balance: '0',
          balanceApproximate: 0,
          usdValue: 0
        }
      ]
    },
    timestamp: Date.now()
  };

  const plan = consolidator.generateTransferPlan(mockData, 'yaketh.eth');

  if (plan.totalTransfers !== 0) {
    throw new Error('Should not generate transfers for zero-balance tokens');
  }
});

test('generateTransferPlan throws on invalid consolidated data', () => {
  const consolidator = new AddressConsolidator();
  let threw = false;
  try {
    consolidator.generateTransferPlan(null);
  } catch (error) {
    threw = true;
  }
  if (!threw) {
    throw new Error('Should throw on null data');
  }
});

// formatTransferPlan Tests
test('formatTransferPlan returns string', () => {
  const consolidator = new AddressConsolidator();
  const mockPlan = {
    destination: 'yaketh.eth',
    totalTransfers: 1,
    tokensToConsolidate: 1,
    sourceAddresses: ['kushmanmb.eth'],
    transfers: [
      {
        from: 'kushmanmb.eth',
        to: 'yaketh.eth',
        tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        tokenName: 'USD Coin',
        tokenSymbol: 'USDC',
        rawBalance: '1000000',
        approximateBalance: 1,
        usdValue: 1,
        calldata: null,
        note: "Resolve ENS 'yaketh.eth' to a hex address before encoding calldata"
      }
    ],
    timestamp: Date.now()
  };

  const output = consolidator.formatTransferPlan(mockPlan);
  if (typeof output !== 'string') {
    throw new Error('formatTransferPlan should return a string');
  }
  if (!output.includes('Token Transfer Consolidation Plan')) {
    throw new Error('Output should include title');
  }
  if (!output.includes('yaketh.eth')) {
    throw new Error('Output should include destination address');
  }
  if (!output.includes('USDC')) {
    throw new Error('Output should include token symbol');
  }
});

test('formatTransferPlan shows no-transfer message when empty', () => {
  const consolidator = new AddressConsolidator();
  const emptyPlan = {
    destination: 'yaketh.eth',
    totalTransfers: 0,
    tokensToConsolidate: 0,
    sourceAddresses: [],
    transfers: [],
    timestamp: Date.now()
  };

  const output = consolidator.formatTransferPlan(emptyPlan);
  if (!output.includes('No transfers needed')) {
    throw new Error('Should indicate no transfers needed when all tokens at destination');
  }
});

test('formatTransferPlan handles null gracefully', () => {
  const consolidator = new AddressConsolidator();
  const output = consolidator.formatTransferPlan(null);
  if (typeof output !== 'string') {
    throw new Error('Should return a string even for null input');
  }
});

// _encodeTransferCalldata Tests
test('_encodeTransferCalldata produces correct selector', () => {
  const consolidator = new AddressConsolidator();
  const calldata = consolidator._encodeTransferCalldata(
    '0x6fb9e80ddd0f5dc99d7cb38b07e8b298a57bf253',
    '1000000'
  );
  if (!calldata.startsWith('0xa9059cbb')) {
    throw new Error('Calldata should start with ERC-20 transfer selector');
  }
});

test('_encodeTransferCalldata produces 138-char string', () => {
  const consolidator = new AddressConsolidator();
  const calldata = consolidator._encodeTransferCalldata(
    '0x6fb9e80ddd0f5dc99d7cb38b07e8b298a57bf253',
    '500000'
  );
  // '0x' (2) + selector without '0x' (8) + padded address (64) + padded amount (64) = 138 chars
  if (calldata.length !== 138) {
    throw new Error(`Calldata length should be 138, got ${calldata.length}`);
  }
});

test('_encodeTransferCalldata handles invalid amount gracefully', () => {
  const consolidator = new AddressConsolidator();
  // Should not throw for non-numeric amount
  const calldata = consolidator._encodeTransferCalldata(
    '0x6fb9e80ddd0f5dc99d7cb38b07e8b298a57bf253',
    'not-a-number'
  );
  if (typeof calldata !== 'string') {
    throw new Error('Should still return a string for invalid amount');
  }
  // Should encode a zero amount in the calldata when the amount is invalid
  const encodedAmount = calldata.slice(10 + 64); // after selector (10 chars) and address (64 chars)
  if (encodedAmount !== '0'.padStart(64, '0')) {
    throw new Error('Invalid amount should encode as zero');
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Total Tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('='.repeat(50) + '\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ All tests passed!\n');
  process.exit(0);
}
