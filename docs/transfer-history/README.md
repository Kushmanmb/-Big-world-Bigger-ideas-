# USDC Transfer History

This directory contains historical records of all USDC transfers to the yaketh.eth controller.

## File Format

Each transfer is recorded in a JSON file with the following naming convention:
```
YYYY-MM-DD_HH-MM-SS_usdc-transfer.json
```

## Record Structure

```json
{
  "timestamp": "2026-04-05T00:00:00Z",
  "amount": "49990",
  "gasEstimate": "10",
  "recipient": "yaketh.eth",
  "recipientAddress": "0xa14373a2209fAd5cDCc22841e9176E0ce4C50c17",
  "token": "USDC",
  "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "workflowRun": "1234567890",
  "triggerType": "schedule",
  "status": "simulated|executed",
  "transactionHash": "0x..." // Only present for executed transfers
}
```

## Usage

### View Recent Transfers
```bash
ls -lt docs/transfer-history/ | head -10
```

### Check Latest Transfer
```bash
cat docs/transfer-history/$(ls -t docs/transfer-history/*.json | head -1)
```

### Count Total Transfers
```bash
ls -1 docs/transfer-history/*.json 2>/dev/null | wc -l
```

### Filter by Status
```bash
grep -l '"status": "executed"' docs/transfer-history/*.json
```

## Retention

- Records are kept indefinitely for audit purposes
- Automated workflow saves records after each run
- Manual archival may be performed quarterly

## Security

- Contains only public transaction data
- No private keys or sensitive information
- Safe to commit to repository
