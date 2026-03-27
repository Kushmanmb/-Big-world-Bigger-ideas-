/**
 * Google Announcements Example
 * 
 * Demonstrates how to use the Google API announcements module
 * to publish ownership claims and announcements
 */

const GoogleAnnouncements = require('./google-announcements');

async function runExamples() {
  console.log('='.repeat(60));
  console.log('Google Announcements Module - Examples');
  console.log('='.repeat(60));
  console.log();

  // Example 1: Create instance
  console.log('Example 1: Creating GoogleAnnouncements instance');
  console.log('-'.repeat(60));
  const ga = new GoogleAnnouncements({
    apiKey: 'your-google-api-key',
    clientId: 'your-client-id'
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
  
  const announcement = ga.createOwnershipAnnouncement(ownershipData);
  console.log('Announcement created:');
  console.log(`  Title: ${announcement.title}`);
  console.log(`  Owner: ${announcement.owner}`);
  console.log(`  Domain: ${announcement.domain}`);
  console.log(`  Timestamp: ${announcement.timestamp}`);
  console.log();

  // Example 3: Publish to Google Docs
  console.log('Example 3: Publishing to Google Docs');
  console.log('-'.repeat(60));
  const docsResult = await ga.publishToGoogleDocs(announcement);
  console.log('✓ Published to Google Docs');
  console.log(`  Document ID: ${docsResult.documentId}`);
  console.log(`  URL: ${docsResult.url}`);
  console.log(`  Published at: ${docsResult.publishedAt}`);
  console.log();

  // Example 4: Publish to Google Sheets
  console.log('Example 4: Publishing to Google Sheets');
  console.log('-'.repeat(60));
  const sheetsResult = await ga.publishToGoogleSheets(announcement);
  console.log('✓ Published to Google Sheets');
  console.log(`  Spreadsheet ID: ${sheetsResult.spreadsheetId}`);
  console.log(`  URL: ${sheetsResult.url}`);
  console.log();

  // Example 5: Publish to Google Drive
  console.log('Example 5: Publishing to Google Drive');
  console.log('-'.repeat(60));
  const driveResult = await ga.publishToGoogleDrive(announcement);
  console.log('✓ Published to Google Drive');
  console.log(`  File ID: ${driveResult.fileId}`);
  console.log(`  URL: ${driveResult.url}`);
  console.log();

  // Example 6: Publish to all platforms
  console.log('Example 6: Publishing to all Google platforms');
  console.log('-'.repeat(60));
  
  const newAnnouncement = ga.createOwnershipAnnouncement({
    domain: 'my-blockchain-project.org',
    owner: 'project-owner',
    evidence: 'https://example.com/proof'
  });
  
  const allResults = await ga.publishToAll(newAnnouncement);
  console.log('✓ Published to all platforms');
  console.log(`  Platforms: ${allResults.platforms.join(', ')}`);
  console.log(`  Total results: ${allResults.results.length}`);
  console.log();

  // Example 7: Get all announcements
  console.log('Example 7: Retrieving all announcements');
  console.log('-'.repeat(60));
  const allAnnouncements = ga.getAnnouncements();
  console.log(`Total announcements: ${allAnnouncements.length}`);
  allAnnouncements.forEach((ann, index) => {
    console.log(`  ${index + 1}. ${ann.platform}: ${ann.announcement.title}`);
  });
  console.log();

  // Example 8: View formatted content
  console.log('Example 8: Viewing formatted announcement content');
  console.log('-'.repeat(60));
  const formattedContent = ga.formatOwnershipContent({
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
  const configInfo = ga.getConfigInfo();
  console.log('Configuration status:');
  console.log(`  Has API Key: ${configInfo.hasApiKey}`);
  console.log(`  Has Client ID: ${configInfo.hasClientId}`);
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
