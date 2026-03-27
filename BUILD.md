# Build Configuration

This document describes the build configuration and compilation settings for the smart contracts in this repository.

## Overview

The repository uses **Foundry** as the primary smart contract development framework. Foundry provides fast, portable, and modular tools for Ethereum application development.

## Configuration Files

### foundry.toml

Primary Foundry configuration file containing:

- **Source Directory:** `contracts/` - Where Solidity source files are located
- **Output Directory:** `out/` - Where compiled artifacts are generated
- **Libraries Directory:** `lib/` - Where dependencies are installed
- **Solidity Version:** 0.8.20
- **Optimizer Settings:**
  - Enabled: true
  - Runs: 999,999 (optimized for execution cost, not deployment)
- **EVM Version:** paris
- **Via IR:** false (standard compilation pipeline)
- **Remappings:** Configured for all project dependencies

### remappings.txt

Dependency path remappings for imports. This file maps import paths to actual library locations in the `lib/` directory:

```
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
forge-std/=lib/forge-std/src/
solady/=lib/solady/src/
account-abstraction/=lib/account-abstraction/contracts/
webauthn-sol/=lib/webauthn-sol/src/
p256-verifier/=lib/p256-verifier/
FreshCryptoLib/=lib/webauthn-sol/lib/FreshCryptoLib/solidity/src/
safe-singleton-deployer-sol/=lib/safe-singleton-deployer-sol/
ds-test/=lib/forge-std/lib/ds-test/src/
erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/
```

### solc-settings.json

Standard JSON format compiler configuration for use with `solc --standard-json` or other tools that accept Solidity standard JSON input. This file contains the same settings as `foundry.toml` but in JSON format.

**Key Settings:**
- Optimizer enabled with 999,999 runs
- EVM version: paris
- Metadata settings (IPFS bytecode hash)
- Output selection for bytecode, ABI, metadata, and documentation
- Via IR: false
- Libraries: none (can be configured per deployment)

## Dependencies

The project is configured to work with the following libraries:

| Library | Purpose | Location |
|---------|---------|----------|
| OpenZeppelin Contracts | Secure, audited contract implementations | `lib/openzeppelin-contracts/` |
| Forge Standard Library | Testing utilities and common patterns | `lib/forge-std/` |
| Solady | Gas-optimized contracts and utilities | `lib/solady/` |
| Account Abstraction | ERC-4337 account abstraction | `lib/account-abstraction/` |
| WebAuthn Sol | WebAuthn signature verification | `lib/webauthn-sol/` |
| P256 Verifier | P256 (secp256r1) signature verification | `lib/p256-verifier/` |
| FreshCryptoLib | Cryptographic primitives | `lib/webauthn-sol/lib/FreshCryptoLib/` |

## Installation

### Prerequisites

1. **Install Foundry:**

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. **Verify Installation:**

```bash
forge --version
cast --version
anvil --version
```

### Installing Dependencies

Install all project dependencies:

```bash
forge install
```

This will clone all libraries specified in the remappings into the `lib/` directory.

## Building

### Standard Build

Compile all contracts:

```bash
forge build
```

**Output:**
- Compiled artifacts in `out/` directory
- Each contract gets its own subdirectory
- Includes bytecode, ABI, metadata, and documentation

### Build with Specific Options

```bash
# Build with detailed output
forge build --force

# Build and watch for changes
forge build --watch

# Build specific contract
forge build --contracts contracts/Proxy.sol
```

### Build Artifacts

After building, the `out/` directory contains:

```
out/
├── Proxy.sol/
│   ├── Proxy.json          # Full artifact (ABI, bytecode, metadata)
│   └── Proxy.metadata.json # Compilation metadata
├── MultiOwnable.sol/
│   ├── MultiOwnable.json
│   └── MultiOwnable.metadata.json
└── Receiver.sol/
    ├── Receiver.json
    └── Receiver.metadata.json
```

## Compilation Details

### Optimizer Configuration

The project uses an extremely high optimizer runs value (999,999):

**Benefits:**
- Optimizes for **runtime gas efficiency** rather than deployment cost
- Ideal for contracts that will be called frequently
- Reduces gas costs for end users
- Best for proxy implementations and library contracts

**Trade-offs:**
- Slightly higher deployment costs
- Longer compilation time
- Minimal impact on bytecode size for most contracts

### EVM Version: Paris

The "paris" EVM version corresponds to:
- Post-merge Ethereum (after The Merge)
- Removes `DIFFICULTY` opcode (replaced with `PREVRANDAO`)
- Compatible with most modern L2s and sidechains
- Broad compatibility with current Ethereum infrastructure

### Metadata Settings

- **Bytecode Hash:** IPFS (for source code verification)
- **Append CBOR:** true (includes metadata hash in bytecode)
- **Literal Content:** false (uses content hash instead)

This configuration enables:
- Automatic source code verification on block explorers
- IPFS-based metadata storage
- Reproducible builds

## Testing

### Run All Tests

```bash
forge test
```

### Run Specific Tests

```bash
# Test specific contract
forge test --match-contract ProxyTest

# Test specific function
forge test --match-test testUpgrade

# Run with gas reporting
forge test --gas-report

# Run with verbose output
forge test -vvv
```

### Test Coverage

```bash
forge coverage
```

## Gas Optimization Analysis

### Gas Snapshots

Create a gas snapshot for regression testing:

```bash
forge snapshot
```

This creates `.gas-snapshot` file with gas costs for all test functions.

### Gas Reports

Generate a detailed gas report:

