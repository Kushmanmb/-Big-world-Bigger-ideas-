/**
 * Token History Tests
 * Test suite for Token Ownership History tracking functionality
 */

const { TokenHistoryTracker, OwnershipEvent } = require('./token-history');
const { test: helperTest, printSummary, getResults } = require('./test-helpers');

// Custom assert for this test file
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

function test(description, fn) {
  console.log(`\n🧪 ${description}`);
  helperTest(description, fn);
}

console.log('🔍 Token Ownership History - Test Suite\n');
console.log('='.repeat(70));

// Test 1: OwnershipEvent creation
test('OwnershipEvent - Create event', () => {
  const event = new OwnershipEvent(
    '123',
    '0x0000000000000000000000000000000000000000',
    '0x1234567890123456789012345678901234567890',
    1609459200,
    '0xabc123',
    11565019
  );
  
  assert(event.tokenId === '123', 'Token ID is set correctly');
  assert(event.from === '0x0000000000000000000000000000000000000000', 'From address is set correctly');
  assert(event.to === '0x1234567890123456789012345678901234567890', 'To address is set correctly');
  assert(event.timestamp === 1609459200, 'Timestamp is set correctly');
  assert(event.id.length === 16, 'Event ID is generated with correct length');
});

// Test 2: OwnershipEvent git log format
test('OwnershipEvent - Git log format', () => {
  const event = new OwnershipEvent(
    '456',
    '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    1609459200,
    '0xdef456',
    12345678
  );
  
  const gitLog = event.toGitLog();
  assert(gitLog.includes('commit'), 'Git log includes commit');
  assert(gitLog.includes('Author:'), 'Git log includes author');
  assert(gitLog.includes('Date:'), 'Git log includes date');
  assert(gitLog.includes('token #456'), 'Git log includes token ID');
});

// Test 3: OwnershipEvent short log format
test('OwnershipEvent - Short log format', () => {
  const event = new OwnershipEvent(
    '789',
    '0xcccccccccccccccccccccccccccccccccccccccc',
    '0xdddddddddddddddddddddddddddddddddddddddd',
    1609459200,
    '0x123abc',
    98765432
  );
  
  const shortLog = event.toShortLog();
  assert(shortLog.includes('Token #789'), 'Short log includes token ID');
  assert(shortLog.includes('→'), 'Short log includes arrow symbol');
});

// Test 4: TokenHistoryTracker creation
test('TokenHistoryTracker - Create tracker', () => {
  const tracker = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  assert(tracker.contractAddress === '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', 'Contract address is normalized');
  assert(tracker.owner === 'kushmanmb', 'Owner is set correctly');
  assert(tracker.history.length === 0, 'History starts empty');
  assert(tracker.tokenOwners.size === 0, 'Token owners map starts empty');
});

// Test 5: Record transfer
test('TokenHistoryTracker - Record transfer', () => {
  const tracker = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  const event = tracker.recordTransfer(
    '100',
    '0x0000000000000000000000000000000000000000',
    '0x1234567890123456789012345678901234567890',
    1609459200,
    '0xabc123',
    11565019
  );
  
  assert(tracker.history.length === 1, 'Transfer is recorded in history');
  assert(event instanceof OwnershipEvent, 'Returns an OwnershipEvent');
  assert(tracker.tokenOwners.get('100') === '0x1234567890123456789012345678901234567890', 'Token owner is tracked');
});

// Test 6: Get token history
test('TokenHistoryTracker - Get token history', () => {
  const tracker = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  tracker.recordTransfer('200', '0xaaaa', '0xbbbb', 1609459200, '0x123', 11565019);
  tracker.recordTransfer('200', '0xbbbb', '0xcccc', 1609459300, '0x456', 11565020);
  tracker.recordTransfer('300', '0xdddd', '0xeeee', 1609459400, '0x789', 11565021);
  
  const token200History = tracker.getTokenHistory('200');
  assert(token200History.length === 2, 'Token 200 has 2 events');
  
  const token300History = tracker.getTokenHistory('300');
  assert(token300History.length === 1, 'Token 300 has 1 event');
});

// Test 7: Get tokens by owner
test('TokenHistoryTracker - Get tokens by owner', () => {
  const tracker = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  const ownerAddress = '0x1111111111111111111111111111111111111111';
  tracker.recordTransfer('400', '0xaaaa', ownerAddress, 1609459200, '0x123', 11565019);
  tracker.recordTransfer('500', '0xbbbb', ownerAddress, 1609459300, '0x456', 11565020);
  tracker.recordTransfer('600', '0xcccc', '0xdddd', 1609459400, '0x789', 11565021);
  
  const ownedTokens = tracker.getTokensByOwner(ownerAddress);
  assert(ownedTokens.length === 2, 'Owner has 2 tokens');
  assert(ownedTokens.includes('400'), 'Includes token 400');
  assert(ownedTokens.includes('500'), 'Includes token 500');
});

// Test 8: Get current owner
test('TokenHistoryTracker - Get current owner', () => {
  const tracker = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  tracker.recordTransfer('700', '0xaaaa', '0xbbbb', 1609459200, '0x123', 11565019);
  tracker.recordTransfer('700', '0xbbbb', '0xcccc', 1609459300, '0x456', 11565020);
  
  const currentOwner = tracker.getCurrentOwner('700');
  assert(currentOwner === '0x000000000000000000000000000000000000cccc', 'Current owner is the last recipient');
});

