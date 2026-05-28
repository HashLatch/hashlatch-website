import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import {
  Hero,
  About,
  Bounty,
  Tokenomics,
  Roadmap,
  Why,
  Community,
  Decentralization,
  Footer,
} from "@/components/site/Sections";
import { LiveStats } from "@/components/site/LiveStats";
import { HashLatchExtractor } from "@/components/site/HashLatchExtractor";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "HashLatch (HLC) — Unlock the Value of Compute · L1 GPU Mining & Crypto Bounties",
      },
      {
        name: "description",
        content:
          "HashLatch is the first L1 blockchain where GPU miners earn double: block rewards plus bounties for solving real cryptographic tasks. KawPow, no premine, code is law.",
      },
      { property: "og:title", content: "HashLatch (HLC) — Unlock the Value of Compute" },
      {
        property: "og:description",
        content:
          "L1 blockchain for GPU mining and cryptographic bounties. Mine blocks, crack hashes, get paid.",
      },
      { property: "og:type", content: "website" },
      { name: "theme-color", content: "#0A0A0F" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

import { BountyFeed } from "@/components/site/BountyFeed";
import { HowToMine } from "@/components/site/HowToMine";

function Index() {
  useReveal();
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hex-grid-bg" />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <About />
        <LiveStats />
        <Bounty />
        <BountyFeed />
        <HashLatchExtractor />
        <HowToMine />
        <Tokenomics />
        <Roadmap />
        <Why />
        <Decentralization />
        <Community />
        <Footer />
      </div>
    </main>
  );
}
