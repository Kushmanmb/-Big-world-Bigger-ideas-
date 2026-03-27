/**
 * Apply Resolver Configuration
 * Loads resolver configuration from resolvers.json and applies it
 */

const Resolver = require('./src/resolver');
const fs = require('fs');
const path = require('path');

console.log('=== Applying Resolver Configuration ===\n');

// Load configuration
const configPath = path.join(__dirname, 'resolvers.json');
console.log(`Loading configuration from: ${configPath}`);

try {
  const configData = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configData);
  
  console.log(`✓ Configuration loaded successfully`);
  console.log(`  Version: ${config.version}`);
  console.log(`  Last Updated: ${config.lastUpdated}`);
  console.log(`  Total Resolvers: ${config.resolvers.length}\n`);
  
  // Create resolver instance
  const resolver = new Resolver('Production Resolver');
  
  // Import resolvers from config
  resolver.fromJSON(config);
  
  console.log('=== Configured Resolvers ===\n');
  
  // Display all configured resolvers
  const allResolvers = resolver.getAllResolvers();
  allResolvers.forEach((res, index) => {
    console.log(`Resolver ${index + 1}:`);
    console.log(`  Address:          ${res.address}`);
    console.log(`  Resolver Address: ${res.resolverAddress}`);
    if (res.metadata) {
      console.log(`  Network:          ${res.metadata.network || 'N/A'}`);
      console.log(`  Type:             ${res.metadata.type || 'N/A'}`);
      if (res.metadata.notes) {
        console.log(`  Notes:            ${res.metadata.notes}`);
      }
    }
    console.log(`  Set At:           ${res.setAt}`);
    console.log();
  });
  
  // Verify the specific resolver requested in the problem statement
  console.log('=== Verification ===\n');
  const targetAddress = '0xEe7aE85f2Fe2239E27D9c1E23fFFe168D63b4055';
  const expectedResolver = '0x0540e1dA908D032D2F74D50C06397cB5f2cbfDdB';
  
  if (resolver.hasResolver(targetAddress)) {
    const resolverInfo = resolver.getResolver(targetAddress);
    console.log(`✓ Resolver found for address`);
    console.log(`  Address:  ${resolverInfo.address}`);
    console.log(`  Resolver: ${resolverInfo.resolverAddress}`);
    
    // Verify it matches the expected resolver
    if (resolverInfo.resolverAddress.toLowerCase() === expectedResolver.toLowerCase()) {
      console.log(`\n✅ SUCCESS: Resolver for ${targetAddress} is correctly set to ${expectedResolver}`);
    } else {
      console.log(`\n❌ ERROR: Resolver mismatch`);
      console.log(`  Expected: ${expectedResolver}`);
      console.log(`  Actual:   ${resolverInfo.resolverAddress}`);
      process.exit(1);
    }
  } else {
    console.log(`❌ ERROR: No resolver found for address ${targetAddress}`);
    process.exit(1);
  }
  
  console.log('\n✅ Resolver configuration applied successfully!');
  process.exit(0);
  
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}
