// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Script } from 'forge-std/Script.sol';
import { VRFCoordinatorV2_5Mock } from '@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol';
import { LinkToken } from "test/mocks/LinkToken.sol";

abstract contract CodeConstants {
  /* VRF Mock values */
  uint96 public MOCK_BASE_FEE = 0.25 ether;
  uint96 public MOCK_GAS_PRICE_LINK = 1e9;

  //LINK / ETH price
  int public MOCK_WEI_PER_UINT_LINK = 4e15;

  uint256 public constant LOCAL_CHAIN_ID = 31337;
  uint256 public constant ETH_SEPOLIA_CHAIN_ID = 1115511;
}

contract HelperConfig is Script, CodeConstants {
  error HelperConfig__InvalidChainId();

  struct NetworkConfig {
    uint256 entranceFee;
    uint256 interval;
    address vrfCoordinator;
    bytes32 gasLane;
    uint256 subscriptionId;
    uint32 callbackGasLimit;
    address link;
  }

  NetworkConfig public localNetworkConfig;
  mapping(uint256 chainId => NetworkConfig) public networkConfigs;

  constructor() {
    networkConfigs[ETH_SEPOLIA_CHAIN_ID] = getSepoliaEthConfig();
  }

  function getConfigByChainId(uint256 chainId) public returns (NetworkConfig memory) {
    if (networkConfigs[chainId].vrfCoordinator != address(0)) {
      return networkConfigs[chainId];
    } else if (chainId == LOCAL_CHAIN_ID) {
      return getOrCreateAnvilEthConfig();
    } else {
      revert HelperConfig__InvalidChainId();
    }
  }

  function getConfig() public returns (NetworkConfig memory) {
    return getConfigByChainId(block.chainid);
  }

  function getSepoliaEthConfig() public pure returns (NetworkConfig memory) {
    return
      NetworkConfig({
        entranceFee: 0.01 ether, //1e15
        interval: 30, // secons
        vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B,
        gasLane: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae, // 550  gwei Key Hash
        subscriptionId: 68719843580913932791199936901234181244887858877602550089395373984994913153091, // Subscription ID
        callbackGasLimit: 500000, //5000 gas
        link: 0x779877A7B0D9E8603169DdbD7836e478b4624789 // LINK token address on Sepolia
      });
  }

  function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory) {
    //check to see if we set an active network config
    if (localNetworkConfig.vrfCoordinator != address(0)) {
      return localNetworkConfig;
    }
    // deploy mocks and such
    address deployer = vm.addr(1);
    vm.startBroadcast(deployer);
    VRFCoordinatorV2_5Mock vrfCoordinatorMock = new VRFCoordinatorV2_5Mock(
      MOCK_BASE_FEE, // Amount to pay the node that node
      MOCK_GAS_PRICE_LINK,
      MOCK_WEI_PER_UINT_LINK
    );
    LinkToken link = new LinkToken();
    uint256 subId = vrfCoordinatorMock.createSubscription();
    vm.stopBroadcast();
    localNetworkConfig = NetworkConfig({
      entranceFee: 0.01 ether, //1e15
      interval: 30, // secons
      vrfCoordinator: address(vrfCoordinatorMock),
      //doesn't matter
      gasLane: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae, // 550  gwei Key Hash
      subscriptionId: subId,
      callbackGasLimit: 500000, //5000 gas
      link: address(link)
    });
    return localNetworkConfig;
  }
}
