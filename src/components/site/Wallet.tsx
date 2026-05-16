import { useEffect, useState } from "react";
import { api } from "@/lib/hashlatch-api";
import { HashLatchExtractor } from "@/components/site/HashLatchExtractor";

type Json = Record<string, unknown> | unknown[] | null;

function fmt(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function statusOf(b: Record<string, unknown>): {
  label: string;
  tone: "open" | "solved" | "reclaimed";
} {
  const raw = String(b.status ?? b.state ?? "").toLowerCase();
  if (raw.includes("solv")) return { label: "Solved", tone: "solved" };
  if (raw.includes("reclaim") || raw.includes("refund"))
    return { label: "Reclaimed", tone: "reclaimed" };
  if (b.solved === true) return { label: "Solved", tone: "solved" };
  if (b.reclaimed === true) return { label: "Reclaimed", tone: "reclaimed" };
  return { label: "Open", tone: "open" };
}

function TerminalCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="mb-4 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export function Wallet() {
  const [balance, setBalance] = useState<Json>(null);
  const [bounties, setBounties] = useState<unknown[] | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Form
  const [targetHash, setTargetHash] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    try {
      const [b, bb] = await Promise.all([api.balance(), api.bounties()]);
      setBalance(b);
      const list = Array.isArray(bb)
        ? bb
        : (bb && typeof bb === "object" && Array.isArray((bb as { bounties?: unknown[] }).bounties)
            ? (bb as { bounties: unknown[] }).bounties
            : []);
      setBounties(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  const balanceValue =
    balance && typeof balance === "object" && !Array.isArray(balance)
      ? (balance as Record<string, unknown>).balance ??
        (balance as Record<string, unknown>).total ??
        balance
      : balance;

  const genAddress = async () => {
    setBusy(true);
    setErr(null);
    try {
      const r = await api.newAddress();
      const addr =
        (r && typeof r === "object" && (r.address as string)) ||
        (r && typeof r === "object" && (r.result as string)) ||
        JSON.stringify(r);
      setAddress(String(addr));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  };

  const submitBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setCreateMsg(null);
    try {
      const r = await api.createBounty({
        target_hash: targetHash.trim(),
        amount: amount.trim(),
        deadline: deadline.trim() || undefined,
      });
      setCreateMsg(`✓ Bounty submitted: ${JSON.stringify(r).slice(0, 200)}`);
      setTargetHash("");
      setAmount("");
      setDeadline("");
      load();
    } catch (e) {
      setCreateMsg(`✗ ${e instanceof Error ? e.message : "Network error"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
          ⚠ {err}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <TerminalCard title="wallet@hashlatch ~ balance">
          <div className="font-mono text-xs text-muted-foreground">
            <div className="text-[10px] uppercase">$ hashlatch-cli getbalance</div>
            <div className="mt-3 text-3xl font-bold text-primary text-glow">
              {fmt(balanceValue)} <span className="text-sm opacity-70">HLC</span>
            </div>
          </div>
        </TerminalCard>

        <TerminalCard title="wallet@hashlatch ~ address">
          <div className="font-mono text-xs text-muted-foreground">
            <div className="text-[10px] uppercase">$ hashlatch-cli getnewaddress</div>
            <div className="mt-3 break-all text-primary">
              {address ?? "— click below to generate —"}
            </div>
            <button
              onClick={genAddress}
              disabled={busy}
              className="mt-4 rounded-md border border-primary/50 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              {busy ? "…" : "Generate New Address"}
            </button>
          </div>
        </TerminalCard>
      </div>

      <HashLatchExtractor onUseHash={(h) => setTargetHash(h)} />

      <TerminalCard title="wallet@hashlatch ~ create bounty">
        <form onSubmit={submitBounty} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-[10px] uppercase text-muted-foreground">
              target_hash (SHA-256 hex)
            </label>
            <input
              required
              value={targetHash}
              onChange={(e) => setTargetHash(e.target.value)}
              placeholder="0x..."
              className="mt-1 w-full rounded-md border border-border bg-background/60 px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] uppercase text-muted-foreground">
                amount (HLC)
              </label>
              <input
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="mt-1 w-full rounded-md border border-border bg-background/60 px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-muted-foreground">
                deadline (block height, optional)
              </label>
              <input
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. 20000"
                className="mt-1 w-full rounded-md border border-border bg-background/60 px-3 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Broadcasting…" : "Create Bounty"}
          </button>
          {createMsg && <div className="text-primary">{createMsg}</div>}
        </form>
      </TerminalCard>

      <TerminalCard title="wallet@hashlatch ~ bounties">
        {!bounties && <div className="font-mono text-xs text-muted-foreground">Loading…</div>}
        {bounties && bounties.length === 0 && (
          <div className="font-mono text-xs text-muted-foreground">No bounties yet.</div>
        )}
        {bounties && bounties.length > 0 && (
          <ul className="divide-y divide-border/40">
            {bounties.map((raw, i) => {
              const b = (raw ?? {}) as Record<string, unknown>;
              const s = statusOf(b);
              const tone =
                s.tone === "solved"
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                  : s.tone === "reclaimed"
                    ? "border-muted-foreground/30 bg-muted/40 text-muted-foreground"
                    : "border-primary/50 bg-primary/10 text-primary";
              return (
                <li key={i} className="grid gap-2 py-3 font-mono text-xs md:grid-cols-[1fr_auto]">
                  <div className="min-w-0 space-y-1">
                    <div className="truncate text-primary">
                      {fmt(b.target_hash ?? b.targetHash ?? b.hash)}
                    </div>
                    <div className="text-muted-foreground">
                      amount: {fmt(b.amount ?? b.reward)} HLC · deadline:{" "}
                      {fmt(b.deadline ?? b.locktime ?? "—")}
                    </div>
                  </div>
                  <span
                    className={`inline-flex h-6 items-center rounded-full border px-2 text-[10px] ${tone}`}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </TerminalCard>
    </div>
  );
}
