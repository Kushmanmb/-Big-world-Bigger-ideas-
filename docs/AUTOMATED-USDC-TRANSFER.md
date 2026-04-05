# Automated USDC Transfer Workflow

## Overview

This document describes the automated GitHub Actions workflow that transfers 50,000 USDC to the yaketh.eth controller every 24 hours for proper management distribution.

## Workflow Configuration

- **File**: `.github/workflows/usdc-transfer-scheduled.yml`
- **Schedule**: Daily at 00:00 UTC (midnight)
- **Transfer Amount**: 50,000 USDC (minus gas fees)
- **Net Transfer**: 49,990 USDC
- **Recipient**: yaketh.eth (0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17)

## How It Works

### 1. **Scheduled Execution**

```yaml
schedule:
  - cron: '0 0 * * *'  # Every day at 00:00 UTC
```

The workflow runs automatically every day at midnight UTC.

### 2. **Manual Trigger**

You can also manually trigger the workflow from GitHub Actions:
- Go to **Actions** → **Scheduled USDC Transfer to Controller**
- Click **Run workflow**
- Choose options:
  - `dryRun`: Simulate without executing (default: true)
  - `skipApproval`: Skip manual approval step (default: false)

### 3. **Workflow Steps**

#### Step 1: Validate and Generate Transaction
- Checks out repository
- Installs dependencies
- Runs `scripts/transfer-usdc.js` to generate transaction
- Validates transaction data
- Uploads transaction artifact

#### Step 2: Request Manual Approval
- **Environment**: `usdc-transfers` (must be configured in GitHub)
- Requires manual approval from authorized personnel
- Displays transfer details for review
- Only runs for scheduled transfers (automatic)

#### Step 3: Execute Transfer
- Downloads transaction artifact
- Displays transaction details
- **Dry Run Mode** (current configuration):
  - Simulates the transfer without executing
  - Shows what would happen in production
- **Live Mode** (when configured):
  - Connects to Ethereum RPC
  - Signs transaction with wallet
  - Broadcasts to network
  - Waits for confirmation

#### Step 4: Record Transfer History
- Saves transfer details to `docs/transfer-history/`
- Creates timestamped JSON file
- Commits history to repository

#### Step 5: Send Notifications
- Generates completion summary
- Can send notifications to Slack/Discord/Email (when configured)
- Displays next scheduled run time

## Current Status: DRY RUN MODE

⚠️ **IMPORTANT**: The workflow is currently configured to run in **dry-run mode** only.

This means:
- ✅ Transaction generation works
- ✅ Validation and approval work
- ✅ History recording works
- ❌ **Actual transactions are NOT executed**

## Enabling Live Transfers

To enable actual transaction execution, you need to:

### 1. Configure GitHub Secrets

Add these secrets in **Settings** → **Secrets and variables** → **Actions**:

```
WALLET_PRIVATE_KEY=0x...  # Private key for signing transactions
ETHEREUM_RPC_URL=https://... # Ethereum mainnet RPC endpoint
```

### 2. Configure GitHub Environment

Create an environment named `usdc-transfers`:
1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name: `usdc-transfers`
4. Add required reviewers (authorized personnel)
5. Configure environment secrets if needed

### 3. Implement Transaction Execution

Update the workflow's `execute-transfer` job to include actual Web3 transaction code:

```javascript
// Example: Using ethers.js or web3.js
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

const tx = {
  to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  data: transactionData, // From generated JSON
  value: 0
};

const signedTx = await wallet.sendTransaction(tx);
const receipt = await signedTx.wait();
console.log('Transaction hash:', receipt.hash);
```

### 4. Remove Dry Run Condition

Change the workflow execution condition from:
```yaml
DRY_RUN: ${{ github.event.inputs.dryRun == 'true' || github.event_name == 'schedule' }}
```

To:
```yaml
DRY_RUN: ${{ github.event.inputs.dryRun == 'true' }}
```

This makes scheduled runs execute in live mode by default.

## Security Considerations

### Multi-Signature Wallets (Recommended)

For production use, it's **highly recommended** to use a multi-signature wallet:

1. **Gnosis Safe**: Popular multi-sig solution
   - Requires multiple approvals for transactions
   - Can integrate with GitHub Actions
   - More secure than single private key

