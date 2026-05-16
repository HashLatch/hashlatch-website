import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Simulator } from "@/components/site/Simulator";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "HashLatch Commit-Reveal Simulator" },
      {
        name: "description",
        content:
          "Step-by-step educational simulator for the HashLatch commit-reveal bounty flow.",
      },
      { property: "og:title", content: "HashLatch Commit-Reveal Simulator" },
      {
        property: "og:description",
        content: "Walk through the four phases of a HashLatch bounty: create, commit, wait, reveal.",
      },
    ],
  }),
  component: SimulatorPage,
});

function SimulatorPage() {
  return (
    <PageShell
      eyebrow="education · commit-reveal"
      title="Commit-Reveal Simulator"
      subtitle="Four steps: Create Bounty → Commit Solution → Wait 6 Blocks → Reveal & Earn."
    >
      <Simulator />
    </PageShell>
  );
}
