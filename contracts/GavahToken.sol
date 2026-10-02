// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GavahToken
 * @dev Gavah Token (GAVAH) - ERC20 token with ownership capabilities
 * 
 * The Gavah Token is designed to be managed through the token manager system,
 * allowing for flexible management of token operations and permissions.
 * 
 * Token Details:
 * - Name: Gavah Token
 * - Symbol: GAVAH
 * - Decimals: 18 (standard ERC20)
 * - Initial Supply: Defined at deployment
 */
contract GavahToken is ERC20, Ownable {
    /**
     * @dev Creates the Gavah Token with an initial supply minted to the deployer.
     * @param initialSupply The initial token supply (in smallest unit, 18 decimals)
     */
    constructor(uint256 initialSupply) ERC20("Gavah Token", "GAVAH") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Allows the owner to mint new tokens.
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint (in smallest unit, 18 decimals)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Allows the owner to burn tokens from their own balance.
     * @param amount The amount of tokens to burn (in smallest unit, 18 decimals)
     */
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }
}
