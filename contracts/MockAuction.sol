// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockAuction {
    address public owner;
    mapping(address => bool) public joined;
    mapping(address => bytes) public encryptedBids;
    event Joined(address indexed user);
    event BidSubmitted(address indexed user, bytes encryptedBid);

    constructor() {
        owner = msg.sender;
    }

    function join() external payable {
        require(msg.value == 0.0001 ether, "Entry fee is 0.0001 ETH");
        require(!joined[msg.sender], "Already joined");
        joined[msg.sender] = true;
        emit Joined(msg.sender);
    }

    function submitEncryptedBid(bytes calldata encryptedBid) external {
        require(joined[msg.sender], "Must join first");
        encryptedBids[msg.sender] = encryptedBid;
        emit BidSubmitted(msg.sender, encryptedBid);
    }
}
