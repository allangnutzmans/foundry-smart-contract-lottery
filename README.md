## Development Environment & Scripts

This section provides an overview of the development tools and scripts used in this project, covering both the smart contract development (Foundry) and the web application.

### Web Frameworks and tecnologies

- **Next.js**: A React framework for building full-stack web applications.
- **Prisma + Supabase**: Prisma is used as the ORM for database interaction, with Supabase serving as the backend-as-a-service provider.
- **Tailwind CSS**: A utility-first CSS framework for rapidly styling the application.
- **TanStack Query**: A powerful data-fetching library for React, used for managing server state.
- **tRPC**: A type-safe API layer that allows building end-to-end type-safe APIs without GraphQL or REST.

### Foundry Framework

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

#### Documentation

https://book.getfoundry.sh/

#### Usage

##### Build

```shell
$ forge build
```

##### Test

```shell
$ forge test
```

##### Format

```shell
$ forge fmt
```

##### Gas Snapshots

```shell
$ forge snapshot
```

##### Anvil

```shell
$ anvil
```

##### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

##### Cast

```shell
$ cast <subcommand>
```

##### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

### Web Application Scripts

This section outlines the available scripts for the web application.

- `dev`: Starts the development server with Turbopack.
  ```bash
  next dev --turbopack
  ```
- `postinstall`: Runs Prisma migrations after installing dependencies.
  ```bash
  prisma generate
  ```
- `build`: Builds the Next.js application for production, skipping linting.
  ```bash
  next build --no-lint
  ```
- `start`: Starts the Next.js production server.
  ```bash
  next start
  ```
- `lint`: Runs ESLint to check for code quality issues.
  ```bash
  eslint .
  ```
- `lint:fix`: Runs ESLint and attempts to fix any fixable issues.
  ```bash
  eslint . --fix
  ```
- `typecheck`: Runs TypeScript compiler to check for type errors without emitting output.
  ```bash
  tsc --noEmit
  ```

## Raffle Documentation

