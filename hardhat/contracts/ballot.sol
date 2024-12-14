
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
        //uint256 index;
        uint256 voteCount;
    }
    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public hasVoted;

    euint4 eOne;
    euint4 eZero;

    uint256 public startTime;
    uint256 public duration;
    uint256 public proposalCount;
    bool public ballotFinished;

    constructor(uint256 _duration) {
        eOne = TFHE.asEuint4(1);
        eZero = TFHE.asEuint4(0);
        startTime = 0;
        duration = _duration;
        proposalCount = 0;
        ballotFinished = false;
    }

    function createProposal(string memory proposalName) public {
        require(startTime == 0, "Ballot has already started - cannot add new proposals");
        proposals[proposalCount] = Proposal({name: proposalName, voteCount: 0});
        proposalCount++;
    }

    function getProposal(uint256 _index) public view returns (Proposal memory) {
        return proposals[_index];
    }

    function startBallot() public { 
        startTime = block.timestamp;
    }

    function vote(uint256 _proposal) public {
        require(!ballotFinished, "Ballot is finished");
        require(!hasVoted[msg.sender], "Already voted");
        
        for (uint256 i = 0; i < proposalCount; i++) {
            if (i == _proposal) {
                proposals[i].voteCount += 1; //eOne
            } else {
                proposals[i].voteCount += 0; //eZero
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