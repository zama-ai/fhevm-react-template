// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm/config/ZamaGatewayConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";
import "fhevm-contracts/contracts/token/ERC20/extensions/ConfidentialERC20Mintable.sol";

/// @notice This contract implements an encrypted ERC20-like token with confidential balances using Zama's FHE library.
/// @dev It supports typical ERC20 functionality such as transferring tokens, minting, and setting allowances,
/// @dev but uses encrypted data types.
contract MyConfidentialERC20 is
    SepoliaZamaFHEVMConfig,
    SepoliaZamaGatewayConfig,
    GatewayCaller,
    ConfidentialERC20Mintable
{
    // @note `SECRET` is not so secret, since it is trivially encrypted and just to have a decryption test
    euint64 internal immutable SECRET;

    // @note `revealedSecret` will hold the decrypted result once the Gateway will relay the decryption of `SECRET`
    uint64 public revealedSecret;

    /// @notice Constructor to initialize the token's name and symbol, and set up the owner
    /// @param name_ The name of the token
    /// @param symbol_ The symbol of the token
    constructor(string memory name_, string memory symbol_) ConfidentialERC20Mintable(name_, symbol_, msg.sender) {
        SECRET = TFHE.asEuint64(42);
        TFHE.allowThis(SECRET);
    }

    /// @notice Request decryption of `SECRET`
    function requestSecret() public {
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(SECRET);
        Gateway.requestDecryption(cts, this.callbackSecret.selector, 0, block.timestamp + 100, false);
    }

    /// @notice Callback function for `SECRET` decryption
    /// @param `decryptedValue` The decrypted 64-bit unsigned integer
    function callbackSecret(uint256, uint64 decryptedValue) public onlyGateway {
        revealedSecret = decryptedValue;
    }
}
