# Potential Future Features and Business Rules for the Raffle Application

Based on the `Raffle.sol` contract and existing components, here are some business rules and functionalities that could be added or expanded:

## From `Raffle.sol` (Smart Contract Capabilities):

*   **Player Management:**
    *   **View Current Participants:** Display the current list of players who have entered the ongoing raffle using the `s_players` array.
    *   **Player Count:** Show the total number of participants in the current raffle using `s_players.length`.

*   **Raffle State & History:**
    *   **Raffle History:** Implement a mechanism to store and display a comprehensive history of past raffles, including details like past winners (`s_recentWinner`), total prize pot, and number of participants for each. This would likely require modifications to the smart contract to store historical data.
    *   **Current Raffle State:** Clearly display the raffle's current state (e.g., `OPEN` or `CALCULATING`) to users on the front-end.
    *   **Time Until Next Draw:** Provide a countdown to the next possible raffle draw using `i_interval` and `s_lastTimestamp`.

*   **Admin/Owner Functionality (Requires contract owner/admin role implementation):**
    *   **Adjust Raffle Parameters:** Allow the owner to modify `i_interval` (raffle duration) or `i_entranceFee` (entrance fee), with careful consideration for transparency and fairness.

*   **Entrance Fee & Balance:**
    *   **Display Total Pot:** Show the current prize pool, which is the contract's balance (`address(this).balance`).

## From Existing React Components and General DApp Features:

*   **User Profiles:**
    *   **Custom Nicknames & Avatars:** Allow users to set and update their unique nicknames and avatars, which are already part of the `User` Prisma model and used in the `Leaderboard` components.
    *   **Personal Wager History:** Display a user's individual history of raffle entries and wins.

*   **Notifications:**
    *   **Winner Notification:** Notify users if they have won a raffle.
    *   **Raffle State Changes:** Send notifications to users when the raffle state changes (e.g., from `OPEN` to `CALCULATING`, or when a winner is picked).

*   **Improved UI/UX:**
    *   **Loading States:** Provide visual feedback to users when data is being fetched or blockchain transactions are pending.
    *   **Error Handling:** Display clear and user-friendly error messages for any issues during contract interactions.
    *   **Transaction Confirmations:** Show the progress and confirmation status of blockchain transactions.

*   **Analytics/Statistics:**
    *   **Total Raffles Played:** Track and display the total number of raffles that have been completed.
    *   **Total Prize Money Distributed:** Show the cumulative amount of prize money paid out.
    *   **Most Frequent Winners:** Highlight top winners based on the number of wins.

*   **Referral System:**
    *   Implement a system where users can refer new players and potentially earn a small percentage of their entrance fees.

*   **Multi-currency Entrance:**
    *   Explore allowing users to enter the raffle using different ERC-20 tokens, which would require integration with a decentralized exchange or a token conversion mechanism.

## Specific to Current Implementation (`Leaderboard.tsx`):

*   The `wagers_static` array in `Leaderboard.tsx` is currently used as a placeholder if there aren't enough real participants. A business rule could be to:
    *   Clearly differentiate between "real" players (from `wagers`) and static placeholders on the leaderboard UI. 