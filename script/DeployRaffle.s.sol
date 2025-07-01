// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Script } from "forge-std/Script.sol";
import { Raffle } from "../src/Raffle.sol";
import { HelperConfig } from "./HelperConfig.s.sol";
import { CreateSubscription, FundSubscription, AddConsumer } from "script/Interactions.s.sol";

contract DeployRaffle is Script {

    function run() public {
        deployContract();
    }

    function deployContract() public returns (Raffle, HelperConfig){
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
        //local -> feploy mocks, get local config
        //sepolia -> get sepolia config

        if (config.subscriptionId == 0) {
            //create subscription
            CreateSubscription subscritionContract = new CreateSubscription();
            (config.subscriptionId, config.vrfCoordinator) = subscritionContract.createSubscription(config.vrfCoordinator);

            //fund
            FundSubscription fundSubscription = new FundSubscription();
            fundSubscription.fundSubscription(
                config.vrfCoordinator,
                config.subscriptionId,
                config.link
            );
        }

        address deployer = vm.addr(1);
        vm.startBroadcast(deployer);
        Raffle raffle = new Raffle(
            config.entranceFee,
            config.interval,
            config.vrfCoordinator,
            config.gasLane,
            config.subscriptionId,
            config.callbackGasLimit
        );
        vm.stopBroadcast();

        AddConsumer addConsumer = new AddConsumer();
        addConsumer.addConsumerUsingConfig(address(raffle));

        return(raffle, helperConfig);
    }

}