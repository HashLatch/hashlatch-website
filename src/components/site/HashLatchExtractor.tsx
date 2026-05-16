import { useState } from "react";
import { sha256Hex } from "@/lib/hashlatch-api";

export function HashLatchExtractor({
  onUseHash,
}: {
  onUseHash?: (hash: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);

  const compute = async () => {
    if (!password) return;
    setBusy(true);
    try {
      const h = await sha256Hex(password);
      setHash(h);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="extractor" className="py-20">
      <div className="mx-auto w-full max-w-[900px] px-5 md:px-8">
        <div className="reveal glass rounded-2xl p-6 md:p-10">
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
            hashlatch-extractor
          </div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Create Bounty from a Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Type a password — SHA-256 is computed locally in your browser, then
            used as the bounty target hash. Mirrors the{" "}
            <code className="font-mono text-primary">hashlatch-extractor.py</code>{" "}
            flow.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              type="text"
              placeholder='e.g. "correct horse battery staple"'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-background/60 px-4 py-3 font-mono text-sm outline-none focus:border-primary"
            />
            <button
              onClick={compute}
              disabled={!password || busy}
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_45%,transparent)] disabled:opacity-50"
            >
              {busy ? "Hashing…" : "Compute SHA-256"}
            </button>
          </div>

          {hash && (
            <div className="mt-6 rounded-md border border-primary/30 bg-background/60 p-4 font-mono text-xs">
              <div className="mb-1 text-muted-foreground">target_hash</div>
              <div className="break-all text-primary">{hash}</div>
              {onUseHash && (
                <button
                  onClick={() => onUseHash(hash)}
                  className="mt-3 inline-flex items-center gap-2 rounded-md border border-primary/50 px-3 py-1.5 text-xs text-primary hover:bg-primary/10"
                >
                  → Pre-fill Create Bounty
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
