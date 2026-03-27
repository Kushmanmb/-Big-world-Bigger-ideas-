/**
 * Withdrawal Credentials Module - Example Usage
 * Demonstrates how to configure and use withdrawal credentials for kushmanmb
 */

const { WithdrawalCredentials, WITHDRAWAL_TYPES } = require('./withdraw-credentials.js');

console.log('='.repeat(60));
console.log('Withdrawal Credentials Module - Example Usage');
console.log('='.repeat(60));
console.log();

// Example 1: Create default kushmanmb configuration
console.log('Example 1: Default kushmanmb configuration');
console.log('-'.repeat(60));
const kushmanmbConfig = WithdrawalCredentials.createKushmanmbConfig();
console.log(kushmanmbConfig.formatConfiguration());

// Example 2: Set a withdrawal address
console.log('\nExample 2: Configure withdrawal address');
console.log('-'.repeat(60));
const creds = new WithdrawalCredentials({
  owner: 'kushmanmb',
  ensName: 'kushmanmb.eth',
  network: 'ethereum'
});

// Example Ethereum address (for demonstration only)
const exampleAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
console.log(`Setting withdrawal address: ${exampleAddress}`);
creds.setWithdrawalAddress(exampleAddress);
console.log(creds.formatConfiguration());

// Example 3: Convert address to withdrawal credentials
console.log('\nExample 3: Convert address to withdrawal credentials');
console.log('-'.repeat(60));
const withdrawalCreds = creds.addressToWithdrawalCredentials(exampleAddress);
console.log(`Address: ${exampleAddress}`);
console.log(`Withdrawal Credentials: ${withdrawalCreds}`);
console.log(`Type: Execution Layer (${WITHDRAWAL_TYPES.EXECUTION})`);

// Example 4: Extract address from credentials
console.log('\nExample 4: Extract address from credentials');
console.log('-'.repeat(60));
const extractedAddress = creds.credentialsToAddress(withdrawalCreds);
console.log(`Withdrawal Credentials: ${withdrawalCreds}`);
console.log(`Extracted Address: ${extractedAddress}`);
console.log(`Match: ${extractedAddress.toLowerCase() === exampleAddress.toLowerCase() ? '✓' : '✗'}`);

// Example 5: Validate withdrawal credentials
console.log('\nExample 5: Validate withdrawal credentials');
console.log('-'.repeat(60));

// Valid execution credentials
const validExecCreds = '0x010000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0';
const validation1 = creds.validateWithdrawalCredentials(validExecCreds);
console.log(`Credentials: ${validExecCreds}`);
console.log(`Valid: ${validation1.valid ? '✓' : '✗'}`);
console.log(`Type: ${validation1.type}`);

// Valid BLS credentials
const validBlsCreds = '0x00' + '0'.repeat(62);
const validation2 = creds.validateWithdrawalCredentials(validBlsCreds);
console.log(`\nCredentials: ${validBlsCreds.substring(0, 20)}...`);
console.log(`Valid: ${validation2.valid ? '✓' : '✗'}`);
console.log(`Type: ${validation2.type}`);

// Invalid credentials
const invalidCreds = '0x12345';
const validation3 = creds.validateWithdrawalCredentials(invalidCreds);
console.log(`\nCredentials: ${invalidCreds}`);
console.log(`Valid: ${validation3.valid ? '✓' : '✗'}`);
if (!validation3.valid) {
  console.log(`Error: ${validation3.error}`);
}

// Example 6: Export to JSON
console.log('\nExample 6: Export configuration to JSON');
console.log('-'.repeat(60));
const jsonConfig = creds.toJSON();
console.log(JSON.stringify(jsonConfig, null, 2));

// Example 7: Export to ENV format
console.log('\nExample 7: Export to environment variables');
console.log('-'.repeat(60));
const envConfig = creds.toEnvFormat();
console.log(envConfig);

// Example 8: Validate different address formats
console.log('\nExample 8: Address validation examples');
console.log('-'.repeat(60));

const testAddresses = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',     // Valid with 0x
  '742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',       // Valid without 0x
  '0xinvalid',                                        // Invalid
  '0x123',                                            // Too short
  ''                                                  // Empty
];

testAddresses.forEach(addr => {
  const isValid = creds.validateAddress(addr);
  console.log(`${addr || '(empty)'}: ${isValid ? '✓ Valid' : '✗ Invalid'}`);
});

// Example 9: Working with ENS names
console.log('\nExample 9: ENS name configuration');
console.log('-'.repeat(60));

const ensExamples = [
  'kushmanmb.eth',
  'test.eth',
  'invalid',
  'example.com'
];

ensExamples.forEach(ens => {
  try {
    const testCreds = new WithdrawalCredentials();
    testCreds.setENSName(ens);
    console.log(`${ens}: ✓ Valid ENS name`);
  } catch (error) {
    console.log(`${ens}: ✗ ${error.message}`);
  }
});

// Example 10: Practical use case
console.log('\nExample 10: Complete workflow');
console.log('-'.repeat(60));
console.log('Setting up withdrawal credentials for Ethereum staking...\n');

const staking = new WithdrawalCredentials({
  owner: 'kushmanmb',
  ensName: 'kushmanmb.eth',
  network: 'ethereum'
});

console.log('Step 1: Configure owner and ENS name ✓');
console.log('Step 2: Set withdrawal address...');

// In real usage, this would be your actual Ethereum address
const stakingAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
staking.setWithdrawalAddress(stakingAddress);
console.log(`  Address set: ${stakingAddress} ✓`);

console.log('Step 3: Generate withdrawal credentials...');
const stakingCreds = staking.addressToWithdrawalCredentials(stakingAddress);
console.log(`  Credentials: ${stakingCreds} ✓`);

console.log('Step 4: Validate credentials...');
const stakingValidation = staking.validateWithdrawalCredentials(stakingCreds);
console.log(`  Valid: ${stakingValidation.valid ? '✓' : '✗'}`);
console.log(`  Type: ${stakingValidation.type}`);

console.log('\nConfiguration complete! Ready for Ethereum staking.');
console.log('\nNote: These credentials would be used when:');
console.log('  - Setting up a new Ethereum validator');
console.log('  - Updating from BLS to execution credentials');
console.log('  - Configuring withdrawal address for staking rewards');

console.log('\n' + '='.repeat(60));
console.log('For more information:');
console.log('  - Ethereum Staking: https://ethereum.org/en/staking/');
console.log('  - Beacon Chain: https://beaconcha.in');
console.log('  - ENS Domains: https://ens.domains');
console.log('='.repeat(60));
