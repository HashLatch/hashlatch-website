import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Decoder } from "@/components/site/Decoder";

export const Route = createFileRoute("/decoder")({
  head: () => ({
    meta: [
      { title: "HashLatch Transaction Decoder" },
      {
        name: "description",
        content:
          "Decode any HashLatch mainnet TXID and inspect OP_RETURN metadata and P2SH bounty scripts.",
      },
      { property: "og:title", content: "HashLatch Transaction Decoder" },
      {
        property: "og:description",
        content: "Inspect bounty UTXOs and commit-reveal metadata on the HashLatch mainnet.",
      },
    ],
  }),
  component: DecoderPage,
});

function DecoderPage() {
  return (
    <PageShell
      eyebrow="mainnet · raw tx"
      title="Transaction Decoder"
      subtitle="Paste a TXID to inspect OP_RETURN metadata and the P2SH bounty script."
    >
      <Decoder />
    </PageShell>
  );
}
