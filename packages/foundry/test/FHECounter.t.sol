// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FhevmTest} from "forge-fhevm/FhevmTest.sol";
import {FHECounter} from "../src/FHECounter.sol";
import {euint32, externalEuint32} from "encrypted-types/EncryptedTypes.sol";

contract FHECounterTest is FhevmTest {
    FHECounter counter;
    address counterAddress;
    uint256 internal constant ALICE_PK = 0xA11CE;
    address alice;

    function setUp() public override {
        super.setUp();
        counter = new FHECounter();
        counterAddress = address(counter);
        alice = vm.addr(ALICE_PK);
    }

    function test_encryptedCountShouldBeUninitializedAfterDeployment() public view {
        // Expect initial count to be bytes32(0) after deployment,
        // (meaning the encrypted count value is uninitialized)
        assertEq(euint32.unwrap(counter.getCount()), bytes32(0));
    }

    function test_incrementTheCounterByOne() public {
        euint32 encryptedCountBeforeInc = counter.getCount();
        assertEq(euint32.unwrap(encryptedCountBeforeInc), bytes32(0));
        uint256 clearCountBeforeInc = 0;

        // Encrypt constant 1 as a euint32
        uint32 clearOne = 1;
        (externalEuint32 encryptedOne, bytes memory inputProof) = encryptUint32(clearOne, alice, counterAddress);

        vm.prank(alice);
        counter.increment(encryptedOne, inputProof);

        euint32 encryptedCountAfterInc = counter.getCount();
        bytes memory sig = signUserDecrypt(ALICE_PK, counterAddress);
        uint256 clearCountAfterInc = userDecrypt(euint32.unwrap(encryptedCountAfterInc), alice, counterAddress, sig);

        assertEq(clearCountAfterInc, clearCountBeforeInc + clearOne);
    }

    function test_decrementTheCounterByOne() public {
        // Encrypt constant 1 as a euint32
        uint32 clearOne = 1;
        (externalEuint32 encryptedOne, bytes memory inputProof) = encryptUint32(clearOne, alice, counterAddress);

        // First increment by 1, count becomes 1
        vm.prank(alice);
        counter.increment(encryptedOne, inputProof);

        // Then decrement by 1, count goes back to 0
        (externalEuint32 encryptedOneDec, bytes memory inputProofDec) = encryptUint32(clearOne, alice, counterAddress);
        vm.prank(alice);
        counter.decrement(encryptedOneDec, inputProofDec);

        euint32 encryptedCountAfterDec = counter.getCount();
        bytes memory sig = signUserDecrypt(ALICE_PK, counterAddress);
        uint256 clearCountAfterDec = userDecrypt(euint32.unwrap(encryptedCountAfterDec), alice, counterAddress, sig);

        assertEq(clearCountAfterDec, 0);
    }
}