// Test 9: Get history for owner
test('TokenHistoryTracker - Get history for owner', () => {
  const tracker = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  const address = '0x1234567890123456789012345678901234567890';
  tracker.recordTransfer('800', '0xaaaa', address, 1609459200, '0x123', 11565019);
  tracker.recordTransfer('900', address, '0xbbbb', 1609459300, '0x456', 11565020);
  tracker.recordTransfer('1000', '0xcccc', '0xdddd', 1609459400, '0x789', 11565021);
  
  const ownerHistory = tracker.getHistoryForOwner(address);
  assert(ownerHistory.length === 2, 'Owner involved in 2 transfers');
});

// Test 10: Statistics
test('TokenHistoryTracker - Statistics', () => {
  const tracker = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  tracker.recordTransfer('1100', '0xaaaa', '0xbbbb', 1609459200, '0x123', 11565019);
  tracker.recordTransfer('1200', '0xcccc', '0xdddd', 1609459300, '0x456', 11565020);
  tracker.recordTransfer('1100', '0xbbbb', '0xeeee', 1609459400, '0x789', 11565021);
  
  const stats = tracker.getStatistics();
  assert(stats.totalTransfers === 3, 'Total transfers is 3');
  assert(stats.uniqueTokens === 2, 'Unique tokens is 2');
  assert(stats.uniqueAddresses === 5, 'Unique addresses is 5');
  assert(stats.currentOwners === 2, 'Current owners is 2');
});

// Test 11: JSON export/import
test('TokenHistoryTracker - JSON export and import', () => {
  const tracker1 = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  tracker1.recordTransfer('1300', '0xaaaa', '0xbbbb', 1609459200, '0x123', 11565019);
  tracker1.recordTransfer('1400', '0xcccc', '0xdddd', 1609459300, '0x456', 11565020);
  
  const jsonData = tracker1.toJSON();
  assert(typeof jsonData === 'object', 'JSON export returns object');
  assert(jsonData.history.length === 2, 'Exported history has 2 events');
  
  const tracker2 = new TokenHistoryTracker('0x0000', 'test');
  tracker2.fromJSON(jsonData);
  assert(tracker2.history.length === 2, 'Imported history has 2 events');
  assert(tracker2.owner === 'kushmanmb', 'Owner is imported correctly');
  assert(tracker2.contractAddress === '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', 'Contract address is imported correctly');
});

// Test 12: Address validation
test('TokenHistoryTracker - Address validation', () => {
  const tracker = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  try {
    tracker.recordTransfer('1500', 'invalid', '0xbbbb', 1609459200, '0x123', 11565019);
    assert(false, 'Should throw error for invalid address');
  } catch (error) {
    assert(error.message.includes('Invalid Ethereum address'), 'Throws error for invalid address');
  }
});

// Test 13: Git log output
test('TokenHistoryTracker - Git log output', () => {
  const tracker = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  tracker.recordTransfer('1600', '0xaaaa', '0xbbbb', 1609459200, '0x123', 11565019);
  tracker.recordTransfer('1700', '0xcccc', '0xdddd', 1609459300, '0x456', 11565020);
  
  const gitLog = tracker.toGitLog();
  assert(typeof gitLog === 'string', 'Git log returns string');
  assert(gitLog.includes('commit'), 'Git log contains commit keyword');
  assert(gitLog.includes('Author:'), 'Git log contains Author');
});

// Test 14: Short log output
test('TokenHistoryTracker - Short log output', () => {
  const tracker = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  tracker.recordTransfer('1800', '0xaaaa', '0xbbbb', 1609459200, '0x123', 11565019);
  tracker.recordTransfer('1900', '0xcccc', '0xdddd', 1609459300, '0x456', 11565020);
  
  const shortLog = tracker.toShortLog();
  assert(typeof shortLog === 'string', 'Short log returns string');
  assert(shortLog.includes('Token #1800'), 'Short log contains token info');
  assert(shortLog.includes('→'), 'Short log contains arrow');
});

// Test 15: Limited log output
test('TokenHistoryTracker - Limited log output', () => {
  const tracker = new TokenHistoryTracker(
    '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    'kushmanmb'
  );
  
  tracker.recordTransfer('2000', '0xaaaa', '0xbbbb', 1609459200, '0x123', 11565019);
  tracker.recordTransfer('2100', '0xcccc', '0xdddd', 1609459300, '0x456', 11565020);
  tracker.recordTransfer('2200', '0xeeee', '0xffff', 1609459400, '0x789', 11565021);
  
  const gitLog = tracker.toGitLog(2);
  const logLines = gitLog.split('\n').filter(line => line.includes('commit'));
  assert(logLines.length === 2, 'Limited git log returns only 2 commits');
});

// Summary
const results = getResults();
console.log('\n' + '='.repeat(70));
console.log('\n📊 Test Summary:');
console.log(`   Passed: ${results.passed}`);
console.log(`   Failed: ${results.failed}`);
console.log(`   Total:  ${results.total}`);

if (results.failed === 0) {
  console.log('\n✨ All tests passed!\n');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed.\n');
  process.exit(1);
}
