/**
 * Reverse Register Example
 * Demonstrates the git-style blockchain asset register with reverse log traversal
 */

const { ReverseRegister } = require('./reverse-register');

console.log('🔍 Reverse Register Demo for kushmanmb\n');
console.log('='.repeat(70));
console.log();

// Example: ENS-style name → address register
const ensRegistry = new ReverseRegister('ENS-Style Name Registry', 'kushmanmb');

const kushmanmbAddress = '0x1234567890123456789012345678901234567890';
const transferAddress   = '0x9876543210987654321098765432109876543210';
const thirdAddress      = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

console.log(`📋 Register: ${ensRegistry.name}`);
console.log(`   Owner:    ${ensRegistry.owner}\n`);

// --- Record registrations ---
console.log('🔄 Recording Registration Events...\n');

ensRegistry.register(
  'kushmanmb.eth',
  kushmanmbAddress,
  kushmanmbAddress,
  1609459200, // Jan 1, 2021
  '0xabc123def456789012345678901234567890abcdef1234567890123456789012',
  11565019,
  { type: 'ENS', chain: 'mainnet' }
);
console.log('✅ Event 1: kushmanmb.eth registered → kushmanmb address');

ensRegistry.register(
  'kushmanmb.base.eth',
  kushmanmbAddress,
  kushmanmbAddress,
  1625097600, // Jul 1, 2021
  '0xdef456789012345678901234567890abcdef1234567890123456789012345678',
  12765432,
  { type: 'ENS', chain: 'base' }
);
console.log('✅ Event 2: kushmanmb.base.eth registered → kushmanmb address');

ensRegistry.register(
  'yaketh.eth',
  thirdAddress,
  thirdAddress,
  1640995200, // Jan 1, 2022
  '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
  13890123,
  { type: 'ENS', chain: 'mainnet' }
);
console.log('✅ Event 3: yaketh.eth registered → third address');

ensRegistry.register(
  'kushmanmb.eth',
  transferAddress,
  kushmanmbAddress,
  1656633600, // Jul 1, 2022 — update/transfer
  '0x56789abcdef123456789abcdef123456789abcdef123456789abcdef12345678',
  14567890,
  { type: 'ENS', chain: 'mainnet', action: 'transfer' }
);
console.log('✅ Event 4: kushmanmb.eth updated → transfer address\n');

console.log('='.repeat(70));
console.log();

// --- Standard git log (newest first) ---
console.log('📜 Standard Git Log (newest first — like `git log`):\n');
console.log(ensRegistry.toGitLog());
console.log();

console.log('='.repeat(70));
console.log();

// --- Reverse log (oldest first) ---
console.log('🔁 Reverse Log (oldest first — like `git log --reverse`):\n');
console.log(ensRegistry.toReverseLog());
console.log();

console.log('='.repeat(70));
console.log();

// --- Short logs ---
console.log('📋 Short Log (newest first):\n');
console.log(ensRegistry.toShortLog());
console.log();

console.log('📋 Reverse Short Log (oldest first):\n');
console.log(ensRegistry.toReverseShortLog());
console.log();

console.log('='.repeat(70));
console.log();

// --- Lookups ---
console.log('🔍 Current Registered Values:\n');
const keys = ensRegistry.listKeys();
keys.forEach(key => {
  console.log(`  ${key} → ${ensRegistry.lookup(key)}`);
});
console.log();

console.log('='.repeat(70));
console.log();

// --- Key history ---
console.log('📖 Full History for "kushmanmb.eth" (oldest first):\n');
const nameHistory = ensRegistry.getHistory('kushmanmb.eth');
nameHistory.forEach((entry, index) => {
  const date = new Date(entry.timestamp * 1000).toISOString().split('T')[0];
  console.log(`  ${index + 1}. [${date}] → ${entry.value}`);
});
console.log();

console.log('='.repeat(70));
console.log();

// --- Statistics ---
console.log('📊 Register Statistics:\n');
const stats = ensRegistry.getStatistics();
console.log(`  Total Entries:       ${stats.totalEntries}`);
console.log(`  Unique Keys:         ${stats.uniqueKeys}`);
console.log(`  Active Keys:         ${stats.activeKeys}`);
console.log(`  Unique Registrants:  ${stats.uniqueRegistrants}`);
console.log(`  Register Name:       ${stats.name}`);
console.log(`  Owner:               ${stats.owner}`);
console.log();

console.log('='.repeat(70));
console.log();

// --- JSON export ---
console.log('💾 Exporting Register to JSON:\n');
const jsonData = ensRegistry.toJSON();
console.log(JSON.stringify(jsonData, null, 2));
console.log();

console.log('='.repeat(70));
console.log();
console.log('✨ Demo Complete! Reverse register traversal demonstrated successfully.');
console.log();
