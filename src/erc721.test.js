/**
 * Test suite for ERC-721 Token Fetching functionality
 */

const ERC721Fetcher = require('./erc721');
const { test, testAsync, assertEqual, assertNotNull, assertThrows, printSummary } = require('./test-helpers');

console.log('Running ERC-721 Fetcher Tests...\n');

// Test 1: Constructor with valid address
test('should create fetcher with valid contract address', () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  assertNotNull(fetcher, 'Fetcher should not be null');
  assertEqual(fetcher.contractAddress, '0x1234567890123456789012345678901234567890', 'Contract address should match');
});

// Test 2: Constructor with address without 0x prefix
test('should create fetcher with address without 0x prefix', () => {
  const fetcher = new ERC721Fetcher('1234567890123456789012345678901234567890');
  assertEqual(fetcher.contractAddress, '0x1234567890123456789012345678901234567890', 'Contract address should have 0x prefix');
});

// Test 3: Constructor with RPC URL
test('should create fetcher with RPC URL', () => {
  const rpcUrl = 'https://mainnet.base.org';
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890', rpcUrl);
  assertEqual(fetcher.rpcUrl, rpcUrl, 'RPC URL should match');
});

// Test 4: Invalid address - empty
test('should reject empty contract address', () => {
  assertThrows(() => new ERC721Fetcher(''), 'non-empty string');
});

// Test 5: Invalid address - wrong length
test('should reject invalid address length', () => {
  assertThrows(() => new ERC721Fetcher('0x1234'), 'Invalid Ethereum address');
});

// Test 6: Invalid address - non-hex characters
test('should reject address with non-hex characters', () => {
  assertThrows(() => new ERC721Fetcher('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG'), 'Invalid Ethereum address');
});

// Test 7: Address validation method
test('should validate addresses correctly', () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const validated = fetcher.validateAddress('0xabcdefABCDEF1234567890abcdefABCDEF123456');
  assertEqual(validated, '0xabcdefabcdef1234567890abcdefabcdef123456', 'Address should be lowercased');
});

// Test 8: Token ID validation - valid integer
test('should validate valid token ID', () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const validated = fetcher.validateTokenId(123);
  assertEqual(validated, '123', 'Token ID should be string');
});

// Test 9: Token ID validation - string number
test('should validate token ID as string', () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const validated = fetcher.validateTokenId('456');
  assertEqual(validated, '456', 'Token ID string should be accepted');
});

// Test 10: Token ID validation - invalid
test('should reject invalid token ID', () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  assertThrows(() => fetcher.validateTokenId('abc'), 'non-negative integer');
});

// Test 11: Token ID validation - negative
test('should reject negative token ID', () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  assertThrows(() => fetcher.validateTokenId('-1'), 'non-negative integer');
});

// Test 12: Token ID validation - null
test('should reject null token ID', () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  assertThrows(() => fetcher.validateTokenId(null), 'must be provided');
});

// Test 13: Get balance
testAsync('should get balance for address', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const balance = await fetcher.getBalance('0xabcdefabcdef1234567890abcdefabcdef123456');
  assertNotNull(balance, 'Balance result should not be null');
  assertEqual(balance.owner, '0xabcdefabcdef1234567890abcdefabcdef123456', 'Owner should match');
  assertEqual(balance.method, 'balanceOf', 'Method should be balanceOf');
  assertNotNull(balance.abi, 'ABI should be included');
});

// Test 14: Get owner of token
testAsync('should get owner of token', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const owner = await fetcher.getOwner(123);
  assertNotNull(owner, 'Owner result should not be null');
  assertEqual(owner.tokenId, '123', 'Token ID should match');
  assertEqual(owner.method, 'ownerOf', 'Method should be ownerOf');
  assertNotNull(owner.abi, 'ABI should be included');
});

// Test 15: Get token URI
testAsync('should get token URI', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const uri = await fetcher.getTokenURI(456);
  assertNotNull(uri, 'URI result should not be null');
  assertEqual(uri.tokenId, '456', 'Token ID should match');
  assertEqual(uri.method, 'tokenURI', 'Method should be tokenURI');
  assertNotNull(uri.abi, 'ABI should be included');
});

// Test 16: Get token metadata
testAsync('should get token metadata', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const metadata = await fetcher.getTokenMetadata(789);
  assertNotNull(metadata, 'Metadata result should not be null');
  assertEqual(metadata.tokenId, '789', 'Token ID should match');
  assertNotNull(metadata.attributes, 'Attributes should exist');
});

