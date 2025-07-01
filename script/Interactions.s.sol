// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Script, console2 } from 'forge-std/Script.sol';
import { HelperConfig, CodeConstants } from './HelperConfig.s.sol';
import { VRFCoordinatorV2_5Mock } from '@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol';
import { LinkToken } from 'test/mocks/LinkToken.sol';
import { DevOpsTools } from 'lib/foundry-devops/src/DevOpsTools.sol';

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

contract FundSubscription is Script, CodeConstants {
  uint256 public constant SUBSCRIPTION_FUND_AMOUNT = 3 ether; //3 LINK

  function fundSubscription(address vrfCoordinator, uint256 subscriptionId, address linkToken) public {
    console2.log('Funding subscription with id: %s', subscriptionId);
    console2.log('Using vrfCoordinator: %s', vrfCoordinator);
    console2.log('On ChainId: %s', block.chainid);
    if (block.chainid == LOCAL_CHIAN_ID) {
      vm.startBroadcast();
      VRFCoordinatorV2_5Mock(vrfCoordinator).fundSubscription(subscriptionId, SUBSCRIPTION_FUND_AMOUNT);
      vm.stopBroadcast();
    } else {
      vm.startBroadcast();
      LinkToken(linkToken).transferAndCall(vrfCoordinator, SUBSCRIPTION_FUND_AMOUNT, abi.encode(subscriptionId));
      vm.stopBroadcast();
      console2.log('Funding subscription with LINK token on Local Anvil');
    }
  }

  function functionSubscriptionUsingConfig() public {
    HelperConfig helperConfig = new HelperConfig();
    address vrfCoordinator = helperConfig.getConfig().vrfCoordinator;
    uint256 sub_id = helperConfig.getConfig().subscriptionId;
    address link = helperConfig.getConfig().link;
    fundSubscription(vrfCoordinator, sub_id, link);
  }

  function run() public {}
}

contract AddConsumer is Script {
  function addConsumerUsingConfig(address raffle) public {
    HelperConfig helperConfig = new HelperConfig();
    uint256 subscriptionId = helperConfig.getConfig().subscriptionId;
    address vrfCoordinator = helperConfig.getConfig().vrfCoordinator;
    addConsumer(raffle, vrfCoordinator, subscriptionId);
  }

  function addConsumer(address contractToaddVRF, address vrfCoordinator, uint256 subscriptionId) public {
    console2.log('Adding consumer contract: ', contractToaddVRF);
    console2.log('Using VRFCoordinator: ', vrfCoordinator);
    console2.log('On chain id: ', block.chainid);

    vm.startBroadcast();
    VRFCoordinatorV2_5Mock(vrfCoordinator).addConsumer(subscriptionId, contractToaddVRF);
    vm.stopBroadcast();
    console2.log('Consumer added successfully');
  }

  function run() external {
    address raffle = DevOpsTools.get_most_recent_deployment('Raffle', block.chainid);
    addConsumerUsingConfig(raffle);
  }
}
