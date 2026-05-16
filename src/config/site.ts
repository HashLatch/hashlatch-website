// Single source of truth for all editable site content.
export const siteConfig = {
  brand: {
    name: "HASHLATCH",
    fullName: "HashLatch",
    ticker: "HLC",
    tagline: "Unlock the Value of Compute",
  },
  nav: {
    links: [
      { label: "Home", href: "/#top" },
      { label: "How It Works", href: "/#bounty" },
      { label: "Whitepaper", href: "/whitepaper" },
      { label: "Tokenomics", href: "/#tokenomics" },
      { label: "Roadmap", href: "/#roadmap" },
      { label: "Wallet", href: "/#wallet" },
      { label: "Community", href: "/#community" },
    ],
    cta: { label: "Launch Wallet", href: "/#wallet" },
  },
  hero: {
    title: "Mine Blocks. Crack Hashes. Get Paid.",
    subtitle:
      "HashLatch is the first L1 blockchain where GPU miners earn double: block rewards plus bounties for solving real cryptographic tasks.",
    primaryCta: { label: "Start Mining", href: "#mining" },
    secondaryCta: { label: "Explore Bounties", href: "#bounty" },
    terminalLines: [
      "> hashlatch node v0.9.0 — connecting to cipherspace...",
      "> peers: 42 | block height: 18,204 | difficulty: 0x1d00ffff",
      "> scanning bounty mempool...",
      "> bounty found: SHA256(?) = 0x3a2b9f... reward: 500 HLC",
      "> GPU#0 RTX 4090  |  hashrate: 124.8 MH/s",
      "> commit submitted ✓  awaiting reveal window...",
    ],
  },
  about: {
    heading: "What is HashLatch?",
    features: [
      {
        icon: "⚡",
        title: "GPU Mining",
        description:
          "KawPow algorithm — ASIC-resistant. Mine HLC with any modern GPU.",
      },
      {
        icon: "🔓",
        title: "Crypto Bounties",
        description:
          "Users lock HLC in escrow for solving hashes, recovering keys, or pentesting.",
      },
      {
        icon: "🤝",
        title: "Commit-Reveal",
        description:
          "Anti-frontrunning two-phase submission protects miner solutions on-chain.",
      },
      {
        icon: "🔐",
        title: "Trustless Escrow",
        description:
          "UTXO-based timelocked contracts. No middleman, no custodian, no trust required.",
      },
    ],
  },
  stats: {
    heading: "Network Status",
    note: "Testnet coming soon — values shown are placeholders",
    items: [
      { label: "Block Height", value: "0" },
      { label: "Network Hashrate", value: "0 H/s" },
      { label: "Difficulty", value: "0" },
      { label: "Circulating Supply", value: "0 HLC" },
      { label: "Active Bounties", value: "0" },
    ],
  },
  bounty: {
    heading: "How Bounties Work",
    note: "Timelock protection: unclaimed bounties return to creator after 7 days.",
    steps: [
      {
        n: "01",
        title: "User Creates Bounty",
        description: "Locks HLC and the target hash inside a UTXO escrow.",
      },
      {
        n: "02",
        title: "Miners Compete",
        description: "GPU miners run hashcat/john against the target challenge.",
      },
      {
        n: "03",
        title: "Commit Solution",
        description: "Miner submits a hash of their solution — anti-frontrun.",
      },
      {
        n: "04",
        title: "Reveal & Earn",
        description: "Miner reveals the preimage and claims the escrowed HLC.",
      },
    ],
  },
  tokenomics: {
    heading: "Tokenomics",
    badge: "No premine. No ICO. Fair launch.",
    rows: [
      ["Max Supply", "21,000,000 HLC"],
      ["Consensus", "KawPow (GPU-only, ASIC-resistant)"],
      ["Block Time", "~2 minutes"],
      ["Dev Fee", "2% (transparent, for development)"],
      ["Miner Reward", "98% of block emission"],
      ["Bounty Model", "User-funded escrow (no extra emission)"],
      ["Address Prefix", "H (mainnet)"],
    ] as [string, string][],
  },
  roadmap: {
    heading: "Roadmap",
    phases: [
      {
        phase: "Phase 1",
        title: "Ravencoin Fork, Genesis Block, Internal Regtest",
        status: "Completed",
        statusTone: "done" as const,
        items: [
          "Ravencoin codebase fork",
          "Genesis block mined",
          "Internal regtest network live",
        ],
      },
      {
        phase: "Phase 2",
        title: "Bounty UTXO Implementation & Commit-Reveal",
        status: "In Progress",
        statusTone: "active" as const,
        items: [
          "Bounty UTXO opcodes",
          "Commit-reveal transactions",
          "Timelock refunds",
        ],
      },
      {
        phase: "Phase 3",
        title: "Public Testnet & Miner Onboarding",
        status: "Planned",
        statusTone: "planned" as const,
        items: ["Open testnet", "Mining pool guides", "Faucet & block explorer"],
      },
      {
        phase: "Phase 4",
        title: "Mainnet Launch & First Real Bounties",
        status: "Planned",
        statusTone: "planned" as const,
        items: [
          "Mainnet genesis",
          "First public bounties",
          "Web wallet release",
        ],
      },
      {
        phase: "Phase 5",
        title: "Cipherspace Explorer & DEX Listings",
        status: "Planned",
        statusTone: "planned" as const,
        items: [
          "Cipherspace block explorer",
          "DEX listings",
          "Bounty marketplace",
        ],
      },
    ],
  },
  why: {
    heading: "Why HashLatch?",
    items: [
      {
        icon: "🎯",
        title: "Real Utility",
        description:
          "Not useless hashing. Get paid for solving actual cryptographic problems.",
      },
      {
        icon: "🌱",
        title: "No Premine, No ICO",
        description:
          "Fair launch from block one. Pure community-driven distribution.",
      },
      {
        icon: "⚖️",
        title: "Code is Law",
        description:
          "No censorship. No whitelists. The free market decides everything.",
      },
    ],
  },
  wallet: {
    heading: "Coming Soon: HashLatch Web Wallet",
    description:
      "Generate addresses, check balances, create bounties, and manage your HLC — all from your browser. No downloads required.",
    cta: { label: "Join Testnet Waitlist", href: "/#community" },
  },
  community: {
    heading: "Join the Community",
    items: [
      { name: "GitHub", icon: "🐙", href: "https://github.com/dstr1989/PoWH" },
      { name: "Discord", icon: "💬", href: "#" },
      { name: "Twitter / X", icon: "𝕏", href: "#" },
      { name: "BitcoinTalk", icon: "₿", href: "#" },
    ],
  },
  footer: {
    copyright: "HashLatch (HLC) © 2026. Released under MIT License.",
    motto: "No premine. No ICO. Pure proof of work.",
    links: [
      { label: "Whitepaper", href: "/whitepaper" },
      { label: "GitHub", href: "https://github.com/dstr1989/PoWH" },
      { label: "Discord", href: "#" },
      { label: "Twitter / X", href: "#" },
      { label: "BitcoinTalk", href: "#" },
      { label: "Cipherspace Explorer", href: "#" },
    ],
  },
  whitepaper: {
    title: "HashLatch Whitepaper",
    subtitle: "Decentralized L1 for Useful GPU Mining & Cryptographic Bounties",
    cta: { label: "Join the HashLatch Community", href: "#" },
    sections: {
      vision: {
        heading: "1. Vision and Goal",
        body: "HashLatch (HLC) is the first 100% decentralized Layer 1 network combining classic GPU mining (KawPow) with a free-market reward mechanism for solving useful cryptographic tasks. Miners earn a stable base income from block rewards plus additional bounties for cracking password hashes, recovering lost wallet keys, and performing authorized penetration tests.",
        principlesTitle: "Core Principles",
        principles: [
          {
            title: "Code is Law",
            description: "Zero censorship, no whitelists, no external control.",
          },
          {
            title: "Hybrid Consensus",
            description:
              "Base mining (KawPow) for security + Bounty layer for extra earnings.",
          },
          {
            title: "Free Market",
            description:
              "Anyone creates tasks by locking HLC, any miner can solve them.",
          },
          {
            title: "Transaction Security",
            description:
              "Commit-reveal prevents front-running, escrow built into UTXO protocol.",
          },
        ],
      },
      architecture: {
        heading: "2. Network Architecture",
        rows: [
          ["Codebase", "Fork of Ravencoin (Bitcoin fork)"],
          ["Consensus", "KawPow (ASIC-resistant, GPU-optimized)"],
          ["Transaction Model", "UTXO (Bitcoin-style)"],
          [
            "Scripting",
            "OP_SHA256, OP_EQUALVERIFY, OP_CHECKLOCKTIMEVERIFY",
          ],
          [
            "Base Layer",
            "Classic block mining every ~2 minutes; emission covers GPU rig OPEX",
          ],
          [
            "Bounty Layer",
            "Special UTXOs storing targetHash, timelock, and HLC reward — solved when Hash(solution) == targetHash",
          ],
          [
            "Bounty UTXO (Escrow)",
            "Tokens locked in P2SH script enforcing OP_SHA256, OP_EQUALVERIFY, OP_CHECKLOCKTIMEVERIFY (7-day default timelock)",
          ],
          [
            "Commit-Reveal Security",
            "Commit = hash(solution + miner_address + nonce) in OP_RETURN. Reveal = plain solution referencing the commit. Nodes verify both.",
          ],
        ] as [string, string][],
      },
      software: {
        heading: "3. Software Components",
        rows: [
          [
            "HashLatch Core (Node)",
            "Forked Ravencoin node with bounty UTXO and commit-reveal support",
          ],
          [
            "HashLatch Miner",
            "GPU miner (KawPow) monitoring bounty UTXOs, triggers Hashcat",
          ],
          [
            "HashLatch Bridge",
            "Script connecting node to Hashcat for automated solving",
          ],
          [
            "HashLatch CLI/Wallet",
            "Interface for creating bounties, commits, claiming rewards",
          ],
        ] as [string, string][],
      },
      bounties: {
        heading: "4. Supported Bounties",
        items: [
          {
            title: "Crypto Wallet Recovery",
            description:
              "Cracking lost passwords (Bitcoin Core, Ethereum presales, BIP39 seeds).",
          },
          {
            title: "Penetration Testing",
            description: "Cracking server hashes with owner consent.",
          },
          {
            title: "Cryptographic Challenges",
            description: "Cracking hashes with partial knowledge.",
          },
          {
            title: "Future",
            description:
              "Any task requiring massive parallel GPU compute.",
          },
        ],
      },
      tokenomics: {
        heading: "5. Tokenomics",
        rows: [
          ["Max Supply", "21,000,000 HLC"],
          ["Block Time", "~2 minutes"],
          ["Consensus", "KawPow (GPU-only, ASIC-resistant)"],
          [
            "Dev Fee",
            "2% of block reward (development, audits, infrastructure)",
          ],
          ["Miner Reward", "98% of block emission"],
          [
            "Bounty Rewards",
            "User-funded escrow only. ZERO additional emission.",
          ],
        ] as [string, string][],
      },
      roadmap: {
        heading: "6. Roadmap",
        phases: [
          {
            mark: "✅",
            phase: "Phase 1",
            title: "Ravencoin Fork, Genesis Block, Internal Regtest",
            tone: "done" as const,
          },
          {
            mark: "🔄",
            phase: "Phase 2",
            title: "Bounty UTXO Implementation & Commit-Reveal",
            tone: "active" as const,
          },
          {
            mark: "•",
            phase: "Phase 3",
            title: "Public Testnet & Miner Onboarding",
            tone: "planned" as const,
          },
          {
            mark: "•",
            phase: "Phase 4",
            title: "Mainnet Launch & First Real Bounties",
            tone: "planned" as const,
          },
          {
            mark: "•",
            phase: "Phase 5",
            title: "Cipherspace Explorer & DEX Listings",
            tone: "planned" as const,
          },
        ],
      },
      faq: {
        heading: "7. Expert Q&A",
        items: [
          {
            q: "Is a Ravencoin fork secure?",
            a: "Yes. Ravencoin has a proven, stable codebase (Bitcoin fork). Our modifications are limited to new transaction types and do not compromise core consensus.",
          },
          {
            q: "How do you prevent bounty spam?",
            a: "Every bounty requires a transaction fee and locks a real token reward. Spamming is economically unviable.",
          },
          {
            q: "What if a miner loses their commit?",
            a: "Commit is optional but recommended. If published but no reveal follows, funds remain locked and other miners can solve the bounty.",
          },
          {
            q: "Can a bounty be solved without a commit?",
            a: "Yes, but the plain-text solution would be visible in the mempool and could be stolen. Commit-reveal is strongly incentivized.",
          },
          {
            q: "What are the computational costs for nodes?",
            a: "Negligible. OP_SHA256 and equality checks are highly optimized. Commit transactions (OP_RETURN) are lightweight.",
          },
        ],
      },
      summary: {
        heading: "8. Summary",
        body: "HashLatch (HLC) is history's first L1 network merging GPU mining with a free-market bounty ecosystem for useful cryptographic tasks. We reject censorship, whitelists, and central points of failure. Built on the proven Ravencoin foundation. Status: Ready for implementation.",
      },
    },
  },
};
