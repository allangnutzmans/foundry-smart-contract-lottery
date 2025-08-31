'use client'

import React, { JSX, useEffect } from 'react';
import { Separator } from "@/components/ui/separator";

// Data model
export type DocSection = {
  id: string;
  title: string;
  content: string | string[] | JSX.Element | JSX.Element[];
};

interface DocTopic {
  id: string;
  title: string;
  sections: DocSection[];
}

interface DocCategory {
  id: string;
  title: string;
  topics: DocTopic[];
}

// Content
const docs: DocCategory[] = [
  {
    id: "guide",
    title: "Guide",
    topics: [
      {
        id: "getting-started",
        title: "Getting Started",
        sections: [
          {
            id: "overview",
            title: "Overview",
            content: (
              <>
                This guide explains how to participate in the <b>Single Entry Raffle</b>, a decentralized lottery application built on the Ethereum blockchain. You will learn how to use the user interface (UI) to enter the raffle, check the status, and understand how the smart contract ensures fairness and transparency.
              </>
            ),
          },
          {
            id: "network-note",
            title: "Note on Testnet",
            content: (
              <>
                All transactions in this guide use <b>Sepolia ETH</b>, a testnet currency. I refer to it as 'ETH' for simplicity, but no real funds are used.
              </>
            ),
          },
          {
            id: "what-is-raffle",
            title: "What is the Raffle?",
            content: (
              <>
                The Raffle is a lottery where users send a small amount of ETH (the entry fee) to participate. After a predefined time interval, the contract automatically picks one winner in a verifiable and fair way using Chainlink VRF and sends the entire balance in the contract to the winner. This version of the raffle only allows one entry per wallet.
              </>
            ),
          },
          {
            id: "participate-via-ui",
            title: "How to participate",
            content: [
              <>Connect your wallet on the correct network.</>,
              <>Check the entry fee displayed.</>,
              <>Click <b>'Enter Raffle'</b> and confirm the transaction sending at least the entry fee. You can only enter once per wallet per raffle.</>,
              <>Wait for the draw: after the interval, Automation checks and triggers the process.</>,
              <>If you win, the contract transfers the prize to your wallet and restarts the raffle.</>,
            ],
          },
          {
            id: "tips",
            title: "Tips",
            content: (
              <>
                Track status in the UI: number of participants, last winner, and time remaining. Each entry adds your address to the player list for the next draw.
              </>
            ),
          },
        ],
      },
      {
        id: "ui-guide",
        title: "User Interface Guide",
        sections: [
          {
            id: "connecting-wallet",
            title: "Connecting Your Wallet",
            content: (
              <>
                To interact with the raffle, you need to connect a web3 wallet (e.g., MetaMask). Click the <b>'Connect Wallet'</b> button in the top right corner of the application and approve the connection in your wallet.
              </>
            ),
          },
          {
            id: "raffle-card",
            title: "The Raffle Card",
            content: (
              <>
                The main raffle card displays all the important information about the current raffle round. You will find the current entry fee, the total number of participants, the time remaining until the next draw, and the most recent winner.
              </>
            ),
          },
          {
            id: "entering-the-raffle",
            title: "Entering the Raffle",
            content: [
              <>Once your wallet is connected, you can enter the raffle by clicking the <b>'Enter Raffle'</b> button on the raffle card.</>,
              <>A transaction will be initiated in your wallet. You need to confirm the transaction and send the specified entry fee.</>,
              <> <b>Important:</b> This is a single-entry raffle, so you can only enter once per wallet for each round. If you try to enter more than once, the transaction will be reverted.</>,
            ],
          },
          {
            id: "leaderboard",
            title: "Leaderboard",
            content: (
              <>
                The leaderboard shows the top winners of the raffle. You can see the addresses of the winners and the amount they have won.
              </>
            ),
          },
          {
            id: "wallet-history",
            title: "Wallet History",
            content: (
              <>
                The wallet history side panel shows your past raffle entries and winnings.
              </>
            ),
          },
        ],
      },
      {
        id: "contract-interaction",
        title: "Smart Contract Interaction",
        sections: [
          {
            id: "how-it-works",
            title: "How It Works",
            content: (
              <>
                The UI interacts with the <i>`SingleEntryRaffle.sol`</i> smart contract deployed on the Sepolia testnet. All actions, such as entering the raffle and drawing a winner, are executed through this contract.
              </>
            ),
          },
          {
            id: "winner-selection",
            title: "Winner Selection",
            content: (
              <>
                The winner is selected in a provably fair and random manner using Chainlink VRF (Verifiable Random Function). When the raffle interval ends, Chainlink Automation triggers the <i>`performUpkeep`</i> function in the contract, which in turn requests a random number from the VRF. The <i>`fulfillRandomWords`</i> function then uses this random number to select a winner from the list of participants.
              </>
            ),
          },
          {
            id: "key-contract-functions",
            title: "Key Contract Functions",
            content: [
              <><i>`enterRaffle()`</i>: This function is called when you click the 'Enter Raffle' button. It registers you as a participant and transfers the entry fee to the contract.</>,
              <><i>`checkUpkeep()`</i>: This function is called by Chainlink Automation to check if the conditions for a new draw are met.</>,
              <><i>`performUpkeep()`</i>: This function initiates the process of requesting a random number from Chainlink VRF.</>,
              <><i>`fulfillRandomWords()`</i>: This function receives the random number and selects the winner.</>,
              <><i>`getPlayerHasEntered(address player)`</i>: This function allows the UI to check if a player has already entered the current raffle round.</>,
            ],
          },
          {
            id: "winner-flow",
            title: "How the winner is chosen",
            content: (
              <>
                Users enter via <i>`enterRaffle()`</i> by sending ETH ≥ entry fee. Periodically, <i>`checkUpkeep`</i> validates conditions. If true, <i>`performUpkeep`</i> requests a random number from Chainlink VRF. When VRF responds, <i>`fulfillRandomWords()`</i> picks the winner index, stores the recent winner, resets players and timer, and transfers the balance.
              </>
            ),
          },
          {
            id: "contract-states",
            title: "Contract states",
            content: (
              <>
                <b>OPEN</b>: open for new entries. <b>CALCULATING</b>: entries are blocked while awaiting and processing VRF randomness.
              </>
            ),
          },
          {
            id: "events",
            title: "Useful events",
            content: (
              <>
                <i>`RaffleEntered(address player)`</i>: emitted on entry. <i>`RequestRaffleWinner(uint256 requestId)`</i>: emitted when requesting randomness. <i>`WinnerPicked(address player)`</i>: emitted when the winner is determined.
              </>
            ),
          },
          {
            id: "costs-limits",
            title: "Costs and limits",
            content: (
              <>
                You pay the entry fee and gas. The contract uses a callback gas limit for VRF. Network parameters such as <i>`keyHash`</i> and <i>`subscriptionId`</i> are configured at deploy.
              </>
            ),
          },
        ],
      },
    ],
  },
  {
  id: "reference",
  title: "Reference",
  topics: [
    {
      id: "read-only-functions",
      title: "Read-only functions",
      sections: [
        {
          id: "useful-view",
          title: "Useful view functions",
          content: [
            <><i>`getEntranceFee()`</i>: minimum entry fee.</>,
            <><i>`getInterval()`</i>: interval between draws.</>,
            <><i>`getNumberOfPlayers()`</i>: participants in the current round.</>,
            <><i>`getRecentWinner()`</i>: the last winner.</>,
            <><i>`getRaffleState()`</i>: current state (open or calculating).</>,
            <><i>`getPlayerHasEntered(address player)`</i>: returns true if the player has entered in the current round.</>,
          ],
        },
      ],
    },
    {
      id: "contract-links",
      title: "Contracts & Verification",
      sections: [
        {
          id: "etherscan-verify",
          title: "Where to verify the contract",
          content: (
            <>
              View on <a href="https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000000" target="_blank" className="underline text-blue-500 hover:text-blue-700">Etherscan</a> (placeholder). Replace with the correct address after deployment.
            </>
          ),
        },
      ],
    },
  ],
},
  {
    id: "resources",
    title: "Resources",
    topics: [
      {
        id: "learn-more",
        title: "Learn more",
        sections: [
          {
            id: "links",
            title: "Useful links",
            content: [
              <><a href="https://docs.chain.link/vrf" target="_blank" className="underline text-blue-500 hover:text-blue-700">Chainlink VRF 2.5</a></>,
              <><a href="https://docs.chain.link/chainlink-automation" target="_blank" className="underline text-blue-500 hover:text-blue-700">Chainlink Automation</a></>,
              <><a href="https://docs.soliditylang.org" target="_blank" className="underline text-blue-500 hover:text-blue-700">Solidity docs</a></>,
              <><a href="https://fravoll.github.io/solidity-patterns/checks_effects_interactions.html" target="_blank" className="underline text-blue-500 hover:text-blue-700">CEI pattern</a></>,
            ],
          },
          {
            id: "faq",
            title: "FAQ",
            content: [
              <>Can I enter multiple times? <b>No</b>, in this version of the raffle you can only enter once per round.</>,
              <>What if I try to enter while it’s calculating? The transaction will revert.</>,
              <>Who pays for VRF? The subscription is configured per network.</>,
            ],
          },
        ],
      },
    ],
  }
];



