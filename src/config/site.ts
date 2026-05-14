// Single source of truth for all editable site content.
export const siteConfig = {
  brand: {
    name: "HASHLOCK",
    fullName: "HashLock",
    ticker: "HLC",
    tagline: "Unlock the Value of Compute",
  },
  nav: {
    links: [
      { label: "Home", href: "#top" },
      { label: "How It Works", href: "#bounty" },
      { label: "Tokenomics", href: "#tokenomics" },
      { label: "Roadmap", href: "#roadmap" },
      { label: "Wallet", href: "#wallet" },
      { label: "Community", href: "#community" },
    ],
    cta: { label: "Launch Wallet", href: "#wallet" },
  },
  hero: {
    title: "Mine Blocks. Crack Hashes. Get Paid.",
    subtitle:
      "HashLock is the first L1 blockchain where GPU miners earn double: block rewards plus bounties for solving real cryptographic tasks.",
    primaryCta: { label: "Start Mining", href: "#mining" },
    secondaryCta: { label: "Explore Bounties", href: "#bounty" },
    terminalLines: [
      "> hashlock node v0.9.0 — connecting to cipherspace...",
      "> peers: 42 | block height: 18,204 | difficulty: 0x1d00ffff",
      "> scanning bounty mempool...",
      "> bounty found: SHA256(?) = 0x3a2b9f... reward: 500 HLC",
      "> GPU#0 RTX 4090  |  hashrate: 124.8 MH/s",
      "> commit submitted ✓  awaiting reveal window...",
    ],
  },
  about: {
    heading: "What is HashLock?",
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
        title: "Genesis & Internal Testnet",
        status: "Completed",
        statusTone: "done" as const,
        items: ["Genesis block mined", "Core node fork", "Internal testnet live"],
      },
      {
        phase: "Phase 2",
        title: "Bounty UTXO & Commit-Reveal",
        status: "In Progress",
        statusTone: "active" as const,
        items: ["Bounty UTXO opcodes", "Commit-reveal transactions", "Timelock refunds"],
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
        title: "Mainnet Launch & First Bounties",
        status: "Planned",
        statusTone: "planned" as const,
        items: ["Mainnet genesis", "First public bounties", "Web wallet release"],
      },
      {
        phase: "Phase 5",
        title: "CEX/DEX Listings & Ecosystem Growth",
        status: "Planned",
        statusTone: "planned" as const,
        items: ["Exchange listings", "Bounty marketplace", "Ecosystem grants"],
      },
    ],
  },
  why: {
    heading: "Why HashLock?",
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
    heading: "Coming Soon: HashLock Web Wallet",
    description:
      "Generate addresses, check balances, create bounties, and manage your HLC — all from your browser. No downloads required.",
    cta: { label: "Join Testnet Waitlist", href: "#community" },
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
    copyright: "HashLock (HLC) © 2026. Released under MIT License.",
    motto: "No premine. No ICO. Pure proof of work.",
    links: [
      { label: "GitHub", href: "https://github.com/dstr1989/PoWH" },
      { label: "Whitepaper", href: "#" },
      { label: "Discord", href: "#" },
      { label: "Twitter / X", href: "#" },
      { label: "BitcoinTalk", href: "#" },
      { label: "Cipherspace Explorer", href: "#" },
    ],
  },
};
