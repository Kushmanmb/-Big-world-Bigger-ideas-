/**
 * Tests for Ownership Announcements Coordinator Module
 */

const OwnershipAnnouncements = require('./ownership-announcements');

// Test helper
let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passedTests++;
  } catch (error) {
    console.log(`✗ ${description}`);
    console.log(`  Error: ${error.message}`);
    failedTests++;
  }
}

console.log('Running Ownership Announcements Coordinator Tests...\n');

// Test 1: Constructor
test('should create OwnershipAnnouncements instance', () => {
  const oa = new OwnershipAnnouncements();
  if (!(oa instanceof OwnershipAnnouncements)) {
    throw new Error('Failed to create instance');
  }
});

// Test 2: Constructor with config
test('should create instance with custom config', () => {
  const oa = new OwnershipAnnouncements({
    google: { apiKey: 'test-google-key' },
    microsoft: { clientId: 'test-microsoft-id' }
  });
  const status = oa.getConfigStatus();
  if (!status.google.hasApiKey || !status.microsoft.hasClientId) {
    throw new Error('Config not set properly');
  }
});

// Test 3: Validate Ethereum address - valid with 0x
test('should validate Ethereum address with 0x prefix', () => {
  const oa = new OwnershipAnnouncements();
  const valid = oa.isValidEthereumAddress('0x1234567890123456789012345678901234567890');
  if (!valid) {
    throw new Error('Valid address rejected');
  }
});

// Test 4: Validate Ethereum address - valid without 0x
test('should validate Ethereum address without 0x prefix', () => {
  const oa = new OwnershipAnnouncements();
  const valid = oa.isValidEthereumAddress('1234567890123456789012345678901234567890');
  if (!valid) {
    throw new Error('Valid address rejected');
  }
});

// Test 5: Validate Ethereum address - invalid
test('should reject invalid Ethereum address', () => {
  const oa = new OwnershipAnnouncements();
  const valid = oa.isValidEthereumAddress('invalid');
  if (valid) {
    throw new Error('Invalid address accepted');
  }
});

// Test 6: Validate Ethereum address - too short
test('should reject Ethereum address that is too short', () => {
  const oa = new OwnershipAnnouncements();
  const valid = oa.isValidEthereumAddress('0x1234');
  if (valid) {
    throw new Error('Short address accepted');
  }
});

// Test 7: Create ownership announcement
test('should create ownership announcement', () => {
  const oa = new OwnershipAnnouncements();
  const announcement = oa.createOwnershipAnnouncement({
    domain: 'ethereum.org',
    owner: 'kushmanmb',
    evidence: 'https://kushmanmb.org'
  });
  
  if (!announcement.title || !announcement.domain || !announcement.owner) {
    throw new Error('Announcement missing required fields');
  }
  
  if (!announcement.announcementId) {
    throw new Error('Missing announcement ID');
  }
});

// Test 8: Create ownership announcement with Ethereum address
test('should create ownership announcement with Ethereum address', () => {
  const oa = new OwnershipAnnouncements();
  const announcement = oa.createOwnershipAnnouncement({
    domain: 'test.org',
    owner: 'test-owner',
    ethereumAddress: '0x1234567890123456789012345678901234567890'
  });
  
  if (!announcement.ethereumAddress) {
    throw new Error('Ethereum address not set');
  }
});

// Test 9: Reject invalid Ethereum address
test('should reject invalid Ethereum address in announcement', () => {
  const oa = new OwnershipAnnouncements();
  
  try {
    oa.createOwnershipAnnouncement({
      domain: 'test.org',
      owner: 'test-owner',
      ethereumAddress: 'invalid'
    });
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('Invalid Ethereum address')) {
      throw error;
    }
  }
});

// Test 10: Reject announcement without domain
test('should reject announcement without domain', () => {
  const oa = new OwnershipAnnouncements();
  
  try {
    oa.createOwnershipAnnouncement({
      owner: 'test-owner'
    });
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('Domain')) {
      throw error;
    }
  }
});

// Test 11: Reject announcement without owner
test('should reject announcement without owner', () => {
  const oa = new OwnershipAnnouncements();
  
  try {
    oa.createOwnershipAnnouncement({
      domain: 'test.org'
    });
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('Owner')) {
      throw error;
    }
  }
});

// Test 12: Publish global announcement
test('should publish global announcement', async () => {
  const oa = new OwnershipAnnouncements();
  const result = await oa.publishGlobalAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  if (!result.success) {
    throw new Error('Publication failed');
  }
  
  if (!result.announcementId) {
    throw new Error('Missing announcement ID');
  }
  
  if (result.totalPlatforms !== 6) {
    throw new Error('Expected 6 platforms');
  }
});

// Test 13: Announce ethereum.org ownership
test('should announce ethereum.org ownership via kushmanmb', async () => {
  const oa = new OwnershipAnnouncements();
  const result = await oa.announceEthereumOrgOwnership();
  
  if (!result.success) {
    throw new Error('Announcement failed');
  }
  
  if (result.domain !== 'ethereum.org') {
    throw new Error('Wrong domain');
  }
  
  if (result.owner !== 'kushmanmb') {
    throw new Error('Wrong owner');
  }
});

