# Contract Verification

This directory contains verification metadata and documentation for deployed smart contracts.

## Verified Contracts

### Proxy Contract (0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43)

**Network:** Base (Chain ID: 8453)  
**Contract:** Proxy.sol  
**Verified:** 2023-07-24 on basescan.org  
**Explorer:** https://basescan.org/address/0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43

#### Contract Details

- **Type:** Transparent Proxy (EIP-1967)
- **Solidity Version:** 0.8.20
- **License:** MIT
- **Optimization:** Enabled (200 runs)

#### Key Features

1. **Transparent Proxy Pattern**: Implements EIP-1967 compliant proxy pattern for upgradeable contracts
2. **Admin Controls**: Restricted admin-only functions for upgrades and administration
3. **Delegatecall Mechanism**: Efficient call forwarding to implementation contract
4. **Custom Errors**: Gas-optimized error handling
5. **Zero Address Validation**: Prevents invalid implementation addresses

#### Constructor Parameters

The contract is initialized with a single parameter:

- `_admin` (address): The initial admin address who has the ability to upgrade the implementation
  - **Admin**: kushmanmb.eth (ENS domain)
  - **Note**: The actual deployment uses the resolved Ethereum address that kushmanmb.eth points to
  - The admin has full control over contract upgrades and administration

#### Storage Layout (EIP-1967)

- **Implementation Slot**: `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`
- **Admin Slot**: `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103`

#### Functions

##### Admin Functions (proxyCallIfNotAdmin)
- `upgradeTo(address _implementation)`: Upgrade to a new implementation
- `upgradeToAndCall(address _implementation, bytes _data)`: Upgrade and initialize in one transaction
- `changeAdmin(address _admin)`: Change the proxy admin
- `admin()`: Query current admin address
- `implementation()`: Query current implementation address

##### Proxy Functions
- `receive()`: Accepts ETH and delegates to implementation
- `fallback()`: Delegates all other calls to implementation

#### Events

- `Upgraded(address indexed implementation)`: Emitted when implementation is changed
- `AdminChanged(address previousAdmin, address newAdmin)`: Emitted when admin is changed

#### Custom Errors

- `DelegatecallFailed()`: Thrown when delegatecall to implementation fails
- `ImplementationIsZeroAddress()`: Thrown when trying to set implementation to zero address
- `ImplementationNotInitialized()`: Thrown when implementation is not initialized

## Verification Process

To verify a contract on block explorers like Basescan, Etherscan, etc., you typically need:

1. **Source Code**: The Solidity source code (available in `contracts/` directory)
2. **Compiler Version**: Must match exactly (e.g., 0.8.20)
3. **Optimization Settings**: Whether optimization was enabled and how many runs
4. **Constructor Arguments**: ABI-encoded constructor parameters
5. **License Type**: SPDX license identifier (MIT)

### Using This Repository

The source code in this repository can be used to verify the contract:

```bash
# View the contract source
cat contracts/Proxy.sol

# View verification metadata
cat contracts/verification/0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43.json
```

### Manual Verification on Basescan

1. Go to https://basescan.org/address/0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43#code
2. Click "Verify and Publish"
3. Select:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20
   - License Type: MIT
4. Paste the source code from `contracts/Proxy.sol`
5. Set Optimization: Yes (200 runs)
6. Submit for verification

## Verification Metadata Format

Each verified contract has a JSON file named after its address containing:

- Contract name and address
- Network and chain ID
- Compiler settings
- Source code reference
- Constructor arguments
- Verification status and timestamp
- Standards implemented (e.g., EIP-1967)
- Features and capabilities
- Documentation references

## Future Contracts

When adding new verified contracts:

1. Create a new JSON file: `contracts/verification/[CONTRACT_ADDRESS].json`
2. Include all compilation and deployment details
3. Reference the source code file
4. Document constructor arguments
5. Update this README with the new contract information
