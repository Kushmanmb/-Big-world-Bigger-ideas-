/**
 * Token UUID Example
 * Demonstrates how to use the Token UUID module for generating and validating UUIDs
 */

const TokenUUID = require('./token-uuid');

console.log('🎯 Token UUID Module - Examples\n');
console.log('='.repeat(70));

// Example 1: Generate random UUIDs
console.log('\n📝 Example 1: Generate Random UUIDs (v4)');
console.log('-'.repeat(70));
const tokenUUID = new TokenUUID();

const randomUUID1 = tokenUUID.generateRandom();
const randomUUID2 = tokenUUID.generateRandom();
const randomUUID3 = tokenUUID.generateRandom();

console.log(`Random UUID 1: ${randomUUID1}`);
console.log(`Random UUID 2: ${randomUUID2}`);
console.log(`Random UUID 3: ${randomUUID3}`);
console.log(`\nNote: Each random UUID is unique and non-deterministic.`);

// Example 2: Generate deterministic UUIDs for tokens
console.log('\n🎨 Example 2: Generate Deterministic UUIDs for NFT Tokens (v5)');
console.log('-'.repeat(70));

// Example with Bored Ape Yacht Club contract
const baycContract = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
const tokenId1 = '1234';
const tokenId2 = '5678';

const baycToken1UUID = tokenUUID.generateForToken(baycContract, tokenId1);
const baycToken2UUID = tokenUUID.generateForToken(baycContract, tokenId2);

console.log(`BAYC Token #${tokenId1} UUID: ${baycToken1UUID}`);
console.log(`BAYC Token #${tokenId2} UUID: ${baycToken2UUID}`);

// Verify determinism
const baycToken1UUID_again = tokenUUID.generateForToken(baycContract, tokenId1);
console.log(`\nVerifying determinism - BAYC Token #${tokenId1} UUID again: ${baycToken1UUID_again}`);
console.log(`Are they the same? ${baycToken1UUID === baycToken1UUID_again ? '✅ Yes' : '❌ No'}`);

// Example 3: Different contracts generate different UUIDs
console.log('\n🔗 Example 3: Different Contracts Generate Different UUIDs');
console.log('-'.repeat(70));

// Example with Mutant Ape Yacht Club contract
const maycContract = '0x60E4d786628Fea6478F785A6d7e704777c86a7c6';
const maycTokenUUID = tokenUUID.generateForToken(maycContract, tokenId1);

console.log(`BAYC Token #${tokenId1} UUID: ${baycToken1UUID}`);
console.log(`MAYC Token #${tokenId1} UUID: ${maycTokenUUID}`);
console.log(`Are they different? ${baycToken1UUID !== maycTokenUUID ? '✅ Yes' : '❌ No'}`);

// Example 4: Generate UUIDs for ownership events
console.log('\n📋 Example 4: Generate UUIDs for Ownership Events');
console.log('-'.repeat(70));

const from = '0x0000000000000000000000000000000000000000'; // Mint from zero address
const to = '0x1234567890123456789012345678901234567890';   // New owner
const timestamp = Math.floor(Date.now() / 1000);

const eventUUID = tokenUUID.generateForEvent(baycContract, tokenId1, from, to, timestamp);

console.log(`Event: Token #${tokenId1} minted`);
console.log(`From: ${from}`);
console.log(`To: ${to}`);
console.log(`Timestamp: ${timestamp}`);
console.log(`Event UUID: ${eventUUID}`);

// Example 5: Validate UUIDs
console.log('\n✅ Example 5: Validate UUIDs');
console.log('-'.repeat(70));

const validUUID = baycToken1UUID;
const invalidUUID = 'not-a-uuid-at-all';

console.log(`Checking if "${validUUID}" is valid...`);
console.log(`Result: ${tokenUUID.isValidUUID(validUUID) ? '✅ Valid' : '❌ Invalid'}`);

