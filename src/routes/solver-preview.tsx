import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Sections";
import { SolverPreview } from "@/components/site/SolverPreview";

export const Route = createFileRoute("/solver-preview")({
  head: () => ({
    meta: [{ title: "HashLatch Solver App — Preview" }],
  }),
  component: SolverPreviewPage,
});

function SolverPreviewPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hex-grid-bg" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 pt-24 pb-16">
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <div className="mb-10 text-center">
              <div className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 font-mono text-xs text-primary">
                Coming Soon
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight">
                HashLatch Solver
              </h1>
              <p className="text-lg text-muted-foreground">
                Browse bounties, crack hashes with your GPU, collect HLC — automatically.
              </p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Windows app in active development · Update coming soon
              </p>
            </div>
            <SolverPreview />
            <div className="mt-10 grid gap-4 sm:grid-cols-3 text-center">
              {[
                { icon: "🔍", title: "Browse bounties", desc: "See active bounties with rewards in HLC" },
                { icon: "⚡", title: "Auto-crack", desc: "App runs hashcat on your GPU automatically" },
                { icon: "💰", title: "Auto-claim", desc: "Found it? HLC lands in your wallet instantly" },
              ].map((f) => (
                <div key={f.title} className="glass rounded-2xl p-6">
                  <div className="mb-2 text-3xl">{f.icon}</div>
                  <div className="mb-1 font-semibold">{f.title}</div>
                  <div className="text-sm text-muted-foreground">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
