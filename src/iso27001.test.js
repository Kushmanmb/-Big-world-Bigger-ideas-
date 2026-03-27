/**
 * Tests for ISO/IEC 27001:2013 Certification Fetcher
 */

const ISO27001Fetcher = require('./iso27001.js');
const { test, testAsync, assertEqual, assertNotNull, assertThrows, printSummary } = require('./test-helpers');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('\n=== ISO27001 Fetcher Tests ===\n');

// Constructor Tests
test('should create fetcher with valid owner', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  assert(fetcher.owner === 'kushmanmb', 'Owner should be set correctly');
});

test('should throw error without owner', () => {
  try {
    new ISO27001Fetcher();
    throw new Error('Should have thrown an error');
  } catch (error) {
    assert(error.message.includes('required'), 'Should throw error about required owner');
  }
});

test('should throw error with invalid owner type', () => {
  try {
    new ISO27001Fetcher(123);
    throw new Error('Should have thrown an error');
  } catch (error) {
    assert(error.message.includes('string'), 'Should throw error about string type');
  }
});

// Certification Info Tests
test('should get certification info', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const info = fetcher.getCertificationInfo();
  
  assert(info.standard === 'ISO/IEC 27001:2013', 'Standard should be correct');
  assert(info.owner === 'kushmanmb', 'Owner should be correct');
  assert(info.version === '2013', 'Version should be correct');
  assert(Array.isArray(info.scope), 'Scope should be an array');
  assert(Array.isArray(info.clauses), 'Clauses should be an array');
  assert(Array.isArray(info.benefits), 'Benefits should be an array');
  assert(Array.isArray(info.complianceAreas), 'Compliance areas should be an array');
});

test('should have 7 standard clauses', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const info = fetcher.getCertificationInfo();
  
  assert(info.clauses.length === 7, 'Should have 7 clauses (4-10)');
  assert(info.clauses[0].number === '4', 'First clause should be 4');
  assert(info.clauses[6].number === '10', 'Last clause should be 10');
});

test('should have 14 control domains', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const info = fetcher.getCertificationInfo();
  
  assert(info.controls.totalControls === 114, 'Should have 114 total controls');
  assert(info.controls.domains.length === 14, 'Should have 14 control domains');
});

// Compliance Status Tests
test('should get compliance status', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const status = fetcher.getComplianceStatus();
  
  assert(status.owner === 'kushmanmb', 'Owner should be correct');
  assert(typeof status.totalControls === 'number', 'Total controls should be a number');
  assert(typeof status.implementedControls === 'number', 'Implemented controls should be a number');
  assert(typeof status.percentage === 'number', 'Percentage should be a number');
  assert(status.percentage >= 0 && status.percentage <= 100, 'Percentage should be 0-100');
  assert(typeof status.status === 'string', 'Status should be a string');
});

test('should calculate correct compliance percentage', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const status = fetcher.getComplianceStatus();
  
  const expectedPercentage = Math.round((status.implementedControls / status.totalControls) * 100);
  assert(status.percentage === expectedPercentage, 'Percentage should be calculated correctly');
});

// Control Status Tests
test('should get detailed control status', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const controlStatus = fetcher.getControlStatus();
  
  assert(controlStatus.owner === 'kushmanmb', 'Owner should be correct');
  assert(controlStatus.standard === 'ISO/IEC 27001:2013', 'Standard should be correct');
  assert(Array.isArray(controlStatus.domains), 'Domains should be an array');
  assert(controlStatus.summary, 'Should have summary object');
  assert(typeof controlStatus.summary.fullyImplemented === 'number', 'Should have fully implemented count');
});

// Formatting Tests
test('should format certification info', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const formatted = fetcher.formatCertificationInfo();
  
  assert(typeof formatted === 'string', 'Should return a string');
  assert(formatted.includes('ISO/IEC 27001:2013'), 'Should include standard name');
  assert(formatted.includes('kushmanmb'), 'Should include owner');
  assert(formatted.includes('Compliance Status'), 'Should include compliance status');
});

test('should generate compliance report', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const report = fetcher.generateComplianceReport();
  
  assert(typeof report === 'string', 'Should return a string');
  assert(report.includes('COMPLIANCE REPORT'), 'Should include report title');
  assert(report.includes('EXECUTIVE SUMMARY'), 'Should include executive summary');
  assert(report.includes('CONTROL DOMAINS STATUS'), 'Should include control domains');
  assert(report.includes('RECOMMENDATIONS'), 'Should include recommendations');
});

// Cache Tests
test('should cache certification info', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const info1 = fetcher.getCertificationInfo();
  const info2 = fetcher.getCertificationInfo();
  
  assert(info1 === info2, 'Should return same cached object');
});

test('should clear cache', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  fetcher.getCertificationInfo();
  
  const stats1 = fetcher.getCacheStats();
  assert(stats1.size > 0, 'Cache should have entries');
  
  fetcher.clearCache();
  const stats2 = fetcher.getCacheStats();
  assert(stats2.size === 0, 'Cache should be empty after clearing');
});

test('should get cache stats', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  fetcher.getCertificationInfo();
  
  const stats = fetcher.getCacheStats();
  assert(typeof stats.size === 'number', 'Should have size');
  assert(typeof stats.timeout === 'number', 'Should have timeout');
  assert(Array.isArray(stats.entries), 'Should have entries array');
});

// Compliance Areas Tests
test('should have repository-specific compliance areas', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const info = fetcher.getCertificationInfo();
  
  assert(info.complianceAreas.length > 0, 'Should have compliance areas');
  
  const hasStatus = info.complianceAreas.every(area => 
    area.status === 'Compliant' || area.status === 'In Progress'
  );
  assert(hasStatus, 'All areas should have valid status');
  
  const hasDescription = info.complianceAreas.every(area => 
    area.description && area.description.length > 0
  );
  assert(hasDescription, 'All areas should have descriptions');
});

// Benefits Tests
test('should have at least 5 benefits', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const info = fetcher.getCertificationInfo();
  
  assert(info.benefits.length >= 5, 'Should have at least 5 benefits');
  assert(info.benefits.every(b => typeof b === 'string'), 'All benefits should be strings');
});

// Dates Tests
test('should have valid dates', () => {
  const fetcher = new ISO27001Fetcher('kushmanmb');
  const info = fetcher.getCertificationInfo();
  
  const lastUpdated = new Date(info.lastUpdated);
  const nextReview = new Date(info.nextReview);
  
  assert(!isNaN(lastUpdated.getTime()), 'Last updated should be valid date');
  assert(!isNaN(nextReview.getTime()), 'Next review should be valid date');
  assert(nextReview > lastUpdated, 'Next review should be after last updated');
});

printSummary();
