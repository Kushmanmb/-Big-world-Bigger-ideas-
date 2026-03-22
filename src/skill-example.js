/**
 * Skill Module - Example Usage
 * Demonstrates the features of the SkillFetcher module
 */

const SkillFetcher = require('./skill.js');

async function runExamples() {
  console.log('🎯 Skill Module Demo\n');
  console.log('='.repeat(50));

  // Example 1: Create a skill tracker for a developer
  console.log('\n📌 Example 1: Create a skill tracker');
  const devSkills = new SkillFetcher('Satoshi');
  console.log(`Created skill tracker for: ${devSkills.owner}`);

  // Example 2: Add blockchain skills
  console.log('\n📌 Example 2: Add blockchain skills');
  const btcSkill = devSkills.addSkill(
    'Bitcoin',
    'expert',
    'blockchain',
    'Deep understanding of Bitcoin protocol and UTXO model'
  );
  console.log(`Added skill: ${btcSkill.name} [${btcSkill.level}]`);

  devSkills.addSkill('Ethereum', 'advanced', 'blockchain', 'EVM and account-based model');
  devSkills.addSkill('Solidity', 'advanced', 'smart_contracts', 'Smart contract development');
  devSkills.addSkill('Zero-Knowledge Proofs', 'intermediate', 'cryptography', 'ZKP protocols and circuits');
  devSkills.addSkill('DeFi Protocols', 'intermediate', 'defi', 'AMMs, lending, staking');
  devSkills.addSkill('NFT Standards', 'beginner', 'nft', 'ERC-721 and ERC-1155');
  console.log(`Total skills added: ${devSkills.skills.size}`);

  // Example 3: Retrieve a specific skill
  console.log('\n📌 Example 3: Retrieve a specific skill');
  const skill = devSkills.getSkill('Solidity');
  if (skill) {
    console.log(`Skill: ${skill.name}`);
    console.log(`  Level: ${skill.level}`);
    console.log(`  Category: ${skill.category}`);
    console.log(`  Description: ${skill.description}`);
  }

  // Example 4: Filter skills by category
  console.log('\n📌 Example 4: Filter by category');
  const blockchainSkills = devSkills.getSkills({ category: 'blockchain' });
  console.log('Blockchain skills:');
  blockchainSkills.forEach(s => {
    console.log(`  - ${s.name} (${s.level})`);
  });

  // Example 5: Filter skills by level
  console.log('\n📌 Example 5: Filter by level');
  const advancedSkills = devSkills.getSkills({ level: 'advanced' });
  console.log('Advanced skills:');
  advancedSkills.forEach(s => {
    console.log(`  - ${s.name} [${s.category}]`);
  });

  // Example 6: Update an existing skill
  console.log('\n📌 Example 6: Update a skill');
  devSkills.addSkill('Zero-Knowledge Proofs', 'advanced', 'cryptography', 'Advanced ZKP circuits and proofs');
  const updatedSkill = devSkills.getSkill('Zero-Knowledge Proofs');
  console.log(`Updated ZKP level: ${updatedSkill.level}`);

  // Example 7: Get a summary of all skills
  console.log('\n📌 Example 7: Skills summary');
  const summary = devSkills.getSummary();
  console.log(`Owner: ${summary.owner}`);
  console.log(`Total skills: ${summary.totalSkills}`);
  console.log('By category:');
  for (const [cat, count] of Object.entries(summary.byCategory)) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log('By level:');
  for (const [lvl, count] of Object.entries(summary.byLevel)) {
    console.log(`  ${lvl}: ${count}`);
  }

  // Example 8: Remove a skill
  console.log('\n📌 Example 8: Remove a skill');
  const removed = devSkills.removeSkill('NFT Standards');
  console.log(`Removed "NFT Standards": ${removed}`);
  console.log(`Remaining skills: ${devSkills.skills.size}`);

  // Example 9: Check valid levels and categories
  console.log('\n📌 Example 9: Valid levels and categories');
  console.log('Valid levels:', SkillFetcher.getValidLevels().join(', '));
  const categories = SkillFetcher.getCategories();
  console.log('Available categories:', Object.values(categories).join(', '));

  console.log('\n✅ Skill module demo complete!');
}

runExamples().catch(console.error);
