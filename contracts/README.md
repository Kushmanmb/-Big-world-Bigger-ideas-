# Smart Contracts

This directory contains Solidity smart contracts for the Big World Bigger Ideas project.

## Contracts

### MultiOwnable.sol

A multi-owner authentication contract allowing multiple owners identified as bytes.

**Features:**
- Multiple owner management with support for both Ethereum addresses and public keys
- ERC-7201 namespaced storage pattern for storage collision prevention
- Owner addition and removal with safety checks
- Efficient owner tracking using index-based mapping
- Support for secp256r1 public key owners
- Built-in protection against removing the last owner

**Key Components:**
- `MultiOwnableStorage`: ERC-7201 namespaced storage struct
  - `nextOwnerIndex`: Tracks the index for next owner addition
  - `removedOwnersCount`: Tracks number of removed owners
  - `ownerAtIndex`: Maps index to owner bytes for efficient lookup
  - `isOwner`: Maps owner bytes to boolean ownership status
- `addOwnerAddress(address)`: Add Ethereum address as owner
- `addOwnerPublicKey(bytes32, bytes32)`: Add public key as owner
- `removeOwnerAtIndex(uint256, bytes)`: Remove owner at specific index
- `removeLastOwner(uint256, bytes)`: Remove the last remaining owner
- `isOwnerAddress(address)`: Check if address is an owner
- `isOwnerPublicKey(bytes32, bytes32)`: Check if public key is an owner
- `isOwnerBytes(bytes)`: Check if bytes represent an owner
- `ownerAtIndex(uint256)`: Get owner bytes at specific index
- `ownerCount()`: Get current number of owners

**Storage Transfers:**
This contract supports transferring ownership and storage control. The contract is designed to work seamlessly with ENS addresses including `kushmanmb.eth`. To transfer ownership to kushmanmb.eth:

1. Resolve `kushmanmb.eth` to its Ethereum address
2. Use `addOwnerAddress()` to add the resolved address as an owner
3. Optionally remove other owners if complete transfer is desired

The contract's flexible owner management system ensures smooth transitions while maintaining security through validation checks.

**Usage:**
This is a base contract designed to be inherited by contracts requiring multi-signature or multi-owner authentication. Initialize owners using `_initializeOwners()` during contract deployment.

**Solidity Version:** ^0.8.18

**License:** MIT

