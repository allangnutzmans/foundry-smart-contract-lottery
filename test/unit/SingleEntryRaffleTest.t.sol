// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Test } from "forge-std/Test.sol";
import { Vm } from "forge-std/Vm.sol";
import { DeploySingleEntryRaffle } from "../../script/DeploySingleEntryRaffle.s.sol";
import { SingleEntryRaffle } from "../../src/SingleEntryRaffle.sol";
import { RaffleBase } from "../../src/RaffleBase.sol";
import { HelperConfig, CodeConstants } from "../../script/HelperConfig.s.sol";
import { VRFCoordinatorV2_5Mock } from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract SingleEntryRaffleTest is Test, CodeConstants {
  event RaffleEntered(address indexed player);
  event WinnerPicked(address indexed winner);
  event RequestRaffleWinner(uint256 indexed requestId);
  event RaffleStarted(uint256 indexed roundId);

  SingleEntryRaffle public singleEntryRaffle;
  HelperConfig public helperConfig;

  address public PLAYER = makeAddr('Player');
  address public PLAYER2 = makeAddr('Player2');
  address public PLAYER3 = makeAddr('Player3');
  uint256 public constant STARTING_PLAYER_BALANCE = 10 ether;

  uint256 entranceFee;
  uint256 interval;
  address vrfCoordinator;
  bytes32 gasLane;
  uint256 subscriptionId;
  uint32 callbackGasLimit;

  function setUp() external {
    DeploySingleEntryRaffle deployer = new DeploySingleEntryRaffle();
    (singleEntryRaffle, helperConfig) = deployer.run();
    HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
    entranceFee = config.entranceFee;
    interval = config.interval;
    vrfCoordinator = config.vrfCoordinator;
    gasLane = config.gasLane;
    subscriptionId = config.subscriptionId;
    callbackGasLimit = config.callbackGasLimit;
    
    vm.deal(PLAYER, STARTING_PLAYER_BALANCE);
    vm.deal(PLAYER2, STARTING_PLAYER_BALANCE);
    vm.deal(PLAYER3, STARTING_PLAYER_BALANCE);

    if (block.chainid == LOCAL_CHAIN_ID) {
      address deployerAddr = helperConfig.getConfig().account; // Owner of the subscription
      vm.prank(deployerAddr);
      VRFCoordinatorV2_5Mock(vrfCoordinator).addConsumer(subscriptionId, address(singleEntryRaffle));
      vm.prank(deployerAddr);
      VRFCoordinatorV2_5Mock(vrfCoordinator).fundSubscription(subscriptionId, 100 ether);
    }
  }

  ////////////////////////////////
  // Constructor Tests (inherited from base functionality)
  ////////////////////////////////
  function testConstructorInitializesState() public {
    SingleEntryRaffle localRaffle = new SingleEntryRaffle(entranceFee, interval, vrfCoordinator, gasLane, subscriptionId, callbackGasLimit);
    assertEq(localRaffle.getEntranceFee(), entranceFee);
    assertEq(localRaffle.getInterval(), interval);
    assertEq(localRaffle.getVrfCoordinator(), vrfCoordinator);
    assertEq(localRaffle.getGasLane(), gasLane);
    assertEq(localRaffle.getSubscriptionId(), subscriptionId);
    assertEq(localRaffle.getCallbackGasLimit(), callbackGasLimit);
    assertEq(uint(localRaffle.getRaffleState()), 0); // Should be OPEN
    assertEq(localRaffle.getNumberOfPlayers(), 0); // No players initially
    assertEq(localRaffle.getRecentWinner(), address(0)); // No recent winner initially
    assertEq(localRaffle.getRoundId(), 1); // Initial round ID
  }

  function testRaffleInitializesOpen() public view {
    assert(singleEntryRaffle.getRaffleState() == RaffleBase.RaffleState.OPEN);
  }

  ////////////////////////////////
  // Entry Tests
  ////////////////////////////////
  function testRaffleRevertsWhenYouDontPayEnough() public {
    vm.prank(PLAYER);
    vm.expectRevert(RaffleBase.Raffle__SendMoreToEnterRaffle.selector);
    singleEntryRaffle.enterRaffle();
  }

  function testRaffleRecordsPlayersWhenTheyEnter() public {
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    address playerAdded = singleEntryRaffle.getPlayer(0);
    assertEq(playerAdded, PLAYER);
    assertEq(singleEntryRaffle.getNumberOfPlayers(), 1);
  }

  function testEnteringRaffleEmitsEvent() public {
    vm.prank(PLAYER);
    vm.expectEmit(true, false, false, false, address(singleEntryRaffle));
    emit RaffleEntered(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
  }

  ////////////////////////////////
  // Single Entry Specific Tests
  ////////////////////////////////
  function testPlayerCannotEnterTwiceInSameRound() public {
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    
    vm.prank(PLAYER);
    vm.expectRevert(RaffleBase.Raffle__AlreadyEntered.selector);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
  }

  function testPlayerHasEnteredReturnsTrueAfterEntry() public {
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    
    assertTrue(singleEntryRaffle.getPlayerHasEntered(PLAYER));
    assertFalse(singleEntryRaffle.getPlayerHasEntered(PLAYER2));
  }

  function testPlayerHasEnteredReturnsFalseBeforeEntry() public view {
    assertFalse(singleEntryRaffle.getPlayerHasEntered(PLAYER));
  }

  function testMultiplePlayersCanEnterOnceInSameRound() public {
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    
    vm.prank(PLAYER2);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    
    vm.prank(PLAYER3);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    
    assertEq(singleEntryRaffle.getNumberOfPlayers(), 3);
    assertTrue(singleEntryRaffle.getPlayerHasEntered(PLAYER));
    assertTrue(singleEntryRaffle.getPlayerHasEntered(PLAYER2));
    assertTrue(singleEntryRaffle.getPlayerHasEntered(PLAYER3));
  }

  function testPlayerCanEnterNewRoundAfterPreviousRoundEnds() public raffleEnteredAndFinished skipFork {
    // After raffle has been finished (new round started), player should be able to enter again
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    
    assertTrue(singleEntryRaffle.getPlayerHasEntered(PLAYER));
    assertEq(singleEntryRaffle.getNumberOfPlayers(), 1);
  }

  ////////////////////////////////
  // Entry Restriction Tests
  ////////////////////////////////
  function testDontAllowPlayersEnterWhileRaffleIsCalculating() public {
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    singleEntryRaffle.performUpkeep('');
    
    vm.expectRevert(RaffleBase.Raffle_RaffleNotOpen.selector);
    vm.prank(PLAYER2);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
  }

  ////////////////////////////////
  // Upkeep Tests (inherited from base functionality)
  ////////////////////////////////
  function testCheckUpkeepReturnsFalseIfItHasNoBalance() public {
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    (bool upkeepNeeded, ) = singleEntryRaffle.checkUpkeep('');
    assertFalse(upkeepNeeded);
  }

  function testCheckUpkeepReturnsFalseIfRaffleNotOpen() public {
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    singleEntryRaffle.performUpkeep('');
    (bool upkeepNeeded, ) = singleEntryRaffle.checkUpkeep('');
    assertFalse(upkeepNeeded);
  }

  function testCheckUpkeepReturnsFalseIfNotEnoughTimePassed() public {
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    (bool upkeepNeeded, ) = singleEntryRaffle.checkUpkeep('');
    assertFalse(upkeepNeeded);
  }

  function testCheckUpkeepReturnsTrueWhenReady() public {
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    (bool upkeepNeeded, ) = singleEntryRaffle.checkUpkeep('');
    assertTrue(upkeepNeeded);
  }

  function testPerformUpkeepCanOnlyRunIfCheckUpKeepIsTrue() public {
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    singleEntryRaffle.performUpkeep('');
  }

  function testPerformUpkeepRevertsIfCheckUpKeepIsFalse() public {
    uint256 currentBalance = 0;
    uint256 numPlayers = 0; 
    RaffleBase.RaffleState raffleState = singleEntryRaffle.getRaffleState();

    vm.expectRevert(abi.encodeWithSelector(RaffleBase.Raffle_UpkeepNotNeeded.selector, currentBalance, numPlayers, raffleState));
    singleEntryRaffle.performUpkeep('');
  }

  function testPerformUpkeepChangesStateAndEmitsRequestId() public raffleEntered {
    vm.recordLogs();
    singleEntryRaffle.performUpkeep('');
    Vm.Log[] memory entries = vm.getRecordedLogs();
    bytes32 requestId = entries[1].topics[1];
    assert(uint256(requestId) > 0);
    assert(uint(singleEntryRaffle.getRaffleState()) == 1); // CALCULATING
  }

  ////////////////////////////////
  // Getter Tests
  ////////////////////////////////
  function testGettersReturnCorrectValues() public view {
    assertEq(singleEntryRaffle.getEntranceFee(), entranceFee);
    assertEq(singleEntryRaffle.getInterval(), interval);
    assertEq(singleEntryRaffle.getVrfCoordinator(), vrfCoordinator);
    assertEq(singleEntryRaffle.getGasLane(), gasLane);
    assertEq(singleEntryRaffle.getSubscriptionId(), subscriptionId);
    assertEq(singleEntryRaffle.getCallbackGasLimit(), callbackGasLimit);
  }

  function testTimeUntilNextDrawCalculation() public view {
    uint256 timePassed = block.timestamp - singleEntryRaffle.getLastTimestamp();
    if (timePassed >= interval) {
        assertEq(singleEntryRaffle.getTimeUntilNextDraw(), 0);
    } else {
        assertEq(singleEntryRaffle.getTimeUntilNextDraw(), interval - timePassed);
    }
  }

  ////////////////////////////////
  // Integration Tests
  ////////////////////////////////
  function testFulfillRandomWordsPicksWinnerResetsStateAndSendsMoney() public raffleEntered skipFork {
    uint256 additionalEntrants = 2;
    address[] memory playersInRound = new address[](additionalEntrants + 1);
    playersInRound[0] = PLAYER;

    for (uint256 i = 0; i < additionalEntrants; i++) {
      address newPlayer = makeAddr(string.concat("Player", vm.toString(i + 4))); // Start from Player4
      hoax(newPlayer, 1 ether);
      singleEntryRaffle.enterRaffle{ value: entranceFee }();
      playersInRound[i + 1] = newPlayer;
    }
    
    // Simulate performUpkeep which would trigger fulfillRandomWords off-chain
    vm.recordLogs();
    singleEntryRaffle.performUpkeep('');
    Vm.Log[] memory entries = vm.getRecordedLogs();
    bytes32 requestId = entries[1].topics[1];

    // Simulate Chainlink VRF call
    VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(singleEntryRaffle));

    // Assertions
    address actualWinner = singleEntryRaffle.getRecentWinner();
    assertNotEq(actualWinner, address(0)); // A winner should be picked
    assertEq(uint(singleEntryRaffle.getRaffleState()), uint(RaffleBase.RaffleState.OPEN));
    assertEq(singleEntryRaffle.getNumberOfPlayers(), 0);
    assertEq(address(singleEntryRaffle).balance, 0);

    // Verify winner's balance (simplified: check if prize was transferred)
    bool foundWinnerWithPrize = false;
    for(uint256 i = 0; i < playersInRound.length; i++){
        if(playersInRound[i] == actualWinner){
            foundWinnerWithPrize = true;
            break;
        }
    }
    assertTrue(foundWinnerWithPrize, "Winner not found among players or prize not transferred");
  }

  function testPlayerEntryStatusResetAfterRoundEnd() public raffleEnteredAndFinished skipFork {
    // After round ends, player should be able to enter new round
    assertFalse(singleEntryRaffle.getPlayerHasEntered(PLAYER));
    
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    assertTrue(singleEntryRaffle.getPlayerHasEntered(PLAYER));
  }

  ////////////////////////////////
  // Modifiers
  ////////////////////////////////
  modifier raffleEntered() {
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    _;
  }

  modifier raffleEnteredAndFinished() {
    vm.prank(PLAYER);
    singleEntryRaffle.enterRaffle{ value: entranceFee }();
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    
    // Complete the raffle cycle
    vm.recordLogs();
    singleEntryRaffle.performUpkeep('');
    Vm.Log[] memory entries = vm.getRecordedLogs();
    bytes32 requestId = entries[1].topics[1];
    VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(singleEntryRaffle));
    _;
  }

  modifier skipFork() {
    if (block.chainid != LOCAL_CHAIN_ID) {
      return;
    }
    _;
  }
}
