/**
 * Tests for Skill Module
 */

const SkillFetcher = require('./skill.js');
const { test, assertEqual, assertNotNull, assertThrows, printSummary } = require('./test-helpers');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('🧪 Running Skill Module Tests...\n');
console.log('='.repeat(60));

// Test 1: Constructor with default owner
test('Constructor with default owner should work', () => {
  const fetcher = new SkillFetcher();
  assertEqual(fetcher.owner, 'Anonymous', 'Default owner should be "Anonymous"');
  assertEqual(fetcher.skills.size, 0, 'Initial skills map should be empty');
});

// Test 2: Constructor with custom owner
test('Constructor with custom owner should work', () => {
  const fetcher = new SkillFetcher('Alice');
  assertEqual(fetcher.owner, 'Alice', 'Owner should be "Alice"');
});

// Test 3: Constructor with invalid owner should throw
test('Constructor with empty owner should throw', () => {
  assertThrows(() => new SkillFetcher(''), 'non-empty string');
});

// Test 4: Constructor with non-string owner should throw
test('Constructor with non-string owner should throw', () => {
  assertThrows(() => new SkillFetcher(null), 'non-empty string');
  assertThrows(() => new SkillFetcher(123), 'non-empty string');
});

// Test 5: addSkill with valid parameters
test('addSkill() with valid parameters should add a skill', () => {
  const fetcher = new SkillFetcher('Bob');
  const skill = fetcher.addSkill('Solidity', 'advanced', 'smart_contracts', 'EVM smart contract language');
  assertEqual(skill.name, 'Solidity', 'Skill name should be "Solidity"');
  assertEqual(skill.level, 'advanced', 'Skill level should be "advanced"');
  assertEqual(skill.category, 'smart_contracts', 'Skill category should be "smart_contracts"');
  assertEqual(skill.description, 'EVM smart contract language', 'Description should match');
  assertEqual(fetcher.skills.size, 1, 'Skills map should have 1 entry');
});

// Test 6: addSkill without description
test('addSkill() without description should use empty string', () => {
  const fetcher = new SkillFetcher('Carol');
  const skill = fetcher.addSkill('Ethereum', 'intermediate', 'blockchain');
  assertEqual(skill.description, '', 'Description should default to empty string');
});

// Test 7: addSkill with invalid name should throw
test('addSkill() with invalid name should throw', () => {
  const fetcher = new SkillFetcher('Dave');
  assertThrows(() => fetcher.addSkill('', 'beginner', 'blockchain'), 'non-empty string');
  assertThrows(() => fetcher.addSkill(null, 'beginner', 'blockchain'), 'non-empty string');
});

// Test 8: addSkill with invalid level should throw
test('addSkill() with invalid level should throw', () => {
  const fetcher = new SkillFetcher('Eve');
  assertThrows(() => fetcher.addSkill('Bitcoin', 'master', 'blockchain'), 'one of:');
  assertThrows(() => fetcher.addSkill('Bitcoin', '', 'blockchain'), 'one of:');
});

// Test 9: addSkill with invalid category should throw
test('addSkill() with invalid category should throw', () => {
  const fetcher = new SkillFetcher('Frank');
  assertThrows(() => fetcher.addSkill('Bitcoin', 'beginner', ''), 'non-empty string');
  assertThrows(() => fetcher.addSkill('Bitcoin', 'beginner', null), 'non-empty string');
});

// Test 10: getSkill returns skill by name
test('getSkill() should return skill by name', () => {
  const fetcher = new SkillFetcher('Grace');
  fetcher.addSkill('Bitcoin', 'expert', 'blockchain');
  const skill = fetcher.getSkill('Bitcoin');
  assertNotNull(skill, 'Skill should be found');
  assertEqual(skill.name, 'Bitcoin', 'Skill name should be "Bitcoin"');
});

// Test 11: getSkill is case-insensitive
test('getSkill() should be case-insensitive', () => {
  const fetcher = new SkillFetcher('Heidi');
  fetcher.addSkill('Solidity', 'advanced', 'smart_contracts');
  assertNotNull(fetcher.getSkill('SOLIDITY'), 'Uppercase lookup should work');
  assertNotNull(fetcher.getSkill('solidity'), 'Lowercase lookup should work');
  assertNotNull(fetcher.getSkill('SoLiDiTy'), 'Mixed case lookup should work');
});

// Test 12: getSkill returns null for unknown skill
test('getSkill() should return null for unknown skill', () => {
  const fetcher = new SkillFetcher('Ivan');
  const result = fetcher.getSkill('UnknownSkill');
  assertEqual(result, null, 'Should return null for unknown skill');
});

// Test 13: addSkill updates existing skill
test('addSkill() should update an existing skill', () => {
  const fetcher = new SkillFetcher('Judy');
  fetcher.addSkill('Ethereum', 'beginner', 'blockchain');
  const updated = fetcher.addSkill('Ethereum', 'expert', 'blockchain', 'Updated');
  assertEqual(updated.level, 'expert', 'Level should be updated');
  assertEqual(updated.description, 'Updated', 'Description should be updated');
  assertEqual(fetcher.skills.size, 1, 'Skills map should still have 1 entry');
});

