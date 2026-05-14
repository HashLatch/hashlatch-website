import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import {
  Hero,
  About,
  Stats,
  Bounty,
  Tokenomics,
  Roadmap,
  Community,
  Footer,
} from "@/components/site/Sections";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Proof of White-Hat (PoWH) — Decentralized L1 for GPU Mining & Bounties" },
      {
        name: "description",
        content:
          "PoWH is a decentralized L1 blockchain for useful GPU mining and cryptographic bounties. KawPow consensus, no premine, code is law.",
      },
      { property: "og:title", content: "Proof of White-Hat (PoWH)" },
      {
        property: "og:description",
        content:
          "Decentralized L1 blockchain for useful GPU mining and cryptographic bounties.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  useReveal();
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <Hero />
      <About />
      <Stats />
      <Bounty />
      <Tokenomics />
      <Roadmap />
      <Community />
      <Footer />
    </main>
  );
}
