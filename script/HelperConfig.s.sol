// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Script, console2 } from 'forge-std/Script.sol';
import { VRFCoordinatorV2_5Mock } from '@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol';
import { LinkToken } from 'test/mocks/LinkToken.sol';

abstract contract CodeConstants {
  /* VRF Mock values */
  uint96 public MOCK_BASE_FEE = 0.25 ether;
  uint96 public MOCK_GAS_PRICE_LINK = 1e9;

  //LINK / ETH price
  int public MOCK_WEI_PER_UINT_LINK = 4e15;

  address public constant FOUNDRY_DEFAULT_SENDER = 0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38;

  uint256 public constant LOCAL_CHAIN_ID = 31337;
  uint256 public constant ETH_SEPOLIA_CHAIN_ID = 11155111;
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
    address account;
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
        interval: 300, // 5 minutes (300 seconds)
        vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B,
        gasLane: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae, // 550  gwei Key Hash
        subscriptionId: 68719843580913932791199936901234181244887858877602550089395373984994913153091, // Subscription ID
        callbackGasLimit: 500000, //5000 gas
        link: 0x779877A7B0D9E8603169DdbD7836e478b4624789, // LINK token address on Sepolia
        account: 0x9918E2c6Bd6fee8048B4Df2bEE0b74a27EA7Fd50
      });
  }

  function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory) {
    // Check to see if we set an active network config
    if (localNetworkConfig.vrfCoordinator != address(0)) {
      return localNetworkConfig;
    }

    console2.log(unicode'⚠️ You have deployed a mock conract!');
    console2.log('Make sure this was intentional');
    vm.startBroadcast();
    VRFCoordinatorV2_5Mock vrfCoordinatorMock = new VRFCoordinatorV2_5Mock(MOCK_BASE_FEE, MOCK_GAS_PRICE_LINK, MOCK_WEI_PER_UINT_LINK);
    LinkToken link = new LinkToken();
    uint256 subscriptionId = vrfCoordinatorMock.createSubscription();
    vm.stopBroadcast();

    localNetworkConfig = NetworkConfig({
      subscriptionId: subscriptionId,
      gasLane: 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c, // doesn't really matter
      interval: 300, // 5 minutes (300 seconds)
      entranceFee: 0.01 ether,
      callbackGasLimit: 500000, // 500,000 gas
      vrfCoordinator: address(vrfCoordinatorMock),
      link: address(link),
      account: FOUNDRY_DEFAULT_SENDER
    });
    vm.deal(localNetworkConfig.account, 100 ether);
    return localNetworkConfig;
  }
}
