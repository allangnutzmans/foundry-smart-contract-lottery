// SPDX-LICENSE-Identifier: MIT
pragma solidity 0.8.19;

import { Test } from 'forge-std/Test.sol';
import { Vm } from 'forge-std/Vm.sol';
import { DeployRaffle } from '../../script/DeployRaffle.s.sol';
import { RaffleBase } from '../../src/RaffleBase.sol';
import { HelperConfig, CodeConstants } from '../../script/HelperConfig.s.sol';
import { VRFCoordinatorV2_5Mock } from '@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol';

contract RaffleTest is Test, CodeConstants {
  event RaffleEntered(address indexed player);
  event WinnerPicked(address indexed player);

  RaffleBase public raffle;
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
    (raffle, helperConfig) = deployer.run();
    HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
    entranceFee = config.entranceFee;
    interval = config.interval;
    vrfCoordinator = config.vrfCoordinator;
    gasLane = config.gasLane;
    subscriptionId = config.subscriptionId;
    callbackGasLimit = config.callbackGasLimit;
    vm.deal(PLAYER, STARTING_PLAYER_BALANCE);

    if (block.chainid == LOCAL_CHAIN_ID) {
      address deployerAddr = helperConfig.getConfig().account; // Owner of the subscription
      vm.prank(deployerAddr);
      VRFCoordinatorV2_5Mock(vrfCoordinator).addConsumer(subscriptionId, address(raffle));
      vm.prank(deployerAddr);
      VRFCoordinatorV2_5Mock(vrfCoordinator).fundSubscription(subscriptionId, 100 ether);
    }

  }

  function testConstructorInitializesState() public {
    RaffleBase localRaffle = new RaffleBase(entranceFee, interval, vrfCoordinator, gasLane, subscriptionId, callbackGasLimit);
    assertEq(localRaffle.getEntranceFee(), entranceFee);
    assertEq(localRaffle.getInterval(), interval);
    assertEq(localRaffle.getVrfCoordinator(), vrfCoordinator);
    assertEq(localRaffle.getGasLane(), gasLane);
    assertEq(localRaffle.getSubscriptionId(), subscriptionId);
    assertEq(localRaffle.getCallbackGasLimit(), callbackGasLimit);
    assertEq(uint(localRaffle.getRaffleState()), 0); // Should be OPEN
  }

  function testRaffleInitializesOpen() public view {
    assert(raffle.getRaffleState() == RaffleBase.RaffleState.OPEN);
  }

  function testRaffleRevertsWhenYouDontPayEnough() public {
    // Arange
    vm.prank(PLAYER);
    // Act -Assert
    vm.expectRevert(RaffleBase.Raffle__SendMoreToEnterRaffle.selector);
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
    vm.expectRevert(RaffleBase.Raffle_RaffleNotOpen.selector);
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
    RaffleBase.RaffleState raffleState = raffle.getRaffleState();

    vm.prank(PLAYER);
    raffle.enterRaffle{ value: entranceFee }();
    currentBalance = currentBalance + entranceFee;
    numPlayers = numPlayers + 1;

    // Act - Assert
    vm.expectRevert(abi.encodeWithSelector(RaffleBase.Raffle_UpkeepNotNeeded.selector, currentBalance, numPlayers, raffleState));
    raffle.performUpkeep('');
  }

  function testPerformUpkeepChangesState() public {
    vm.prank(PLAYER);
    raffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    raffle.performUpkeep('');
    assertEq(uint(raffle.getRaffleState()), 1); // CALCULATING
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
    RaffleBase.RaffleState raffleState = raffle.getRaffleState();
    assert(uint256(requestId) > 0);
    assert(uint256(raffleState) == 1); // CALCULATING
  }

  ////////////////////////////////////////////////////////
  /////////////  FULLFILLRANDOMWORDS ////////////////////
  ///////////////////////////////////////////////////////

  modifier skipFork() {
    if (block.chainid != LOCAL_CHAIN_ID) {
      return;
    }
    _;
  }


  function testFullfillrandomWordsCanOlnyBeCalledAfterPerformUpkeep(uint256 randomRequestId) public raffleEntered skipFork {
    // Act
    vm.expectRevert(VRFCoordinatorV2_5Mock.InvalidRequest.selector);
    VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(randomRequestId, address(raffle));
  }

  function testFullfillrandomWordsPicksWinnerAndResetsAndSendsMoney() public raffleEntered skipFork {
    // Arrange
    uint256 additionalEntrants = 3;
    uint256 startingIndex = 1;
    address expectedWinner = address(1);

    for (uint256 i = startingIndex; i < additionalEntrants + startingIndex; i++) {
      address newPlayer = address(uint160(i));
      hoax(newPlayer, 1 ether);
      raffle.enterRaffle{ value: entranceFee }();
    }
    
    uint256 startingTimeStamp = raffle.getLastTimestamp();
    uint256 winnerStartingBalance = expectedWinner.balance;

    // Act
    vm.recordLogs();
    raffle.performUpkeep('');
    Vm.Log[] memory entries = vm.getRecordedLogs();
    bytes32 requestId = entries[1].topics[1];
    VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(raffle));

    // Assert
    address winner = raffle.getRecentWinner();
    RaffleBase.RaffleState raffleState = raffle.getRaffleState();
    uint256 winnerBalance = winner.balance;
    uint256 endingTimestamp = raffle.getLastTimestamp();
    uint256 prize = entranceFee * (additionalEntrants + 1);

    assert(winner == expectedWinner);
    assert(uint256(raffleState) == 0);
    assert(winnerBalance == winnerStartingBalance + prize);
    assert(endingTimestamp > startingTimeStamp);
  }
}
