// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { RaffleBase } from "./RaffleBase.sol";

/**
 * MultiTicketRaffle
 *
 * Main rules:
 * - Each player can buy up to MAX_TICKETS_PER_PLAYER (5) per round.
 * - Ticket prices increase according to PRICE_BPS (basis points).
 *   Ex: PRICE_BPS = [10000, 15000, 20000, 25000, 30000] (where 10000 = 100%).
 * - To calculate the total cost of n tickets (from ticket k+1 to k+n)
 *   we use a prefix-sum (PRICE_PREFIX_BPS) to compute the sum in O(1).
 *
 * Note on winner selection:
 * - To maintain compatibility with RaffleBase which chooses a player index
 *   (VRF -> index), we store one entry per ticket in s_players
 *   (i.e., we repeat the address as many times as tickets purchased).
 * - This repetition is safe because max 5 entries per tx per player; if you want
 *   to avoid s_players growth and loops in selection, see offchain suggestions
 *   at the end of the file (Merkle / aggregation / commit + off-chain service).
 */
contract TicketRaffle is RaffleBase {
  uint8 public constant MAX_TICKETS_PER_PLAYER = 5;

  // basis points per ticket (10000 = 100%)
  uint16[5] private PRICE_BPS = [uint16(10000), uint16(15000), uint16(20000), uint16(25000), uint16(30000)];
  // prefix sums of PRICE_BPS in basis points: PRICE_PREFIX_BPS[0] = 0
  uint32[6] private PRICE_PREFIX_BPS;

  // tickets owned by player for a given round
  mapping(uint256 => mapping(address => uint8)) private s_ticketsByRound;

  // total tickets in a given round (equivalente ao players.length se cada ticket = 1 entrada)
  mapping(uint256 => uint256) private s_totalTicketsByRound;

  event TicketsPurchased(address indexed buyer, uint256 indexed roundId, uint8 bought, uint8 totalForPlayer);
  event TicketsRefunded(address indexed buyer, uint256 indexed roundId, uint8 refunded);

  constructor(
    uint256 entranceFee,
    uint256 interval,
    address vrfCoordinator,
    bytes32 gasLane,
    uint256 subscriptionId,
    uint32 callbackGasLimit
  ) RaffleBase(entranceFee, interval, vrfCoordinator, gasLane, subscriptionId, callbackGasLimit) {
    // Precompute prefix sums for BPS (executes only once on deploy)
    PRICE_PREFIX_BPS[0] = 0;
    for (uint256 i = 0; i < PRICE_BPS.length; i++) {
      PRICE_PREFIX_BPS[i + 1] = PRICE_PREFIX_BPS[i] + PRICE_BPS[i];
    }
  }

  /**
   * buyTickets
   * - count: how many tickets to buy now (1..5)
   * - validates that it does not exceed MAX_TICKETS_PER_PLAYER per round
   * - calculates the total cost in O(1) using prefix sums
   * - registers entries in the players array (each ticket = 1 push),
   *   this is necessary if RaffleBase draws by index in s_players.
   */
  function buyTickets(uint8 count) external payable onlyOpen {
    require(count >= 1, "Must buy at least 1 ticket");
    require(count <= MAX_TICKETS_PER_PLAYER, "Too many tickets in single call");

    uint256 roundId = getRoundId();
    uint8 current = s_ticketsByRound[roundId][msg.sender];
    require(current + count <= MAX_TICKETS_PER_PLAYER, "Exceeds max tickets per player this round");

    // calculate total bps: prefix[current + count] - prefix[current]
    uint32 bpsBefore = PRICE_PREFIX_BPS[uint256(current)];
    uint32 bpsAfter = PRICE_PREFIX_BPS[uint256(current + count)];
    uint32 totalBps = bpsAfter - bpsBefore; // sum of BPS for tickets purchased now

    // calculate totalFee = entranceFee * totalBps / 10000
    uint256 base = getEntranceFee();
    uint256 totalFee = (base * uint256(totalBps)) / 10000;

    require(msg.value == totalFee, "Incorrect ETH sent for tickets");

    // Register tickets: add one entry per ticket to the base's players array
    // NOTE: we assume RaffleBase has `address[] internal s_players;`
    // If your RaffleBase has a different internal array name, adjust here.
    for (uint8 i = 0; i < count; i++) {
      // push to base players array so index selection works
      s_players[s_roundId][s_playerCount++] = payable(msg.sender);
    }

    // Update ticket counter per player and total tickets in the round
    s_ticketsByRound[roundId][msg.sender] = current + count;
    s_totalTicketsByRound[roundId] += count;

    emit TicketsPurchased(msg.sender, roundId, count, current + count);
  }

  /**
   * getTicketCountForPlayer
   */
  function getTicketCountForPlayer(uint256 roundId, address player) external view returns (uint8) {
    return s_ticketsByRound[roundId][player];
  }

  /**
   * getTotalTicketsInRound
   */
  function getTotalTicketsInRound(uint256 roundId) external view returns (uint256) {
    return s_totalTicketsByRound[roundId];
  }

  /**
   * getNextTicketPriceForPlayer
   * Returns the price (in wei) for the player's next ticket in this round
   */
  function getNextTicketPriceForPlayer(address player) public view returns (uint256) {
    uint256 roundId = getRoundId();
    uint8 current = s_ticketsByRound[roundId][player];
    require(current < MAX_TICKETS_PER_PLAYER, "No more tickets allowed");
    uint16 bps = PRICE_BPS[uint256(current)]; // price of the next ticket
    uint256 base = getEntranceFee();
    return (base * uint256(bps)) / 10000;
  }

  /**
   * Simple overwrites to maintain compatibility with SingleEntryRaffle public interface.
   * The functions below redirect to the base implementation.
   */
  function enterRaffle() public payable override onlyOpen paysEnough {
    // For compatibility, behaves as buying 1 ticket with progressive pricing logic.
    // Calculate the correct price for the first ticket for this player
    uint256 roundId = getRoundId();
    uint8 current = s_ticketsByRound[roundId][msg.sender];
    require(current < MAX_TICKETS_PER_PLAYER, "Exceeds max tickets per player this round");
    
    uint32 bpsBefore = PRICE_PREFIX_BPS[uint256(current)];
    uint32 bpsAfter = PRICE_PREFIX_BPS[uint256(current + 1)];
    uint32 totalBps = bpsAfter - bpsBefore;
    
    uint256 base = getEntranceFee();
    uint256 expectedFee = (base * uint256(totalBps)) / 10000;
    
    require(msg.value == expectedFee, "Incorrect ETH sent for next ticket");
    
    // Add player entry
    s_players[s_roundId][s_playerCount++] = payable(msg.sender);
    
    // Update ticket counts
    s_ticketsByRound[roundId][msg.sender] = current + 1;
    s_totalTicketsByRound[roundId] += 1;
    
    emit RaffleEntered(msg.sender);
    emit TicketsPurchased(msg.sender, roundId, 1, current + 1);
  }

  function checkUpkeep(bytes memory checkData) public view override returns (bool upkeepNeeded, bytes memory /* performData */) {
    return super.checkUpkeep(checkData);
  }

  function performUpkeep(bytes calldata performData) public override {
    super.performUpkeep(performData);
  }

  function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
    super.fulfillRandomWords(requestId, randomWords);
  }

  /* ---------- NOTE ON CLEANUP BETWEEN ROUNDS ---------- */
  // It's important that RaffleBase "resets" the s_players array and state
  // when a new round starts. Here we are storing by round: s_ticketsByRound[roundId],
  // and s_totalTicketsByRound[roundId] to avoid confusion between rounds.
  // If your RaffleBase automatically clears s_players between rounds, then it's fine.
  /* ----------------------------------------------------- */
}
