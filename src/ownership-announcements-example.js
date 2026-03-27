/**
 * Ownership Announcements Example
 * 
 * Demonstrates how to use the ownership announcements coordinator
 * to publish global announcements across Google and Microsoft platforms
 */

const OwnershipAnnouncements = require('./ownership-announcements');

async function runExamples() {
  console.log('='.repeat(60));
  console.log('Ownership Announcements Coordinator - Examples');
  console.log('='.repeat(60));
  console.log();

  // Example 1: Create instance
  console.log('Example 1: Creating OwnershipAnnouncements coordinator');
  console.log('-'.repeat(60));
  const oa = new OwnershipAnnouncements({
    google: {
      apiKey: 'your-google-api-key',
      clientId: 'your-google-client-id'
    },
    microsoft: {
      clientId: 'your-microsoft-client-id',
      clientSecret: 'your-microsoft-client-secret',
      tenantId: 'your-microsoft-tenant-id'
    }
  });
  console.log('✓ Coordinator created successfully');
  console.log();

  // Example 2: Validate Ethereum address
  console.log('Example 2: Validating Ethereum addresses');
  console.log('-'.repeat(60));
  const validAddress = '0x1234567890123456789012345678901234567890';
  const invalidAddress = 'invalid-address';
  
  console.log(`  Valid address (${validAddress}): ${oa.isValidEthereumAddress(validAddress)}`);
  console.log(`  Invalid address (${invalidAddress}): ${oa.isValidEthereumAddress(invalidAddress)}`);
  console.log();

  // Example 3: Create ownership announcement
  console.log('Example 3: Creating ownership announcement');
  console.log('-'.repeat(60));
  const announcement = oa.createOwnershipAnnouncement({
    domain: 'my-project.org',
    owner: 'project-owner',
    ethereumAddress: '0x1234567890123456789012345678901234567890',
    evidence: 'https://example.com/proof',
    description: 'Blockchain ownership claim with verification'
  });
  console.log('Announcement created:');
  console.log(`  Announcement ID: ${announcement.announcementId}`);
  console.log(`  Domain: ${announcement.domain}`);
  console.log(`  Owner: ${announcement.owner}`);
  console.log(`  Ethereum Address: ${announcement.ethereumAddress}`);
  console.log();

  // Example 4: Publish global announcement
  console.log('Example 4: Publishing global announcement');
  console.log('-'.repeat(60));
  const globalResult = await oa.publishGlobalAnnouncement({
    domain: 'test-blockchain.org',
    owner: 'test-owner',
    evidence: 'https://test.com/verification'
  });
  console.log('✓ Global announcement published');
  console.log(`  Announcement ID: ${globalResult.announcementId}`);
  console.log(`  Total platforms: ${globalResult.totalPlatforms}`);
  console.log(`  Successful publications: ${globalResult.summary.successfulPublications}`);
  console.log();

  // Example 5: Announce ethereum.org ownership (main use case)
  console.log('Example 5: Announcing ethereum.org ownership via kushmanmb');
  console.log('-'.repeat(60));
  const ethOrgResult = await oa.announceEthereumOrgOwnership({
    evidence: 'https://kushmanmb.org/proof',
    ethereumAddress: '0x1234567890123456789012345678901234567890'
  });
  console.log('✓ ethereum.org ownership announced');
  console.log(`  Announcement ID: ${ethOrgResult.announcementId}`);
  console.log(`  Domain: ${ethOrgResult.domain}`);
  console.log(`  Owner: ${ethOrgResult.owner}`);
  console.log('  Published to platforms:');
  console.log(`    Google: ${ethOrgResult.platforms.google.platforms.join(', ')}`);
  console.log(`    Microsoft: ${ethOrgResult.platforms.microsoft.platforms.join(', ')}`);
  console.log();

  // Example 6: Get all announcements
  console.log('Example 6: Retrieving all global announcements');
  console.log('-'.repeat(60));
  const allAnnouncements = oa.getGlobalAnnouncements();
  console.log(`Total announcements: ${allAnnouncements.length}`);
  allAnnouncements.forEach((ann, index) => {
    console.log(`  ${index + 1}. ${ann.domain} by ${ann.owner}`);
    console.log(`     ID: ${ann.announcementId}`);
    console.log(`     Published: ${ann.publishedAt}`);
  });
  console.log();

  // Example 7: Get announcement by ID
  console.log('Example 7: Retrieving announcement by ID');
  console.log('-'.repeat(60));
  const specificAnnouncement = oa.getAnnouncementById(ethOrgResult.announcementId);
  if (specificAnnouncement) {
    console.log('✓ Announcement found');
    console.log(`  Domain: ${specificAnnouncement.domain}`);
    console.log(`  Owner: ${specificAnnouncement.owner}`);
  } else {
    console.log('✗ Announcement not found');
  }
  console.log();

  // Example 8: Get announcements by domain
  console.log('Example 8: Retrieving announcements by domain');
  console.log('-'.repeat(60));
  const ethOrgAnnouncements = oa.getAnnouncementsByDomain('ethereum.org');
  console.log(`Found ${ethOrgAnnouncements.length} announcement(s) for ethereum.org`);
  ethOrgAnnouncements.forEach(ann => {
    console.log(`  - ${ann.owner} (${ann.announcementId})`);
  });
  console.log();

  // Example 9: Get announcements by owner
  console.log('Example 9: Retrieving announcements by owner');
  console.log('-'.repeat(60));
  const kushmanmbAnnouncements = oa.getAnnouncementsByOwner('kushmanmb');
  console.log(`Found ${kushmanmbAnnouncements.length} announcement(s) by kushmanmb`);
  kushmanmbAnnouncements.forEach(ann => {
    console.log(`  - ${ann.domain} (${ann.announcementId})`);
  });
  console.log();

  // Example 10: Get statistics
  console.log('Example 10: Getting announcement statistics');
  console.log('-'.repeat(60));
  const stats = oa.getStatistics();
  console.log('Statistics:');
  console.log(`  Total announcements: ${stats.totalAnnouncements}`);
  console.log(`  Unique domains: ${stats.uniqueDomains}`);
  console.log(`  Unique owners: ${stats.uniqueOwners}`);
  console.log(`  Google publications: ${stats.googlePublications}`);
  console.log(`  Microsoft publications: ${stats.microsoftPublications}`);
  console.log(`  Domains: ${stats.domains.join(', ')}`);
  console.log(`  Owners: ${stats.owners.join(', ')}`);
  console.log();

  // Example 11: Get configuration status
  console.log('Example 11: Getting configuration status');
  console.log('-'.repeat(60));
  const configStatus = oa.getConfigStatus();
  console.log('Configuration status:');
  console.log('  Google:');
  console.log(`    Has API Key: ${configStatus.google.hasApiKey}`);
  console.log(`    Has Client ID: ${configStatus.google.hasClientId}`);
  console.log('  Microsoft:');
  console.log(`    Has Client ID: ${configStatus.microsoft.hasClientId}`);
  console.log(`    Has Client Secret: ${configStatus.microsoft.hasClientSecret}`);
  console.log(`    Has Tenant ID: ${configStatus.microsoft.hasTenantId}`);
  console.log();

  console.log('='.repeat(60));
  console.log('All examples completed successfully!');
  console.log('='.repeat(60));
  console.log();
  console.log('NOTE: This module simulates API calls for demonstration.');
  console.log('In production, integrate with actual Google and Microsoft APIs.');
}

// Run examples
runExamples().catch(error => {
  console.error('Error running examples:', error);
  process.exit(1);
});