```bash
forge test --gas-report
```

## Deployment

### Local Deployment (Anvil)

1. Start local node:
```bash
anvil
```

2. Deploy contract:
```bash
forge create contracts/Proxy.sol:Proxy --private-key <PRIVATE_KEY>
```

### Testnet/Mainnet Deployment

```bash
forge create contracts/Proxy.sol:Proxy \
  --rpc-url <RPC_URL> \
  --private-key <PRIVATE_KEY> \
  --constructor-args <ADMIN_ADDRESS> \
  --verify \
  --etherscan-api-key <API_KEY>
```

## Verification

### Verify on Block Explorer

```bash
forge verify-contract \
  --chain-id <CHAIN_ID> \
  --compiler-version 0.8.20 \
  --num-of-optimizations 999999 \
  <CONTRACT_ADDRESS> \
  contracts/Proxy.sol:Proxy \
  --etherscan-api-key <API_KEY>
```

### Standard JSON Verification

For manual verification using `solc-settings.json`:

1. Go to block explorer (e.g., Etherscan, Basescan)
2. Select "Verify and Publish"
3. Choose "Solidity (Standard JSON Input)"
4. Upload `solc-settings.json`
5. Upload source files
6. Submit for verification

## Import Resolution via remappings.txt

### How OpenZeppelin Imports Are Resolved

Solidity imports using the `@openzeppelin/contracts/` prefix are resolved through the remapping:

```
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
```

This means the import:

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
```

resolves at compile time to:

```
lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol
```

The remapping is defined in **three places** to ensure consistent resolution across all tools (all three files already exist in the repository root):

| File | Purpose |
|------|---------|
| `remappings.txt` | Foundry's primary remapping source, also read by editors (e.g., Hardhat, solidity-ls) |
| `foundry.toml` | Inline remappings array for Foundry builds (`remappings = [...]` under `[profile.default]`) |
| `solc-settings.json` | Standard JSON format for direct `solc --standard-json` usage (key: `"remappings"`) |

### Vendored OpenZeppelin Contracts

The OpenZeppelin ERC20 implementation and its dependencies are vendored directly in this repository under `lib/openzeppelin-contracts/`:

```
lib/openzeppelin-contracts/contracts/
├── token/ERC20/
│   ├── ERC20.sol                    ← resolved target for the import
│   ├── IERC20.sol                   ← ERC20 standard interface
│   └── extensions/
│       └── IERC20Metadata.sol       ← optional metadata extension
└── utils/
    └── Context.sol                  ← base context abstraction
```

These files are committed to the repository so the import always resolves correctly without needing to run `forge install`.

### Example Contract

`contracts/ERC20Token.sol` demonstrates successful import resolution:

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(string memory name_, string memory symbol_, uint256 initialSupply)
        ERC20(name_, symbol_)
    {
        _mint(msg.sender, initialSupply);
    }
}
```

Compile with Foundry to verify resolution:

```bash
forge build --contracts contracts/ERC20Token.sol
```

### Error Handling: If the File Moves

If `lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol` is moved or deleted, the compiler will emit:

```
Error: Source "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol" not found
```

**Resolution steps:**

1. Verify the file exists at the expected path:
   ```bash
   test -f lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol && echo "OK" || echo "MISSING"
   ```

2. Confirm the remapping in `remappings.txt` is correct:
   ```
   @openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
   ```

3. Restore the file from the OpenZeppelin repository or re-install via Foundry:
   ```bash
   forge install OpenZeppelin/openzeppelin-contracts@v4.9.4 --no-commit
   ```

### Dependency Management Recommendations

- **Vendoring (current approach):** The required OpenZeppelin files are committed directly to `lib/`. This guarantees reproducible builds without network access and makes the import path immediately verifiable.

- **Git submodules:** For a full OpenZeppelin installation, add it as a submodule:
  ```bash
  forge install OpenZeppelin/openzeppelin-contracts --no-commit
  ```
  Then add `lib/` to `.gitmodules`. Submodule refs are tracked by git even when `lib/` contents are gitignored.

- **Never change the prefix `@openzeppelin/contracts/`** in import statements without updating `remappings.txt`, `foundry.toml`, and `solc-settings.json` simultaneously.

## Troubleshooting

### Common Issues

**Issue: "Library not found" / import not resolved**
```bash
# Verify the vendored file exists
test -f lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol && echo "OK"

# If missing, re-install dependencies
forge install
```

**Issue: "Compiler version mismatch"**
```bash
# Solution: Update foundry.toml or install specific version
forge install ethereum/solidity@v0.8.20
```

**Issue: "Out of memory during compilation"**
```bash
# Solution: Reduce optimizer runs temporarily
# Edit foundry.toml: optimizer_runs = 200
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Foundry Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
      
      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1
      
      - name: Install dependencies
        run: forge install
      
      - name: Build contracts
        run: forge build
      
      - name: Run tests
        run: forge test
      
      - name: Gas snapshot
        run: forge snapshot
```

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/) - Official documentation
- [Foundry GitHub](https://github.com/foundry-rs/foundry) - Source code and issues
- [Solidity Documentation](https://docs.soliditylang.org/) - Language reference
- [EIP-1967](https://eips.ethereum.org/EIPS/eip-1967) - Proxy storage slots standard

## Configuration Updates

**Last Updated:** 2026-02-24

**Compiler Settings:**
- Solidity: 0.8.20
- Optimizer: Enabled (999,999 runs)
- EVM Version: paris
- Via IR: false

For questions or issues with the build configuration, please open an issue on GitHub.
