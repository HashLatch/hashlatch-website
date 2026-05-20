import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { RichList } from "@/components/site/RichList";

export const Route = createFileRoute("/top-wallets")({
  component: TopWalletsPage,
});

function TopWalletsPage() {
  return (
    <PageShell
      eyebrow="explorer · live"
      title="Top Wallets"
      subtitle="All addresses with their current HLC balance. Updated automatically."
    >
      <RichList />
    </PageShell>
  );
}
