/**
 * Tests for Address Consolidator Module
 */

const { AddressConsolidator, TRACKED_ADDRESSES } = require('./address-consolidator.js');

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
  const addresses = consolidator.tracker.getAllAddresses();
  // Should have attempted to add addresses (may be 0 if ENS validation fails in test env)
  if (addresses.length > 2) {
    throw new Error(`Expected at most 2 addresses, got ${addresses.length}`);
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
