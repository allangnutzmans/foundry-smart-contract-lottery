// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Script } from "forge-std/Script.sol";
import { RaffleBase } from "../src/RaffleBase.sol";
import { HelperConfig } from "./HelperConfig.s.sol";
import { CreateSubscription, FundSubscription, AddConsumer } from "script/Interactions.s.sol";

contract DeployRaffle is Script {
  function run() public returns (RaffleBase, HelperConfig) {
    HelperConfig helperConfig = new HelperConfig();
    HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

    address vrfCoordinator = config.vrfCoordinator;
    bytes32 gasLane = config.gasLane;
    uint256 subscriptionId = config.subscriptionId;
    uint32 callbackGasLimit = config.callbackGasLimit;
    uint256 entranceFee = config.entranceFee;
    uint256 interval = config.interval;

    vm.startBroadcast();
    RaffleBase raffle = new RaffleBase(entranceFee, interval, vrfCoordinator, gasLane, subscriptionId, callbackGasLimit);
    vm.stopBroadcast();
    return (raffle, helperConfig);
  }
}