**Source:** [Coinbase Smart Wallet](https://github.com/coinbase/smart-wallet)

### Receiver.sol

An abstract receiver mixin contract for handling ETH and safe-transferred ERC721 and ERC1155 tokens.

**Features:**
- Handles all ERC721 and ERC1155 token safety callbacks
- Collapses function table gas overhead and minimizes code size
- Utilizes fallback pattern for efficient callback handling
- Accepts ETH transfers via `receive()` function
- Memory-safe assembly for optimal gas efficiency

**Key Components:**
- `receive()`: Virtual function for receiving ETH
- `fallback()`: Virtual fallback with `receiverFallback` modifier
- `receiverFallback`: Modifier that handles token callback signatures:
  - `onERC721Received(address,address,uint256,bytes)` (0x150b7a02)
  - `onERC1155Received(address,address,uint256,uint256,bytes)` (0xf23a6e61)
  - `onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)` (0xbc197c81)

**Usage:**
This is an abstract contract designed to be inherited by contracts that need to receive ERC721 and ERC1155 tokens safely. When inherited, the contract automatically handles the required callback functions without needing explicit implementations.

**Solidity Version:** ^0.8.4

**License:** MIT

**Source:** [Solady](https://github.com/Vectorized/solady/blob/main/src/accounts/Receiver.sol)

### Base64.sol

A utility library for Base64 encoding operations on bytes data.

**Features:**
- Standard Base64 encoding with padding (RFC 4648 Section 4)
- Base64URL encoding without padding (RFC 4648 Section 5)
- Gas-optimized assembly implementation
- Memory-safe operations
- Support for arbitrary-length byte arrays

**Key Components:**
- `encode(bytes memory data)`: Encode bytes to standard Base64 string with padding
- `encodeURL(bytes memory data)`: Encode bytes to Base64URL string without padding
- `_TABLE`: Standard Base64 character table (A-Z, a-z, 0-9, +, /)
- `_TABLE_URL`: Base64URL character table (A-Z, a-z, 0-9, -, _)

**Usage:**
This is a library contract that can be imported and used by other contracts for encoding data as Base64 strings. Common use cases include:
- Encoding on-chain data for JSON metadata
- Creating data URIs for NFT metadata
- Encoding binary data for cross-system compatibility

**Example:**
```solidity
import "./Base64.sol";

contract MyContract {
    function createDataURI(bytes memory data) public pure returns (string memory) {
        string memory base64Data = Base64.encode(data);
        return string(abi.encodePacked("data:application/octet-stream;base64,", base64Data));
    }
    
    function createURLSafeEncoding(bytes memory data) public pure returns (string memory) {
        return Base64.encodeURL(data);
    }
}
```

**Solidity Version:** ^0.8.20

**License:** MIT

**Source:** [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)

### Proxy.sol

A transparent proxy contract following the EIP-1967 standard.

**Features:**
- Transparent proxy pattern for upgradeable contracts
- EIP-1967 compliant storage slots
- Admin-only functions for upgrades and administration
- Delegatecall-based proxy functionality
- Support for both `upgradeTo` and `upgradeToAndCall` patterns

**Key Components:**
- `IMPLEMENTATION_KEY`: Storage slot for implementation address (EIP-1967)
- `OWNER_KEY`: Storage slot for admin/owner address (EIP-1967)
- `upgradeTo()`: Upgrade implementation contract
- `upgradeToAndCall()`: Upgrade and initialize in one transaction
- `changeAdmin()`: Change proxy admin
- `admin()`: Query current admin
- `implementation()`: Query current implementation

**Verification:**
This contract was submitted for verification at basescan.org on 2023-07-24.

**Solidity Version:** 0.8.20

**License:** MIT

## Verified Deployments

### Base Network (Chain ID: 8453)

**Contract Address:** `0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43`

- **Network:** Base Mainnet
- **Explorer:** [View on Basescan](https://basescan.org/address/0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43)
- **Verified:** 2023-07-24
- **Compiler:** Solidity 0.8.20 with optimization (200 runs)
- **Type:** Transparent Proxy (EIP-1967)
- **Admin:** kushmanmb.eth

For detailed verification metadata, see `contracts/verification/0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43.json`

For complete verification documentation, see `contracts/verification/README.md`

## Recent Updates (2026-02-19)

**Improvements Made:**
1. **Upgraded Solidity Version**: Updated from 0.8.15 to 0.8.20 for better optimization and latest features
2. **Custom Error Handling**: Replaced `require()` statements with custom errors for gas efficiency:
   - `DelegatecallFailed()`: Thrown when delegatecall to implementation fails
   - `ImplementationIsZeroAddress()`: Thrown when trying to set implementation to zero address
   - `ImplementationNotInitialized()`: Thrown when implementation is not initialized
3. **Zero Address Validation**: Added validation in `_setImplementation()` to prevent setting implementation to zero address
4. **Gas Optimization**: Custom errors save approximately 200-400 gas per revert compared to require strings

**Testing Recommendations:**
If deploying this updated contract, ensure you test:
- Zero address validation in `_setImplementation()` reverts with `ImplementationIsZeroAddress()`
- Failed delegatecall in `upgradeToAndCall()` reverts with `DelegatecallFailed()`
- Uninitialized implementation access reverts with `ImplementationNotInitialized()`
- All existing functionality remains unchanged (upgradeTo, changeAdmin, admin, implementation queries)

**Deployment Notes:**
- This contract maintains full backward compatibility with EIP-1967
- The ABI will include the new custom errors
- Gas savings will be realized on error conditions
- Consider recompiling with Solidity 0.8.20 for full optimization benefits

## Build Configuration

This repository uses Foundry for smart contract development, testing, and deployment.

### Foundry Setup

The project is configured with Foundry through `foundry.toml` with the following key settings:

- **Solidity Version:** 0.8.20
- **Optimizer:** Enabled with 999,999 runs for maximum gas efficiency
- **EVM Version:** Paris
- **Source Directory:** `contracts/`
- **Output Directory:** `out/`

### Compiler Settings

The repository includes multiple compiler configuration files:

1. **foundry.toml** - Primary Foundry configuration
2. **remappings.txt** - Dependency path remappings
3. **solc-settings.json** - Standard JSON compiler settings for direct `solc` usage

### Dependency Remappings

The following libraries are configured via remappings:

- `@openzeppelin/contracts/` - OpenZeppelin contracts library
- `forge-std/` - Foundry standard library
- `solady/` - Solady gas-optimized library
- `account-abstraction/` - ERC-4337 account abstraction
- `webauthn-sol/` - WebAuthn verification
- `p256-verifier/` - P256 signature verification
- And additional dependencies for comprehensive smart contract development

### Installing Dependencies

To install Foundry dependencies:

```bash
forge install
```

This will install all libraries specified in the remappings to the `lib/` directory.

### Building Contracts

To compile the smart contracts:

```bash
forge build
```

This will:
- Compile all Solidity files in `contracts/`
- Apply optimizer with 999,999 runs
- Generate artifacts in `out/` directory
- Include all specified output (bytecode, ABI, metadata, etc.)

### Testing

To run tests (when available):

```bash
forge test
```

### Gas Optimization

The contracts are compiled with an extremely high optimizer runs value (999,999) which:
- Optimizes for execution cost rather than deployment cost
- Ideal for frequently-called functions
- Reduces gas costs for users interacting with deployed contracts
- May increase deployment costs slightly

### Additional Resources

- [Foundry Documentation](https://book.getfoundry.sh/)
- [Foundry GitHub](https://github.com/foundry-rs/foundry)
