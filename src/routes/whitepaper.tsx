import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Sections";
import { Whitepaper } from "@/components/site/Whitepaper";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/whitepaper")({
  head: () => ({
    meta: [
      {
        title:
          "HashLock Whitepaper — Decentralized L1 for GPU Mining & Cryptographic Bounties",
      },
      {
        name: "description",
        content:
          "Read the HashLock (HLC) whitepaper: vision, architecture, commit-reveal bounty UTXOs, KawPow consensus, tokenomics, and roadmap.",
      },
      {
        property: "og:title",
        content: "HashLock Whitepaper — L1 GPU Mining & Crypto Bounties",
      },
      {
        property: "og:description",
        content:
          "Vision, architecture, and tokenomics for HashLock: useful GPU mining and a free-market bounty layer.",
      },
      { property: "og:type", content: "article" },
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
  component: WhitepaperPage,
});

function WhitepaperPage() {
  useReveal();
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hex-grid-bg" />
      <div className="relative z-10">
        <Navbar />
        <Whitepaper />
        <Footer />
      </div>
    </main>
  );
}
