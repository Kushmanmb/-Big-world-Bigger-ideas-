# Multi-Signature Wallet Module

A multi-signature (M-of-N) smart wallet implementation for Ethereum.  
Requires **M out of N** owner approvals before any transaction can be executed.

---

## Contract

**Source:** [`contracts/MultiSignatureWallet.sol`](../contracts/MultiSignatureWallet.sol)  
**ABI:** [`contracts/multi_signature_wallet.json`](../contracts/multi_signature_wallet.json)  
**Solidity version:** `^0.8.18`  
**License:** MIT

### Features

- Multiple owners (up to any number)
- Configurable confirmation threshold (e.g. 2-of-3, 3-of-5)
- Transaction lifecycle: submit → confirm → execute
- Revoke a confirmation before execution
- Deposits ETH with `Deposit` event
- Fully auditable via on-chain events

### Events

| Event | Description |
|---|---|
| `Deposit(sender, amount, balance)` | ETH deposited into the wallet |
| `SubmitTransaction(owner, txIndex, to, value, data)` | Transaction proposed |
| `ConfirmTransaction(owner, txIndex)` | Owner confirmed a transaction |
| `RevokeConfirmation(owner, txIndex)` | Owner revoked their confirmation |
| `ExecuteTransaction(owner, txIndex)` | Transaction executed |

### Functions

| Function | Access | Description |
|---|---|---|
| `submitTransaction(to, value, data)` | owner | Propose a new transaction |
| `confirmTransaction(txIndex)` | owner | Approve a pending transaction |
| `executeTransaction(txIndex)` | owner | Execute once threshold is met |
| `revokeConfirmation(txIndex)` | owner | Revoke a previously given confirmation |
| `getOwners()` | public view | Return list of owners |
| `getTransaction(txIndex)` | public view | Return transaction details |
| `getTransactionCount()` | public view | Return number of transactions |
| `isOwner(address)` | public view | Check if address is an owner |
| `isConfirmed(txIndex, owner)` | public view | Check if owner confirmed a transaction |
| `numConfirmationsRequired` | public view | Required confirmation threshold |

---

## JavaScript Module

**Source:** [`src/multi-sig-wallet.js`](./multi-sig-wallet.js)

### Installation

The module is part of this package — no additional install required.

```javascript
const MultiSigWallet = require('./src/multi-sig-wallet');
```

### Exports

| Export | Type | Description |
|---|---|---|
| `MultiSigWallet` (default) | `class` | Client for reading on-chain state |
| `MultiSigWallet.abi` | `Array` | Contract ABI |
| `MultiSigWallet.bytecode` | `string` | Compiled contract bytecode (`0x…`) |

---

## Usage

### 1. Read on-chain state (no external dependencies)

```javascript
const MultiSigWallet = require('./src/multi-sig-wallet');

const client = new MultiSigWallet(
  '0xYourContractAddress',
  'https://ethereum.publicnode.com' // optional, this is the default
);

// Get owners
const owners = await client.getOwners();
console.log('Owners:', owners);

// Get confirmation threshold
const required = await client.getNumConfirmationsRequired();
console.log('Confirmations required:', required);

// Get total transactions
const count = await client.getTransactionCount();
console.log('Transaction count:', count);

// Get details of transaction #0
const tx = await client.getTransaction(0);
console.log('Transaction:', tx);
// { to, value, data, executed, numConfirmations }

// Check if an address is an owner
const isOwner = await client.isOwner('0xSomeAddress');
console.log('Is owner:', isOwner);

// Check if an owner confirmed a transaction
const confirmed = await client.isConfirmed(0, '0xOwnerAddress');
console.log('Confirmed:', confirmed);
```

### 2. Deploy with ethers.js

```javascript
const { ethers } = require('ethers');
const MultiSigWallet = require('./src/multi-sig-wallet');

const { abi, bytecode } = MultiSigWallet;

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const signer = await provider.getSigner();

const owners = [
  await signer.getAddress(),
  '0xOwner2...',
  '0xOwner3...',
];
const requiredConfirmations = 2; // 2-of-3

const factory = new ethers.ContractFactory(abi, bytecode, signer);
const contract = await factory.deploy(owners, requiredConfirmations);
await contract.waitForDeployment();

console.log('Deployed to:', await contract.getAddress());
```

### 3. Interact with a deployed contract via ethers.js

```javascript
const { ethers } = require('ethers');
const MultiSigWallet = require('./src/multi-sig-wallet');

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const signer = await provider.getSigner();

const contract = new ethers.Contract(
  '0xDeployedContractAddress',
  MultiSigWallet.abi,
  signer
);

// Submit a transaction (owner only)
await contract.submitTransaction(
  '0xRecipient',
  ethers.parseEther('1.0'), // 1 ETH in wei
  '0x'                      // empty calldata for a plain ETH transfer
);

// Confirm the transaction (second owner)
await contract.connect(signer2).confirmTransaction(0);

// Execute once threshold is reached
await contract.executeTransaction(0);
```

---

## Constructor Validation

The `MultiSigWallet` JS client validates its inputs on construction:

```javascript
// Throws: "A valid contract address is required"
new MultiSigWallet('invalid');

// Throws: "rpcUrl must be a non-empty string"
new MultiSigWallet('0xValid...', null);
```

The Solidity constructor validates:

- At least one owner is provided
- Confirmation threshold > 0 and ≤ number of owners
- No zero-address owners
- No duplicate owners

---

## Running Tests

```bash
node src/multi-sig-wallet.test.js
# or
npm run test:multi-sig-wallet
```

---

## Security Considerations

- **Revoke before expiry:** Owners should revoke confirmations if a proposal is no longer valid.
- **No time-lock:** This implementation has no built-in time-lock; consider adding one for production use.
- **No upgrade mechanism:** The contract is immutable after deployment.
- **Reentrancy:** The `executeTransaction` function marks the transaction as executed before the external call, following the checks-effects-interactions pattern.
