// SPDX-LICENSE-Identifier: MIT
pragma solidity 0.8.19;

import { Test } from 'forge-std/Test.sol';
import { Vm } from 'forge-std/Vm.sol';
import { DeployRaffle } from '../../script/DeployRaffle.s.sol';
import { Raffle } from '../../src/Raffle.sol';
import { HelperConfig } from '../../script/HelperConfig.s.sol';
import { VRFCoordinatorV2_5Mock } from '@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol';

contract RaffleTest is Test {
  event RaffleEntered(address indexed player);
  event WinnerPicked(address indexed player);

  Raffle public raffle;
  HelperConfig public helperConfig;

  address public PLAYER = makeAddr('Player');
  uint256 public constant STARTING_PLAYER_BALANCE = 10 ether;

  uint256 entranceFee;
  uint256 interval;
  address vrfCoordinator;
  bytes32 gasLane;
  uint256 subscriptionId;
  uint32 callbackGasLimit;

  function setUp() external {
    DeployRaffle deployer = new DeployRaffle();
    (raffle, helperConfig) = deployer.deployContract();
    HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
    entranceFee = config.entranceFee;
    interval = config.interval;
    vrfCoordinator = config.vrfCoordinator;
    gasLane = config.gasLane;
    subscriptionId = config.subscriptionId;
    callbackGasLimit = config.callbackGasLimit;
    vm.deal(PLAYER, STARTING_PLAYER_BALANCE);
    address deployerAddr = vm.addr(1); // Owner of the subscription
    vm.prank(deployerAddr);
    VRFCoordinatorV2_5Mock(vrfCoordinator).addConsumer(subscriptionId, address(raffle));
  }

  function testConstructorInitializesState() public {
    Raffle localRaffle = new Raffle(entranceFee, interval, vrfCoordinator, gasLane, subscriptionId, callbackGasLimit);
    assertEq(localRaffle.getEntranceFee(), entranceFee);
    assertEq(localRaffle.getInterval(), interval);
    assertEq(localRaffle.getVrfCoordinator(), vrfCoordinator);
    assertEq(localRaffle.getGasLane(), gasLane);
    assertEq(localRaffle.getSubscriptionId(), subscriptionId);
    assertEq(localRaffle.getCallbackGasLimit(), callbackGasLimit);
    assertEq(uint(localRaffle.getRflleState()), 0); // Should be OPEN
  }

  function testRaffleInitializesOpen() public view {
    assert(raffle.getRflleState() == Raffle.RaffleState.OPEN);
  }

  function testRaffleRevertsWhenYouDontPayEnough() public {
    // Arange
    vm.prank(PLAYER);
    // Act -Assert
    vm.expectRevert(Raffle.Raffle__SendMoreToEnterRaffle.selector);
    raffle.enterRaffle(); //Without sending any ether
  }

  function testRaffleRecordsPlayersWhenTheyEnter() public {
    // Arrange
    vm.prank(PLAYER);

    // Act
    raffle.enterRaffle{ value: entranceFee }();
    // Assert
    address playerAdded = raffle.getPlayer(0);
    assertEq(playerAdded, PLAYER);
  }

  function testEnteringRaffleEmitsEvent() public {
    // Arrange
    vm.prank(PLAYER);
    // Act
    vm.expectEmit(true, false, false, false, address(raffle));
    emit RaffleEntered(PLAYER);
    // Assert
    raffle.enterRaffle{ value: entranceFee }();
  }

  function testdontAllowPlayersEnterWhileRaffleIsCalculating() public {
    // Arrange
    vm.prank(PLAYER);
    raffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1); //timeskips 31 seconds
    vm.roll(block.number + 1); // rolls the block number to the next one - "good practice"
    // Act
    raffle.performUpkeep('');
    vm.expectRevert(Raffle.Raffle_RaffleNotOpen.selector);
    // Assert
    vm.prank(PLAYER);
    raffle.enterRaffle{ value: entranceFee }();
  }

  ////////////////////////////////////////////////////////
  /////////////  CHECK UPKEEP ////////////////////////////
  ///////////////////////////////////////////////////////
  function testCheckUpkeepReturnsFalseIfItHasNoBalance() public {
    // Arrange
    vm.warp(block.timestamp + interval + 1); //timeskips 31 seconds
    vm.roll(block.number + 1); // rolls the block number to the next one - "good practice"

    //act
    (bool upkeepNeeded, ) = raffle.checkUpkeep('');

    // Assert
    assert(!upkeepNeeded);
  }

  function testGettersReturnCorrectValues() public {
    assertEq(raffle.getEntranceFee(), entranceFee);
    assertEq(raffle.getInterval(), interval);
    assertEq(raffle.getVrfCoordinator(), vrfCoordinator);
    assertEq(raffle.getGasLane(), gasLane);
    assertEq(raffle.getSubscriptionId(), subscriptionId);
    assertEq(raffle.getCallbackGasLimit(), callbackGasLimit);
  }

  function testCheckUpkeepReturnsFalseIfRaffleNotOpen() public {
    // Set state to CALCULATING
    vm.prank(PLAYER);
    raffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    raffle.performUpkeep('');
    (bool upkeepNeeded, ) = raffle.checkUpkeep('');
    assertFalse(upkeepNeeded);
  }

  function testCheckUpkeepReturnsFalseIfNotEnoughTimePassed() public {
    vm.prank(PLAYER);
    raffle.enterRaffle{ value: entranceFee }();
    (bool upkeepNeeded, ) = raffle.checkUpkeep('');
    assertFalse(upkeepNeeded);
  }

  ////////////////////////////////////////////////////////
  /////////////  PERFORM UPKEP ////////////////////////////
  ///////////////////////////////////////////////////////

  function testPerformUpkeepCanOnlyRunIfCheckUpKeepIsTue() public {
    // Arrange
    vm.prank(PLAYER);
    raffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);

    // Act - Assert
    raffle.performUpkeep('');
  }

  function testCheckUpkeepReturnsTrueWhenReady() public {
    vm.prank(PLAYER);
    raffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    (bool upkeepNeeded, ) = raffle.checkUpkeep('');
    assertTrue(upkeepNeeded);
  }

  function testPerformUpkeepRevertsIfCheckUpKeepIsFalse() public {
    // Arrange
    uint256 currentBalance = 0;
    uint256 numPlayers = 0;
    Raffle.RaffleState raffleState = raffle.getRflleState();

    vm.prank(PLAYER);
    raffle.enterRaffle{ value: entranceFee }();
    currentBalance = currentBalance + entranceFee;
    numPlayers = numPlayers + 1;

    // Act - Assert
    vm.expectRevert(abi.encodeWithSelector(Raffle.Raffle_UpkeepNotNeeded.selector, currentBalance, numPlayers, raffleState));
    raffle.performUpkeep('');
  }

  function testPerformUpkeepChangesState() public {
    vm.prank(PLAYER);
    raffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    raffle.performUpkeep('');
    assertEq(uint(raffle.getRflleState()), 1); // CALCULATING
  }

  modifier raffleEntered() {
    vm.prank(PLAYER);
    raffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    _;
  }

  function testPerformUpkeepUpdatesRaffleStateAndEmitsRequestId() public raffleEntered {
    // Act
    vm.recordLogs();
    raffle.performUpkeep('');
    Vm.Log[] memory entries = vm.getRecordedLogs();
    bytes32 requestId = entries[1].topics[1]; // First log comes from the vrf itself, so we take the second one

    // Assert
    Raffle.RaffleState raffleState = raffle.getRflleState();
    assert(uint256(requestId) > 0);
    assert(uint256(raffleState) == 1); // CALCULATING
  }

    ////////////////////////////////////////////////////////
    /////////////  FULLFILLRANDOMWORDS ////////////////////
    ///////////////////////////////////////////////////////

    function testFullfillrandomWordsCanOlnyBeCalledAfterPerformUpkeep(uint256 randomRequestId) raffleEntered public {
        // Act
        vm.expectRevert(VRFCoordinatorV2_5Mock.InvalidRequest.selector);
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(randomRequestId, address(raffle));
        
    }
}
