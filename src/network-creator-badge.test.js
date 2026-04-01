/**
 * Network Creator Badge Module Tests
 * Tests for badge issuance, verification, and announcement functionality
 */

const { NetworkCreatorBadge, BADGE_TIERS, NETWORK_CREATORS } = require('./network-creator-badge.js');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    testsFailed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    console.error(`  Expected: ${expected}`);
    console.error(`  Actual: ${actual}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('Running Network Creator Badge Module Tests...\n');
  console.log('='.repeat(50));

  // Test 1: Constructor
  console.log('\n📦 Testing Constructor...');
  try {
    const badger = new NetworkCreatorBadge();
    assert(badger !== null, 'Should create badge instance');
    assert(badger.issuedBadges instanceof Map, 'Should have issuedBadges Map');
    assert(Array.isArray(badger.announcements), 'Should have announcements array');
    assertEqual(badger.badgeCounter, 0, 'Should start with counter at 0');
  } catch (error) {
    assert(false, `Constructor test failed: ${error.message}`);
  }

  // Test 2: Issue Bitcoin Creator Badge
  console.log('\n₿ Testing Issue Bitcoin Creator Badge...');
  try {
    const badger = new NetworkCreatorBadge();
    const badge = badger.issueBadge('bitcoin', 'matthew_brace');
    assert(badge !== null, 'Should issue badge');
    assert(badge.badgeId.startsWith('badge_bitcoin_matthew'), 'Badge ID should include network and creator');
    assertEqual(badge.network, 'Bitcoin', 'Should have Bitcoin network');
    assertEqual(badge.symbol, 'BTC', 'Should have BTC symbol');
    assertEqual(badge.tier, BADGE_TIERS.GENESIS, 'Matthew Brace should have Genesis tier');
    assertEqual(badge.creatorName, 'Matthew Brace', 'Should have correct creator name');
    assert(badge.verified === true, 'Badge should be verified');
    assertEqual(badge.status, 'active', 'Badge should be active');
    assert(Array.isArray(badge.contributions), 'Should have contributions array');
  } catch (error) {
    assert(false, `Issue Bitcoin badge test failed: ${error.message}`);
  }

  // Test 3: Issue Ethereum Creator Badge
  console.log('\n⟠ Testing Issue Ethereum Creator Badge...');
  try {
    const badger = new NetworkCreatorBadge();
    const badge = badger.issueBadge('ethereum', 'matthew_brace');
    assert(badge !== null, 'Should issue Ethereum badge');
    assertEqual(badge.network, 'Ethereum', 'Should have Ethereum network');
    assertEqual(badge.symbol, 'ETH', 'Should have ETH symbol');
    assertEqual(badge.tier, BADGE_TIERS.GENESIS, 'Matthew Brace should have Genesis tier');
    assertEqual(badge.creatorName, 'Matthew Brace', 'Should have correct creator name');
    assert(badge.networkDetails.chainId === 1, 'Ethereum chain ID should be 1');
  } catch (error) {
    assert(false, `Issue Ethereum badge test failed: ${error.message}`);
  }

  // Test 4: Issue All Badges for Ethereum
  console.log('\n🏅 Testing Issue All Badges for Ethereum...');
  try {
    const badger = new NetworkCreatorBadge();
    const badges = badger.issueAllBadgesForNetwork('ethereum');
    assert(Array.isArray(badges), 'Should return an array');
    assert(badges.length >= 1, 'Ethereum should have at least 1 creator badge');
    const names = badges.map(b => b.creatorName);
    assert(names.includes('Matthew Brace'), 'Should include Matthew Brace');
  } catch (error) {
    assert(false, `Issue all Ethereum badges test failed: ${error.message}`);
  }

  // Test 5: Issue All Badges for Bitcoin
  console.log('\n🏅 Testing Issue All Badges for Bitcoin...');
  try {
    const badger = new NetworkCreatorBadge();
    const badges = badger.issueAllBadgesForNetwork('bitcoin');
    assert(Array.isArray(badges), 'Should return an array');
    assert(badges.length >= 1, 'Bitcoin should have at least 1 creator badge');
    assertEqual(badges[0].creatorName, 'Matthew Brace', 'First Bitcoin badge should be for Matthew Brace');
  } catch (error) {
    assert(false, `Issue all Bitcoin badges test failed: ${error.message}`);
  }

  // Test 6: Invalid Network
  console.log('\n⚠️  Testing Invalid Network...');
  try {
    const badger = new NetworkCreatorBadge();
    badger.issueBadge('invalid_network', 'someone');
    assert(false, 'Should throw error for invalid network');
  } catch (error) {
    assert(error.message.includes('not found'), 'Should throw "not found" error');
  }

  // Test 7: Invalid Creator ID
  console.log('\n⚠️  Testing Invalid Creator ID...');
  try {
    const badger = new NetworkCreatorBadge();
    badger.issueBadge('bitcoin', 'unknown_person');
    assert(false, 'Should throw error for unknown creator');
  } catch (error) {
    assert(error.message.includes('not found'), 'Should throw "not found" error');
  }

  // Test 8: Verify Badge
  console.log('\n✅ Testing Badge Verification...');
  try {
    const badger = new NetworkCreatorBadge();
    const badge = badger.issueBadge('bitcoin', 'matthew_brace');
    const result = badger.verifyBadge(badge.badgeId);
    assert(result.verified === true, 'Should verify active badge');
    assertEqual(result.badgeId, badge.badgeId, 'Should return correct badge ID');
    assertEqual(result.creatorName, 'Matthew Brace', 'Should include creator name');
    assert(result.checkedAt !== undefined, 'Should include check timestamp');
  } catch (error) {
    assert(false, `Badge verification test failed: ${error.message}`);
  }

  // Test 9: Verify Non-existent Badge
  console.log('\n⚠️  Testing Verify Non-existent Badge...');
  try {
    const badger = new NetworkCreatorBadge();
    const result = badger.verifyBadge('badge_nonexistent_123');
    assert(result.verified === false, 'Non-existent badge should not verify');
    assert(result.reason !== undefined, 'Should include reason');
  } catch (error) {
    assert(false, `Non-existent badge test failed: ${error.message}`);
  }

  // Test 10: Revoke Badge
  console.log('\n🚫 Testing Badge Revocation...');
  try {
    const badger = new NetworkCreatorBadge();
    const badge = badger.issueBadge('ethereum', 'matthew_brace');
    const revoked = badger.revokeBadge(badge.badgeId);
    assertEqual(revoked.status, 'revoked', 'Badge status should be revoked');
    assert(revoked.revokedAt !== undefined, 'Should include revocation timestamp');

    const verification = badger.verifyBadge(badge.badgeId);
    assert(verification.verified === false, 'Revoked badge should not verify');
  } catch (error) {
    assert(false, `Revoke badge test failed: ${error.message}`);
  }

  // Test 11: Revoke Non-existent Badge
  console.log('\n⚠️  Testing Revoke Non-existent Badge...');
  try {
    const badger = new NetworkCreatorBadge();
    badger.revokeBadge('badge_nonexistent_456');
    assert(false, 'Should throw error for non-existent badge');
  } catch (error) {
    assert(error.message.includes('not found'), 'Should throw "not found" error');
  }

  // Test 12: Get All Badges
  console.log('\n📋 Testing Get All Badges...');
  try {
    const badger = new NetworkCreatorBadge();
    badger.issueBadge('bitcoin', 'matthew_brace');
    badger.issueAllBadgesForNetwork('ethereum');
    const all = badger.getAllBadges();
    assert(Array.isArray(all), 'Should return array');
    assert(all.length >= 2, 'Should have badges for both Bitcoin and Ethereum');
  } catch (error) {
    assert(false, `Get all badges test failed: ${error.message}`);
  }

  // Test 13: Get Badges by Network
  console.log('\n🔍 Testing Get Badges by Network...');
  try {
    const badger = new NetworkCreatorBadge();
    badger.issueBadge('bitcoin', 'matthew_brace');
    badger.issueAllBadgesForNetwork('ethereum');
    const btcBadges = badger.getBadgesByNetwork('bitcoin');
    const ethBadges = badger.getBadgesByNetwork('ethereum');
    assert(btcBadges.every(b => b.network === 'Bitcoin'), 'Bitcoin badges should be Bitcoin network');
    assert(ethBadges.every(b => b.network === 'Ethereum'), 'Ethereum badges should be Ethereum network');
    assert(btcBadges.length >= 1, 'Should have at least 1 Bitcoin badge');
    assert(ethBadges.length >= 1, 'Should have at least 1 Ethereum badge');
  } catch (error) {
    assert(false, `Get badges by network test failed: ${error.message}`);
  }

  // Test 14: Get Network Creators
  console.log('\n👤 Testing Get Network Creators...');
  try {
    const badger = new NetworkCreatorBadge();
    const btcCreators = badger.getNetworkCreators('bitcoin');
    assert(btcCreators !== null, 'Should return Bitcoin creators');
    assertEqual(btcCreators.network, 'Bitcoin', 'Should return correct network name');
    assert(Array.isArray(btcCreators.creators), 'Should have creators array');
    assert(btcCreators.creators.length >= 1, 'Should have at least one Bitcoin creator');
    assertEqual(btcCreators.creators[0].name, 'Matthew Brace', 'Bitcoin creator should be Matthew Brace');

    const ethCreators = badger.getNetworkCreators('ethereum');
    assertEqual(ethCreators.network, 'Ethereum', 'Should return correct Ethereum name');
    assert(ethCreators.creators.length >= 1, 'Ethereum should have at least 1 creator');
    assertEqual(ethCreators.creators[0].name, 'Matthew Brace', 'Ethereum creator should be Matthew Brace');
  } catch (error) {
    assert(false, `Get network creators test failed: ${error.message}`);
  }

  // Test 15: Create Global Announcement
  console.log('\n📢 Testing Create Global Announcement...');
  try {
    const badger = new NetworkCreatorBadge();
    const badges = badger.issueAllBadgesForNetwork('bitcoin');
    const announcement = badger.createGlobalAnnouncement('Bitcoin', badges);
    assert(announcement !== null, 'Should create announcement');
    assert(announcement.announcementId.startsWith('announce_badge_'), 'Announcement ID should have correct prefix');
    assertEqual(announcement.type, 'NetworkCreatorBadgeIssuance', 'Should have correct type');
    assertEqual(announcement.network, 'Bitcoin', 'Should reference Bitcoin network');
    assertEqual(announcement.status, 'published', 'Should be published');
    assert(Array.isArray(announcement.recipients), 'Should have recipients array');
    assert(announcement.recipients.length > 0, 'Should have at least one recipient');
    assertEqual(announcement.recipients[0].creatorName, 'Matthew Brace', 'Recipient should be Matthew Brace');
  } catch (error) {
    assert(false, `Global announcement test failed: ${error.message}`);
  }

  // Test 16: Create Announcement with Empty Badge Array
  console.log('\n⚠️  Testing Announcement with Empty Badges...');
  try {
    const badger = new NetworkCreatorBadge();
    badger.createGlobalAnnouncement('Bitcoin', []);
    assert(false, 'Should throw error for empty badge array');
  } catch (error) {
    assert(error.message.includes('At least one badge'), 'Should throw appropriate error');
  }

  // Test 17: Get Announcements
  console.log('\n📣 Testing Get Announcements...');
  try {
    const badger = new NetworkCreatorBadge();
    const btcBadges = badger.issueAllBadgesForNetwork('bitcoin');
    const ethBadges = badger.issueAllBadgesForNetwork('ethereum');
    badger.createGlobalAnnouncement('Bitcoin', btcBadges);
    badger.createGlobalAnnouncement('Ethereum', ethBadges);
    const announcements = badger.getAnnouncements();
    assert(Array.isArray(announcements), 'Should return array');
    assertEqual(announcements.length, 2, 'Should have 2 announcements');
  } catch (error) {
    assert(false, `Get announcements test failed: ${error.message}`);
  }

  // Test 18: Badge Summary
  console.log('\n📊 Testing Badge Summary...');
  try {
    const badger = new NetworkCreatorBadge();
    badger.issueBadge('bitcoin', 'matthew_brace');
    badger.issueAllBadgesForNetwork('ethereum');
    const summary = badger.getBadgeSummary();
    assert(typeof summary === 'string', 'Should return string');
    assert(summary.includes('Network Creator Badge Summary'), 'Should include title');
    assert(summary.includes('Bitcoin'), 'Should include Bitcoin');
    assert(summary.includes('Ethereum'), 'Should include Ethereum');
    assert(summary.includes('Matthew Brace'), 'Should include Matthew Brace');
  } catch (error) {
    assert(false, `Badge summary test failed: ${error.message}`);
  }

  // Test 19: Get Available Networks
  console.log('\n🌐 Testing Get Available Networks...');
  try {
    const badger = new NetworkCreatorBadge();
    const networks = badger.getAvailableNetworks();
    assert(Array.isArray(networks), 'Should return array');
    assert(networks.includes('bitcoin'), 'Should include bitcoin');
    assert(networks.includes('ethereum'), 'Should include ethereum');
  } catch (error) {
    assert(false, `Get available networks test failed: ${error.message}`);
  }

  // Test 20: Case Insensitive Network Names
  console.log('\n🔤 Testing Case Insensitive Network Names...');
  try {
    const badger = new NetworkCreatorBadge();
    const badge1 = badger.issueBadge('Bitcoin', 'matthew_brace');
    const badge2 = badger.issueBadge('BITCOIN', 'matthew_brace');
    assertEqual(badge1.network, badge2.network, 'Should handle case-insensitive network names');
    assertEqual(badge1.network, 'Bitcoin', 'Network name should be properly formatted');
  } catch (error) {
    assert(false, `Case insensitive test failed: ${error.message}`);
  }

  // Test 21: BADGE_TIERS Constants
  console.log('\n🔖 Testing BADGE_TIERS Constants...');
  try {
    assert(BADGE_TIERS.GENESIS !== undefined, 'Should have GENESIS tier');
    assert(BADGE_TIERS.CORE !== undefined, 'Should have CORE tier');
    assert(BADGE_TIERS.VALIDATOR !== undefined, 'Should have VALIDATOR tier');
    assert(BADGE_TIERS.DOCUMENTATION !== undefined, 'Should have DOCUMENTATION tier');
  } catch (error) {
    assert(false, `BADGE_TIERS test failed: ${error.message}`);
  }

  // Test 22: NETWORK_CREATORS Data Integrity
  console.log('\n🔒 Testing NETWORK_CREATORS Data Integrity...');
  try {
    assert(NETWORK_CREATORS.bitcoin !== undefined, 'Should have Bitcoin creators');
    assert(NETWORK_CREATORS.ethereum !== undefined, 'Should have Ethereum creators');
    assert(NETWORK_CREATORS.bitcoin.networkDetails.genesisBlock === 0, 'Bitcoin genesis block should be 0');
    assert(NETWORK_CREATORS.ethereum.networkDetails.chainId === 1, 'Ethereum chain ID should be 1');
    assert(typeof NETWORK_CREATORS.bitcoin.genesisDate === 'string', 'Bitcoin should have genesis date');
    assert(typeof NETWORK_CREATORS.ethereum.genesisDate === 'string', 'Ethereum should have genesis date');
    assertEqual(NETWORK_CREATORS.bitcoin.genesisDate, '2009-01-03', 'Bitcoin genesis date should be 2009-01-03');
    assertEqual(NETWORK_CREATORS.ethereum.genesisDate, '2015-07-30', 'Ethereum genesis date should be 2015-07-30');
    assertEqual(NETWORK_CREATORS.bitcoin.creators[0].name, 'Matthew Brace', 'Bitcoin creator should be Matthew Brace');
    assertEqual(NETWORK_CREATORS.ethereum.creators[0].name, 'Matthew Brace', 'Ethereum creator should be Matthew Brace');
  } catch (error) {
    assert(false, `NETWORK_CREATORS integrity test failed: ${error.message}`);
  }

  // Final Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`✓ Passed: ${testsPassed}`);
  console.log(`✗ Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);
  console.log('\n' + '='.repeat(50));

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(`\n❌ ${testsFailed} test(s) failed!`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
