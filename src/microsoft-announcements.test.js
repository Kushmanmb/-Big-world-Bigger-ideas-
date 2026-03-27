/**
 * Tests for Microsoft Announcements Module
 */

const MicrosoftAnnouncements = require('./microsoft-announcements');

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

console.log('Running Microsoft Announcements Tests...\n');

// Test 1: Constructor
test('should create MicrosoftAnnouncements instance', () => {
  const ma = new MicrosoftAnnouncements();
  if (!(ma instanceof MicrosoftAnnouncements)) {
    throw new Error('Failed to create instance');
  }
});

// Test 2: Constructor with config
test('should create instance with custom config', () => {
  const ma = new MicrosoftAnnouncements({
    clientId: 'test-client-id',
    clientSecret: 'test-secret'
  });
  const config = ma.getConfigInfo();
  if (!config.hasClientId || !config.hasClientSecret) {
    throw new Error('Config not set properly');
  }
});

// Test 3: Create ownership announcement
test('should create ownership announcement', () => {
  const ma = new MicrosoftAnnouncements();
  const announcement = ma.createOwnershipAnnouncement({
    domain: 'ethereum.org',
    owner: 'kushmanmb',
    evidence: 'https://kushmanmb.org'
  });
  
  if (!announcement.title || !announcement.content || !announcement.owner) {
    throw new Error('Announcement missing required fields');
  }
  
  if (announcement.domain !== 'ethereum.org') {
    throw new Error('Domain not set correctly');
  }
});

// Test 4: Validate announcement - valid
test('should validate valid announcement', () => {
  const ma = new MicrosoftAnnouncements();
  const announcement = {
    title: 'Test Announcement',
    content: 'Test content',
    owner: 'test-owner'
  };
  ma.validateAnnouncement(announcement);
});

// Test 5: Validate announcement - missing title
test('should reject announcement without title', () => {
  const ma = new MicrosoftAnnouncements();
  const announcement = {
    content: 'Test content',
    owner: 'test-owner'
  };
  
  try {
    ma.validateAnnouncement(announcement);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('title')) {
      throw error;
    }
  }
});

// Test 6: Validate announcement - missing content
test('should reject announcement without content', () => {
  const ma = new MicrosoftAnnouncements();
  const announcement = {
    title: 'Test',
    owner: 'test-owner'
  };
  
  try {
    ma.validateAnnouncement(announcement);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('content')) {
      throw error;
    }
  }
});

// Test 7: Validate announcement - missing owner
test('should reject announcement without owner', () => {
  const ma = new MicrosoftAnnouncements();
  const announcement = {
    title: 'Test',
    content: 'Test content'
  };
  
  try {
    ma.validateAnnouncement(announcement);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('owner')) {
      throw error;
    }
  }
});

// Test 8: Publish to OneDrive
test('should publish to OneDrive', async () => {
  const ma = new MicrosoftAnnouncements();
  const announcement = ma.createOwnershipAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  const result = await ma.publishToOneDrive(announcement);
  
  if (!result.success) {
    throw new Error('Publication failed');
  }
  
  if (result.platform !== 'OneDrive') {
    throw new Error('Wrong platform');
  }
  
  if (!result.fileId || !result.url) {
    throw new Error('Missing file info');
  }
});

// Test 9: Publish to SharePoint
test('should publish to SharePoint', async () => {
  const ma = new MicrosoftAnnouncements();
  const announcement = ma.createOwnershipAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  const result = await ma.publishToSharePoint(announcement);
  
  if (!result.success || result.platform !== 'SharePoint') {
    throw new Error('Publication to SharePoint failed');
  }
});

// Test 10: Publish to Teams
test('should publish to Microsoft Teams', async () => {
  const ma = new MicrosoftAnnouncements();
  const announcement = ma.createOwnershipAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  const result = await ma.publishToTeams(announcement);
  
  if (!result.success || result.platform !== 'Microsoft Teams') {
    throw new Error('Publication to Teams failed');
  }
});

// Test 11: Publish to all platforms
test('should publish to all Microsoft platforms', async () => {
  const ma = new MicrosoftAnnouncements();
  const announcement = ma.createOwnershipAnnouncement({
    domain: 'ethereum.org',
    owner: 'kushmanmb'
  });
  
  const result = await ma.publishToAll(announcement);
  
  if (!result.success) {
    throw new Error('Publication to all failed');
  }
  
  if (result.results.length !== 3) {
    throw new Error('Expected 3 platform results');
  }
  
  if (result.platforms.length !== 3) {
    throw new Error('Expected 3 platforms');
  }
});

// Test 12: Get announcements
test('should retrieve announcements', async () => {
  const ma = new MicrosoftAnnouncements();
  const announcement = ma.createOwnershipAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  await ma.publishToOneDrive(announcement);
  
  const announcements = ma.getAnnouncements();
  if (announcements.length === 0) {
    throw new Error('No announcements retrieved');
  }
});

// Test 13: Clear announcements
test('should clear announcements', async () => {
  const ma = new MicrosoftAnnouncements();
  const announcement = ma.createOwnershipAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  await ma.publishToOneDrive(announcement);
  ma.clearAnnouncements();
  
  const announcements = ma.getAnnouncements();
  if (announcements.length !== 0) {
    throw new Error('Announcements not cleared');
  }
});

// Test 14: Format ownership content
test('should format ownership content correctly', () => {
  const ma = new MicrosoftAnnouncements();
  const content = ma.formatOwnershipContent({
    domain: 'ethereum.org',
    owner: 'kushmanmb',
    evidence: 'https://test.com',
    timestamp: '2026-02-25T00:00:00.000Z'
  });
  
  if (!content.includes('ethereum.org')) {
    throw new Error('Domain not in content');
  }
  
  if (!content.includes('kushmanmb')) {
    throw new Error('Owner not in content');
  }
  
  if (!content.includes('BLOCKCHAIN OWNERSHIP ANNOUNCEMENT')) {
    throw new Error('Title not in content');
  }
});

// Test 15: Reject invalid ownership data
test('should reject invalid ownership data', () => {
  const ma = new MicrosoftAnnouncements();
  
  try {
    ma.createOwnershipAnnouncement(null);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('object')) {
      throw error;
    }
  }
});

// Test 16: Reject missing domain
test('should reject ownership announcement without domain', () => {
  const ma = new MicrosoftAnnouncements();
  
  try {
    ma.createOwnershipAnnouncement({
      owner: 'test'
    });
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('Domain')) {
      throw error;
    }
  }
});

// Test 17: Reject missing owner
test('should reject ownership announcement without owner', () => {
  const ma = new MicrosoftAnnouncements();
  
  try {
    ma.createOwnershipAnnouncement({
      domain: 'test.org'
    });
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('Owner')) {
      throw error;
    }
  }
});

// Test 18: Get config info
test('should get config info without exposing secrets', () => {
  const ma = new MicrosoftAnnouncements({
    clientId: 'secret-id',
    clientSecret: 'secret'
  });
  
  const config = ma.getConfigInfo();
  
  if (config.clientSecret) {
    throw new Error('Config exposed client secret');
  }
  
  if (!config.hasClientSecret) {
    throw new Error('Config should indicate client secret presence');
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