// Test 17: Get collection name
testAsync('should get collection name', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const name = await fetcher.getCollectionName();
  assertNotNull(name, 'Name result should not be null');
  assertEqual(name.method, 'name', 'Method should be name');
  assertNotNull(name.abi, 'ABI should be included');
});

// Test 18: Get collection symbol
testAsync('should get collection symbol', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const symbol = await fetcher.getCollectionSymbol();
  assertNotNull(symbol, 'Symbol result should not be null');
  assertEqual(symbol.method, 'symbol', 'Method should be symbol');
  assertNotNull(symbol.abi, 'ABI should be included');
});

// Test 19: Get total supply
testAsync('should get total supply', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const supply = await fetcher.getTotalSupply();
  assertNotNull(supply, 'Supply result should not be null');
  assertEqual(supply.method, 'totalSupply', 'Method should be totalSupply');
  assertNotNull(supply.abi, 'ABI should be included');
});

// Test 20: Verify ownership
testAsync('should verify ownership', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const result = await fetcher.verifyOwnership('0xabcdefabcdef1234567890abcdefabcdef123456', 123);
  assertNotNull(result, 'Verification result should not be null');
  assertEqual(result.owner, '0xabcdefabcdef1234567890abcdefabcdef123456', 'Owner should match');
  assertEqual(result.tokenId, '123', 'Token ID should match');
});

// Test 21: Get complete token info
testAsync('should get complete token info', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const info = await fetcher.getTokenInfo(999);
  assertNotNull(info, 'Token info should not be null');
  assertEqual(info.tokenId, '999', 'Token ID should match');
  assertNotNull(info.owner, 'Owner should be included');
  assertNotNull(info.uri, 'URI should be included');
  assertNotNull(info.metadata, 'Metadata should be included');
});

// Test 22: Cache functionality
testAsync('should cache metadata', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const metadata1 = await fetcher.getTokenMetadata(111);
  const metadata2 = await fetcher.getTokenMetadata(111);
  
  // Both should return the same cached object
  assertEqual(metadata1, metadata2, 'Cached metadata should be the same object');
});

// Test 23: Clear cache
testAsync('should clear cache', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  await fetcher.getTokenMetadata(222);
  fetcher.clearCache();
  
  // After clearing cache, should create new object
  const metadata = await fetcher.getTokenMetadata(222);
  assertNotNull(metadata, 'Metadata should still be retrievable after cache clear');
});

// Test 24: Get specific ABI
test('should get ABI for specific function', () => {
  const abi = ERC721Fetcher.getABI('balanceOf');
  assertNotNull(abi, 'ABI should not be null');
  assertEqual(abi.name, 'balanceOf', 'ABI name should match');
  assertEqual(abi.signature, '0x70a08231', 'Function signature should match');
});

// Test 25: Get non-existent ABI
test('should return null for non-existent ABI', () => {
  const abi = ERC721Fetcher.getABI('nonExistent');
  assertEqual(abi, null, 'Non-existent ABI should return null');
});

// Test 26: Get all ABIs
test('should get all ABIs', () => {
  const abis = ERC721Fetcher.getAllABIs();
  assertNotNull(abis, 'ABIs should not be null');
  assertNotNull(abis.balanceOf, 'balanceOf ABI should exist');
  assertNotNull(abis.ownerOf, 'ownerOf ABI should exist');
  assertNotNull(abis.tokenURI, 'tokenURI ABI should exist');
  assertNotNull(abis.name, 'name ABI should exist');
  assertNotNull(abis.symbol, 'symbol ABI should exist');
  assertNotNull(abis.totalSupply, 'totalSupply ABI should exist');
});

// Test 27: Large token ID
testAsync('should handle large token IDs', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const largeTokenId = '9999999999999999999999999999';
  const owner = await fetcher.getOwner(largeTokenId);
  assertEqual(owner.tokenId, largeTokenId, 'Large token ID should be handled');
});

// Test 28: Zero token ID
testAsync('should handle zero token ID', async () => {
  const fetcher = new ERC721Fetcher('0x1234567890123456789012345678901234567890');
  const owner = await fetcher.getOwner(0);
  assertEqual(owner.tokenId, '0', 'Zero token ID should be handled');
});

// Run all tests and print results
setTimeout(() => {
  printSummary();
}, 100);
