# WebAuthn.sol

A Solidity library for verifying WebAuthn Authentication Assertions on-chain.

## Overview

WebAuthn.sol is a library that enables smart contracts to verify WebAuthn (Web Authentication API) signatures. This allows users to authenticate and interact with smart contracts using biometric authentication, security keys, or other WebAuthn-compatible authenticators like:

- **iCloud Keychain** (Face ID, Touch ID)
- **Google Password Manager**
- **Hardware security keys** (YubiKey, Titan, etc.)
- **Windows Hello**
- **Android biometrics**

## Features

- ✅ **WebAuthn signature verification** on-chain
- ✅ **RIP-7212 precompile support** for gas-efficient verification
- ✅ **FreshCryptoLib fallback** for compatibility with all networks
- ✅ **Signature malleability protection** (secp256r1 curve)
- ✅ **User presence (UP) flag verification**
- ✅ **Optional user verification (UV) flag check**
- ✅ **Challenge validation** with base64url encoding
- ✅ **Client data JSON type verification**

## Installation

This library depends on the following external libraries:

```solidity
import {FCL_ecdsa} from "FreshCryptoLib/FCL_ecdsa.sol";
import {FCL_Elliptic_ZZ} from "FreshCryptoLib/FCL_elliptic.sol";
import {Base64} from "openzeppelin-contracts/contracts/utils/Base64.sol";
import {LibString} from "solady/utils/LibString.sol";
```

### Dependencies

Install the required dependencies:

```bash
# Using Foundry
forge install FreshCryptoLib/FreshCryptoLib
forge install OpenZeppelin/openzeppelin-contracts
forge install Vectorized/solady

# Using npm/hardhat
npm install @freshcryptolib/contracts
npm install @openzeppelin/contracts
npm install solady
```

## Usage

### Basic Example

```solidity
pragma solidity ^0.8.0;

import {WebAuthn} from "./WebAuthn.sol";

contract MyContract {
    // Store the user's public key coordinates
    mapping(address => uint256) public publicKeyX;
    mapping(address => uint256) public publicKeyY;

    function authenticate(
        bytes memory challenge,
        bool requireUserVerification,
        WebAuthn.WebAuthnAuth memory webAuthnAuth
    ) public view returns (bool) {
        uint256 x = publicKeyX[msg.sender];
        uint256 y = publicKeyY[msg.sender];
        
        return WebAuthn.verify(
            challenge,
            requireUserVerification,
            webAuthnAuth,
            x,
            y
        );
    }
}
```

### WebAuthnAuth Structure

The `WebAuthnAuth` struct contains all necessary data for verification:

```solidity
struct WebAuthnAuth {
    bytes authenticatorData;  // Raw authenticator data from WebAuthn API
    string clientDataJSON;    // Client data JSON string
    uint256 challengeIndex;   // Position of challenge in clientDataJSON
    uint256 typeIndex;        // Position of type field in clientDataJSON
    uint256 r;                // ECDSA signature r value (secp256r1)
    uint256 s;                // ECDSA signature s value (secp256r1)
}
```

### Example with Account Registration

```solidity
contract WebAuthnAccount {
    struct Account {
        uint256 publicKeyX;
        uint256 publicKeyY;
        bool registered;
    }
    
    mapping(address => Account) public accounts;
    
    function register(uint256 x, uint256 y) external {
        require(!accounts[msg.sender].registered, "Already registered");
        accounts[msg.sender] = Account({
            publicKeyX: x,
            publicKeyY: y,
            registered: true
        });
    }
    
    function executeWithWebAuthn(
        bytes memory challenge,
        WebAuthn.WebAuthnAuth memory webAuthnAuth,
        bytes memory transaction
    ) external {
        Account memory account = accounts[msg.sender];
        require(account.registered, "Not registered");
        
        bool verified = WebAuthn.verify(
            challenge,
            true, // require user verification
            webAuthnAuth,
            account.publicKeyX,
            account.publicKeyY
        );
        
        require(verified, "Authentication failed");
        
        // Execute the transaction...
    }
}
```

## Technical Details

### Verification Process

