import { useEffect, useState } from "react";
import { api } from "@/lib/hashlatch-api";

type Bounty = {
  txid?: string;
  target_hash?: string;
  amount?: number | string;
  deadline?: number | string;
  solved?: boolean;
  [k: string]: unknown;
};

function short(s?: string) {
  if (!s) return "—";
  return s.length > 16 ? `${s.slice(0, 16)}…` : s;
}

export function BountyFeed() {
  const [list, setList] = useState<Bounty[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const d = await api.bounties();
        if (cancelled) return;
        const arr = Array.isArray(d)
          ? (d as Bounty[])
          : ((d as { bounties?: Bounty[] })?.bounties ?? []);
        setList(arr);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Network error");
        setList([]);
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <section id="bounty-feed" className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <div className="reveal mb-12 text-center md:mb-16">
          <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Mempool · Live
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Active Bounties — Live
          </h2>
        </div>

        {list === null ? (
          <div className="text-center font-mono text-xs text-muted-foreground">
            $ fetching bounties…
          </div>
        ) : list.length === 0 ? (
          <div className="reveal mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-background/40 p-10 text-center font-mono text-sm text-muted-foreground">
            No active bounties. Be the first to{" "}
            <a href="/wallet" className="text-primary underline">
              create one
            </a>
            .
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((b, i) => (
              <div
                key={(b.txid as string) ?? i}
                className="reveal rounded-2xl border border-primary/40 bg-black/60 p-5 font-mono text-xs shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_8%,transparent)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    txid
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      b.solved
                        ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                        : "border border-primary/40 bg-primary/10 text-primary"
                    }`}
                  >
                    {b.solved ? "● Solved" : "○ Open"}
                  </span>
                </div>
                <code className="block break-all text-foreground/80">
                  {short(b.txid)}
                </code>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="text-muted-foreground">Reward</div>
                    <div className="text-primary text-glow text-sm">
                      {String(b.amount ?? "—")} HLC
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Deadline</div>
                    <div>{String(b.deadline ?? "—")}</div>
                  </div>
                </div>
                {b.target_hash && (
                  <div className="mt-3 truncate text-[10px] text-muted-foreground">
                    target: <span className="text-foreground/70">{short(b.target_hash as string)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 text-center font-mono text-xs text-primary">
            ⚠ API unreachable — retrying every 60s
          </div>
        )}
      </div>
    </section>
  );
}