console.log(`\nChecking if "${invalidUUID}" is valid...`);
console.log(`Result: ${tokenUUID.isValidUUID(invalidUUID) ? '✅ Valid' : '❌ Invalid'}`);

// Example 6: Get UUID version
console.log('\n🔢 Example 6: Get UUID Version');
console.log('-'.repeat(70));

const v4UUID = tokenUUID.generateRandom();
const v5UUID = tokenUUID.generateForToken(baycContract, tokenId1);

console.log(`UUID: ${v4UUID}`);
console.log(`Version: v${tokenUUID.getVersion(v4UUID)}`);

console.log(`\nUUID: ${v5UUID}`);
console.log(`Version: v${tokenUUID.getVersion(v5UUID)}`);

// Example 7: NIL UUID
console.log('\n⭕ Example 7: NIL UUID (All Zeros)');
console.log('-'.repeat(70));

const nilUUID = TokenUUID.getNilUUID();
console.log(`NIL UUID: ${nilUUID}`);
console.log(`Is NIL? ${tokenUUID.isNilUUID(nilUUID) ? '✅ Yes' : '❌ No'}`);
console.log(`Is random UUID NIL? ${tokenUUID.isNilUUID(v4UUID) ? '✅ Yes' : '❌ No'}`);

// Example 8: Custom namespace
console.log('\n🎭 Example 8: Using Custom Namespace');
console.log('-'.repeat(70));

const customNamespace = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
const customTokenUUID = TokenUUID.withNamespace(customNamespace);

const defaultUUID = tokenUUID.generateForToken(baycContract, tokenId1);
const customUUID = customTokenUUID.generateForToken(baycContract, tokenId1);

console.log(`Default namespace UUID: ${defaultUUID}`);
console.log(`Custom namespace UUID:  ${customUUID}`);
console.log(`Are they different? ${defaultUUID !== customUUID ? '✅ Yes' : '❌ No'}`);

// Example 9: Practical use case - Portfolio tracking
console.log('\n💼 Example 9: Practical Use Case - NFT Portfolio Tracking');
console.log('-'.repeat(70));

const portfolio = [
  { contract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', tokenId: '1234', name: 'BAYC #1234' },
  { contract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', tokenId: '5678', name: 'BAYC #5678' },
  { contract: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6', tokenId: '9999', name: 'MAYC #9999' }
];

console.log('NFT Portfolio with UUIDs:');
portfolio.forEach((nft, index) => {
  const uuid = tokenUUID.generateForToken(nft.contract, nft.tokenId);
  console.log(`${index + 1}. ${nft.name}`);
  console.log(`   Contract: ${nft.contract}`);
  console.log(`   Token ID: ${nft.tokenId}`);
  console.log(`   UUID: ${uuid}`);
});

// Example 10: Address format handling
console.log('\n🔄 Example 10: Address Format Normalization');
console.log('-'.repeat(70));

const addresses = [
  '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', // Mixed case with 0x
  '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // Lowercase with 0x
  'BC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'   // Mixed case without 0x
];

console.log('Generating UUIDs for the same contract in different formats:');
addresses.forEach((addr, index) => {
  const uuid = tokenUUID.generateForToken(addr, '1000');
  console.log(`${index + 1}. Address: ${addr}`);
  console.log(`   UUID: ${uuid}`);
});
console.log('\nAll three UUIDs are identical because addresses are normalized! ✅');

// Summary
console.log('\n' + '='.repeat(70));
console.log('\n📚 Summary');
console.log('-'.repeat(70));
console.log('✅ Random UUIDs (v4) are perfect for unique, non-deterministic identifiers');
console.log('✅ Deterministic UUIDs (v5) are perfect for consistent token identification');
console.log('✅ Event UUIDs combine multiple factors for unique event tracking');
console.log('✅ Address normalization ensures consistent UUIDs regardless of format');
console.log('✅ Custom namespaces allow for different UUID spaces in the same system');
console.log('\n🎉 Token UUID module is ready for production use!\n');
