// SPDX-License-Identifier: MIT

// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// view & pure functions

pragma solidity 0.8.19;

import { VRFConsumerBaseV2Plus } from '@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol';
import { VRFV2PlusClient } from '@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol';

/**
 * @title A Base Raffle Contract
 * @author Allan Gnutzmans, Patrick Collins
 * @notice This contract were made with the Cyfrin Updraft course!
 */

contract RaffleBase is VRFConsumerBaseV2Plus {
  /* Errors */
  error Raffle__SendMoreToEnterRaffle();
  error Raffle__TransferFailed();
  error Raffle_RaffleNotOpen();
  error Raffle_UpkeepNotNeeded(uint256 balance, uint256 length, uint256 raffleState);
  error Raffle__AlreadyEntered();

  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint32 private constant NUM_WORDS = 1;
  
  uint256 internal immutable i_entranceFee;
  bytes32 internal immutable i_keyHash;
  uint256 internal immutable i_subscriptionId;
  uint256 internal immutable i_interval;
  uint32 internal immutable i_callbackGasLimit;
  uint256 internal s_lastTimestamp;
  address internal s_recentWinner;
  uint256 internal s_roundId;
  mapping(uint256 => mapping(uint256 => address payable)) internal s_players;
  uint256 internal s_playerCount;
  RaffleState internal s_raffleState;

  enum RaffleState {
    OPEN, // 0
    CALCULATING //1
  }

  /* Events - Always emit a event when update the storage */
  event RaffleEntered(address indexed player);
  event WinnerPicked(address indexed player);
  event RequestRaffleWinner(uint256 indexed requestId);
  event RaffleStarted(uint256 indexed roundId);

  constructor(
    uint256 entranceFee,
    uint256 interval,
    address vrfCoordinator,
    bytes32 gasLane,
    uint256 subscriptionId,
    uint32 callbackGasLimit
  ) VRFConsumerBaseV2Plus(vrfCoordinator) {
    i_entranceFee = entranceFee;
    i_interval = interval;
    i_keyHash = gasLane;
    i_subscriptionId = subscriptionId;
    i_callbackGasLimit = callbackGasLimit;

    s_lastTimestamp = block.timestamp;
    s_raffleState = RaffleState.OPEN;
    s_roundId = 1;
    emit RaffleStarted(s_roundId);
  }

  function enterRaffle() public virtual payable onlyOpen paysEnough {
    s_playerCount++;
    s_players[s_roundId][s_playerCount - 1] = payable(msg.sender);
    emit RaffleEntered(msg.sender);
  }

  // Get a random number from chainlink Verifiable Random Function(VRF) 2.5, consists in 2 transactions
  // 1. Request RNG - Random number genetrator
  // 2. Get RNG

  // When should the winner be picked?
  /**
   * @dev Function that Chainlink Automation nodes will call to see
   * if the lottery is ready to have a winner picked.
   *
   * @param - ignored
   * @return upkeepNeeded  - true if is time to restart the lottery
   * @return - ignored
   */

  function checkUpkeep(bytes memory /* checkData */) public view virtual returns (bool upkeepNeeded, bytes memory /* performData */) {
    bool isOpen = RaffleState.OPEN == s_raffleState;
    bool timePassed = ((block.timestamp - s_lastTimestamp) >= i_interval);
    bool hasPlayers = s_playerCount > 0;
    bool hasBalance = address(this).balance > 0;
    upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers);
    return (upkeepNeeded, '');
  }

  function performUpkeep(bytes calldata /* performData */) public virtual {
    (bool upkeppNeeded, ) = checkUpkeep('');
    if (!upkeppNeeded) {
      revert Raffle_UpkeepNotNeeded(address(this).balance, s_playerCount, uint256(s_raffleState));
    }

    s_raffleState = RaffleState.CALCULATING;
    VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient.RandomWordsRequest({
      keyHash: i_keyHash,
      subId: i_subscriptionId,
      requestConfirmations: REQUEST_CONFIRMATIONS,
      callbackGasLimit: i_callbackGasLimit,
      numWords: NUM_WORDS,
      extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({ nativePayment: false }))
    });
    uint256 requestId = s_vrfCoordinator.requestRandomWords(request);
    emit RequestRaffleWinner(requestId);
  }
  // CEI: Checks, Effects, Interactions Pattern
  // or
  // FREI-PI: Function Requirements, Effects-Interactions, Protocol Invariants
  function fulfillRandomWords(uint256 /* requestId */, uint256[] calldata randomWords) internal virtual override {
    // Guaranteed to be less than s_playerCount.
    // Only considers players from the current round (0..s_playerCount-1)
    uint256 indexOfWinner = randomWords[0] % s_playerCount;
    address payable recentWinner = s_players[s_roundId][indexOfWinner];
    s_recentWinner = recentWinner;

    s_raffleState = RaffleState.OPEN;
    s_playerCount = 0;
    s_lastTimestamp = block.timestamp;
    s_roundId++; // Increment round ID for next round
    emit WinnerPicked(s_recentWinner);
    emit RaffleStarted(s_roundId);

    (bool success, ) = recentWinner.call{ value: address(this).balance }('');
    if (!success) {
      revert Raffle__TransferFailed();
    }
  }

    /*
        Modifiers
    */
   modifier onlyOpen() {
        if (s_raffleState != RaffleState.OPEN) revert Raffle_RaffleNotOpen();
        _;
    }

    modifier paysEnough() {
        if (msg.value < i_entranceFee) revert Raffle__SendMoreToEnterRaffle();
        _;
    }


    /*
    * Getters
    */
    function getEntranceFee() public view virtual returns (uint256) {
    return i_entranceFee;
    }

    function getInterval() public view virtual returns (uint256) {
    return i_interval;
    }

    function getVrfCoordinator() public view virtual returns (address) {
    return address(s_vrfCoordinator);
    }

    function getGasLane() public view virtual returns (bytes32) {
    return i_keyHash;
    }

    function getSubscriptionId() public view virtual returns (uint256) {
    return i_subscriptionId;
    }

    function getCallbackGasLimit() public view virtual returns (uint32) {
    return i_callbackGasLimit;
    }

    function getRaffleState() public view virtual returns (RaffleState) {
    return s_raffleState;
    }

    function getPlayer(uint256 index) public view virtual returns (address) {
    return s_players[s_roundId][index];
    }

    function getLastTimestamp() public view virtual returns (uint256) {
    return s_lastTimestamp;
    }

    function getRecentWinner() public view virtual returns (address) {
    return s_recentWinner;
    }

    function getNumberOfPlayers() public view virtual returns (uint256) {
    return s_playerCount;
    }

    function getRoundId() public view virtual returns (uint256) {
    return s_roundId;
  }

    function getTimeUntilNextDraw() public view virtual returns (uint256) {
        if (block.timestamp >= s_lastTimestamp + i_interval) {
            return 0;
        } else {
            return (s_lastTimestamp + i_interval) - block.timestamp;
        }
    }
}
