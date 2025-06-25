// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/*
 * @title A Simple Raffle Contract
 * @author Allan Gnutzmans and Patrick Collins
 * @notice This contract were made with the Cyfrin Updraft course!
 * @return This implements the Chainlink VRF Version 2
 */
contract Raffle {

    uint256 private immutable i_entranceFee;

    constructor(uint256 entranceFee){
        i_entranceFee = entranceFee;
    }

    function enterRaffle() public {

    }

    function pickWinner() public {

    }

    function getEntranceFee() external view returns(uint256) {
        return i_entranceFee;
    }
    
}
