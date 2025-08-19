// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Test, console2 } from "forge-std/Test.sol";
import { Vm } from "forge-std/Vm.sol";
import { DeployTicketRaffle } from "../../script/DeployTicketRaffle.s.sol";
import { TicketRaffle } from "../../src/TicketRaffle.sol";
import { RaffleBase } from "../../src/RaffleBase.sol";
import { HelperConfig, CodeConstants } from "../../script/HelperConfig.s.sol";
import { VRFCoordinatorV2_5Mock } from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract TicketRaffleTest is Test, CodeConstants {
  event RaffleEntered(address indexed player);
  event WinnerPicked(address indexed winner);
  event RequestRaffleWinner(uint256 indexed requestId);
  event RaffleStarted(uint256 indexed roundId);
  event TicketsPurchased(address indexed buyer, uint256 indexed roundId, uint8 bought, uint8 totalForPlayer);
  event TicketsRefunded(address indexed buyer, uint256 indexed roundId, uint8 refunded);

  TicketRaffle public ticketRaffle;
  HelperConfig public helperConfig;

  address public PLAYER = makeAddr('Player');
  address public PLAYER2 = makeAddr('Player2');
  address public PLAYER3 = makeAddr('Player3');
  uint256 public constant STARTING_PLAYER_BALANCE = 100 ether;

  uint256 entranceFee;
  uint256 interval;
  address vrfCoordinator;
  bytes32 gasLane;
  uint256 subscriptionId;
  uint32 callbackGasLimit;

  // Pricing constants for testing (basis points)
  uint16[5] private PRICE_BPS = [uint16(10000), uint16(15000), uint16(20000), uint16(25000), uint16(30000)];
  uint32[6] private PRICE_PREFIX_BPS = [uint32(0), uint32(10000), uint32(25000), uint32(45000), uint32(70000), uint32(100000)];

  function setUp() external {
    DeployTicketRaffle deployer = new DeployTicketRaffle();
    (ticketRaffle, helperConfig) = deployer.run();
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
      address deployerAddr = helperConfig.getConfig().account;
      vm.prank(deployerAddr);
      VRFCoordinatorV2_5Mock(vrfCoordinator).addConsumer(subscriptionId, address(ticketRaffle));
      vm.prank(deployerAddr);
      VRFCoordinatorV2_5Mock(vrfCoordinator).fundSubscription(subscriptionId, 100 ether);
    }
  }

  ////////////////////////////////
  // Constructor Tests
  ////////////////////////////////
  function testConstructorInitializesState() public {
    TicketRaffle localRaffle = new TicketRaffle(entranceFee, interval, vrfCoordinator, gasLane, subscriptionId, callbackGasLimit);
    assertEq(localRaffle.getEntranceFee(), entranceFee);
    assertEq(localRaffle.getInterval(), interval);
    assertEq(localRaffle.getVrfCoordinator(), vrfCoordinator);
    assertEq(localRaffle.getGasLane(), gasLane);
    assertEq(localRaffle.getSubscriptionId(), subscriptionId);
    assertEq(localRaffle.getCallbackGasLimit(), callbackGasLimit);
    assertEq(uint(localRaffle.getRaffleState()), 0); // Should be OPEN
    assertEq(localRaffle.getNumberOfPlayers(), 0);
    assertEq(localRaffle.getRecentWinner(), address(0));
    assertEq(localRaffle.getRoundId(), 1);
    assertEq(localRaffle.MAX_TICKETS_PER_PLAYER(), 5);
  }

  function testRaffleInitializesOpen() public view {
    assert(ticketRaffle.getRaffleState() == RaffleBase.RaffleState.OPEN);
  }

  ////////////////////////////////
  // Ticket Pricing Tests
  ////////////////////////////////
  function testGetNextTicketPriceForPlayerFirst() public view {
    uint256 expectedPrice = (entranceFee * 10000) / 10000; // 100% for first ticket
    assertEq(ticketRaffle.getNextTicketPriceForPlayer(PLAYER), expectedPrice);
  }

  function testGetNextTicketPriceForPlayerProgressive() public {
    // Buy first ticket
    uint256 firstTicketPrice = (entranceFee * 10000) / 10000; // 100%
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: firstTicketPrice}(1);
    
    // Second ticket should cost 150%
    uint256 expectedSecondPrice = (entranceFee * 15000) / 10000;
    assertEq(ticketRaffle.getNextTicketPriceForPlayer(PLAYER), expectedSecondPrice);
    
    // Buy second ticket
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: expectedSecondPrice}(1);
    
    // Third ticket should cost 200%
    uint256 expectedThirdPrice = (entranceFee * 20000) / 10000;
    assertEq(ticketRaffle.getNextTicketPriceForPlayer(PLAYER), expectedThirdPrice);
  }

  function testGetNextTicketPriceRevertsWhenMaxReached() public {
    // Buy all 5 tickets
    uint256 totalCost = calculateTotalCost(0, 5);
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: totalCost}(5);
    
    // Should revert when trying to get price for 6th ticket
    vm.expectRevert("No more tickets allowed");
    ticketRaffle.getNextTicketPriceForPlayer(PLAYER);
  }

  ////////////////////////////////
  // Single Ticket Purchase Tests
  ////////////////////////////////
  function testBuyOneTicketSuccess() public {
    uint256 roundId = ticketRaffle.getRoundId();
    uint256 ticketPrice = (entranceFee * 10000) / 10000; // 100%
    
    vm.prank(PLAYER);
    vm.expectEmit(true, true, false, true, address(ticketRaffle));
    emit TicketsPurchased(PLAYER, roundId, 1, 1);
    ticketRaffle.buyTickets{value: ticketPrice}(1);
    
    assertEq(ticketRaffle.getTicketCountForPlayer(roundId, PLAYER), 1);
    assertEq(ticketRaffle.getTotalTicketsInRound(roundId), 1);
    assertEq(ticketRaffle.getNumberOfPlayers(), 1);
  }

  function testBuyOneTicketIncorrectPayment() public {
    uint256 ticketPrice = (entranceFee * 10000) / 10000;
    
    vm.prank(PLAYER);
    vm.expectRevert("Incorrect ETH sent for tickets");
    ticketRaffle.buyTickets{value: ticketPrice - 1}(1); // Pay less
    
    vm.prank(PLAYER);
    vm.expectRevert("Incorrect ETH sent for tickets");
    ticketRaffle.buyTickets{value: ticketPrice + 1}(1); // Pay more
  }

  ////////////////////////////////
  // Multiple Ticket Purchase Tests
  ////////////////////////////////
  function testBuyMultipleTicketsAtOnce() public {
    uint256 roundId = ticketRaffle.getRoundId();
    // Buy 3 tickets at once: 100% + 150% + 200% = 450%
    uint256 totalCost = calculateTotalCost(0, 3);
    
    vm.prank(PLAYER);
    vm.expectEmit(true, true, false, true, address(ticketRaffle));
    emit TicketsPurchased(PLAYER, roundId, 3, 3);
    ticketRaffle.buyTickets{value: totalCost}(3);
    
    assertEq(ticketRaffle.getTicketCountForPlayer(roundId, PLAYER), 3);
    assertEq(ticketRaffle.getTotalTicketsInRound(roundId), 3);
    assertEq(ticketRaffle.getNumberOfPlayers(), 3); // 3 entries in players array
  }

  function testBuyTicketsIncrementally() public {
    uint256 roundId = ticketRaffle.getRoundId();
    
    // Buy 2 tickets first
    uint256 firstBatchCost = calculateTotalCost(0, 2);
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: firstBatchCost}(2);
    
    assertEq(ticketRaffle.getTicketCountForPlayer(roundId, PLAYER), 2);
    
    // Buy 2 more tickets (tickets 3 and 4)
    uint256 secondBatchCost = calculateTotalCost(2, 2);
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: secondBatchCost}(2);
    
    assertEq(ticketRaffle.getTicketCountForPlayer(roundId, PLAYER), 4);
    assertEq(ticketRaffle.getTotalTicketsInRound(roundId), 4);
    assertEq(ticketRaffle.getNumberOfPlayers(), 4);
  }

  ////////////////////////////////
  // Maximum Ticket Limit Tests
  ////////////////////////////////
  function testBuyMaxTicketsInOneTransaction() public {
    uint256 roundId = ticketRaffle.getRoundId();
    uint256 totalCost = calculateTotalCost(0, 5);
    
    vm.prank(PLAYER);
    vm.expectEmit(true, true, false, true, address(ticketRaffle));
    emit TicketsPurchased(PLAYER, roundId, 5, 5);
    ticketRaffle.buyTickets{value: totalCost}(5);
    
    assertEq(ticketRaffle.getTicketCountForPlayer(roundId, PLAYER), 5);
    assertEq(ticketRaffle.getTotalTicketsInRound(roundId), 5);
    assertEq(ticketRaffle.getNumberOfPlayers(), 5);
  }

  function testCannotBuyMoreThanMaxTickets() public {
    uint256 totalCost = calculateTotalCost(0, 5);
    
    // Buy max tickets first
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: totalCost}(5);
    
    // Try to buy one more
    uint256 sixthTicketCost = (entranceFee * 30000) / 10000; // This would be the 6th ticket price if allowed
    vm.prank(PLAYER);
    vm.expectRevert("Exceeds max tickets per player this round");
    ticketRaffle.buyTickets{value: sixthTicketCost}(1);
  }

  function testCannotBuySixTicketsAtOnce() public {
    vm.prank(PLAYER);
    vm.expectRevert("Too many tickets in single call");
    ticketRaffle.buyTickets{value: 1 ether}(6);
  }

  function testCannotBuyZeroTickets() public {
    vm.prank(PLAYER);
    vm.expectRevert("Must buy at least 1 ticket");
    ticketRaffle.buyTickets{value: 0}(0);
  }

  ////////////////////////////////
  // Multiple Players Tests
  ////////////////////////////////
  function testMultiplePlayersCanBuyTickets() public {
    uint256 roundId = ticketRaffle.getRoundId();
    
    // Player 1 buys 2 tickets
    uint256 player1Cost = calculateTotalCost(0, 2);
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: player1Cost}(2);
    
    // Player 2 buys 3 tickets
    uint256 player2Cost = calculateTotalCost(0, 3);
    vm.prank(PLAYER2);
    ticketRaffle.buyTickets{value: player2Cost}(3);
    
    // Player 3 buys 1 ticket
    uint256 player3Cost = calculateTotalCost(0, 1);
    vm.prank(PLAYER3);
    ticketRaffle.buyTickets{value: player3Cost}(1);
    
    assertEq(ticketRaffle.getTicketCountForPlayer(roundId, PLAYER), 2);
    assertEq(ticketRaffle.getTicketCountForPlayer(roundId, PLAYER2), 3);
    assertEq(ticketRaffle.getTicketCountForPlayer(roundId, PLAYER3), 1);
    assertEq(ticketRaffle.getTotalTicketsInRound(roundId), 6);
    assertEq(ticketRaffle.getNumberOfPlayers(), 6); // Total entries in players array
  }

  ////////////////////////////////
  // EnterRaffle Compatibility Tests
  ////////////////////////////////
  function testEnterRaffleBuysOneTicket() public {
    uint256 roundId = ticketRaffle.getRoundId();
    uint256 ticketPrice = (entranceFee * 10000) / 10000;
    
    vm.prank(PLAYER);
    ticketRaffle.enterRaffle{value: ticketPrice}();
    
    assertEq(ticketRaffle.getTicketCountForPlayer(roundId, PLAYER), 1);
    assertEq(ticketRaffle.getNumberOfPlayers(), 1);
  }

  function testEnterRaffleWithWrongAmount() public {
    vm.prank(PLAYER);
    vm.expectRevert(RaffleBase.Raffle__SendMoreToEnterRaffle.selector);
    ticketRaffle.enterRaffle{value: entranceFee - 1}(); // Pay less than entrance fee (modifier check)
    
    vm.prank(PLAYER);
    vm.expectRevert("Incorrect ETH sent for next ticket");
    ticketRaffle.enterRaffle{value: entranceFee + 1}(); // Pay more than required (custom check)
  }

  ////////////////////////////////
  // State Restriction Tests
  ////////////////////////////////
  function testCannotBuyTicketsWhenCalculating() public {
    uint256 ticketPrice = calculateTotalCost(0, 1);
    
    // Enter raffle and trigger calculation state
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: ticketPrice}(1);
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    ticketRaffle.performUpkeep('');
    
    // Should not be able to buy tickets while calculating
    vm.prank(PLAYER2);
    vm.expectRevert(RaffleBase.Raffle_RaffleNotOpen.selector);
    ticketRaffle.buyTickets{value: ticketPrice}(1);
  }

  ////////////////////////////////
  // Upkeep Tests (inherited functionality)
  ////////////////////////////////
  function testCheckUpkeepReturnsFalseIfNoTickets() public {
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    (bool upkeepNeeded, ) = ticketRaffle.checkUpkeep('');
    assertFalse(upkeepNeeded);
  }

  function testCheckUpkeepReturnsTrueWhenReady() public {
    uint256 ticketPrice = calculateTotalCost(0, 1);
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: ticketPrice}(1);
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    (bool upkeepNeeded, ) = ticketRaffle.checkUpkeep('');
    assertTrue(upkeepNeeded);
  }

  ////////////////////////////////
  // Round Reset Tests
  ////////////////////////////////
  function testTicketCountsResetAfterRoundEnd() public skipFork {
    uint256 initialRoundId = ticketRaffle.getRoundId();
    console2.log("Initial Round ID: %s", initialRoundId);
    
    // Buy tickets in first round
    uint256 ticketPrice = calculateTotalCost(0, 3);
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: ticketPrice}(3);
    
    console2.log("Tickets for player %s in initial round: %s", PLAYER, ticketRaffle.getTicketCountForPlayer(initialRoundId, PLAYER));
    assertEq(ticketRaffle.getTicketCountForPlayer(initialRoundId, PLAYER), 3);
    
    // Complete the round
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    vm.recordLogs();
    ticketRaffle.performUpkeep('');
    Vm.Log[] memory entries = vm.getRecordedLogs();
    bytes32 requestId = entries[1].topics[1];
    VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(ticketRaffle));
    
    uint256 newRoundId = ticketRaffle.getRoundId();
    console2.log("New Round ID: %s", newRoundId);
    assertEq(newRoundId, initialRoundId + 1);
    
    // Player should have 0 tickets in new round
    console2.log("Tickets for player %s in new round: %s", PLAYER, ticketRaffle.getTicketCountForPlayer(newRoundId, PLAYER));
    console2.log("Total tickets in new round: %s", ticketRaffle.getTotalTicketsInRound(newRoundId));
    assertEq(ticketRaffle.getTicketCountForPlayer(newRoundId, PLAYER), 0);
    assertEq(ticketRaffle.getTotalTicketsInRound(newRoundId), 0);
  }

  function testCanBuyTicketsInNewRound() public skipFork {
    // Buy max tickets in first round
    uint256 maxTicketsCost = calculateTotalCost(0, 5);
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: maxTicketsCost}(5);
    
    // Complete the round
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    vm.recordLogs();
    ticketRaffle.performUpkeep('');
    Vm.Log[] memory entries = vm.getRecordedLogs();
    bytes32 requestId = entries[1].topics[1];
    VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(ticketRaffle));
    
    uint256 newRoundId = ticketRaffle.getRoundId();
    
    // Should be able to buy tickets again in new round
    uint256 firstTicketPrice = calculateTotalCost(0, 1);
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: firstTicketPrice}(1);
    
    assertEq(ticketRaffle.getTicketCountForPlayer(newRoundId, PLAYER), 1);
  }

  ////////////////////////////////
  // Integration Test
  ////////////////////////////////
  function testFullRaffleFlowWithTickets() public skipFork {
    uint256 roundId = ticketRaffle.getRoundId();
    
    // Multiple players buy different amounts of tickets
    uint256 player1Cost = calculateTotalCost(0, 2); // 2 tickets
    vm.prank(PLAYER);
    ticketRaffle.buyTickets{value: player1Cost}(2);
    
    uint256 player2Cost = calculateTotalCost(0, 3); // 3 tickets
    vm.prank(PLAYER2);
    ticketRaffle.buyTickets{value: player2Cost}(3);
    
    uint256 player3Cost = calculateTotalCost(0, 1); // 1 ticket
    vm.prank(PLAYER3);
    ticketRaffle.buyTickets{value: player3Cost}(1);
    
    assertEq(ticketRaffle.getTotalTicketsInRound(roundId), 6);
    assertEq(ticketRaffle.getNumberOfPlayers(), 6); // 6 entries total
    
    // Complete raffle
    vm.warp(block.timestamp + interval + 1);
    vm.roll(block.number + 1);
    vm.recordLogs();
    ticketRaffle.performUpkeep('');
    Vm.Log[] memory entries = vm.getRecordedLogs();
    bytes32 requestId = entries[1].topics[1];
    VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(ticketRaffle));
    
    // Verify winner was picked and money transferred
    address winner = ticketRaffle.getRecentWinner();
    assertNotEq(winner, address(0));
    assertEq(address(ticketRaffle).balance, 0);
    assertEq(uint(ticketRaffle.getRaffleState()), uint(RaffleBase.RaffleState.OPEN));
  }

  ////////////////////////////////
  // Helper Functions
  ////////////////////////////////
  function calculateTotalCost(uint8 startTicket, uint8 count) internal view returns (uint256) {
    uint32 bpsBefore = PRICE_PREFIX_BPS[uint256(startTicket)];
    uint32 bpsAfter = PRICE_PREFIX_BPS[uint256(startTicket + count)];
    uint32 totalBps = bpsAfter - bpsBefore;
    return (entranceFee * uint256(totalBps)) / 10000;
  }

  ////////////////////////////////
  // Modifiers
  ////////////////////////////////
  modifier skipFork() {
    if (block.chainid != LOCAL_CHAIN_ID) {
      return;
    }
    _;
  }
}

