## Quick Guide: Raffle

This document explains, in simple terms, how the raffle contract (`src/Raffle.sol`) works and how you can interact with it through the web interface.

### What is the Raffle?
The Raffle is a lottery where users send a small amount of ETH (the entry fee) to participate. After a predefined time interval, the contract automatically picks one winner in a verifiable and fair way using Chainlink VRF (verifiable randomness on-chain) and sends the entire balance accumulated in the contract to the winner.

- **Entry fee**: the minimum ETH required to join (set at deploy time as `i_entranceFee`).
- **Interval**: the minimum time between drawings (set as `i_interval`).
- **Randomness**: powered by Chainlink VRF 2.5, which provides verifiable on-chain random numbers.

### How to participate via the web UI
1. **Connect your wallet** (e.g., MetaMask) on the correct network (e.g., Sepolia or the network shown in the UI).
2. **Check the entry fee** displayed in the UI (fetched from the contract via `getEntranceFee()`).
3. **Click “Enter Raffle”** and confirm the transaction by sending at least the entry fee.
4. **Wait for the draw**: after the minimum time (`getInterval()`), Chainlink Automation checks whether it is time to draw and triggers the process.
5. **If you win**, the contract automatically transfers the prize to your wallet and restarts the raffle.

Tips:
- You can track status in the UI (number of participants, last winner, time remaining).
- Each entry adds your address to the player list for the next draw.

### How the winner is chosen (simple technical summary)
- Users enter via `enterRaffle()` by sending ETH ≥ entry fee.
- Periodically, the check function (`checkUpkeep`) validates that:
  - The raffle is open;
  - The minimum time has passed;
  - There are players and a positive balance.
- If yes, the execution step (`performUpkeep`) requests a random number from Chainlink VRF.
- When VRF responds, `fulfillRandomWords()` is called with the random number:
  - Calculates the winner index;
  - Stores the recent winner;
  - Resets the player list and the timer;
  - Transfers the entire contract balance to the winner.

### Security and fairness
- **VRF (Verifiable Random Function)**: randomness is provided by a Chainlink oracle and is verifiable on-chain. This prevents manipulation by miners or the contract itself.
- **CEI pattern** (Checks-Effects-Interactions): functions follow best practices to reduce risks (checks → state updates → external interactions).
- **Errors and state**: the contract uses custom errors and a state `enum` to prevent entries while a winner is being calculated.

### Contract states
- `OPEN`: open for new entries.
- `CALCULATING`: entries are blocked while the contract waits for and processes VRF randomness.

### Useful events
- `RaffleEntered(address player)`: emitted when someone enters.
- `RequestRaffleWinner(uint256 requestId)`: emitted when the randomness request is sent to VRF.
- `WinnerPicked(address player)`: emitted when the winner is determined.

### Costs and limits
- You pay the entry fee (shown in the UI via `getEntranceFee()`) and the transaction gas.
- The contract sets a callback gas limit (`i_callbackGasLimit`) for the VRF response.
- The network and the VRF subscription (`i_keyHash`, `i_subscriptionId`) are configured at deploy.

### Where to verify the contract
- View on Etherscan (dummy): [Open on Etherscan (Sepolia)](https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000000)
  - Use this link as a placeholder. In the real app, replace it with the correct address after deployment.

### Useful read-only functions in the UI
- `getEntranceFee()`: minimum fee to enter.
- `getInterval()`: interval between draws.
- `getNumberOfPlayers()`: how many participants are in the current round.
- `getRecentWinner()`: the last winner.
- `getRflleState()`: current state (open or calculating).

### FAQ
- **Can I enter multiple times?** Yes. Each entry adds your address again to the list, increasing your chances proportionally.
- **What if I try to enter while it’s “calculating”?** The transaction will revert (state `CALCULATING`).
- **Who pays for VRF?** The contract is configured with a Chainlink VRF subscription; automation and VRF nodes are paid according to the network/configuration.

### Learn more (recommended reading)
- Chainlink VRF 2.5 (verifiable randomness): [Official docs](https://docs.chain.link/vrf)
- Chainlink Automation (`checkUpkeep`/`performUpkeep`): [Official docs](https://docs.chain.link/chainlink-automation)
- Solidity events, custom errors, and `enum`: [Solidity Docs](https://docs.soliditylang.org)
- CEI best practices (Checks-Effects-Interactions): [Pattern article](https://fravoll.github.io/solidity-patterns/checks_effects_interactions.html)

---

If you have questions, open an issue or check the contract file at `src/Raffle.sol`. The web interface shows the main data automatically, so the best experience is to interact there and use this guide as a reference.
