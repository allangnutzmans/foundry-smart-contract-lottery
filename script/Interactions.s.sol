// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Script, console2 } from 'forge-std/Script.sol';
import { HelperConfig } from './HelperConfig.s.sol';
import { VRFCoordinatorV2_5Mock } from '@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol';

contract CreateSubscription is Script {
  function createSubscriptionUsingConfig() public returns (uint256, address) {
    HelperConfig helperConfig = new HelperConfig();
    address vrfCoordinator = helperConfig.getConfig().vrfCoordinator;
    (uint256 sub_id, ) = createSubscription(vrfCoordinator);
    return (sub_id, vrfCoordinator);
  }

  function createSubscription(address vrfCoordinator) public returns (uint256, address) {
    console2.log('Creating subscription on chainId: %s', block.chainid);
    vm.startBroadcast();
    uint256 sub_id = VRFCoordinatorV2_5Mock(vrfCoordinator).createSubscription();
    vm.stopBroadcast();
    console2.log('Subscription created with id: %s', sub_id);
    console2.log('Please update the subscriptionId in HelperConfig.s.sol');
    return (sub_id, vrfCoordinator);
  }

  function run() public {}
}


contract FundSubscription is Script {

    uint256 public constant SUBSCRIPTION_FUND_AMOUNT = 3 ether; //3 LINK

    function functionSubscriptionUsingConfig() public {
        HelperConfig helperConfig = new HelperConfig();
        address vrfCoordinator = helperConfig.getConfig().vrfCoordinator;
        uint256 sub_id = helperConfig.getConfig().subscriptionId;
    }
    function run() public {}
}