export default function RaffleDocs() {
  // On initial load, if hash is present, scroll to it
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleNavigateToId = (id: string) => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(id);
    if (!el) return;
    window.history.replaceState(null, '', `#${id}`);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 py-2 md:grid-cols-[1fr_16rem] md:px-4 lg:grid-cols-[1fr_18rem]">
        {/* Main content: render ALL docs with anchors */}
        <main className="min-w-0">
          <article className="prose prose-invert max-w-none">
            {docs.map((category) => (
              <section key={category.id} id={category.id} className="mt-10">
                <h1 className="text-3xl font-bold tracking-tight">{category.title}</h1>
                <Separator className="my-4" />
                {category.topics.map((topic) => (
                  <section key={topic.id} id={topic.id} className="mt-4">
                    <h2 className="mt-8 text-2xl font-semibold">{topic.title}</h2>
                    {topic.sections.map((section) => (
                      <section key={section.id} id={section.id} className="scroll-mt-24">
                        <h3 className="mt-6 text-xl font-semibold">{section.title}</h3>
                        {Array.isArray(section.content) ? (
                          <ol className="mt-3 list-decimal pl-5 leading-7 text-muted-foreground">
                            {section.content.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="mt-3 leading-7 text-muted-foreground">{section.content}</p>
                        )}
                      </section>
                    ))}
                  </section>
                ))}
              </section>
            ))}
          </article>
        </main>

        {/* Right ToC: single hierarchical menu with indentation */}
        <aside className="hidden md:block">
          <div className="sticky top-10">
            <div className="text-sm font-semibold text-muted-foreground">On this page</div>
            <nav className="mt-3 space-y-1">
              {docs.map((category) => (
                <div key={category.id} className="space-y-1">
                  <button
                    onClick={() => handleNavigateToId(category.id)}
                    className="block w-full truncate rounded px-2 py-1 text-left text-sm hover:bg-muted"
                  >
                    {category.title}
                  </button>
                  {category.topics.map((topic) => (
                    <div key={topic.id} className="space-y-1">
                      <button
                        onClick={() => handleNavigateToId(topic.id)}
                        className="ml-2 block w-full truncate rounded px-2 py-1 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {topic.title}
                      </button>
                      {topic.sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handleNavigateToId(section.id)}
                          className="ml-4 block w-full truncate rounded px-2 py-1 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {section.title}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
