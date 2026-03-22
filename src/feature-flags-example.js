/**
 * Example usage of Feature Flags functionality
 */

const featureFlags = require('./feature-flags');

console.log('🚀 Feature Flags Demo\n');

// Example 1: Setting feature flags
console.log('1️⃣ Setting feature flags...');
featureFlags.setFlag('dark_mode', true);
featureFlags.setFlag('new_ui', false);
featureFlags.setFlag('experimental_features', true);
console.log('✅ Feature flags set successfully!\n');

// Example 2: Getting individual flag values
console.log('2️⃣ Getting individual flag values...');
console.log(`   dark_mode: ${featureFlags.getFlag('dark_mode')}`);
console.log(`   new_ui: ${featureFlags.getFlag('new_ui')}`);
console.log(`   experimental_features: ${featureFlags.getFlag('experimental_features')}`);
console.log(`   non_existent_flag: ${featureFlags.getFlag('non_existent_flag')}\n`);

// Example 3: Checking if flags exist
console.log('3️⃣ Checking if flags exist...');
console.log(`   dark_mode exists: ${featureFlags.hasFlag('dark_mode')}`);
console.log(`   non_existent exists: ${featureFlags.hasFlag('non_existent')}\n`);

// Example 4: Using flags in code logic
console.log('4️⃣ Using flags in application logic...');
if (featureFlags.getFlag('dark_mode')) {
  console.log('   🌙 Dark mode is enabled - applying dark theme');
} else {
  console.log('   ☀️  Dark mode is disabled - applying light theme');
}

if (featureFlags.getFlag('experimental_features')) {
  console.log('   🧪 Experimental features are enabled');
} else {
  console.log('   🔒 Experimental features are disabled');
}
console.log('');

// Example 5: Listing all flags
console.log('5️⃣ Listing all feature flags...');
const allFlags = featureFlags.listFlags();
console.log('   All flags:', JSON.stringify(allFlags, null, 2));
console.log('');

// Example 6: Updating a flag
console.log('6️⃣ Updating a feature flag...');
console.log(`   Before: dark_mode = ${featureFlags.getFlag('dark_mode')}`);
featureFlags.setFlag('dark_mode', false);
console.log(`   After: dark_mode = ${featureFlags.getFlag('dark_mode')}\n`);

// Example 7: Removing a flag
console.log('7️⃣ Removing a feature flag...');
console.log(`   Before removal: experimental_features exists = ${featureFlags.hasFlag('experimental_features')}`);
featureFlags.removeFlag('experimental_features');
console.log(`   After removal: experimental_features exists = ${featureFlags.hasFlag('experimental_features')}\n`);

console.log('✅ Feature flags demo completed!\n');
console.log('💡 Tips:');
console.log('   - Use feature flags to enable/disable features without code changes');
console.log('   - Manage flags programmatically: featureFlags.setFlag(<flag_name>, true/false)');
console.log('   - List all flags: featureFlags.listFlags()');
console.log('   - Remove flags: featureFlags.removeFlag(<flag_name>)');
