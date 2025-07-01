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
 * @title A Simple Raffle Contract
 * @author Allan Gnutzmans and Patrick Collins
 * @notice This contract were made with the Cyfrin Updraft course!
 */

contract Raffle is VRFConsumerBaseV2Plus {
  /* Errors */
  error Raffle__SendMoreToEnterRaffle();
  error Raffle__TransferFailed();
  error Raffle_RaffleNotOpen();
  error Raffle_UpkeepNotNeeded(uint256 balance, uint256 length, uint256 raffleState);

  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint32 private constant NUM_WORDS = 1;
  uint256 private immutable i_entranceFee;
  bytes32 private immutable i_keyHash;
  uint256 private immutable i_subscriptionId;
  uint256 private immutable i_interval;
  uint32 private immutable i_callbackGasLimit;
  uint256 private s_lastTimestamp;
  address private s_recentWinner;
  address payable[] private s_players;
  RaffleState private s_raffleState; 

  enum RaffleState {
    OPEN, // 0 
    CALCULATING //1
  }

  /* Events - Always emit a event when update the storage */
  event RaffleEntered(address indexed player);
  event WinnerPicked(address indexed player);

  constructor(
    uint256 entranceFee,
    uint256 interval,
    address vrfCoordinator,
    bytes32 gasLane,
    uint256 subscriptionId,
    uint32 callbackGasLimit
  ) VRFConsumerBaseV2Plus(vrfCoordinator) {
    // @dev The duration of the lottery in seconds
    i_entranceFee = entranceFee;
    i_interval = interval;
    i_keyHash = gasLane;
    i_subscriptionId = subscriptionId;
    i_callbackGasLimit = callbackGasLimit;

    s_lastTimestamp = block.timestamp;
    s_raffleState = RaffleState.OPEN;
  }

  function enterRaffle() external payable {
    // require(msg.value >= i_entranceFee, "Not enough ETH sent!"); - Not very Gas efficient due to the string storing
    //  require(msg.value >= i_entranceFee, SendMoreToEnterRaffle()); - Just works in later versions of solidity / specific compiler version
    if (msg.value < i_entranceFee) {
      revert Raffle__SendMoreToEnterRaffle();
    }
    if (s_raffleState != RaffleState.OPEN){
      revert Raffle_RaffleNotOpen();
    }

    s_players.push(payable(msg.sender));
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
  function checkUpkeep(bytes memory /* checkData */)
        public
        view
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isOpen = RaffleState.OPEN == s_raffleState;
        bool timePassed = ((block.timestamp - s_lastTimestamp) >= i_interval);
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers);
        return (upkeepNeeded, "");
    }

  function performUpkeep(bytes calldata /* performData */) external {
    // Check if enough time has passed
    (bool upkeppNeeded, ) = checkUpkeep("");
    if (!upkeppNeeded) {
      revert Raffle_UpkeepNotNeeded(address(this).balance, s_players.length, uint256(s_raffleState));
    }

    s_raffleState = RaffleState.CALCULATING;
    VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient.RandomWordsRequest({
      keyHash: i_keyHash, //max gas price that you are willing to pay in for request in wei
      subId: i_subscriptionId,
      requestConfirmations: REQUEST_CONFIRMATIONS,
      callbackGasLimit: i_callbackGasLimit, // gas limit the chainlink node responds will call the callback fuction (fulfillRandomWords() -we will define later - gives the random number)
      numWords: NUM_WORDS,
      // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
      extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({ nativePayment: false }))
    });
    uint256 requestId = s_vrfCoordinator.requestRandomWords(request);
  }

  // CEI: Checks, Effects, Interactions Pattern
  // or
  // FREI-PI: Function Requirements, Effects-Interactions, Protocol Invariants
  function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal virtual override {
    // Checks

    // Effect (Internal Contract State changes)
  
    uint256 indexOfWinner = randomWords[0] % s_players.length;
    address payable recentWinner = s_players[indexOfWinner];
    s_recentWinner = recentWinner;
    
    s_raffleState = RaffleState.OPEN;
    s_players = new address payable[](0);
    s_lastTimestamp = block.timestamp;
    emit WinnerPicked(s_recentWinner);

    // Interactions (External Contract Interactions)
    (bool success, ) = recentWinner.call{value: address(this).balance}("");
    if (!success) {
        revert Raffle__TransferFailed();
    }
  }

  /*
   * Getters
   */
  function getEntranceFee() external view returns (uint256) {
    return i_entranceFee;
  }

  function getRflleState() external view returns (RaffleState) {
    return s_raffleState;
  }

  function getPlayer(uint256 index) external view returns (address) {
    return s_players[index];
  }
}
