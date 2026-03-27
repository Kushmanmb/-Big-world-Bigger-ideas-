/**
 * Microsoft Announcements Example
 * 
 * Demonstrates how to use the Microsoft API announcements module
 * to publish ownership claims and announcements
 */

const MicrosoftAnnouncements = require('./microsoft-announcements');

async function runExamples() {
  console.log('='.repeat(60));
  console.log('Microsoft Announcements Module - Examples');
  console.log('='.repeat(60));
  console.log();

  // Example 1: Create instance
  console.log('Example 1: Creating MicrosoftAnnouncements instance');
  console.log('-'.repeat(60));
  const ma = new MicrosoftAnnouncements({
    clientId: 'your-azure-client-id',
    clientSecret: 'your-azure-client-secret',
    tenantId: 'your-azure-tenant-id'
  });
  console.log('✓ Instance created successfully');
  console.log();

  // Example 2: Create ownership announcement
  console.log('Example 2: Creating ownership announcement');
  console.log('-'.repeat(60));
  const ownershipData = {
    domain: 'ethereum.org',
    owner: 'kushmanmb',
    evidence: 'https://kushmanmb.org',
    description: 'Blockchain documentation and ownership claim',
    timestamp: new Date().toISOString()
  };
  
  const announcement = ma.createOwnershipAnnouncement(ownershipData);
  console.log('Announcement created:');
  console.log(`  Title: ${announcement.title}`);
  console.log(`  Owner: ${announcement.owner}`);
  console.log(`  Domain: ${announcement.domain}`);
  console.log(`  Timestamp: ${announcement.timestamp}`);
  console.log();

  // Example 3: Publish to OneDrive
  console.log('Example 3: Publishing to OneDrive');
  console.log('-'.repeat(60));
  const oneDriveResult = await ma.publishToOneDrive(announcement);
  console.log('✓ Published to OneDrive');
  console.log(`  File ID: ${oneDriveResult.fileId}`);
  console.log(`  URL: ${oneDriveResult.url}`);
  console.log(`  Published at: ${oneDriveResult.publishedAt}`);
  console.log();

  // Example 4: Publish to SharePoint
  console.log('Example 4: Publishing to SharePoint');
  console.log('-'.repeat(60));
  const sharePointResult = await ma.publishToSharePoint(announcement);
  console.log('✓ Published to SharePoint');
  console.log(`  List Item ID: ${sharePointResult.listItemId}`);
  console.log(`  URL: ${sharePointResult.url}`);
  console.log();

  // Example 5: Publish to Microsoft Teams
  console.log('Example 5: Publishing to Microsoft Teams');
  console.log('-'.repeat(60));
  const teamsResult = await ma.publishToTeams(announcement);
  console.log('✓ Published to Microsoft Teams');
  console.log(`  Message ID: ${teamsResult.messageId}`);
  console.log(`  URL: ${teamsResult.url}`);
  console.log();

  // Example 6: Publish to all platforms
  console.log('Example 6: Publishing to all Microsoft platforms');
  console.log('-'.repeat(60));
  
  const newAnnouncement = ma.createOwnershipAnnouncement({
    domain: 'my-blockchain-project.org',
    owner: 'project-owner',
    evidence: 'https://example.com/proof'
  });
  
  const allResults = await ma.publishToAll(newAnnouncement);
  console.log('✓ Published to all platforms');
  console.log(`  Platforms: ${allResults.platforms.join(', ')}`);
  console.log(`  Total results: ${allResults.results.length}`);
  console.log();

  // Example 7: Get all announcements
  console.log('Example 7: Retrieving all announcements');
  console.log('-'.repeat(60));
  const allAnnouncements = ma.getAnnouncements();
  console.log(`Total announcements: ${allAnnouncements.length}`);
  allAnnouncements.forEach((ann, index) => {
    console.log(`  ${index + 1}. ${ann.platform}: ${ann.announcement.title}`);
  });
  console.log();

  // Example 8: View formatted content
  console.log('Example 8: Viewing formatted announcement content');
  console.log('-'.repeat(60));
  const formattedContent = ma.formatOwnershipContent({
    domain: 'ethereum.org',
    owner: 'kushmanmb',
    evidence: 'https://kushmanmb.org',
    description: 'Complete blockchain ownership documentation',
    timestamp: new Date().toISOString()
  });
  console.log(formattedContent);
  console.log();

  // Example 9: Get configuration info
  console.log('Example 9: Getting configuration info');
  console.log('-'.repeat(60));
  const configInfo = ma.getConfigInfo();
  console.log('Configuration status:');
  console.log(`  Has Client ID: ${configInfo.hasClientId}`);
  console.log(`  Has Client Secret: ${configInfo.hasClientSecret}`);
  console.log(`  Has Tenant ID: ${configInfo.hasTenantId}`);
  console.log(`  Note: ${configInfo.note}`);
  console.log();

  console.log('='.repeat(60));
  console.log('All examples completed successfully!');
  console.log('='.repeat(60));
}

// Run examples
runExamples().catch(error => {
  console.error('Error running examples:', error);
  process.exit(1);
});
