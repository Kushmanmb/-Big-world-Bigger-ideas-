# Quick Start: Automated USDC Transfers

## 🚀 What This Does

Automatically transfers **50,000 USDC** (minus gas fees = **49,990 USDC**) to yaketh.eth controller every 24 hours.

## ⏰ Schedule

- **Frequency**: Every 24 hours
- **Time**: 00:00 UTC (midnight)
- **Recipient**: yaketh.eth (0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17)
- **Token**: USDC (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)

## 📋 Current Status

⚠️ **DRY RUN MODE ONLY** - Currently configured to simulate transfers without executing actual transactions.

## 🎯 Quick Actions

### Run Manual Test

1. Go to [Actions → Scheduled USDC Transfer](../../actions/workflows/usdc-transfer-scheduled.yml)
2. Click **Run workflow**
3. Select:
   - `dryRun`: ✅ true
   - `skipApproval`: ✅ true (for testing)
4. Click **Run workflow**

### Check Transfer History

View all transfer records in [`docs/transfer-history/`](../transfer-history/)

### View Latest Transaction

Check [`scripts/usdc-transfer-transaction.json`](../scripts/usdc-transfer-transaction.json)

## ⚙️ Configuration

### Workflow File
`.github/workflows/usdc-transfer-scheduled.yml`

### Transfer Script
`scripts/transfer-usdc.js`

### Documentation
- Full Guide: [`docs/AUTOMATED-USDC-TRANSFER.md`](./AUTOMATED-USDC-TRANSFER.md)
- Script README: [`scripts/USDC-TRANSFER-README.md`](../scripts/USDC-TRANSFER-README.md)

## 🔐 Security Features

- ✅ Manual approval required (for scheduled runs)
- ✅ Dry-run mode enabled by default
- ✅ Transfer history tracking
- ✅ Gas fee accounting
- ✅ Validation gates
- ⏳ Multi-sig wallet support (to be configured)

## 🔧 Enable Live Transfers

To enable actual transaction execution (NOT recommended until properly reviewed):

1. **Set GitHub Secrets**:
   - `WALLET_PRIVATE_KEY` - Wallet private key
   - `ETHEREUM_RPC_URL` - Ethereum RPC endpoint

2. **Create Environment**:
   - Name: `usdc-transfers`
   - Add required reviewers

3. **Update Workflow**:
   - Modify dry-run condition
   - Add transaction execution code

4. **Test Thoroughly**:
   - Run multiple dry-run tests
   - Verify all checks pass
   - Review with team

⚠️ **See full documentation before enabling live mode!**

## 📊 Monitoring

### View Workflow Runs
[Actions → Scheduled USDC Transfer](../../actions/workflows/usdc-transfer-scheduled.yml)

### Check Logs
Each workflow run provides detailed logs and summaries

### Transfer History
```bash
# View recent transfers
ls -lt docs/transfer-history/ | head -10

# Check latest transfer
cat docs/transfer-history/$(ls -t docs/transfer-history/ | head -1)
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Workflow not running | Check cron schedule, verify Actions enabled |
| Transaction fails | Review logs, check balance, verify RPC |
| Approval not requested | Configure `usdc-transfers` environment |
| Wrong amount | Update `ESTIMATED_GAS_COST_USDC` in script |

## 📞 Support

- **Full Documentation**: [`docs/AUTOMATED-USDC-TRANSFER.md`](./AUTOMATED-USDC-TRANSFER.md)
- **Script Documentation**: [`scripts/USDC-TRANSFER-README.md`](../scripts/USDC-TRANSFER-README.md)
- **Token Manager Info**: [`TOKEN-MANAGERS-README.md`](../TOKEN-MANAGERS-README.md)

## 🔄 Next Steps

1. ✅ Review workflow configuration
2. ✅ Test with dry-run mode
3. ⏳ Configure GitHub environment
4. ⏳ Set up multi-signature wallet
5. ⏳ Add monitoring/alerts
6. ⏳ Enable live transfers (after thorough review)
