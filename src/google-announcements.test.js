/**
 * Tests for Google Announcements Module
 */

const GoogleAnnouncements = require('./google-announcements');

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

console.log('Running Google Announcements Tests...\n');

// Test 1: Constructor
test('should create GoogleAnnouncements instance', () => {
  const ga = new GoogleAnnouncements();
  if (!(ga instanceof GoogleAnnouncements)) {
    throw new Error('Failed to create instance');
  }
});

// Test 2: Constructor with config
test('should create instance with custom config', () => {
  const ga = new GoogleAnnouncements({
    apiKey: 'test-key',
    clientId: 'test-client-id'
  });
  const config = ga.getConfigInfo();
  if (!config.hasApiKey || !config.hasClientId) {
    throw new Error('Config not set properly');
  }
});

// Test 3: Create ownership announcement
test('should create ownership announcement', () => {
  const ga = new GoogleAnnouncements();
  const announcement = ga.createOwnershipAnnouncement({
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
  const ga = new GoogleAnnouncements();
  const announcement = {
    title: 'Test Announcement',
    content: 'Test content',
    owner: 'test-owner'
  };
  ga.validateAnnouncement(announcement);
});

// Test 5: Validate announcement - missing title
test('should reject announcement without title', () => {
  const ga = new GoogleAnnouncements();
  const announcement = {
    content: 'Test content',
    owner: 'test-owner'
  };
  
  try {
    ga.validateAnnouncement(announcement);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('title')) {
      throw error;
    }
  }
});

// Test 6: Validate announcement - missing content
test('should reject announcement without content', () => {
  const ga = new GoogleAnnouncements();
  const announcement = {
    title: 'Test',
    owner: 'test-owner'
  };
  
  try {
    ga.validateAnnouncement(announcement);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('content')) {
      throw error;
    }
  }
});

// Test 7: Validate announcement - missing owner
test('should reject announcement without owner', () => {
  const ga = new GoogleAnnouncements();
  const announcement = {
    title: 'Test',
    content: 'Test content'
  };
  
  try {
    ga.validateAnnouncement(announcement);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('owner')) {
      throw error;
    }
  }
});

// Test 8: Publish to Google Docs
test('should publish to Google Docs', async () => {
  const ga = new GoogleAnnouncements();
  const announcement = ga.createOwnershipAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  const result = await ga.publishToGoogleDocs(announcement);
  
  if (!result.success) {
    throw new Error('Publication failed');
  }
  
  if (result.platform !== 'Google Docs') {
    throw new Error('Wrong platform');
  }
  
  if (!result.documentId || !result.url) {
    throw new Error('Missing document info');
  }
});

// Test 9: Publish to Google Sheets
test('should publish to Google Sheets', async () => {
  const ga = new GoogleAnnouncements();
  const announcement = ga.createOwnershipAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  const result = await ga.publishToGoogleSheets(announcement);
  
  if (!result.success || result.platform !== 'Google Sheets') {
    throw new Error('Publication to Sheets failed');
  }
});

// Test 10: Publish to Google Drive
test('should publish to Google Drive', async () => {
  const ga = new GoogleAnnouncements();
  const announcement = ga.createOwnershipAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  const result = await ga.publishToGoogleDrive(announcement);
  
  if (!result.success || result.platform !== 'Google Drive') {
    throw new Error('Publication to Drive failed');
  }
});

// Test 11: Publish to all platforms
test('should publish to all Google platforms', async () => {
  const ga = new GoogleAnnouncements();
  const announcement = ga.createOwnershipAnnouncement({
    domain: 'ethereum.org',
    owner: 'kushmanmb'
  });
  
  const result = await ga.publishToAll(announcement);
  
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
  const ga = new GoogleAnnouncements();
  const announcement = ga.createOwnershipAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  await ga.publishToGoogleDocs(announcement);
  
  const announcements = ga.getAnnouncements();
  if (announcements.length === 0) {
    throw new Error('No announcements retrieved');
  }
});

// Test 13: Clear announcements
test('should clear announcements', async () => {
  const ga = new GoogleAnnouncements();
  const announcement = ga.createOwnershipAnnouncement({
    domain: 'test.org',
    owner: 'test-owner'
  });
  
  await ga.publishToGoogleDocs(announcement);
  ga.clearAnnouncements();
  
  const announcements = ga.getAnnouncements();
  if (announcements.length !== 0) {
    throw new Error('Announcements not cleared');
  }
});

// Test 14: Format ownership content
test('should format ownership content correctly', () => {
  const ga = new GoogleAnnouncements();
  const content = ga.formatOwnershipContent({
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
  const ga = new GoogleAnnouncements();
  
  try {
    ga.createOwnershipAnnouncement(null);
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('object')) {
      throw error;
    }
  }
});

// Test 16: Reject missing domain
test('should reject ownership announcement without domain', () => {
  const ga = new GoogleAnnouncements();
  
  try {
    ga.createOwnershipAnnouncement({
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
  const ga = new GoogleAnnouncements();
  
  try {
    ga.createOwnershipAnnouncement({
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
  const ga = new GoogleAnnouncements({
    apiKey: 'secret-key',
    clientId: 'secret-id'
  });
  
  const config = ga.getConfigInfo();
  
  if (config.apiKey) {
    throw new Error('Config exposed API key');
  }
  
  if (!config.hasApiKey) {
    throw new Error('Config should indicate API key presence');
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
