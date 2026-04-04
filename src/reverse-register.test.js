/**
 * Reverse Register Tests
 * Test suite for the git-style blockchain asset register with reverse traversal
 */

const { ReverseRegister, RegisterEntry } = require('./reverse-register');
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

console.log('🔍 Reverse Register - Test Suite\n');
console.log('='.repeat(70));

// Test 1: RegisterEntry creation
test('RegisterEntry - Create entry', () => {
  const entry = new RegisterEntry(
    'kushmanmb.eth',
    '0x1234567890123456789012345678901234567890',
    '0x1234567890123456789012345678901234567890',
    1609459200,
    '0xabc123',
    11565019,
    { type: 'ENS' }
  );

  assert(entry.key === 'kushmanmb.eth', 'Key is set correctly');
  assert(entry.value === '0x1234567890123456789012345678901234567890', 'Value is set correctly');
  assert(entry.registrant === '0x1234567890123456789012345678901234567890', 'Registrant is set correctly');
  assert(entry.timestamp === 1609459200, 'Timestamp is set correctly');
  assert(entry.metadata.type === 'ENS', 'Metadata is set correctly');
  assert(entry.id.length === 16, 'Entry ID is generated with correct length');
});

// Test 2: RegisterEntry git log format
test('RegisterEntry - Git log format', () => {
  const entry = new RegisterEntry(
    'token-123',
    '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    1609459200,
    '0xdef456',
    12345678
  );

  const gitLog = entry.toGitLog();
  assert(gitLog.includes('commit'), 'Git log includes commit');
  assert(gitLog.includes('Author:'), 'Git log includes author');
  assert(gitLog.includes('Date:'), 'Git log includes date');
  assert(gitLog.includes('"token-123"'), 'Git log includes key');
});

// Test 3: RegisterEntry short log format
test('RegisterEntry - Short log format', () => {
  const entry = new RegisterEntry(
    'asset-456',
    '0xcccccccccccccccccccccccccccccccccccccccc',
    '0xdddddddddddddddddddddddddddddddddddddddd',
    1609459200,
    '0x123abc',
    98765432
  );

  const shortLog = entry.toShortLog();
  assert(shortLog.includes('"asset-456"'), 'Short log includes key');
  assert(shortLog.includes('→'), 'Short log includes arrow symbol');
});

// Test 4: ReverseRegister creation
test('ReverseRegister - Create register', () => {
  const reg = new ReverseRegister('ENS Registry', 'kushmanmb');

  assert(reg.name === 'ENS Registry', 'Name is set correctly');
  assert(reg.owner === 'kushmanmb', 'Owner is set correctly');
  assert(reg.entries.length === 0, 'Entries start empty');
  assert(reg._registry.size === 0, 'Register map starts empty');
});

// Test 5: ReverseRegister invalid name
test('ReverseRegister - Invalid name throws error', () => {
  try {
    new ReverseRegister('');
    assert(false, 'Should throw error for empty name');
  } catch (error) {
    assert(error.message.includes('non-empty string'), 'Throws error for empty name');
  }
});

// Test 6: Register an entry
test('ReverseRegister - Register entry', () => {
  const reg = new ReverseRegister('Test Registry', 'kushmanmb');

  const entry = reg.register(
    'kushmanmb.eth',
    '0x1234567890123456789012345678901234567890',
    '0x1234567890123456789012345678901234567890',
    1609459200,
    '0xabc123',
    11565019
  );

  assert(reg.entries.length === 1, 'Entry is added to entries list');
  assert(entry instanceof RegisterEntry, 'Returns a RegisterEntry');
  assert(reg._registry.get('kushmanmb.eth') === '0x1234567890123456789012345678901234567890', 'Key maps to value');
});

// Test 7: Register invalid key throws error
test('ReverseRegister - Invalid key throws error', () => {
  const reg = new ReverseRegister('Test Registry');

  try {
    reg.register('', '0xbbbb', '0xaaaa', 1609459200, '0x123', 11565019);
    assert(false, 'Should throw error for empty key');
  } catch (error) {
    assert(error.message.includes('Key must be'), 'Throws error for empty key');
  }
});

// Test 8: Register invalid address throws error
test('ReverseRegister - Invalid registrant address throws error', () => {
  const reg = new ReverseRegister('Test Registry');

  try {
    reg.register('mykey', 'myvalue', 'not-an-address', 1609459200, '0x123', 11565019);
    assert(false, 'Should throw error for invalid address');
  } catch (error) {
    assert(error.message.includes('Invalid Ethereum address'), 'Throws error for invalid address');
  }
});

