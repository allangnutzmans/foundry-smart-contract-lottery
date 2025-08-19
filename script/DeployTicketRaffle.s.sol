// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Script } from "forge-std/Script.sol";
import { TicketRaffle } from "../src/TicketRaffle.sol";
import { HelperConfig } from "./HelperConfig.s.sol";

contract DeployTicketRaffle is Script {
  function run() public returns (TicketRaffle, HelperConfig) {
    HelperConfig helperConfig = new HelperConfig();
    HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

    address vrfCoordinator = config.vrfCoordinator;
    bytes32 gasLane = config.gasLane;
    uint256 subscriptionId = config.subscriptionId;
    uint32 callbackGasLimit = config.callbackGasLimit;
    uint256 entranceFee = config.entranceFee;
    uint256 interval = config.interval;

    vm.startBroadcast();
    TicketRaffle ticketRaffle = new TicketRaffle(entranceFee, interval, vrfCoordinator, gasLane, subscriptionId, callbackGasLimit);
    vm.stopBroadcast();
    return (ticketRaffle, helperConfig);
  }
}
