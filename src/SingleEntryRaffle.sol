// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { RaffleBase } from "./RaffleBase.sol";


contract SingleEntryRaffle is RaffleBase {
  
  mapping(address => uint256) private s_hasEnteredInRound;

  constructor(
    uint256 entranceFee,
    uint256 interval,
    address vrfCoordinator,
    bytes32 gasLane,
    uint256 subscriptionId,
    uint32 callbackGasLimit
  ) RaffleBase(entranceFee, interval, vrfCoordinator, gasLane, subscriptionId, callbackGasLimit) {}

function enterRaffle() public payable override onlyOpen paysEnough {
    if (s_hasEnteredInRound[msg.sender] == getRoundId()) {
        revert Raffle__AlreadyEntered();
    }

    if (s_playerCount == 0) {
        s_lastTimestamp = block.timestamp;
        emit RaffleStarted(s_roundId);
    }

    super.enterRaffle();
    s_hasEnteredInRound[msg.sender] = getRoundId();
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

  function getEntranceFee() public view override returns (uint256) {
    return super.getEntranceFee();
  }

  function getInterval() public view override returns (uint256) {
    return super.getInterval();
  }

  function getVrfCoordinator() public view override returns (address) {
    return super.getVrfCoordinator();
  }

  function getGasLane() public view override returns (bytes32) {
    return super.getGasLane();
  }

  function getSubscriptionId() public view override returns (uint256) {
    return super.getSubscriptionId();
  }

  function getCallbackGasLimit() public view override returns (uint32) {
    return super.getCallbackGasLimit();
  }

  function getRaffleState() public view override returns (RaffleState) {
    return super.getRaffleState();
  }

  function getPlayer(uint256 index) public view override returns (address) {
    return super.getPlayer(index);
  }

  function getLastTimestamp() public view override returns (uint256) {
    return super.getLastTimestamp();
  }

  function getRecentWinner() public view override returns (address) {
    return super.getRecentWinner();
  }

  function getNumberOfPlayers() public view override returns (uint256) {
    return super.getNumberOfPlayers();
  }

  function getTimeUntilNextDraw() public view override returns (uint256) {
    return super.getTimeUntilNextDraw();
  }

  function getRoundId() public view override returns (uint256) {
    return super.getRoundId();
  }

  function getPlayerHasEntered(address player) public view returns (bool) {
    return s_hasEnteredInRound[player] == getRoundId();
  }
}
