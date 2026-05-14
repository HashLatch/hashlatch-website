// Single source of truth for all editable site content.
export const siteConfig = {
  brand: {
    name: "PoWH",
    fullName: "Proof of White-Hat",
    tagline:
      "The first decentralized L1 blockchain for useful GPU mining & cryptographic bounties",
  },
  nav: {
    links: [
      { label: "About", href: "#about" },
      { label: "Mining", href: "#mining" },
      { label: "Bounty", href: "#bounty" },
      { label: "Wallet", href: "#wallet" },
      { label: "Community", href: "#community" },
    ],
    cta: { label: "Launch Wallet", href: "#wallet" },
  },
  hero: {
    title: "Proof of White-Hat",
    subtitle:
      "The first decentralized L1 blockchain for useful GPU mining & cryptographic bounties",
    primaryCta: { label: "Start Mining", href: "#mining" },
    secondaryCta: { label: "Explore Bounties", href: "#bounty" },
  },
  about: {
    heading: "What is PoWH?",
    features: [
      {
        icon: "⚡",
        title: "KawPow Mining",
        description:
          "ASIC-resistant GPU mining based on Ravencoin's proven algorithm.",
      },
      {
        icon: "🔒",
        title: "Cryptographic Bounties",
        description:
          "Earn extra rewards solving real-world crypto challenges.",
      },
      {
        icon: "🛡️",
        title: "Code is Law",
        description: "No censorship. No whitelists. Pure free market.",
      },
    ],
  },
  stats: {
    heading: "Network Stats",
    note: "Testnet coming soon",
    items: [
      { label: "Current Block Height", value: "0" },
      { label: "Network Hashrate", value: "0 H/s" },
      { label: "Difficulty", value: "0" },
      { label: "Circulating Supply", value: "0 POWH" },
    ],
  },
  bounty: {
    heading: "How Bounties Work",
    steps: [
      {
        n: "01",
        title: "User Creates Bounty",
        description: "Locks POWH tokens in escrow with target hash.",
      },
      {
        n: "02",
        title: "Miners Compete",
        description: "Miners attempt to crack the hash using GPU power.",
      },
      {
        n: "03",
        title: "Commit & Reveal",
        description: "Secure two-phase submission prevents solution theft.",
      },
      {
        n: "04",
        title: "Get Rewarded",
        description: "Valid solution claims escrow reward automatically.",
      },
    ],
  },
  tokenomics: {
    heading: "Tokenomics",
    badge: "No premine. No ICO.",
    rows: [
      ["Max Supply", "21,000,000 POWH"],
      ["Consensus", "KawPow (GPU-only)"],
      ["Block Time", "~1–2 minutes"],
      ["Dev Fee", "2%"],
      ["Miner Reward", "98%"],
      ["Bounty Model", "User-funded escrow"],
      ["Address Prefix", "P (mainnet)"],
    ] as [string, string][],
  },
  roadmap: {
    heading: "Roadmap",
    phases: [
      {
        phase: "Phase 1",
        title: "Foundation",
        status: "Completed",
        statusTone: "done" as const,
        items: ["Fork Ravencoin", "Genesis block", "Internal testnet"],
      },
      {
        phase: "Phase 2",
        title: "Bounty Engine",
        status: "In Progress",
        statusTone: "active" as const,
        items: ["Bounty UTXO", "Commit-reveal transactions"],
      },
      {
        phase: "Phase 3",
        title: "Public Testnet",
        status: "Planned",
        statusTone: "planned" as const,
        items: ["Public testnet", "Miner onboarding"],
      },
      {
        phase: "Phase 4",
        title: "Mainnet",
        status: "Planned",
        statusTone: "planned" as const,
        items: ["Mainnet launch", "First bounties", "Exchange listings"],
      },
    ],
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
    copyright: "Proof of White-Hat (PoWH) © 2026. Released under MIT License.",
    motto: "Code is law.",
    links: [
      { label: "GitHub", href: "https://github.com/dstr1989/PoWH" },
      { label: "Whitepaper", href: "#" },
      { label: "Discord", href: "#" },
    ],
  },
};
