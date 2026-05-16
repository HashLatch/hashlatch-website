import { useEffect, useState } from "react";
import { api } from "@/lib/hashlatch-api";

type Info = Record<string, unknown>;

function pick(o: Info | null, ...keys: string[]): string {
  if (!o) return "—";
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null) return String(v);
  }
  return "—";
}

function formatProgress(v: string): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  return `${(n * 100).toFixed(2)}%`;
}

export function LiveStats() {
  const [data, setData] = useState<Info | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const d = await api.blockchainInfo();
        if (cancelled) return;
        setData(d);
        setError(null);
        setUpdatedAt(Date.now());
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Network error");
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const items = [
    { label: "Block Height", value: pick(data, "blocks", "height") },
    { label: "Difficulty", value: pick(data, "difficulty") },
    { label: "Chain", value: pick(data, "chain") },
    {
      label: "Verification Progress",
      value: formatProgress(pick(data, "verificationprogress", "verification_progress")),
    },
  ];

  return (
    <section id="mining" className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <div className="reveal mb-12 text-center md:mb-16">
          <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live Testnet
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Network Status
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((s) => (
            <div key={s.label} className="reveal glass rounded-2xl p-6 text-center">
              <div className="text-glow truncate font-mono text-2xl font-bold text-primary md:text-3xl">
                {s.value}
              </div>
              <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="reveal mt-6 text-center font-mono text-xs text-muted-foreground">
          {error
            ? `⚠ ${error} — retrying every 30s`
            : updatedAt
              ? `↻ Updated ${new Date(updatedAt).toLocaleTimeString()} · auto-refresh 30s`
              : "Connecting to testnet…"}
        </div>
      </div>
    </section>
  );
}