// Test 9: Lookup current value
test('ReverseRegister - Lookup current value', () => {
  const reg = new ReverseRegister('Test Registry');

  reg.register('mykey', 'first-value', '0xaaaa', 1609459200, '0x111', 100);
  reg.register('mykey', 'second-value', '0xaaaa', 1609459300, '0x222', 101);

  const current = reg.lookup('mykey');
  assert(current === 'second-value', 'Lookup returns latest registered value');

  const missing = reg.lookup('nonexistent');
  assert(missing === null, 'Lookup returns null for missing key');
});

// Test 10: Get history for a key
test('ReverseRegister - Get history for key', () => {
  const reg = new ReverseRegister('Test Registry');

  reg.register('key-a', 'v1', '0xaaaa', 1609459200, '0x111', 100);
  reg.register('key-a', 'v2', '0xbbbb', 1609459300, '0x222', 101);
  reg.register('key-b', 'v1', '0xcccc', 1609459400, '0x333', 102);

  const historyA = reg.getHistory('key-a');
  assert(historyA.length === 2, 'key-a has 2 history entries');
  assert(historyA[0].value === 'v1', 'First history entry is oldest');
  assert(historyA[1].value === 'v2', 'Second history entry is newest');

  const historyB = reg.getHistory('key-b');
  assert(historyB.length === 1, 'key-b has 1 history entry');
});

// Test 11: Get entries by registrant
test('ReverseRegister - Get entries by registrant', () => {
  const reg = new ReverseRegister('Test Registry');
  const addr = '0x1111111111111111111111111111111111111111';

  reg.register('key-1', 'v1', addr, 1609459200, '0x111', 100);
  reg.register('key-2', 'v2', addr, 1609459300, '0x222', 101);
  reg.register('key-3', 'v3', '0xaaaa', 1609459400, '0x333', 102);

  const entries = reg.getEntriesByRegistrant(addr);
  assert(entries.length === 2, 'Registrant has 2 entries');
});

// Test 12: List keys
test('ReverseRegister - List keys', () => {
  const reg = new ReverseRegister('Test Registry');

  reg.register('alpha', 'v1', '0xaaaa', 1609459200, '0x111', 100);
  reg.register('beta', 'v1', '0xbbbb', 1609459300, '0x222', 101);
  reg.register('alpha', 'v2', '0xaaaa', 1609459400, '0x333', 102);

  const keys = reg.listKeys();
  assert(keys.length === 2, 'Only unique keys are listed');
  assert(keys.includes('alpha'), 'Includes key alpha');
  assert(keys.includes('beta'), 'Includes key beta');
});

// Test 13: toGitLog - newest first
test('ReverseRegister - toGitLog (newest first)', () => {
  const reg = new ReverseRegister('Test Registry');

  reg.register('key-1', 'old', '0xaaaa', 1609459200, '0x111', 100);
  reg.register('key-2', 'new', '0xbbbb', 1609459300, '0x222', 101);

  const log = reg.toGitLog();
  assert(typeof log === 'string', 'toGitLog returns string');
  assert(log.includes('commit'), 'Log contains commit keyword');
  // Newest entry ("key-2") should appear before oldest ("key-1")
  const pos1 = log.indexOf('"key-1"');
  const pos2 = log.indexOf('"key-2"');
  assert(pos2 < pos1, 'Newest entry appears first in toGitLog');
});

// Test 14: toReverseLog - oldest first
test('ReverseRegister - toReverseLog (oldest first)', () => {
  const reg = new ReverseRegister('Test Registry');

  reg.register('key-1', 'old', '0xaaaa', 1609459200, '0x111', 100);
  reg.register('key-2', 'new', '0xbbbb', 1609459300, '0x222', 101);

  const log = reg.toReverseLog();
  assert(typeof log === 'string', 'toReverseLog returns string');
  assert(log.includes('commit'), 'Log contains commit keyword');
  // Oldest entry ("key-1") should appear before newest ("key-2")
  const pos1 = log.indexOf('"key-1"');
  const pos2 = log.indexOf('"key-2"');
  assert(pos1 < pos2, 'Oldest entry appears first in toReverseLog');
});

