'use client'

import React, { useEffect } from 'react';
import { Separator } from "@/components/ui/separator";

// Data model
interface DocSection {
  id: string;
  title: string;
  content: string | string[];
}

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
            id: "what-is-raffle",
            title: "What is the Raffle?",
            content:
              "The Raffle is a lottery where users send a small amount of ETH (the entry fee) to participate. After a predefined time interval, the contract automatically picks one winner in a verifiable and fair way using Chainlink VRF and sends the entire balance in the contract to the winner.",
          },
          {
            id: "participate-via-ui",
            title: "How to participate",
            content: [
              "Connect your wallet on the correct network.",
              "Check the entry fee displayed.",
              "Click 'Enter Raffle' and confirm the transaction sending at least the entry fee.",
              "Wait for the draw: after the interval, Automation checks and triggers the process.",
              "If you win, the contract transfers the prize to your wallet and restarts the raffle.",
            ],
          },
          {
            id: "tips",
            title: "Tips",
            content:
              "Track status in the UI: number of participants, last winner, and time remaining. Each entry adds your address to the player list for the next draw.",
          },
        ],
      },
      {
        id: "technical-overview",
        title: "Technical Overview",
        sections: [
          {
            id: "winner-flow",
            title: "How the winner is chosen",
            content:
              "Users enter via enterRaffle() by sending ETH ≥ entry fee. Periodically, checkUpkeep validates conditions. If true, performUpkeep requests a random number from Chainlink VRF. When VRF responds, fulfillRandomWords() picks the winner index, stores the recent winner, resets players and timer, and transfers the balance.",
          },
          {
            id: "contract-states",
            title: "Contract states",
            content: "OPEN: open for new entries. CALCULATING: entries are blocked while awaiting and processing VRF randomness.",
          },
          {
            id: "events",
            title: "Useful events",
            content:
              "RaffleEntered(address player): emitted on entry. RequestRaffleWinner(uint256 requestId): emitted when requesting randomness. WinnerPicked(address player): emitted when the winner is determined.",
          },
          {
            id: "costs-limits",
            title: "Costs and limits",
            content:
              "You pay the entry fee and gas. The contract uses a callback gas limit for VRF. Network parameters such as keyHash and subscriptionId are configured at deploy.",
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
              "getEntranceFee(): minimum entry fee.",
              "getInterval(): interval between draws.",
              "getNumberOfPlayers(): participants in the current round.",
              "getRecentWinner(): the last winner.",
              "getRaffleState(): current state (open or calculating).",
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
            content:
              "View on Etherscan (placeholder): https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000000. Replace with the correct address after deployment.",
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
              "Chainlink VRF 2.5: https://docs.chain.link/vrf",
              "Chainlink Automation: https://docs.chain.link/chainlink-automation",
              "Solidity docs: https://docs.soliditylang.org",
              "CEI pattern: https://fravoll.github.io/solidity-patterns/checks_effects_interactions.html",
            ],
          },
          {
            id: "faq",
            title: "FAQ",
            content: [
              "Can I enter multiple times? Yes. Each entry adds your address again, increasing your chances proportionally.",
              "What if I try to enter while it’s calculating? The transaction will revert.",
              "Who pays for VRF? The subscription is configured per network.",
            ],
          },
        ],
      },
    ],
  },
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
          <div className="sticky top-20">
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
