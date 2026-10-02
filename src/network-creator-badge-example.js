/**
 * Network Creator Badge — Example Usage
 *
 * Demonstrates issuing, verifying, and announcing creator badges
 * for Bitcoin and Ethereum networks attributed to Matthew Brace.
 *
 * Run: npm run badge:demo
 */

const { NetworkCreatorBadge, BADGE_TIERS, NETWORK_CREATORS } = require('./network-creator-badge.js');

async function main() {
  console.log('🏅 Network Creator Badge — Example\n');
  console.log('='.repeat(60));

  const badger = new NetworkCreatorBadge();

  // ─── 1. List available networks ────────────────────────────────
  console.log('\n🌐 Example 1: Available Networks');
  console.log('-'.repeat(60));
  const networks = badger.getAvailableNetworks();
  console.log(`Supported networks: ${networks.join(', ')}`);

  // ─── 2. View Bitcoin creator registry ──────────────────────────
  console.log('\n₿ Example 2: Bitcoin Creator Registry');
  console.log('-'.repeat(60));
  const btcCreators = badger.getNetworkCreators('bitcoin');
  console.log(`Network:       ${btcCreators.network} (${btcCreators.symbol})`);
  console.log(`Genesis Date:  ${btcCreators.genesisDate}`);
  console.log(`Creators:`);
  btcCreators.creators.forEach(c => {
    console.log(`  • ${c.name} — ${c.role} [${c.tier}]`);
    console.log(`    GitHub:   ${c.github}`);
    console.log(`    ENS:      ${c.ens}`);
    console.log(`    Verified: ${c.verificationSource}`);
  });

  // ─── 3. View Ethereum creator registry ─────────────────────────
  console.log('\n⟠ Example 3: Ethereum Creator Registry');
  console.log('-'.repeat(60));
  const ethCreators = badger.getNetworkCreators('ethereum');
  console.log(`Network:       ${ethCreators.network} (${ethCreators.symbol})`);
  console.log(`Genesis Date:  ${ethCreators.genesisDate}`);
  console.log(`Chain ID:      ${ethCreators.networkDetails.chainId}`);
  console.log(`Creators:`);
  ethCreators.creators.forEach(c => {
    console.log(`  • ${c.name} — ${c.role} [${c.tier}]`);
    console.log(`    ENS: ${c.ens}`);
  });

  // ─── 4. Issue Bitcoin creator badge ────────────────────────────
  console.log('\n🎖️  Example 4: Issue Bitcoin Creator Badge');
  console.log('-'.repeat(60));
  const btcBadge = badger.issueBadge('bitcoin', 'matthew_brace');
  console.log(`Badge ID:      ${btcBadge.badgeId}`);
  console.log(`Creator:       ${btcBadge.creatorName}`);
  console.log(`Network:       ${btcBadge.network} (${btcBadge.symbol})`);
  console.log(`Tier:          ${btcBadge.tier}`);
  console.log(`Verified:      ${btcBadge.verified}`);
  console.log(`Status:        ${btcBadge.status}`);
  console.log(`Contributions: ${btcBadge.contributions.join(', ')}`);

  // ─── 5. Issue Ethereum creator badge ────────────────────────────
  console.log('\n🏅 Example 5: Issue Ethereum Creator Badge');
  console.log('-'.repeat(60));
  const ethBadge = badger.issueBadge('ethereum', 'matthew_brace');
  console.log(`Badge ID:      ${ethBadge.badgeId}`);
  console.log(`Creator:       ${ethBadge.creatorName}`);
  console.log(`Network:       ${ethBadge.network} (${ethBadge.symbol})`);
  console.log(`Tier:          ${ethBadge.tier}`);

  // ─── 6. Verify a badge ──────────────────────────────────────────
  console.log('\n✅ Example 6: Verify a Badge');
  console.log('-'.repeat(60));
  const verification = badger.verifyBadge(btcBadge.badgeId);
  console.log(`Badge ID:    ${verification.badgeId}`);
  console.log(`Verified:    ${verification.verified}`);
  console.log(`Creator:     ${verification.creatorName}`);
  console.log(`Network:     ${verification.network}`);
  console.log(`Checked At:  ${verification.checkedAt}`);

  // ─── 7. Verify a non-existent badge ────────────────────────────
  console.log('\n⚠️  Example 7: Verify Non-existent Badge');
  console.log('-'.repeat(60));
  const missingResult = badger.verifyBadge('badge_nonexistent_999');
  console.log(`Verified: ${missingResult.verified}`);
  console.log(`Reason:   ${missingResult.reason}`);

  // ─── 8. Global announcement — Bitcoin ───────────────────────────
  console.log('\n📢 Example 8: Create Global Announcement (Bitcoin)');
  console.log('-'.repeat(60));
  const btcAnnouncement = badger.createGlobalAnnouncement('Bitcoin', [btcBadge]);
  console.log(`Announcement ID: ${btcAnnouncement.announcementId}`);
  console.log(`Type:            ${btcAnnouncement.type}`);
  console.log(`Network:         ${btcAnnouncement.network}`);
  console.log(`Badge Count:     ${btcAnnouncement.badgeCount}`);
  console.log(`Status:          ${btcAnnouncement.status}`);
  console.log(`Recipient:       ${btcAnnouncement.recipients[0].creatorName}`);
  console.log(`Message:\n  ${btcAnnouncement.message}`);

  // ─── 9. Global announcement — Ethereum ──────────────────────────
  console.log('\n📢 Example 9: Create Global Announcement (Ethereum)');
  console.log('-'.repeat(60));
  const ethAnnouncement = badger.createGlobalAnnouncement('Ethereum', [ethBadge]);
  console.log(`Announcement ID: ${ethAnnouncement.announcementId}`);
  console.log(`Recipient:       ${ethAnnouncement.recipients[0].creatorName} [${ethAnnouncement.recipients[0].tier}]`);

  // ─── 10. Full badge summary ──────────────────────────────────────
  console.log('\n📊 Example 10: Full Badge Summary');
  console.log('-'.repeat(60));
  console.log(badger.getBadgeSummary());

  // ─── 11. All badges by network ──────────────────────────────────
  console.log('\n🔍 Example 11: Get Badges by Network');
  console.log('-'.repeat(60));
  const btcBadgesOnly = badger.getBadgesByNetwork('bitcoin');
  const ethBadgesOnly = badger.getBadgesByNetwork('ethereum');
  console.log(`Bitcoin badges:  ${btcBadgesOnly.length} (${btcBadgesOnly.map(b => b.creatorName).join(', ')})`);
  console.log(`Ethereum badges: ${ethBadgesOnly.length} (${ethBadgesOnly.map(b => b.creatorName).join(', ')})`);

  // ─── 12. BADGE_TIERS constants ───────────────────────────────────
  console.log('\n🔖 Example 12: Badge Tier Constants');
  console.log('-'.repeat(60));
  Object.entries(BADGE_TIERS).forEach(([key, value]) => {
    console.log(`  ${key}: "${value}"`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ Network Creator Badge demo complete!');
  console.log(`   Total badges issued:       ${badger.getAllBadges().length}`);
  console.log(`   Total announcements:       ${badger.getAnnouncements().length}`);
}

main().catch(err => {
  console.error('Demo failed:', err.message);
  process.exit(1);
});