// Test 14: Announce ethereum.org with custom data
test('should announce ethereum.org with additional data', async () => {
  const oa = new OwnershipAnnouncements();
  const result = await oa.announceEthereumOrgOwnership({
    evidence: 'https://custom-evidence.com',
    ethereumAddress: '0x1234567890123456789012345678901234567890'
  });
  
  if (!result.success) {
    throw new Error('Announcement failed');
  }
  
  if (!result.platforms.google || !result.platforms.microsoft) {
    throw new Error('Missing platform results');
  }
});

// Test 15: Get global announcements
test('should retrieve global announcements', async () => {
  const oa = new OwnershipAnnouncements();
  await oa.publishGlobalAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  const announcements = oa.getGlobalAnnouncements();
  if (announcements.length === 0) {
    throw new Error('No announcements retrieved');
  }
});

// Test 16: Get announcement by ID
test('should retrieve announcement by ID', async () => {
  const oa = new OwnershipAnnouncements();
  const result = await oa.publishGlobalAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  const announcement = oa.getAnnouncementById(result.announcementId);
  if (!announcement) {
    throw new Error('Announcement not found');
  }
  
  if (announcement.announcementId !== result.announcementId) {
    throw new Error('Wrong announcement returned');
  }
});

// Test 17: Get announcements by domain
test('should retrieve announcements by domain', async () => {
  const oa = new OwnershipAnnouncements();
  await oa.publishGlobalAnnouncement({
    domain: 'specific-domain.org',
    owner: 'test-owner'
  });
  
  const announcements = oa.getAnnouncementsByDomain('specific-domain.org');
  if (announcements.length === 0) {
    throw new Error('No announcements found for domain');
  }
  
  if (announcements[0].domain !== 'specific-domain.org') {
    throw new Error('Wrong domain in results');
  }
});

// Test 18: Get announcements by owner
test('should retrieve announcements by owner', async () => {
  const oa = new OwnershipAnnouncements();
  await oa.publishGlobalAnnouncement({
    domain: 'test.org',
    owner: 'specific-owner'
  });
  
  const announcements = oa.getAnnouncementsByOwner('specific-owner');
  if (announcements.length === 0) {
    throw new Error('No announcements found for owner');
  }
  
  if (announcements[0].owner !== 'specific-owner') {
    throw new Error('Wrong owner in results');
  }
});

// Test 19: Get statistics
test('should retrieve statistics', async () => {
  const oa = new OwnershipAnnouncements();
  await oa.publishGlobalAnnouncement({
    domain: 'test1.org',
    owner: 'owner1'
  });
  await oa.publishGlobalAnnouncement({
    domain: 'test2.org',
    owner: 'owner2'
  });
  
  const stats = oa.getStatistics();
  
  if (stats.totalAnnouncements < 2) {
    throw new Error('Incorrect total announcements');
  }
  
  if (!stats.domains || !stats.owners) {
    throw new Error('Missing domain/owner lists');
  }
});

// Test 20: Clear all announcements
test('should clear all announcements', async () => {
  const oa = new OwnershipAnnouncements();
  await oa.publishGlobalAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  oa.clearAllAnnouncements();
  
  const announcements = oa.getGlobalAnnouncements();
  if (announcements.length !== 0) {
    throw new Error('Announcements not cleared');
  }
});

// Test 21: Create publication summary
test('should create publication summary', () => {
  const oa = new OwnershipAnnouncements();
  const googleResults = {
    results: [
      { success: true, platform: 'Google Docs', url: 'url1' },
      { success: true, platform: 'Google Sheets', url: 'url2' }
    ]
  };
  const microsoftResults = {
    results: [
      { success: true, platform: 'OneDrive', url: 'url3' }
    ]
  };
  
  const summary = oa.createPublicationSummary(googleResults, microsoftResults);
  
  if (summary.totalPublications !== 3) {
    throw new Error('Wrong total publications');
  }
  
  if (summary.successfulPublications !== 3) {
    throw new Error('Wrong successful publications count');
  }
});

// Test 22: Get config status
test('should get configuration status', () => {
  const oa = new OwnershipAnnouncements({
    google: { apiKey: 'test-key' },
    microsoft: { clientId: 'test-id' }
  });
  
  const status = oa.getConfigStatus();
  
  if (!status.google || !status.microsoft) {
    throw new Error('Missing config status');
  }
});

console.log('\n' + '='.repeat(50));
console.log(`Tests Passed: ${passedTests}`);
console.log(`Tests Failed: ${failedTests}`);
console.log('='.repeat(50));

if (failedTests === 0) {
  console.log('\n✅ All tests passed!');
} else {
  console.log(`\n❌ ${failedTests} test(s) failed`);
  process.exit(1);
}
