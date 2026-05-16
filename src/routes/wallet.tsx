import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Wallet } from "@/components/site/Wallet";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "HashLatch Wallet — Testnet RPC Console" },
      {
        name: "description",
        content:
          "Web wallet for HashLatch (HLC) testnet: balance, addresses, real bounties via RPC.",
      },
      { property: "og:title", content: "HashLatch Wallet" },
      {
        property: "og:description",
        content: "Live web wallet connected to the HashLatch testnet RPC bridge.",
      },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  return (
    <PageShell
      eyebrow="testnet · live RPC"
      title="HashLatch Wallet"
      subtitle="Balances, addresses, and bounties — straight from the testnet node."
    >
      <Wallet />
    </PageShell>
  );
}