2. **Implementation**:
   ```javascript
   // Instead of direct transaction:
   // 1. Generate transaction data
   // 2. Submit to multi-sig wallet
   // 3. Wait for required approvals
   // 4. Execute when threshold met
   ```

### Private Key Security

⚠️ **Never commit private keys to the repository**

- ✅ Store in GitHub Secrets (encrypted at rest)
- ✅ Use separate wallet for automation
- ✅ Limit wallet balance to necessary amounts
- ✅ Monitor wallet activity regularly
- ✅ Rotate keys periodically
- ❌ Never log private keys
- ❌ Never expose in workflow outputs

### Access Control

- Require manual approval for all automated transfers
- Limit workflow permissions to minimum necessary
- Use GitHub environment protection rules
- Configure required reviewers
- Enable audit logging

## Monitoring & Alerts

### Transfer History

All transfers (including simulations) are recorded in:
```
docs/transfer-history/YYYY-MM-DD_HH-MM-SS_usdc-transfer.json
```

Each record includes:
- Timestamp
- Amount transferred
- Gas estimate
- Recipient details
- Workflow run ID
- Status (simulated/executed)

### Notifications

Configure notifications by adding secrets:

```bash
# Slack webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Discord webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Email (using SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALERT_EMAIL=admin@example.com
```

## Troubleshooting

### Workflow Fails to Start

- Check cron schedule syntax
- Verify workflow file is in `.github/workflows/`
- Ensure repository has Actions enabled
- Check for syntax errors in YAML

### Transaction Generation Fails

- Verify `scripts/transfer-usdc.js` exists
- Check Node.js dependencies are installed
- Review error messages in workflow logs

### Approval Never Requested

- Verify `usdc-transfers` environment exists
- Check environment has required reviewers
- Ensure permissions are correctly set

### Transfer Not Executed

- Check if dry-run mode is enabled
- Verify secrets are configured
- Review execution logs for errors
- Ensure wallet has sufficient balance

## Gas Fee Adjustments

The current gas estimate is **10 USDC**. To adjust:

1. Edit `scripts/transfer-usdc.js`
2. Update `ESTIMATED_GAS_COST_USDC` constant
3. Commit changes
4. Next workflow run will use new estimate

Current calculation:
```javascript
const ESTIMATED_GAS_COST_USDC = 10; // Conservative estimate
const netTransferAmount = 50000 - 10; // 49,990 USDC
```

## Testing

### Test Workflow Manually

1. Go to **Actions** tab
2. Select **Scheduled USDC Transfer to Controller**
3. Click **Run workflow**
4. Select:
   - Branch: `main` or your feature branch
   - `dryRun`: `true` ✅
   - `skipApproval`: `true` (for testing only)
5. Click **Run workflow**
6. Monitor execution in real-time

### Verify Transaction Data

After workflow runs:
1. Check **Artifacts** for `usdc-transfer-transaction`
2. Download and verify JSON content
3. Ensure calldata is correct
4. Verify recipient address

## Maintenance

### Regular Tasks

- **Weekly**: Review transfer history
- **Monthly**: Verify gas estimates are accurate
- **Quarterly**: Rotate wallet keys (if using single key)
- **As Needed**: Adjust transfer amounts based on requirements

### Updating the Workflow

1. Create a feature branch
2. Edit `.github/workflows/usdc-transfer-scheduled.yml`
3. Test changes with manual trigger
4. Create pull request
5. Review and merge

## Support

For issues or questions:
- Check workflow run logs in **Actions** tab
- Review transfer history in `docs/transfer-history/`
- See main documentation in `scripts/USDC-TRANSFER-README.md`
- Check token manager configuration in `token-managers.json`

## Related Documentation

- [USDC Transfer Script](../scripts/USDC-TRANSFER-README.md)
- [USDC Transfer Summary](../scripts/USDC-TRANSFER-SUMMARY.md)
- [Token Manager Configuration](../TOKEN-MANAGERS-README.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Version History

- **v1.0.0** (2026-04-05): Initial automated workflow
  - Daily transfers at 00:00 UTC
  - 50,000 USDC (minus 10 USDC gas fee)
  - Net transfer: 49,990 USDC
  - Dry-run mode enabled by default
  - Manual approval required
  - Transfer history tracking
