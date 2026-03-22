// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20Token
 * @dev Example ERC20 token contract demonstrating import resolution via remappings.
 *
 * The import `@openzeppelin/contracts/token/ERC20/ERC20.sol` is resolved using
 * the remapping defined in remappings.txt:
 *   @openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
 *
 * This resolves to:
 *   lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol
 */
contract ERC20Token is ERC20 {
    /**
     * @dev Creates a new ERC20 token with an initial supply minted to the deployer.
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param initialSupply The initial token supply (in smallest unit, 18 decimals)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, initialSupply);
    }
}
