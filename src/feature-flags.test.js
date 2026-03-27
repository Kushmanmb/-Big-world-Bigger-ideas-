/**
 * Test suite for Feature Flags functionality
 */

const fs = require('fs');
const path = require('path');
const featureFlags = require('./feature-flags');
const { test, testAsync, assertEqual, assertNotNull, assertThrows, printSummary } = require('./test-helpers');

const TEST_FLAGS_FILE = path.join(__dirname, '..', 'feature-flags.json');
const BACKUP_FILE = TEST_FLAGS_FILE + '.backup';

// Setup: Backup existing feature flags file if it exists
function setup() {
  if (fs.existsSync(TEST_FLAGS_FILE)) {
    fs.copyFileSync(TEST_FLAGS_FILE, BACKUP_FILE);
  }
  // Reset to clean state
  fs.writeFileSync(TEST_FLAGS_FILE, JSON.stringify({ flags: {}, lastUpdated: null }, null, 2));
}

// Teardown: Restore backup
function teardown() {
  if (fs.existsSync(BACKUP_FILE)) {
    fs.copyFileSync(BACKUP_FILE, TEST_FLAGS_FILE);
    fs.unlinkSync(BACKUP_FILE);
  }
}

console.log('Running Feature Flags Tests...\n');

setup();

// Test 1: Set a feature flag
test('should set a feature flag to true', () => {
  const result = featureFlags.setFlag('test_feature', true);
  
  assertNotNull(result, 'Result should not be null');
  assertEqual(result.flags.test_feature.enabled, true, 'Flag should be enabled');
  assertNotNull(result.flags.test_feature.updatedAt, 'UpdatedAt should be set');
});

// Test 2: Get a feature flag
test('should get a feature flag value', () => {
  featureFlags.setFlag('get_test', true);
  const value = featureFlags.getFlag('get_test');
  
  assertEqual(value, true, 'Flag value should be true');
});

// Test 3: Get non-existent flag returns false
test('should return false for non-existent flag', () => {
  const value = featureFlags.getFlag('non_existent_flag');
  
  assertEqual(value, false, 'Non-existent flag should return false');
});

// Test 4: Set a feature flag to false
test('should set a feature flag to false', () => {
  featureFlags.setFlag('disabled_feature', false);
  const value = featureFlags.getFlag('disabled_feature');
  
  assertEqual(value, false, 'Flag should be disabled');
});

// Test 5: List all feature flags
test('should list all feature flags', () => {
  featureFlags.setFlag('flag1', true);
  featureFlags.setFlag('flag2', false);
  
  const flags = featureFlags.listFlags();
  
  assertNotNull(flags, 'Flags list should not be null');
  assertNotNull(flags.flags, 'Flags object should exist');
  assertEqual(flags.flags.flag1.enabled, true, 'Flag1 should be enabled');
  assertEqual(flags.flags.flag2.enabled, false, 'Flag2 should be disabled');
});

// Test 6: Check if flag exists
test('should check if a flag exists', () => {
  featureFlags.setFlag('existing_flag', true);
  
  assertEqual(featureFlags.hasFlag('existing_flag'), true, 'Flag should exist');
  assertEqual(featureFlags.hasFlag('non_existing_flag'), false, 'Flag should not exist');
});

// Test 7: Remove a feature flag
test('should remove a feature flag', () => {
  featureFlags.setFlag('removable_flag', true);
  assertEqual(featureFlags.hasFlag('removable_flag'), true, 'Flag should exist before removal');
  
  featureFlags.removeFlag('removable_flag');
  assertEqual(featureFlags.hasFlag('removable_flag'), false, 'Flag should not exist after removal');
});

// Test 8: Invalid flag name should throw error
test('should throw error for empty flag name', () => {
  assertThrows(() => featureFlags.setFlag('', true), 'non-empty string');
});

// Test 9: Invalid flag value should throw error
test('should throw error for non-boolean value', () => {
  assertThrows(() => featureFlags.setFlag('test', 'invalid'), 'must be a boolean');
});

// Test 10: Update existing flag
test('should update existing flag value', () => {
  featureFlags.setFlag('update_test', true);
  assertEqual(featureFlags.getFlag('update_test'), true, 'Flag should be true initially');
  
  featureFlags.setFlag('update_test', false);
  assertEqual(featureFlags.getFlag('update_test'), false, 'Flag should be false after update');
});

// Test 11: LastUpdated timestamp should be set
test('should set lastUpdated timestamp', () => {
  const result = featureFlags.setFlag('timestamp_test', true);
  
  assertNotNull(result.lastUpdated, 'lastUpdated should be set');
});

// Test 12: Multiple flags can coexist
test('should support multiple flags', () => {
  featureFlags.setFlag('multi_flag_1', true);
  featureFlags.setFlag('multi_flag_2', false);
  featureFlags.setFlag('multi_flag_3', true);
  
  assertEqual(featureFlags.getFlag('multi_flag_1'), true, 'Flag 1 should be true');
  assertEqual(featureFlags.getFlag('multi_flag_2'), false, 'Flag 2 should be false');
  assertEqual(featureFlags.getFlag('multi_flag_3'), true, 'Flag 3 should be true');
});

teardown();

printSummary();
