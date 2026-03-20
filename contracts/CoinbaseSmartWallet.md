# Coinbase Smart Wallet

## Overview

The Coinbase Smart Wallet is an ERC-4337-compatible smart contract account implementation. It provides a flexible and secure way to manage digital assets on Ethereum and EVM-compatible chains.

## Key Features

### ERC-4337 Account Abstraction
- Implements the `IAccount` interface from the ERC-4337 standard
- Supports user operations through the EntryPoint contract
- Enables gasless transactions via paymasters

### Multi-Owner Support
- Supports both Ethereum address owners (EOAs) and passkey/WebAuthn public key owners
- Flexible owner management through the `MultiOwnable` base contract
- Can add or remove owners dynamically

### Cross-Chain Replayability
- Special support for cross-chain replayable transactions
- Uses a reserved nonce key (`REPLAYABLE_NONCE_KEY = 8453`) for operations that should be valid across chains
- Useful for syncing owner changes across multiple chains

### Upgradeable via UUPS
- Uses the UUPS (Universal Upgradeable Proxy Standard) pattern
- Allows contract logic upgrades while maintaining the same address
- Only owners can authorize upgrades

### Signature Validation
- ERC-1271 signature validation support
- Validates signatures from both EOA owners and WebAuthn public keys
- Wraps signature data with owner index for efficient validation

## Architecture

### Inheritance
```
CoinbaseSmartWallet
├── ERC1271 (signature validation)
├── IAccount (ERC-4337 interface)
├── MultiOwnable (owner management)
├── UUPSUpgradeable (upgradeability)
└── Receiver (receive ETH)
```

### Key Constants
- `REPLAYABLE_NONCE_KEY`: 8453 - Reserved nonce key for cross-chain operations

### Structs

#### SignatureWrapper
Used for signature validation, allowing callers to identify which owner signed:
- `ownerIndex`: The index of the owner in the owners list
- `signatureData`: The actual signature (format depends on owner type)

#### Call
Represents a call to execute:
- `target`: Address to call
- `value`: ETH value to send
- `data`: Call data

## Core Functions

### Initialization
- `constructor()`: Initializes the implementation with a zero address owner to prevent direct use
- `initialize(bytes[] calldata owners)`: Initializes a proxy instance with initial owners

### User Operations (ERC-4337)
- `validateUserOp()`: Validates a user operation before execution
  - Checks nonce key validity
  - Validates signature
  - Handles payment prefunding

### Execution
- `execute(address target, uint256 value, bytes calldata data)`: Execute a single call
- `executeBatch(Call[] calldata calls)`: Execute multiple calls in sequence
- `executeWithoutChainIdValidation(bytes[] calldata calls)`: Execute calls that can be replayed cross-chain

### Validation
- `canSkipChainIdValidation(bytes4 functionSelector)`: Checks if a function can be executed cross-chain

Allowed selectors:
  - `addOwnerPublicKey`
  - `addOwnerAddress`
  - `removeOwnerAtIndex`
  - `removeLastOwner`
  - `upgradeToAndCall`

### View Functions
- `entryPoint()`: Returns the EntryPoint v0.6 address (0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789)
- `getUserOpHashWithoutChainId()`: Computes user operation hash without chain ID
- `implementation()`: Returns the current implementation address

## Security Features

### Access Control
- `onlyEntryPoint`: Restricts calls to the EntryPoint contract
- `onlyEntryPointOrOwner`: Allows calls from EntryPoint or any owner
- `onlyOwner`: Restricts upgrades to owners only

### Nonce Validation
Enforces proper nonce key usage:
- Cross-chain operations MUST use `REPLAYABLE_NONCE_KEY`
- Regular operations MUST NOT use `REPLAYABLE_NONCE_KEY`

### Error Handling
- `Initialized()`: Thrown if trying to re-initialize
- `SelectorNotAllowed(bytes4)`: Thrown if trying to execute non-whitelisted function cross-chain
- `InvalidNonceKey(uint256)`: Thrown if nonce key doesn't match operation type

## Dependencies

This contract relies on several external libraries and interfaces:
- **account-abstraction**: ERC-4337 interfaces (`IAccount`, `UserOperation`)
- **solady**: Optimized Solidity libraries (`Receiver`, `SignatureCheckerLib`, `UUPSUpgradeable`)
- **webauthn-sol**: WebAuthn signature verification
- **ERC1271**: Signature validation standard
- **MultiOwnable**: Owner management (custom implementation)

## Usage Example

### Deploying via Proxy
```solidity
// Deploy implementation
CoinbaseSmartWallet implementation = new CoinbaseSmartWallet();

// Prepare initial owners
bytes[] memory owners = new bytes[](1);
owners[0] = abi.encode(ownerAddress); // EOA owner

// Deploy proxy and initialize
bytes memory initData = abi.encodeWithSelector(
    CoinbaseSmartWallet.initialize.selector,
    owners
);
// Deploy your proxy pointing to implementation with initData
```

### Executing Operations
```solidity
// Via EntryPoint (ERC-4337)
UserOperation memory userOp = ...; // Prepare user operation
entryPoint.handleOps([userOp], beneficiary);

// Direct execution (for owners)
wallet.execute(targetAddress, value, data);
```

### Cross-Chain Owner Sync
```solidity
// Prepare call to add owner
bytes memory addOwnerCall = abi.encodeWithSelector(
    MultiOwnable.addOwnerAddress.selector,
    newOwnerAddress
);

// Execute without chain ID validation
bytes[] memory calls = new bytes[](1);
calls[0] = addOwnerCall;
wallet.executeWithoutChainIdValidation(calls);
```

## License

MIT License

## References

- [Coinbase Smart Wallet Repository](https://github.com/coinbase/smart-wallet)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [Solady Library](https://github.com/vectorized/solady)
- [Alchemy LightAccount](https://github.com/alchemyplatform/light-account)
- [Daimo Account](https://github.com/daimo-eth/daimo)
