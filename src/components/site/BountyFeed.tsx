import { useEffect, useState, useCallback, type ReactNode } from "react";
import { api, sha256Hex } from "@/lib/hashlatch-api";
import { Loader2, X, ChevronRight, Clock, Hash } from "lucide-react";

type Bounty = {
  txid?: string;
  target_hash?: string;
  amount?: number | string;
  deadline_block?: number;
  blocks_remaining?: number;
  solved?: boolean;
  [k: string]: unknown;
};

function short(s?: string, len = 16) {
  if (!s) return "—";
  return s.length > len ? `${s.slice(0, len)}…` : s;
}

// ── Modal shell matching Wallet.tsx style ─────────────────────────────────────
function ModalShell({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl border-primary/40 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-primary">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Claim Modal: commit → wait 6 blocks → reveal ──────────────────────────────
function ClaimModal({
  bounty, solverAddress, onClose,
}: {
  bounty: Bounty; solverAddress: string; onClose: () => void;
}) {
  const [step, setStep]         = useState<"commit" | "waiting" | "reveal" | "done">("commit");
  const [solution, setSolution] = useState("");
  const [nonce]                 = useState<string>(() => crypto.randomUUID().replace(/-/g, ""));
  const [commitHash, setCommitHash] = useState("");
  const [commitBlock, setCommitBlock] = useState(0);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [commitTxid, setCommitTxid] = useState("");
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);

  // Fetch current block height for progress tracking
  useEffect(() => {
    const fetchBlock = async () => {
      try {
        const d = await api.blockchainInfo() as Record<string, unknown>;
        setCurrentBlock(Number(d.blocks ?? 0));
      } catch { /* ignore */ }
    };
    fetchBlock();
    const id = setInterval(fetchBlock, 30_000);
    return () => clearInterval(id);
  }, []);

  // Compute commit hash live
  useEffect(() => {
    if (!solution || !solverAddress) return;
    sha256Hex(solution + solverAddress + nonce).then(setCommitHash);
  }, [solution, solverAddress, nonce]);

  const handleVerify = async () => {
    if (!solution || !bounty.target_hash) return;
    const computed = await sha256Hex(solution);
    setVerified(computed.toLowerCase() === String(bounty.target_hash).toLowerCase());
  };

  const handleCommit = async () => {
    setErr(null);
    if (!commitHash) { setErr("Enter your solution first"); return; }
    setBusy(true);
    try {
      const r = await api.commitBounty({
        bounty_txid:    String(bounty.txid ?? ""),
        commit_hash:    commitHash,
        solver_address: solverAddress,
      });
      setCommitTxid(String(r.txid ?? ""));
      setCommitBlock(currentBlock);
      setStep("waiting");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Commit failed");
    } finally {
      setBusy(false);
    }
  };

  const handleReveal = async () => {
    setErr(null);
    setBusy(true);
    try {
      await api.revealBounty({
        bounty_txid:    String(bounty.txid ?? ""),
        solution,
        nonce,
        payout_address: solverAddress,
      });
      setStep("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Reveal failed");
    } finally {
      setBusy(false);
    }
  };

  const blocksWaited = currentBlock - commitBlock;
  const canReveal    = blocksWaited >= 6;

  return (
    <ModalShell
      title={step === "done" ? "Bounty Solved ✓" : "Claim Bounty"}
      onClose={onClose}
    >
      {/* Stepper */}
      {step !== "done" && (
        <div className="mb-5 flex gap-1">
          {(["commit", "waiting", "reveal"] as const).map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1">
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold
                ${step === s ? "bg-primary text-primary-foreground"
                  : (["commit","waiting","reveal"].indexOf(step) > i)
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "border border-border text-muted-foreground"}`}>
                {(["commit","waiting","reveal"].indexOf(step) > i) ? "✓" : i + 1}
              </div>
              {i < 2 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>
      )}

      {/* STEP: COMMIT */}
      {step === "commit" && (
        <>
          <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 p-3 font-mono text-[11px] text-primary/80">
            ℹ Commit hides your answer for 6 blocks to prevent front-running.
          </div>

          <div className="mb-3">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Target hash</div>
            <code className="block break-all font-mono text-[10px] text-foreground/70">{bounty.target_hash}</code>
          </div>

          <div className="mb-2">
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Your solution
            </label>
            <div className="flex gap-2">
              <input
                value={solution}
                onChange={(e) => { setSolution(e.target.value); setVerified(null); }}
                placeholder="Enter the secret you know…"
                className="flex-1 rounded-md border border-border bg-background/60 p-3 font-mono text-xs outline-none focus:border-primary"
              />
              <button
                onClick={handleVerify}
                className="shrink-0 rounded-md border border-border px-3 font-mono text-[11px] hover:border-primary hover:text-primary"
              >
                Verify
              </button>
            </div>
            {verified !== null && (
              <div className={`mt-2 rounded-md border p-2 font-mono text-[11px]
                ${verified
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
                {verified ? "✓ Hash matches! Safe to commit." : "✕ Hash doesn't match. Double-check your solution."}
              </div>
            )}
          </div>

          {err && <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-2 font-mono text-[11px] text-destructive">{err}</div>}

          <button
            onClick={handleCommit}
            disabled={busy || !commitHash || verified === false}
            className="mt-2 w-full rounded-md bg-primary px-4 py-3 font-mono text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            {busy ? <><Loader2 size={14} className="mr-2 inline animate-spin" />Committing…</> : "Commit Solution"}
          </button>
        </>
      )}

      {/* STEP: WAITING */}
      {step === "waiting" && (
        <>
          <div className="mb-4 rounded-md border border-emerald-400/30 bg-emerald-400/10 p-3 font-mono text-xs text-emerald-300">
            ✓ Committed! TX: {short(commitTxid, 20)}
          </div>
          <div className="mb-2 font-mono text-[11px]">
            <div className="mb-2 flex justify-between text-muted-foreground">
              <span>Blocks since commit</span>
              <span className={canReveal ? "text-emerald-400" : "text-primary"}>
                {Math.min(blocksWaited, 6)} / 6
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full transition-all ${canReveal ? "bg-emerald-400" : "bg-primary"}`}
                style={{ width: `${Math.min(100, (blocksWaited / 6) * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-muted-foreground">
              {canReveal ? "✓ Ready to reveal!" : `Wait ~${(6 - blocksWaited) * 10} more minutes`}
            </div>
          </div>
          {canReveal && (
            <button
              onClick={() => setStep("reveal")}
              className="mt-4 w-full rounded-md bg-primary px-4 py-3 font-mono text-sm font-semibold text-primary-foreground"
            >
              Reveal Solution <ChevronRight size={14} className="inline" />
            </button>
          )}
        </>
      )}

      {/* STEP: REVEAL */}
      {step === "reveal" && (
        <>
          <div className="mb-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 font-mono text-[11px] text-yellow-400">
            ⚠ Make sure this is the exact solution and nonce from your commit.
          </div>
          <div className="mb-3 rounded border border-border bg-background/40 p-3">
            <div className="mb-1 font-mono text-[10px] text-muted-foreground">Solution</div>
            <div className="font-mono text-xs text-primary">{solution || "(re-enter below)"}</div>
          </div>
          {!solution && (
            <input
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Re-enter your solution"
              className="mb-3 w-full rounded-md border border-border bg-background/60 p-3 font-mono text-xs outline-none focus:border-primary"
            />
          )}
          <div className="mb-4 rounded border border-border bg-background/40 p-2 font-mono text-[10px]">
            <span className="text-muted-foreground">nonce: </span>
            <span className="break-all text-foreground/70">{nonce}</span>
          </div>
          {err && <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-2 font-mono text-[11px] text-destructive">{err}</div>}
          <button
            onClick={handleReveal}
            disabled={busy || !solution}
            className="w-full rounded-md bg-emerald-500 px-4 py-3 font-mono text-sm font-semibold text-black disabled:opacity-40"
          >
            {busy ? <><Loader2 size={14} className="mr-2 inline animate-spin" />Revealing…</> : "Reveal & Collect Reward"}
          </button>
        </>
      )}

      {/* DONE */}
      {step === "done" && (
        <div className="py-4 text-center">
          <div className="mb-3 text-4xl">🎉</div>
          <div className="mb-2 font-bold text-emerald-400">Bounty Solved!</div>
          <div className="font-mono text-xs text-muted-foreground">
            Reward {bounty.amount} HLC will be sent to your address.
          </div>
          <button onClick={onClose}
            className="mt-6 rounded-md bg-primary px-8 py-3 font-mono text-sm font-semibold text-primary-foreground">
            Close
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ── Main BountyFeed ───────────────────────────────────────────────────────────
export function BountyFeed() {
  const [list, setList]             = useState<Bounty[] | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [filter, setFilter]         = useState<"active" | "all">("active");
  const [claiming, setClaiming]     = useState<Bounty | null>(null);
  const [solverAddr, setSolverAddr] = useState<string>("");

  // Read connected wallet address if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hashlatch_wallet_v3");
      if (raw) {
        const w = JSON.parse(raw) as { address?: string };
        if (w?.address) setSolverAddr(w.address);
      }
    } catch { /* ignore */ }
  }, []);

  const load = useCallback(async () => {
    try {
      const d = await api.bounties(filter);
      const arr = Array.isArray(d)
        ? (d as Bounty[])
        : ((d as { bounties?: Bounty[] })?.bounties ?? []);
      setList(arr);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setList([]);
    }
  }, [filter]);

  useEffect(() => {
    setList(null);
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <section id="bounty-feed" className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">

        {/* Header */}
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
          <p className="mt-3 font-mono text-sm text-muted-foreground">
            Solve the hash preimage, collect the HLC reward.
          </p>
        </div>

        {/* Filter + refresh */}
        <div className="mb-6 flex items-center gap-3">
          {(["active", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all
                ${filter === f
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"}`}
            >
              {f === "active" ? "Active" : "All"}
            </button>
          ))}
          <button
            onClick={load}
            className="ml-auto flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary"
          >
            <Loader2 size={11} className={list === null ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {list === null ? (
          <div className="text-center font-mono text-xs text-muted-foreground">
            <Loader2 size={16} className="mx-auto mb-2 animate-spin" />
            $ fetching bounties…
          </div>

        /* Empty */
        ) : list.length === 0 ? (
          <div className="reveal mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-background/40 p-10 text-center font-mono text-sm text-muted-foreground">
            No active bounties. Be the first to{" "}
            <a href="/wallet" className="text-primary underline">create one</a>.
          </div>

        /* Cards */
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((b, i) => (
              <div
                key={(b.txid as string) ?? i}
                className="reveal flex flex-col rounded-2xl border border-primary/40 bg-black/60 p-5 font-mono text-xs shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_8%,transparent)]"
              >
                {/* Status badge */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">txid</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px]
                    ${b.solved
                      ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                      : "border border-primary/40 bg-primary/10 text-primary"}`}>
                    {b.solved ? "● Solved" : "○ Open"}
                  </span>
                </div>

                <code className="mb-3 block break-all text-foreground/80">{short(b.txid)}</code>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground"><Hash size={9} /> Reward</div>
                    <div className="text-glow text-sm text-primary">{String(b.amount ?? "—")} HLC</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground"><Clock size={9} /> Blocks left</div>
                    <div className={Number(b.blocks_remaining ?? 999) < 24 ? "text-yellow-400" : ""}>
                      {b.blocks_remaining != null ? `${b.blocks_remaining}` : "—"}
                    </div>
                  </div>
                </div>

                {b.target_hash && (
                  <div className="mt-3 rounded border border-border bg-background/30 px-2 py-1.5">
                    <div className="mb-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">target hash</div>
                    <code className="break-all text-[10px] text-foreground/60">{b.target_hash}</code>
                  </div>
                )}

                {/* Claim button */}
                {!b.solved && (
                  <div className="mt-auto pt-4">
                    <button
                      onClick={() => setClaiming(b)}
                      className="w-full rounded-md border border-primary/40 bg-primary/10 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                    >
                      Solve & Claim →
                    </button>
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

      {/* Claim modal */}
      {claiming && (
        <ClaimModal
          bounty={claiming}
          solverAddress={solverAddr}
          onClose={() => setClaiming(null)}
        />
      )}
    </section>
  );
}
