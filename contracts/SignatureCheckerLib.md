# SignatureCheckerLib

A Solidity library for signature verification that supports both ECDSA signatures from Externally Owned Accounts (EOAs) and ERC1271 signatures from smart contract wallets.

## Overview

SignatureCheckerLib provides a comprehensive set of functions to verify digital signatures in Ethereum smart contracts. It supports:

- **ECDSA signatures** from regular wallet accounts (EOAs)
- **ERC-1271 signatures** from smart contract wallets (e.g., Argent, Gnosis Safe)
- **Multiple signature formats**:
  - Standard 65-byte `(r, s, v)` format
  - Compact EIP-2098 64-byte `(r, vs)` format
  - Individual parameters `(v, r, s)`

## Features

- **Dual signature support**: Automatically handles both EOA and smart contract signatures
- **Gas efficient**: Uses inline assembly for optimal performance
- **Multiple formats**: Accepts signatures in various formats for flexibility
- **Memory safe**: Properly manages memory and restores state
- **EIP-191 hashing**: Includes utilities for Ethereum Signed Message hashing

## Key Functions

### Signature Verification

#### `isValidSignatureNow(address signer, bytes32 hash, bytes memory signature)`
Verifies a signature against a hash and signer address. Supports both 64-byte and 65-byte signatures.

#### `isValidSignatureNowCalldata(address signer, bytes32 hash, bytes calldata signature)`
Calldata variant for gas efficiency when signature is in calldata.

#### `isValidSignatureNow(address signer, bytes32 hash, bytes32 r, bytes32 vs)`
Verifies EIP-2098 compact signature format.

#### `isValidSignatureNow(address signer, bytes32 hash, uint8 v, bytes32 r, bytes32 s)`
Verifies signature using individual components.

### ERC-1271 Only Functions

#### `isValidERC1271SignatureNow(address signer, bytes32 hash, bytes memory signature)`
Validates signature specifically for ERC-1271 smart contract wallets (skips ECDSA recovery).

#### `isValidERC1271SignatureNowCalldata(address signer, bytes32 hash, bytes calldata signature)`
Calldata variant for ERC-1271 validation.

### Hashing Utilities

#### `toEthSignedMessageHash(bytes32 hash)`
Converts a hash to an Ethereum Signed Message hash (EIP-191).

#### `toEthSignedMessageHash(bytes memory s)`
Creates an Ethereum Signed Message hash from arbitrary bytes.

### Helper Functions

#### `emptySignature()`
Returns an empty calldata bytes for use as a placeholder.

## Usage Examples

### Basic Signature Verification

```solidity
import "./SignatureCheckerLib.sol";

contract MyContract {
    using SignatureCheckerLib for address;
    
    function verifySignature(
        address signer,
        bytes32 messageHash,
        bytes memory signature
    ) public view returns (bool) {
        return SignatureCheckerLib.isValidSignatureNow(
            signer,
            messageHash,
            signature
        );
    }
}
```

### With EIP-191 Message Hashing

```solidity
function verifyMessage(
    address signer,
    string memory message,
    bytes memory signature
) public view returns (bool) {
    bytes32 messageHash = keccak256(abi.encodePacked(message));
    bytes32 ethSignedHash = SignatureCheckerLib.toEthSignedMessageHash(messageHash);
    
    return SignatureCheckerLib.isValidSignatureNow(
        signer,
        ethSignedHash,
        signature
    );
}
```

### Compact Signature Format (EIP-2098)

```solidity
function verifyCompactSignature(
    address signer,
    bytes32 hash,
    bytes32 r,
    bytes32 vs
) public view returns (bool) {
    return SignatureCheckerLib.isValidSignatureNow(signer, hash, r, vs);
}
```

## Security Considerations

⚠️ **Important Warnings:**

1. **Do NOT use signatures as unique identifiers**
   - Signatures can be replayed across different contexts
   - Always include a nonce in your digest to prevent replay attacks

2. **Use EIP-712 for structured data**
   - EIP-712 provides domain separation and prevents cross-chain/cross-contract replays
   - It also enables human-readable signing for better UX and security

3. **Signature malleability**
   - This implementation does NOT check for signature malleability
   - If uniqueness is required, implement additional checks

4. **Contract signatures are revocable**
   - Unlike ECDSA signatures, ERC-1271 signatures can be revoked by the contract
   - Don't assume perpetual validity

## Technical Details

### Precompiles Used

- **ecrecover (0x1)**: Used for ECDSA signature recovery
- **identity (0x4)**: Used for memory copying operations

### ERC-1271 Magic Value

The library checks for the magic value `0x1626ba7e` which is `bytes4(keccak256("isValidSignature(bytes32,bytes)"))`.

### Signature Formats

1. **65-byte format**: `[r (32 bytes)][s (32 bytes)][v (1 byte)]`
2. **64-byte format (EIP-2098)**: `[r (32 bytes)][vs (32 bytes)]` where `vs = s | (v - 27) << 255`

## Gas Optimization

The library uses inline assembly for:
- Minimizing gas costs
- Efficient memory management
- Direct precompile calls
- Optimized calldata handling

## Attribution

Based on:
- [Solady](https://github.com/vectorized/solady/blob/main/src/utils/SignatureCheckerLib.sol)
- [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/SignatureChecker.sol)

## License

MIT License