The library implements the WebAuthn verification process as specified in [W3C WebAuthn Level 2](https://www.w3.org/TR/webauthn-2/#sctn-verifying-assertion):

1. **Signature malleability check**: Ensures `s <= n/2` for secp256r1 curve
2. **Type verification**: Confirms client data is of type `"webauthn.get"`
3. **Challenge validation**: Verifies the challenge matches expected value (base64url encoded)
4. **User presence check**: Validates the UP (User Present) bit is set
5. **User verification check** (optional): Validates the UV (User Verified) bit if required
6. **Signature verification**: Uses RIP-7212 precompile or FreshCryptoLib fallback

### RIP-7212 Precompile

The library first attempts to use the RIP-7212 precompile (address `0x100`) for gas-efficient signature verification on secp256r1. If the precompile is not available or verification fails, it falls back to the FreshCryptoLib implementation.

**Networks with RIP-7212 support:**
- Base (Chain ID: 8453)
- Future EVM chains that adopt RIP-7212

### Gas Optimization

- **With RIP-7212 precompile**: ~5,000-10,000 gas
- **Without precompile (FreshCryptoLib)**: ~100,000-150,000 gas

The automatic fallback ensures compatibility while optimizing for networks with native support.

### Security Considerations

#### What This Library Verifies

- ✅ Authenticator data structure and flags
- ✅ User presence (UP flag)
- ✅ Optional user verification (UV flag)
- ✅ Client data JSON type
- ✅ Challenge value
- ✅ Signature validity (secp256r1)
- ✅ Signature malleability protection

#### What This Library Does NOT Verify

- ❌ **Origin matching**: Relies on authenticator to enforce correct relying party
- ❌ **Top origin validation**: Assumes credentials not used in cross-origin context
- ❌ **RP ID hash validation**: Trusts authenticator enforcement (Apple App Site Association, Google Asset Links)
- ❌ **Credential backup state**: Not used in business logic
- ❌ **Client extension outputs**: Assumes no extensions used
- ❌ **Signature counter**: Not used for risk scoring
- ❌ **Attestation object**: Assumes no attestation verification needed

**Important**: These assumptions are suitable for many use cases but may not be appropriate for all applications. Review the security considerations carefully before using in production.

### Threat Model

This library assumes:

1. **Trusted authenticators**: Users employ high-quality authenticators (iCloud Keychain, Google Password Manager, hardware keys)
2. **No cross-origin usage**: Credentials are not shared across different origins
3. **Time-bounded messages**: Messages signed include expiry mechanism to prevent replay attacks
4. **Platform security**: Apple App Site Association and Google Asset Links properly configured

## Client-Side Integration

To use this library, you'll need to:

1. **Register credentials** using the WebAuthn API
2. **Create assertions** when authenticating
3. **Extract the required data** for the `WebAuthnAuth` struct
4. **Submit to your contract**

### Example JavaScript (Client-Side)

```javascript
// 1. Get credential from WebAuthn API
const credential = await navigator.credentials.get({
    publicKey: {
        challenge: Uint8Array.from(challengeBytes),
        rpId: "example.com",
        userVerification: "required"
    }
});

// 2. Parse the response
const authenticatorData = new Uint8Array(credential.response.authenticatorData);
const clientDataJSON = new TextDecoder().decode(credential.response.clientDataJSON);
const signature = parseSignature(credential.response.signature); // Parse DER to r,s

// 3. Find indices in clientDataJSON
const challengeIndex = clientDataJSON.indexOf('"challenge"');
const typeIndex = clientDataJSON.indexOf('"type"');

// 4. Create WebAuthnAuth struct
const webAuthnAuth = {
    authenticatorData: "0x" + Array.from(authenticatorData).map(b => b.toString(16).padStart(2, '0')).join(''),
    clientDataJSON: clientDataJSON,
    challengeIndex: challengeIndex,
    typeIndex: typeIndex,
    r: "0x" + signature.r.toString(16),
    s: "0x" + signature.s.toString(16)
};

// 5. Submit to contract
await contract.authenticate(challenge, true, webAuthnAuth);
```

## Testing

When testing this library:

1. **Test with real WebAuthn credentials** from different authenticators
2. **Verify signature malleability protection** (reject high-s values)
3. **Test challenge validation** (reject wrong challenges)
4. **Test flag verification** (UP and UV bits)
5. **Test both precompile and fallback paths**

### Test Networks

- **Base Goerli/Sepolia**: Has RIP-7212 precompile
- **Ethereum Mainnet/Sepolia**: Uses FreshCryptoLib fallback
- **Local hardhat/foundry**: Can simulate with/without precompile

## References

- [W3C WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
- [RIP-7212: Precompile for secp256r1 Curve Support](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md)
- [FreshCryptoLib](https://github.com/rdubois-crypto/FreshCryptoLib)
- [Coinbase WebAuthn Implementation](https://github.com/base-org/webauthn-sol)
- [Daimo P256 Verifier](https://github.com/daimo-eth/p256-verifier)

## Authors

- **Coinbase** - [base-org/webauthn-sol](https://github.com/base-org/webauthn-sol)
- **Daimo** - [daimo-eth/p256-verifier](https://github.com/daimo-eth/p256-verifier)

## License

MIT License

## Version History

### v1.0.0 (2026-02-24)

- Initial implementation
- Support for RIP-7212 precompile with FreshCryptoLib fallback
- Complete WebAuthn assertion verification
- Signature malleability protection
- User presence and verification flag checks
- Challenge and type validation
