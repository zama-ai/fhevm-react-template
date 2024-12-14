
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
    GatewayCaller{

    struct Proposal {
        string name;
        uint256 index;
        uint256 voteCount;
    }
    mapping(uint256 => Proposal) public proposals;


    euint4 unoEncriptado;
    euint4 ceroEncriptado;

    uint256 public startTime;
    uint256 public duration;
    uint256 public proposalCount;
    bool public ballotFinished;

    constructor(uint256 duration) {
        unoEncriptado = TFHE.asEuint4(1);
        ceroEncriptado = TFHE.asEuint4(0);
        startTime = 0;
        duration = duration;
        proposalCount = 0;
        ballotFinished = false;
    }

    function createProposal(string memory proposalName) public {
        proposals[proposalCount] = Proposal({name: proposalName, index: proposalCount, voteCount: 0});
        proposalCount++;
    }

    function getProposal(uint256 index) public view returns (Proposal memory) {
        return proposals[index];
    }

    function startBallot() public { 
        startTime = block.timestamp;
    }

    function vote(uint256 proposal) public {
        for (uint256 i = 0; i < proposalCount; i++) {
            if (i == proposal) {
                proposals[i].voteCount += 1; //unoEncriptado
            } else {
                proposals[i].voteCount += 0; //ceroEncriptado
            }
        }
    }

    function finishBallot() public {
        require(block.timestamp >= startTime + duration, "Ballot is still ongoing");
        ballotFinished = true;
    }

    function get_ballot_status() public view returns (bool) {
        return ballotFinished;
    }

    function get_result() public view returns (Proposal memory) {
        require(ballotFinished, "Ballot is not finished");
        uint256 maxVotes = 0;
        uint256 maxIndex = 0;
        for (uint256 i = 0; i < proposalCount; i++) {
            if (proposals[i].voteCount > maxVotes) {
                maxVotes = proposals[i].voteCount;
                maxIndex = i;
            }
        }
        return proposals[maxIndex];
    }
}   