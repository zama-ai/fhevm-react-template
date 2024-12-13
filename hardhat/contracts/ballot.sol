
// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm/config/ZamaGatewayConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";
import "fhevm-contracts/contracts/token/ERC20/extensions/ConfidentialERC20Mintable.sol";

contract Ballot is
    SepoliaZamaFHEVMConfig,
    SepoliaZamaGatewayConfig,
    GatewayCaller,
    ConfidentialERC20Mintable{

    struct Proposal {
        string name;
        uint256 index;
        uint256 voteCount;
    }
    mapping(uint256 => Proposal) public proposals;

    uint256 public startTime;
    uint256 public duration;
    uint256 public proposalCount;


    constructor(uint256 duration) {
        startTime = block.timestamp;
        duration = duration;
        proposalCount = 0;
    }

    function createProposal(string memory proposalName) public {
        proposals[proposalCount] = Proposal({name: proposalName, index: proposalCount, voteCount: 0});
        proposalCount++;
    }

    function vote(uint256 proposal, bool voter) public {
        for (uint256 i = 0; i < proposalCount; i++) {
            if (i != proposal) {
                proposals[i].voteCount += 0;
            }
        }
        //proposals[proposal].voteCount += voter ? 1 : -1;
    }
}   