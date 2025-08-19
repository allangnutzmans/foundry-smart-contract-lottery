// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Script } from "forge-std/Script.sol";
import { SingleEntryRaffle } from "../src/SingleEntryRaffle.sol";
import { HelperConfig } from "./HelperConfig.s.sol";

contract DeploySingleEntryRaffle is Script {
  function run() public returns (SingleEntryRaffle, HelperConfig) {
    HelperConfig helperConfig = new HelperConfig();
    HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

    address vrfCoordinator = config.vrfCoordinator;
    bytes32 gasLane = config.gasLane;
    uint256 subscriptionId = config.subscriptionId;
    uint32 callbackGasLimit = config.callbackGasLimit;
    uint256 entranceFee = config.entranceFee;
    uint256 interval = config.interval;

    vm.startBroadcast();
    SingleEntryRaffle singleEntryRaffle = new SingleEntryRaffle(entranceFee, interval, vrfCoordinator, gasLane, subscriptionId, callbackGasLimit);
    vm.stopBroadcast();
    return (singleEntryRaffle, helperConfig);
  }
}
