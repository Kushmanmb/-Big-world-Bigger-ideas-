# USDC Transfer Script

This script generates transaction details for transferring 50,000 USDC to the yaketh.eth controller for distribution, accounting for estimated gas fees.

## Overview

- **Script**: `scripts/transfer-usdc.js`
- **Token**: USDC (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)
- **Recipient**: yaketh.eth (0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17)
- **Amount**: 50,000 USDC
- **Gas Fee Estimate**: 10 USDC
- **Net Transfer**: 49,990 USDC

## Usage

### Quick Start

```bash
# Generate transfer transaction
npm run transfer:usdc

# Or run directly
node scripts/transfer-usdc.js
```

### Output

The script generates:
1. **Console output** with transaction details and verification
2. **JSON file** at `scripts/usdc-transfer-transaction.json` with complete transaction data

### Transaction Details

```
To (Contract):           0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
Recipient (Controller):  0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17
Net Transfer Amount:     49,990 USDC
Raw Amount (6 decimals): 49990000000
```

## Gas Fee Calculation

The script subtracts an estimated 10 USDC for gas fees:

- **ERC-20 transfer gas**: ~65,000 gas units
- **At 30 gwei**: ~0.00195 ETH
- **At $3,500/ETH**: ~$6.83
- **Conservative estimate**: 10 USDC

> **Note**: Gas prices fluctuate. Adjust based on current network conditions when executing the transaction.

## Transaction Data

The generated calldata encodes an ERC-20 `transfer(address,uint256)` function call:

```
Function: transfer(address,uint256)
Selector: 0xa9059cbb
Parameters:
  - address: 0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17
  - uint256: 49990000000
```

## Programmatic Usage

```javascript
const { generateTransferTransaction } = require('./scripts/transfer-usdc');

// Generate transaction details
const transaction = generateTransferTransaction();

console.log('To:', transaction.to);
console.log('Data:', transaction.data);
console.log('Amount:', transaction.amount, transaction.symbol);
```

## Integration with Wallets

### Using the generated calldata:

1. **MetaMask / Web3 Wallets**:
   - To: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` (USDC contract)
   - Data: Use the calldata from the generated output
   - Value: `0` (no ETH sent)

2. **Etherscan Write Contract**:
   - Go to USDC contract on Etherscan
   - Navigate to "Write Contract" tab
   - Use `transfer` function with:
     - `_to`: `0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17`
     - `_value`: `49990000000`

3. **Hardware Wallets** (Ledger, Trezor):
   - Import the calldata directly
   - Verify recipient and amount on device screen

## Verification

The script includes built-in verification:

```
✅ Verification:
Function:                transfer(address,uint256)
Recipient:               0xa14373a2209fad5cdcc22841e9176e0ce4c50c17
Amount (raw):            49990000000
Amount (USDC):           49990.000000 USDC
```

## Important Notes

1. ⚠️ **This script generates transaction data only** - it does NOT execute the transaction
2. 🔍 **Always verify** all transaction details before signing
3. 💰 **Check balances**:
   - Ensure sufficient USDC balance (≥49,990 USDC)
   - Ensure sufficient ETH for gas fees (≥0.002 ETH recommended)
4. ⛽ **Gas prices vary** - check current network conditions
5. 🔐 **Security**: Never share private keys or seed phrases

## Related Files

- `scripts/transfer-usdc.js` - Main script
- `scripts/usdc-transfer-transaction.json` - Generated transaction data
- `src/calldata.js` - Calldata encoding module
- `token-managers.json` - Controller configuration

## Support

For issues or questions:
- Check the [repository README](../README.md)
- Review the [token manager documentation](../TOKEN-MANAGERS-README.md)
- Verify controller configuration in `token-managers.json`

## Version History

- **v1.0.0** (2026-04-05): Initial release
  - Transfer 50,000 USDC to yaketh.eth controller
  - Account for estimated gas fees (10 USDC)
  - Net transfer: 49,990 USDC
