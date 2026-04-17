// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {FHECounter} from "../src/FHECounter.sol";

contract DeployFHECounter is Script {
    function run() external {
        vm.startBroadcast();

        FHECounter counter = new FHECounter();
        console.log("FHECounter deployed at:", address(counter));

        vm.stopBroadcast();
    }
}
