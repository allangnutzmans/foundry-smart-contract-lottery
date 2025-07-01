// SPDX-LICENSE-Identifier: MIT
pragma solidity 0.8.19;

import { Test } from "forge-std/Test.sol";
import { DeployRaffle } from "../../script/DeployRaffle.s.sol";
import { Raffle } from "../../src/Raffle.sol";
import { HelperConfig } from "../../script/HelperConfig.s.sol";


contract NameRaffleTest is Test {

    event RaffleEntered(address indexed player);
    event WinnerPicked(address indexed player);

    Raffle public raffle;
    HelperConfig public helperConfig;

    address public PLAYER = makeAddr("Player");
    uint256 public constant STARTING_PLAYER_BALANCE = 10 ether;

    uint256 entranceFee;
    uint256 interval;
    address vrfCoordinator;
    bytes32 gasLane;
    uint256 subscriptionId;
    uint32 callbackGasLimit;

    function setUp() external{
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
        raffle.enterRaffle{value: entranceFee}();
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
        raffle.enterRaffle{value: entranceFee}();
    }

    function testDontAllowPlayersEnterWhileRaffleIsCalculating() public{
        // Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}();
        vm.warp(block.timestamp + interval + 1); //timeskips 31 seconds
        vm.roll(block.number + 1); // rolls the block number to the next one - "good practice"
        // Act
        raffle.performUpkeep("");
        vm.expectRevert(Raffle.Raffle_RaffleNotOpen.selector);
        // Assert
        vm.prank(PLAYER);
        raffle.enterRaffle{value: entranceFee}();
    }

    ////////////////////////////////////////////////////////
    /////////////  CHECK UPKEP ////////////////////////////
    ///////////////////////////////////////////////////////
/*     function testCheckUpkeepReturnsFalseIfItHasNoBalance() public {
        // Arrange
        vm.warp(block.timestamp + interval + 1); //timeskips 31 seconds
        vm.roll(block.number + 1); // rolls the block number to the next one - "good practice"

        //act
        (bool upkeepNeeded, ) = raffle.checkUpkeep("");

        // Assert
        assert(!upkeepNeeded);
        
    } */

}