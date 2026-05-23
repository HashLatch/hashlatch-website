import { createFileRoute } from '@tanstack/react-router';
import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Sections';
import { RichList } from '@/components/site/RichList';

export const Route = createFileRoute('/top-wallets')({
  head: () => ({
    meta: [{ title: "Top Wallets — HashLatch (HLC)" }],
  }),
  component: TopWalletsPage,
});

function TopWalletsPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hex-grid-bg" />
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        <div>
          <Navbar />
          <div className="pt-24">
            <RichList />
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
