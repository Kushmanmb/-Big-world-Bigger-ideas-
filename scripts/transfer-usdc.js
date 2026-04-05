/**
 * USDC Transfer Script
 * Generates transaction details for transferring 50,000 USDC to yaketh.eth controller
 * Accounts for estimated gas fees
 */

const CalldataEncoder = require('../src/calldata');

// USDC Token Configuration
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDC_DECIMALS = 6;
const USDC_SYMBOL = 'USDC';

// Controller Address (yaketh.eth)
const CONTROLLER_ADDRESS = '0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17';
const CONTROLLER_ENS = 'yaketh.eth';

// Transfer amount: 50,000 USDC
const TRANSFER_AMOUNT_USDC = 50000;

// Gas fee estimation (in ETH and approximate USDC value)
// ERC-20 transfer typically costs ~65,000 gas
// At 30 gwei gas price and $3,500 ETH price: ~$6.83
// Round up for safety
const ESTIMATED_GAS_COST_USDC = 10; // Conservative estimate in USDC

/**
 * Converts USDC amount to raw units (considering 6 decimals)
 * @param {number} amount - USDC amount in human-readable format
 * @returns {string} Raw amount as string
 */
function usdcToRaw(amount) {
  const rawAmount = BigInt(Math.floor(amount * Math.pow(10, USDC_DECIMALS)));
  return rawAmount.toString();
}

/**
 * Converts raw USDC units to human-readable amount
 * @param {string|bigint} raw - Raw amount
 * @returns {string} Formatted USDC amount
 */
function rawToUsdc(raw) {
  const amount = Number(BigInt(raw)) / Math.pow(10, USDC_DECIMALS);
  return amount.toFixed(USDC_DECIMALS);
}

/**
 * Generates the transfer transaction details
 */
function generateTransferTransaction() {
  console.log('='.repeat(70));
  console.log('USDC Transfer to Controller - Transaction Generator');
  console.log('='.repeat(70));
  console.log();

  // Calculate net transfer amount (minus estimated gas fees)
  const netTransferAmount = TRANSFER_AMOUNT_USDC - ESTIMATED_GAS_COST_USDC;
  const rawAmount = usdcToRaw(netTransferAmount);

  console.log('📊 Transfer Details:');
  console.log('-'.repeat(70));
  console.log(`Requested Amount:        ${TRANSFER_AMOUNT_USDC.toLocaleString()} ${USDC_SYMBOL}`);
  console.log(`Estimated Gas Cost:      ${ESTIMATED_GAS_COST_USDC.toLocaleString()} ${USDC_SYMBOL}`);
  console.log(`Net Transfer Amount:     ${netTransferAmount.toLocaleString()} ${USDC_SYMBOL}`);
  console.log(`Raw Amount (6 decimals): ${rawAmount}`);
  console.log();

  console.log('📍 Addresses:');
  console.log('-'.repeat(70));
  console.log(`Token Contract (USDC):   ${USDC_ADDRESS}`);
  console.log(`Recipient (Controller):  ${CONTROLLER_ADDRESS}`);
  console.log(`Recipient ENS:           ${CONTROLLER_ENS}`);
  console.log();

  // Generate calldata for ERC-20 transfer
  const encoder = new CalldataEncoder();
  const calldata = encoder.encode('transfer(address,uint256)', [
    CONTROLLER_ADDRESS,
    rawAmount
  ]);

  console.log('🔧 Transaction Data:');
  console.log('-'.repeat(70));
  console.log(`To (Contract):           ${USDC_ADDRESS}`);
  console.log(`Data (Calldata):         ${calldata}`);
  console.log(`Value (ETH):             0`);
  console.log();

  // Decode and verify
  const decoded = encoder.decode(calldata);
  console.log('✅ Verification:');
  console.log('-'.repeat(70));
  console.log(`Function:                ${decoded.signature}`);
  console.log(`Recipient:               ${decoded.params[0]}`);
  console.log(`Amount (raw):            ${decoded.params[1]}`);
  console.log(`Amount (USDC):           ${rawToUsdc(decoded.params[1])} ${USDC_SYMBOL}`);
  console.log();

  // Gas estimation
  console.log('⛽ Gas Estimation:');
  console.log('-'.repeat(70));
  console.log(`Estimated Gas Limit:     65,000`);
  console.log(`Suggested Gas Price:     30 gwei (adjust based on network)`);
  console.log(`Max Transaction Fee:     ~0.00195 ETH (~$6.83 at $3,500/ETH)`);
  console.log();

  console.log('📋 Summary:');
  console.log('-'.repeat(70));
  console.log(`This transaction will transfer ${netTransferAmount.toLocaleString()} USDC to`);
  console.log(`${CONTROLLER_ENS} (${CONTROLLER_ADDRESS})`);
  console.log(`for distribution purposes.`);
  console.log();

  console.log('⚠️  Important Notes:');
  console.log('-'.repeat(70));
  console.log('1. Review all transaction details carefully before signing');
  console.log('2. Ensure you have sufficient USDC balance in your wallet');
  console.log('3. Ensure you have sufficient ETH for gas fees');
  console.log('4. Gas prices fluctuate - adjust based on current network conditions');
  console.log('5. This script generates transaction data only - does not execute');
  console.log();

  // Return transaction object for programmatic use
  return {
    to: USDC_ADDRESS,
    data: calldata,
    value: '0',
    recipient: CONTROLLER_ADDRESS,
    recipientENS: CONTROLLER_ENS,
    amount: netTransferAmount,
    rawAmount: rawAmount,
    symbol: USDC_SYMBOL,
    decimals: USDC_DECIMALS,
    estimatedGasCost: ESTIMATED_GAS_COST_USDC,
    timestamp: new Date().toISOString()
  };
}

// Export for use as a module
module.exports = {
  generateTransferTransaction,
  usdcToRaw,
  rawToUsdc,
  USDC_ADDRESS,
  CONTROLLER_ADDRESS,
  CONTROLLER_ENS,
  TRANSFER_AMOUNT_USDC,
  ESTIMATED_GAS_COST_USDC
};

// Run if executed directly
if (require.main === module) {
  try {
    const transaction = generateTransferTransaction();
    
    // Optionally save to JSON file
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, 'usdc-transfer-transaction.json');
    fs.writeFileSync(outputPath, JSON.stringify(transaction, null, 2));
    console.log(`💾 Transaction details saved to: ${outputPath}`);
    console.log();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}