**Live Application**: [https://the-rafflesol.vercel.app/raffle/guide](https://the-rafflesol.vercel.app/raffle/guide)

This section provides detailed documentation for the Single Entry Raffle application, explaining how to participate, interact with the user interface, and understand the underlying smart contract.

### Guide

#### Getting Started

##### Overview

This guide explains how to participate in the **Single Entry Raffle**, a decentralized lottery application built on the Ethereum blockchain. You will learn how to use the user interface (UI) to enter the raffle, check the status, and understand how the smart contract ensures fairness and transparency.

##### Note on Testnet

All transactions in this guide use **Sepolia ETH**, a testnet currency. I refer to it as 'ETH' for simplicity, but no real funds are used.

##### What is the Raffle?

The Raffle is a lottery where users send a small amount of ETH (the entry fee) to participate. After a predefined time interval, the contract automatically picks one winner in a verifiable and fair way using Chainlink VRF and sends the entire balance in the contract to the winner. This version of the raffle only allows one entry per wallet.

##### How to participate

1. Connect your wallet on the correct network.
2. Check the entry fee displayed.
3. Click **'Enter Raffle'** and confirm the transaction sending at least the entry fee. You can only enter once per wallet per raffle.
4. Wait for the draw: after the interval, Automation checks and triggers the process.
5. If you win, the contract transfers the prize to your wallet and restarts the raffle.

##### Tips

Track status in the UI: number of participants, last winner, and time remaining. Each entry adds your address to the player list for the next draw.

#### User Interface Guide

##### Connecting Your Wallet

To interact with the raffle, you need to connect a web3 wallet (e.g., MetaMask). Click the **'Connect Wallet'** button in the top right corner of the application and approve the connection in your wallet.

##### The Raffle Card

The main raffle card displays all the important information about the current raffle round. You will find the current entry fee, the total number of participants, the time remaining until the next draw, and the most recent winner.

##### Entering the Raffle

1. Once your wallet is connected, you can enter the raffle by clicking the **'Enter Raffle'** button on the raffle card.
2. A transaction will be initiated in your wallet. You need to confirm the transaction and send the specified entry fee.
3. **Important:** This is a single-entry raffle, so you can only enter once per wallet for each round. If you try to enter more than once, the transaction will be reverted.

##### Leaderboard

The leaderboard shows the top winners of the raffle. You can see the addresses of the winners and the amount they have won.

##### Wallet History

The wallet history side panel shows your past raffle entries and winnings.

#### Smart Contract Interaction

##### How It Works

The UI interacts with the _`SingleEntryRaffle.sol`_ smart contract deployed on the Sepolia testnet. All actions, such as entering the raffle and drawing a winner, are executed through this contract.

##### Winner Selection

The winner is selected in a provably fair and random manner using Chainlink VRF (Verifiable Random Function). When the raffle interval ends, Chainlink Automation triggers the _`performUpkeep`_ function in the contract, which in turn requests a random number from the VRF. The _`fulfillRandomWords`_ function then uses this random number to select a winner from the list of participants.

##### Key Contract Functions

_`enterRaffle()`_: This function is called when you click the 'Enter Raffle' button. It registers you as a participant and transfers the entry fee to the contract.
_`checkUpkeep()`_: This function is called by Chainlink Automation to check if the conditions for a new draw are met.
_`performUpkeep()`_: This function initiates the process of requesting a random number from Chainlink VRF.
_`fulfillRandomWords()`_: This function receives the random number and selects the winner.
_`getPlayerHasEntered(address player)`_: This function allows the UI to check if a player has already entered the current raffle round.

##### How the winner is chosen

Users enter via _`enterRaffle()`_ by sending ETH ≥ entry fee. Periodically, _`checkUpkeep`_ validates conditions. If true, _`performUpkeep`_ requests a random number from Chainlink VRF. When VRF responds, _`fulfillRandomWords()`_ picks the winner index, stores the recent winner, resets players and timer, and transfers the balance.

##### Contract states

**OPEN**: open for new entries. **CALCULATING**: entries are blocked while awaiting and processing VRF randomness.

##### Useful events

_`RaffleEntered(address player)`_: emitted on entry. _`RequestRaffleWinner(uint256 requestId)`_: emitted when requesting randomness. _`WinnerPicked(address player)`_: emitted when the winner is determined.

##### Costs and limits

You pay the entry fee and gas. The contract uses a callback gas limit for VRF. Network parameters such as _`keyHash`_ and _`subscriptionId`_ are configured at deploy.

### Reference

#### Read-only functions

##### Useful view functions

_`getEntranceFee()`_: minimum entry fee.
_`getInterval()`_: interval between draws.
_`getNumberOfPlayers()`_: participants in the current round.
_`getRecentWinner()`_: the last winner.
_`getRaffleState()`_: current state (open or calculating).
_`getPlayerHasEntered(address player)`_: returns true if the player has entered in the current round.

#### Contracts & Verification

##### Where to verify the contract

View on [Etherscan](https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000000) (placeholder). Replace with the correct address after deployment.

### Resources

#### Learn more

##### Useful links

[Chainlink VRF 2.5](https://docs.chain.link/vrf)
[Chainlink Automation](https://docs.chain.link/chainlink-automation)
[Solidity docs](https://docs.soliditylang.org)
[CEI pattern](https://fravoll.github.io/solidity-patterns/checks_effects_interactions.html)

##### FAQ

- Can I enter multiple times? **No**, in this version of the raffle you can only enter once per round.
- What if I try to enter while it’s calculating? The transaction will revert.
- Who pays for VRF? The subscription is configured per network.

### Script Documentation

This section details the deployment and interaction scripts for the raffle contracts.

#### `DeployRaffle.s.sol`

This script is responsible for deploying the `RaffleBase` contract. It retrieves network configuration from `HelperConfig.s.sol` and uses these parameters to instantiate a new `RaffleBase` contract.

#### `DeploySingleEntryRaffle.s.sol`

This script handles the deployment of the `SingleEntryRaffle` contract. Similar to `DeployRaffle.s.sol`, it fetches network-specific parameters from `HelperConfig.s.sol` and deploys a new `SingleEntryRaffle` instance.

#### `DeployTicketRaffle.s.sol`

This script is used for deploying the `TicketRaffle` contract. It obtains the necessary network configuration from `HelperConfig.s.sol` to deploy a new `TicketRaffle` contract.

#### `HelperConfig.s.sol`

This contract provides network-specific configuration parameters for the raffle contracts. It distinguishes between Sepolia ETH testnet and local Anvil development chains.

- **Errors**:

  - `HelperConfig__InvalidChainId()`: Thrown when an unsupported chain ID is encountered.

- **Structs**:

  - `NetworkConfig`: Contains configuration details such as `entranceFee`, `interval`, `vrfCoordinator`, `gasLane`, `subscriptionId`, `callbackGasLimit`, `link` token address, and `account`.

- **Functions**:
  - `getConfigByChainId(uint256 chainId)`: Returns the `NetworkConfig` for a given chain ID.
  - `getConfig()`: Returns the `NetworkConfig` for the current `block.chainid`.
  - `getSepoliaEthConfig()`: Returns the hardcoded `NetworkConfig` for the Sepolia testnet.
  - `getOrCreateAnvilEthConfig()`: Creates and returns a mock `NetworkConfig` for local Anvil development, including deploying `VRFCoordinatorV2_5Mock` and `LinkToken` mocks.

#### `Interactions.s.sol`

This script contains contracts for interacting with Chainlink VRF subscriptions.

- **`CreateSubscription` Contract**:

  - `createSubscriptionUsingConfig()`: Creates a new VRF subscription using the configuration from `HelperConfig.s.sol`.
  - `createSubscription(address vrfCoordinator, address account)`: Creates a new VRF subscription on the specified VRF Coordinator.

- **`FundSubscription` Contract**:

  - `SUBSCRIPTION_FUND_AMOUNT`: Constant amount (3 ETH) used to fund subscriptions.
  - `fundSubscription(address vrfCoordinator, uint256 subscriptionId, address linkToken, address account)`: Funds a VRF subscription. It handles funding for both local Anvil (using mock coordinator) and live networks (using `LinkToken.transferAndCall`).
  - `functionSubscriptionUsingConfig()`: Funds a VRF subscription using the configuration from `HelperConfig.s.sol`.

- **`AddConsumer` Contract**:
  - `addConsumerUsingConfig(address raffle)`: Adds a raffle contract as a consumer to a VRF subscription using the configuration from `HelperConfig.s.sol`.
  - `addConsumer(address contractToaddVRF, address vrfCoordinator, uint256 subscriptionId, address account)`: Adds a specified contract as a consumer to a VRF subscription.
  - `run()`: Automatically adds the most recently deployed Raffle contract as a consumer.

#### `TestSubscription.s.sol`

This script is a simple test script to create a VRF subscription.

### Smart Contract Documentation

This section provides details about the core raffle smart contracts.

#### `RaffleBase.sol`

A base contract for raffle implementations, providing core logic for entering, checking upkeep, performing upkeep, and fulfilling random words for winner selection using Chainlink VRF.

- **Title**: A Base Raffle Contract
- **Author**: Allan Gnutzmans, Patrick Collins
- **Notice**: This contract was made with the Cyfrin Updraft course!

- **Errors**:

  - `Raffle__SendMoreToEnterRaffle()`: Thrown if the sent ETH is less than the `i_entranceFee`.
  - `Raffle__TransferFailed()`: Thrown if transferring the prize to the winner fails.
  - `Raffle_RaffleNotOpen()`: Thrown if `enterRaffle` is called when the raffle state is not `OPEN`.
  - `Raffle_UpkeepNotNeeded(uint256 balance, uint256 length, uint256 raffleState)`: Thrown if `performUpkeep` is called when upkeep is not needed.
  - `Raffle__AlreadyEntered()`: Thrown if a player tries to enter the raffle multiple times in a single-entry round.

- **Enums**:

  - `RaffleState`: `OPEN` (0) and `CALCULATING` (1).

- **Events**:

  - `RaffleEntered(address indexed player)`: Emitted when a player successfully enters the raffle.
  - `WinnerPicked(address indexed player)`: Emitted when a winner is determined.
  - `RequestRaffleWinner(uint256 indexed requestId)`: Emitted when a random word request is made to Chainlink VRF.
  - `RaffleStarted(uint256 indexed roundId)`: Emitted when a new raffle round starts.

- **Functions**:

  - `constructor`: Initializes the raffle with `entranceFee`, `interval`, VRF parameters, sets the initial `RaffleState` to `OPEN`, and emits `RaffleStarted`.
  - `enterRaffle()`: Allows a player to enter the raffle by sending at least the `i_entranceFee`. It increments `s_playerCount` and adds the player to `s_players`.
  - `checkUpkeep(bytes memory /* checkData */)`: A view function called by Chainlink Automation to determine if it's time to pick a winner based on `timePassed`, `isOpen`, `hasPlayers`, and `hasBalance`.
  - `performUpkeep(bytes calldata /* performData */)`: Called by Chainlink Automation when `checkUpkeep` returns true. It sets `s_raffleState` to `CALCULATING`, requests random words from Chainlink VRF, and emits `RequestRaffleWinner`.
  - `fulfillRandomWords(uint256 /* requestId */, uint256[] calldata randomWords)`: Internal function called by Chainlink VRF once random numbers are generated. It selects a winner, resets the raffle state to `OPEN`, clears players, updates `s_lastTimestamp`, increments `s_roundId`, emits `WinnerPicked` and `RaffleStarted`, and transfers the contract's balance to the winner.

- **Modifiers**:

  - `onlyOpen()`: Ensures that the function can only be called when the raffle state is `OPEN`.
  - `paysEnough()`: Ensures that the `msg.value` sent is greater than or equal to `i_entranceFee`.

- **Getters**:
  - `getEntranceFee()`: Returns the minimum entrance fee.
  - `getInterval()`: Returns the interval between draws.
  - `getVrfCoordinator()`: Returns the VRF Coordinator address.
  - `getGasLane()`: Returns the key hash for VRF.
  - `getSubscriptionId()`: Returns the VRF subscription ID.
  - `getCallbackGasLimit()`: Returns the callback gas limit for VRF.
  - `getRaffleState()`: Returns the current state of the raffle (`OPEN` or `CALCULATING`).
  - `getPlayer(uint256 index)`: Returns the player at a given index for the current round.
  - `getLastTimestamp()`: Returns the timestamp of the last draw.
  - `getRecentWinner()`: Returns the address of the most recent winner.
  - `getNumberOfPlayers()`: Returns the number of participants in the current round.
  - `getRoundId()`: Returns the current round ID.
  - `getTimeUntilNextDraw()`: Returns the time remaining until the next draw.

#### `SingleEntryRaffle.sol`

This contract inherits from `RaffleBase` and implements a raffle where each player can only enter once per round.

- **State Variables**:

  - `s_hasEnteredInRound`: A mapping to track if a player has entered in the current round.

- **Functions**:
  - `constructor`: Initializes the `SingleEntryRaffle` by calling the `RaffleBase` constructor.
  - `enterRaffle()`: Overrides `RaffleBase.enterRaffle`. It checks if the player has already entered in the current round using `s_hasEnteredInRound`. If not, it calls the base `enterRaffle` and records the player's entry for the current round. It also sets `s_lastTimestamp` and emits `RaffleStarted` if it's the first player to enter.
  - `checkUpkeep()`, `performUpkeep()`, `fulfillRandomWords()`: These functions override the base implementations and simply call their respective `super` functions.
  - `getPlayerHasEntered(address player)`: A view function that returns `true` if the given player has entered the current raffle round.

#### `TicketRaffle.sol`

This contract extends `RaffleBase` to implement a multi-ticket raffle with progressive pricing.

- **Title**: MultiTicketRaffle
- **Main rules**:
  - Each player can buy up to `MAX_TICKETS_PER_PLAYER` (5) per round.
  - Ticket prices increase according to `PRICE_BPS` (basis points). `PRICE_BPS = [10000, 15000, 20000, 25000, 30000]` (where 10000 = 100%).
- **Note on winner selection**: To maintain compatibility with `RaffleBase` which chooses a player index (VRF -> index), we store one entry per ticket in `s_players`, max 5 tickets (i.e., we repeat the address as many times as tickets purchased).

- **Constants**:

  - `MAX_TICKETS_PER_PLAYER`: Maximum number of tickets a player can buy per round (currently 5).

- **State Variables**:

  - `PRICE_BPS`: Array of basis points for progressive ticket pricing.
  - `PRICE_PREFIX_BPS`: Precomputed prefix sums of `PRICE_BPS` to calculate total cost in O(1).
  - `s_ticketsByRound`: Mapping to track the number of tickets owned by a player in a given round.
  - `s_totalTicketsByRound`: Mapping to track the total number of tickets sold in a given round.

- **Events**:

  - `TicketsPurchased(address indexed buyer, uint256 indexed roundId, uint8 bought, uint8 totalForPlayer)`: Emitted when a player buys tickets.
  - `TicketsRefunded(address indexed buyer, uint256 indexed roundId, uint8 refunded)`: Emitted when tickets are refunded (though no refund functionality is explicitly shown in this snippet).

- **Functions**:
  - `constructor`: Initializes the `TicketRaffle` by calling the `RaffleBase` constructor and precomputes `PRICE_PREFIX_BPS`.
  - `buyTickets(uint8 count)`: Allows a player to buy multiple tickets (1-5) in a single call. It validates the count and maximum tickets per player, calculates the total cost using `PRICE_PREFIX_BPS`, and adds multiple entries to the `s_players` array in `RaffleBase`. It updates ticket counters and emits `TicketsPurchased`.
  - `getTicketCountForPlayer(uint256 roundId, address player)`: Returns the number of tickets a player holds for a specific round.
  - `getTotalTicketsInRound(uint256 roundId)`: Returns the total number of tickets sold in a specific round.
  - `getNextTicketPriceForPlayer(address player)`: Returns the price (in wei) for the player's next ticket in the current round, considering progressive pricing.
  - `enterRaffle()`: Overrides `RaffleBase.enterRaffle`. This function is maintained for compatibility but internally behaves as buying 1 ticket with the progressive pricing logic. It calculates the correct price for the first ticket, adds the player to `s_players`, updates ticket counts, and emits `RaffleEntered` and `TicketsPurchased`.
  - `checkUpkeep()`, `performUpkeep()`, `fulfillRandomWords()`: These functions override the base implementations and simply call their respective `super` functions.