// Test 15: toShortLog - newest first
test('ReverseRegister - toShortLog (newest first)', () => {
  const reg = new ReverseRegister('Test Registry');

  reg.register('first', 'v1', '0xaaaa', 1609459200, '0x111', 100);
  reg.register('second', 'v2', '0xbbbb', 1609459300, '0x222', 101);

  const log = reg.toShortLog();
  assert(typeof log === 'string', 'toShortLog returns string');
  assert(log.includes('"first"'), 'Short log contains first key');
  assert(log.includes('→'), 'Short log contains arrow');
  const posFirst = log.indexOf('"first"');
  const posSecond = log.indexOf('"second"');
  assert(posSecond < posFirst, 'Newest entry appears first in toShortLog');
});

// Test 16: toReverseShortLog - oldest first
test('ReverseRegister - toReverseShortLog (oldest first)', () => {
  const reg = new ReverseRegister('Test Registry');

  reg.register('first', 'v1', '0xaaaa', 1609459200, '0x111', 100);
  reg.register('second', 'v2', '0xbbbb', 1609459300, '0x222', 101);

  const log = reg.toReverseShortLog();
  assert(typeof log === 'string', 'toReverseShortLog returns string');
  const posFirst = log.indexOf('"first"');
  const posSecond = log.indexOf('"second"');
  assert(posFirst < posSecond, 'Oldest entry appears first in toReverseShortLog');
});

// Test 17: Log limit
test('ReverseRegister - Log with limit', () => {
  const reg = new ReverseRegister('Test Registry');

  reg.register('k1', 'v1', '0xaaaa', 1609459200, '0x111', 100);
  reg.register('k2', 'v2', '0xbbbb', 1609459300, '0x222', 101);
  reg.register('k3', 'v3', '0xcccc', 1609459400, '0x333', 102);

  const gitLog = reg.toGitLog(2);
  const commitCount = (gitLog.match(/^commit /gm) || []).length;
  assert(commitCount === 2, 'toGitLog with limit=2 returns 2 commits');

  const reverseLog = reg.toReverseLog(2);
  const reverseCount = (reverseLog.match(/^commit /gm) || []).length;
  assert(reverseCount === 2, 'toReverseLog with limit=2 returns 2 commits');
});

// Test 18: Statistics
test('ReverseRegister - Statistics', () => {
  const reg = new ReverseRegister('Stats Registry', 'kushmanmb');

  reg.register('key-1', 'v1', '0xaaaa', 1609459200, '0x111', 100);
  reg.register('key-2', 'v2', '0xbbbb', 1609459300, '0x222', 101);
  reg.register('key-1', 'v2', '0xaaaa', 1609459400, '0x333', 102);

  const stats = reg.getStatistics();
  assert(stats.totalEntries === 3, 'Total entries is 3');
  assert(stats.uniqueKeys === 2, 'Unique keys is 2');
  assert(stats.activeKeys === 2, 'Active keys is 2');
  assert(stats.uniqueRegistrants === 2, 'Unique registrants is 2');
  assert(stats.name === 'Stats Registry', 'Name is correct');
  assert(stats.owner === 'kushmanmb', 'Owner is correct');
});

// Test 19: JSON export and import
test('ReverseRegister - JSON export and import', () => {
  const reg1 = new ReverseRegister('JSON Registry', 'kushmanmb');

  reg1.register('key-a', 'val-a', '0xaaaa', 1609459200, '0x111', 100, { type: 'ENS' });
  reg1.register('key-b', 'val-b', '0xbbbb', 1609459300, '0x222', 101);

  const jsonData = reg1.toJSON();
  assert(typeof jsonData === 'object', 'JSON export returns object');
  assert(jsonData.entries.length === 2, 'Exported entries count is 2');
  assert(jsonData.entries[0].metadata.type === 'ENS', 'Metadata is exported');

  const reg2 = new ReverseRegister('Temp');
  reg2.fromJSON(jsonData);

  assert(reg2.entries.length === 2, 'Imported entries count is 2');
  assert(reg2.name === 'JSON Registry', 'Name is imported correctly');
  assert(reg2.owner === 'kushmanmb', 'Owner is imported correctly');
  assert(reg2.lookup('key-a') === 'val-a', 'Lookup works after import');
  assert(reg2.entries[0].metadata.type === 'ENS', 'Metadata is imported');
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