// Test 14: getSkills returns all skills
test('getSkills() should return all skills', () => {
  const fetcher = new SkillFetcher('Karl');
  fetcher.addSkill('Bitcoin', 'expert', 'blockchain');
  fetcher.addSkill('Solidity', 'advanced', 'smart_contracts');
  fetcher.addSkill('ZKP', 'intermediate', 'cryptography');
  const all = fetcher.getSkills();
  assertEqual(all.length, 3, 'Should return 3 skills');
});

// Test 15: getSkills filtered by category
test('getSkills() filtered by category should work', () => {
  const fetcher = new SkillFetcher('Laura');
  fetcher.addSkill('Bitcoin', 'expert', 'blockchain');
  fetcher.addSkill('Ethereum', 'advanced', 'blockchain');
  fetcher.addSkill('Solidity', 'intermediate', 'smart_contracts');
  const blockchainSkills = fetcher.getSkills({ category: 'blockchain' });
  assertEqual(blockchainSkills.length, 2, 'Should return 2 blockchain skills');
});

// Test 16: getSkills filtered by level
test('getSkills() filtered by level should work', () => {
  const fetcher = new SkillFetcher('Mike');
  fetcher.addSkill('Bitcoin', 'expert', 'blockchain');
  fetcher.addSkill('Solidity', 'expert', 'smart_contracts');
  fetcher.addSkill('ZKP', 'beginner', 'cryptography');
  const expertSkills = fetcher.getSkills({ level: 'expert' });
  assertEqual(expertSkills.length, 2, 'Should return 2 expert skills');
});

// Test 17: removeSkill removes a skill
test('removeSkill() should remove an existing skill', () => {
  const fetcher = new SkillFetcher('Nancy');
  fetcher.addSkill('Bitcoin', 'expert', 'blockchain');
  const removed = fetcher.removeSkill('Bitcoin');
  assert(removed === true, 'Should return true when skill is removed');
  assertEqual(fetcher.skills.size, 0, 'Skills map should be empty after removal');
});

// Test 18: removeSkill returns false for unknown skill
test('removeSkill() should return false for unknown skill', () => {
  const fetcher = new SkillFetcher('Oscar');
  const result = fetcher.removeSkill('NonExistent');
  assert(result === false, 'Should return false when skill is not found');
});

// Test 19: getSummary returns correct data
test('getSummary() should return correct summary', () => {
  const fetcher = new SkillFetcher('Paul');
  fetcher.addSkill('Bitcoin', 'expert', 'blockchain');
  fetcher.addSkill('Ethereum', 'advanced', 'blockchain');
  fetcher.addSkill('Solidity', 'intermediate', 'smart_contracts');
  const summary = fetcher.getSummary();
  assertEqual(summary.owner, 'Paul', 'Owner should be Paul');
  assertEqual(summary.totalSkills, 3, 'Total skills should be 3');
  assertEqual(summary.byCategory['blockchain'], 2, 'Should have 2 blockchain skills');
  assertEqual(summary.byCategory['smart_contracts'], 1, 'Should have 1 smart_contracts skill');
  assertEqual(summary.byLevel['expert'], 1, 'Should have 1 expert skill');
  assertEqual(summary.byLevel['advanced'], 1, 'Should have 1 advanced skill');
  assertEqual(summary.byLevel['intermediate'], 1, 'Should have 1 intermediate skill');
});

// Test 20: Static getValidLevels returns expected levels
test('SkillFetcher.getValidLevels() should return valid levels', () => {
  const levels = SkillFetcher.getValidLevels();
  assert(Array.isArray(levels), 'Should return an array');
  assert(levels.includes('beginner'), 'Should include beginner');
  assert(levels.includes('intermediate'), 'Should include intermediate');
  assert(levels.includes('advanced'), 'Should include advanced');
  assert(levels.includes('expert'), 'Should include expert');
  assertEqual(levels.length, 4, 'Should have exactly 4 levels');
});

// Test 21: Static getCategories returns expected categories
test('SkillFetcher.getCategories() should return categories', () => {
  const categories = SkillFetcher.getCategories();
  assert(typeof categories === 'object', 'Should return an object');
  assert(categories.BLOCKCHAIN, 'Should include BLOCKCHAIN category');
  assert(categories.SMART_CONTRACTS, 'Should include SMART_CONTRACTS category');
  assert(categories.NFT, 'Should include NFT category');
});

// Test 22: addSkill stores timestamps
test('addSkill() should store addedAt and updatedAt timestamps', () => {
  const fetcher = new SkillFetcher('Quinn');
  const skill = fetcher.addSkill('Bitcoin', 'beginner', 'blockchain');
  assert(skill.addedAt instanceof Date, 'addedAt should be a Date');
  assert(skill.updatedAt instanceof Date, 'updatedAt should be a Date');
  assert(!isNaN(skill.addedAt.getTime()), 'addedAt should be a valid date');
});

printSummary();
