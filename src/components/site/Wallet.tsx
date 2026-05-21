import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  Check,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Send,
  Plus,
  X,
} from "lucide-react";
import { api, sha256Hex } from "@/lib/hashlatch-api";

type StoredWallet = {
  address: string;
  seed: string;
  passwordHash: string; // sha256 hex
};

const LS_KEY = "hashlatch_wallet_v2";
const IDLE_MS = 15 * 60 * 1000;

function loadWallet(): StoredWallet | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as StoredWallet) : null;
  } catch {
    return null;
  }
}

function CopyBtn({ value, label = "copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground hover:border-primary/60 hover:text-primary"
    >
      {done ? <Check size={12} /> : <Copy size={12} />}
      {done ? "copied" : label}
    </button>
  );
}

type Screen =
  | "landing"
  | "create-reveal"
  | "create-password"
  | "login"
  | "locked"
  | "dashboard";

type Tx = {
  txid?: string;
  amount?: number | string;
  type?: string;
  time?: number | string;
  [k: string]: unknown;
};

export function Wallet() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [stored, setStored] = useState<StoredWallet | null>(null);
  const [draftSeed, setDraftSeed] = useState<{ address: string; seed: string } | null>(null);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // password inputs
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  // login
  const [loginMode, setLoginMode] = useState<"password" | "seed">("password");
  const [loginPw, setLoginPw] = useState("");
  const [loginSeedTxt, setLoginSeedTxt] = useState("");

  // dashboard
  const [balance, setBalance] = useState<string>("—");
  const [balErr, setBalErr] = useState<string | null>(null);
  const [balLoading, setBalLoading] = useState(false);
  const [txs, setTxs] = useState<Tx[] | null>(null);

  // modals
  const [sendOpen, setSendOpen] = useState(false);
  const [bountyOpen, setBountyOpen] = useState(false);

  useEffect(() => {
    const w = loadWallet();
    if (w) {
      setStored(w);
      setScreen("locked");
    }
  }, []);

  // ────── idle auto-lock ──────
  const idleTimer = useRef<number | null>(null);
  const resetIdle = useCallback(() => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      setScreen("locked");
      setBalance("—");
      setTxs(null);
    }, IDLE_MS);
  }, []);
  useEffect(() => {
    if (screen !== "dashboard") return;
    const events = ["mousemove", "keydown", "click", "touchstart"];
    const handler = () => resetIdle();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetIdle();
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [screen, resetIdle]);

  // ────── balance polling ──────
  const fetchBalance = useCallback(async (addr: string) => {
    setBalLoading(true);
    setBalErr(null);
    try {
      const d = (await api.balance(addr)) as Record<string, unknown>;
      const raw =
        (d.balance as number | string | undefined) ??
        (d.result as number | string | undefined) ??
        (typeof d === "number" ? d : undefined);
      const n = Number(raw);
      setBalance(Number.isFinite(n) ? n.toFixed(8) : String(raw ?? "0"));
    } catch (e) {
      setBalErr(e instanceof Error ? e.message : "Network error");
      setBalance("—");
    } finally {
      setBalLoading(false);
    }
  }, []);

  const fetchTxs = useCallback(async (addr: string) => {
    try {
      const d = (await api.transactions(addr)) as Record<string, unknown>;
      const list =
        (d.transactions as Tx[] | undefined) ??
        (d.txs as Tx[] | undefined) ??
        (Array.isArray(d) ? (d as unknown as Tx[]) : null);
      setTxs(list?.slice(0, 10) ?? []);
    } catch {
      setTxs([]);
    }
  }, []);

  useEffect(() => {
    if (screen !== "dashboard" || !stored) return;
    fetchBalance(stored.address);
    fetchTxs(stored.address);
    const id = setInterval(() => fetchBalance(stored.address), 30_000);
    return () => clearInterval(id);
  }, [screen, stored, fetchBalance, fetchTxs]);

  // ────── actions ──────
  const startCreate = async () => {
    setBusy(true);
    setErr(null);
    try {
      const d = await api.getSeedPhrase();
      setDraftSeed({
        address: d.address,
        seed: d.seed_phrase ?? ((d as Record<string, unknown>).seed as string),
      });
      setScreen("create-reveal");
    } catch (e) {
      setErr(
        e instanceof Error && e.message.includes("timed out")
          ? "Request timed out"
          : "⚠ Cannot connect to HashLatch node",
      );
    } finally {
      setBusy(false);
    }
  };

  const confirmPassword = async () => {
    setErr(null);
    if (pw.length < 8) {
      setErr("Password must be at least 8 characters");
      return;
    }
    if (pw !== pw2) {
      setErr("Passwords do not match");
      return;
    }
    if (!draftSeed) return;
    const passwordHash = await sha256Hex(pw);
    const w: StoredWallet = {
      address: draftSeed.address,
      seed: draftSeed.seed,
      passwordHash,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(w));
    setStored(w);
    setDraftSeed(null);
    setPw("");
    setPw2("");
    setScreen("dashboard");
  };

  const tryLogin = async () => {
    setErr(null);
    if (!stored && loginMode === "password") {
      setErr("No wallet on this device. Login with seed phrase instead.");
      return;
    }
    if (loginMode === "password") {
      const h = await sha256Hex(loginPw);
      if (h !== stored!.passwordHash) {
        setErr("Invalid password");
        return;
      }
      setLoginPw("");
      setScreen("dashboard");
    } else {
      const normalized = loginSeedTxt.trim().toLowerCase().split(/\s+/).join(" ");
      const words = normalized.split(" ").filter(Boolean);
      if (words.length !== 12) {
        setErr("Seed phrase must be exactly 12 words");
        return;
      }
      const w = loadWallet();
      if (!w || w.seed.trim().toLowerCase() !== normalized) {
        setErr("Seed does not match the wallet stored on this device");
        return;
      }
      setStored(w);
      setLoginSeedTxt("");
      setScreen("dashboard");
    }
  };

  const lock = () => {
    setBalance("—");
    setTxs(null);
    setScreen("locked");
  };

  const logout = () => {
    localStorage.removeItem(LS_KEY);
    setStored(null);
    setLoginPw("");
    setLoginSeedTxt("");
    setScreen("landing");
  };

  // ═══════════ LANDING ═══════════
  if (screen === "landing") {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="glass rounded-2xl p-10 text-center">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            $ hashlatch-cli wallet
          </div>
          <h2 className="mb-8 text-2xl font-bold">HashLatch Wallet</h2>
          <button
            onClick={startCreate}
            disabled={busy}
            className="mx-auto inline-flex items-center gap-2 rounded-md border-2 border-primary bg-background px-10 py-4 font-mono text-base font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_55%,transparent)] disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Generating…
              </>
            ) : (
              "Create New Wallet"
            )}
          </button>
          <div className="mt-6">
            <button
              onClick={() => {
                setErr(null);
                setScreen("login");
              }}
              className="rounded-md border border-border px-6 py-2 font-mono text-sm text-muted-foreground hover:border-primary/60 hover:text-primary"
            >
              Login
            </button>
          </div>
          {err && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
              {err}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════ CREATE — REVEAL SEED ═══════════
  if (screen === "create-reveal" && draftSeed) {
    const words = draftSeed.seed.trim().split(/\s+/);
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="glass rounded-2xl border-primary/40 p-6">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-primary">
            wallet · address
          </div>
          <div className="flex items-start justify-between gap-3">
            <code className="break-all font-mono text-xs text-foreground/90 md:text-sm">
              {draftSeed.address}
            </code>
            <CopyBtn value={draftSeed.address} />
          </div>
        </div>

        <div className="glass rounded-2xl border-primary/40 p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              seed phrase · 12 words
            </div>
            <CopyBtn value={draftSeed.seed} label="Copy to Clipboard" />
          </div>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
            {words.map((w, i) => (
              <div
                key={i}
                className="rounded-md border border-border bg-background/60 px-3 py-2 font-mono text-sm"
              >
                <span className="mr-2 text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {w}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-primary/40 bg-primary/5 p-3 font-mono text-xs text-primary">
            ⚠ Save these words in a safe place. You will lose access to your wallet without them.
          </div>
        </div>

        <button
          onClick={() => {
            setErr(null);
            setScreen("create-password");
          }}
          className="w-full rounded-md bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground hover:shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
        >
          I've Saved My Seed Phrase → Set Password
        </button>
      </div>
    );
  }

  // ═══════════ CREATE — PASSWORD ═══════════
  if (screen === "create-password") {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="glass rounded-2xl p-8">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            $ hashlatch-cli wallet --set-password
          </div>
          <h2 className="mb-5 text-xl font-bold">Set Wallet Password</h2>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password (min. 8 characters)"
            className="mb-3 w-full rounded-md border border-border bg-background/60 p-3 font-mono text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="Confirm password"
            className="w-full rounded-md border border-border bg-background/60 p-3 font-mono text-sm outline-none focus:border-primary"
          />
          <button
            onClick={confirmPassword}
            className="mt-4 w-full rounded-md bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground hover:shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
          >
            Create Wallet
          </button>
          {err && (
            <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
              {err}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════ LOGIN / LOCKED ═══════════
  if (screen === "login" || screen === "locked") {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="glass rounded-2xl p-8">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            $ hashlatch-cli wallet --unlock
          </div>
          <h2 className="mb-4 text-xl font-bold">
            {screen === "locked" ? "Wallet Locked" : "Login"}
          </h2>

          <div className="mb-4 inline-flex rounded-md border border-border p-1 font-mono text-[11px]">
            <button
              onClick={() => {
                setErr(null);
                setLoginMode("password");
              }}
              className={`rounded px-3 py-1 ${
                loginMode === "password"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Login with Password
            </button>
            <button
              onClick={() => {
                setErr(null);
                setLoginMode("seed");
              }}
              className={`rounded px-3 py-1 ${
                loginMode === "seed"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Login with Seed
            </button>
          </div>

          {loginMode === "password" ? (
            <input
              type="password"
              value={loginPw}
              onChange={(e) => setLoginPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tryLogin()}
              placeholder="Password"
              className="w-full rounded-md border border-border bg-background/60 p-3 font-mono text-sm outline-none focus:border-primary"
            />
          ) : (
            <textarea
              value={loginSeedTxt}
              onChange={(e) => setLoginSeedTxt(e.target.value)}
              placeholder="word1 word2 word3 ... word12"
              rows={3}
              className="w-full rounded-md border border-border bg-background/60 p-3 font-mono text-sm outline-none focus:border-primary"
            />
          )}

          <button
            onClick={tryLogin}
            className="mt-3 w-full rounded-md bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground hover:shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
          >
            Unlock
          </button>
          {err && (
            <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
              {err}
            </div>
          )}

          {screen === "login" && (
            <button
              onClick={() => {
                setErr(null);
                setScreen("landing");
              }}
              className="mt-4 w-full font-mono text-[11px] text-muted-foreground underline hover:text-primary"
            >
              ← Back
            </button>
          )}
          {screen === "locked" && (
            <button
              onClick={logout}
              className="mt-4 w-full font-mono text-[11px] text-muted-foreground underline hover:text-destructive"
            >
              Forget this wallet (clear local storage)
            </button>
          )}
        </div>
      </div>
    );
  }

  // ═══════════ DASHBOARD ═══════════
  if (screen === "dashboard" && stored) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="glass rounded-2xl p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">HashLatch Wallet</h2>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Connected
            </div>
          </div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-primary">
            address
          </div>
          <div className="flex items-start justify-between gap-3">
            <code className="break-all font-mono text-xs text-foreground/90 md:text-sm">
              {stored.address}
            </code>
            <CopyBtn value={stored.address} />
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              balance · auto-refresh 30s
            </div>
            <button
              onClick={() => fetchBalance(stored.address)}
              disabled={balLoading}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground hover:text-primary"
            >
              <RefreshCw size={12} className={balLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
          {balLoading && balance === "—" ? (
            <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> loading…
            </div>
          ) : balErr ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
              ⚠ Cannot connect to HashLatch node
              <button
                onClick={() => fetchBalance(stored.address)}
                className="ml-2 underline"
              >
                retry
              </button>
            </div>
          ) : (
            <div className="text-glow font-mono text-3xl font-bold text-primary md:text-4xl">
              {balance} <span className="text-base">HLC</span>
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setSendOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/60 px-4 py-3 font-mono text-sm text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Send size={14} /> Send HLC
          </button>
          <button
            onClick={() => setBountyOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/60 px-4 py-3 font-mono text-sm text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Plus size={14} /> Create Bounty
          </button>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-primary">
            recent transactions
          </div>
          {txs === null ? (
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" /> loading…
            </div>
          ) : txs.length === 0 ? (
            <div className="font-mono text-xs text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {txs.map((t, i) => (
                <li
                  key={(t.txid as string) ?? i}
                  className="flex items-center justify-between gap-3 py-2 font-mono text-xs"
                >
                  <code className="truncate text-muted-foreground">
                    {(t.txid as string) ?? "—"}
                  </code>
                  <span className="text-primary">{String(t.amount ?? "")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={lock}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-primary/50 px-4 py-3 font-mono text-sm text-primary hover:bg-primary/10"
          >
            <Lock size={14} /> Lock Wallet
          </button>
          <button
            onClick={logout}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-destructive/50 px-4 py-3 font-mono text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut size={14} /> Logout (clear data)
          </button>
        </div>

        {sendOpen && (
          <SendModal
            from={stored.address}
            seed={stored.seed}
            onClose={() => setSendOpen(false)}
            onDone={() => {
              setSendOpen(false);
              fetchBalance(stored.address);
              fetchTxs(stored.address);
            }}
          />
        )}
        {bountyOpen && (
          <BountyModal
            from={stored.address}
            seed={stored.seed}
            onClose={() => setBountyOpen(false)}
            onDone={() => {
              setBountyOpen(false);
              fetchBalance(stored.address);
            }}
          />
        )}
      </div>
    );
  }

  return null;
}

// ─────────── Modals ───────────

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
      <div className="glass w-full max-w-md rounded-2xl border-primary/40 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SendModal({
  from,
  seed,
  onClose,
  onDone,
}: {
  from: string;
  seed: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submit = async () => {
    setErr(null);
    const n = Number(amount);
    if (!to.trim() || !Number.isFinite(n) || n <= 0) {
      setErr("Provide a valid recipient and amount");
      return;
    }
    setBusy(true);
    try {
      await api.send({ from, to: to.trim(), amount: n, seed });
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Send failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <ModalShell title="Send HLC" onClose={onClose}>
      <input
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Recipient address"
        className="mb-3 w-full rounded-md border border-border bg-background/60 p-3 font-mono text-xs outline-none focus:border-primary"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (HLC)"
        inputMode="decimal"
        className="w-full rounded-md border border-border bg-background/60 p-3 font-mono text-xs outline-none focus:border-primary"
      />
      {err && (
        <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-2 font-mono text-[11px] text-destructive">
          {err}
        </div>
      )}
      <button
        onClick={submit}
        disabled={busy}
        className="mt-4 w-full rounded-md bg-primary px-4 py-3 font-mono text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {busy ? "Broadcasting…" : "Send"}
      </button>
    </ModalShell>
  );
}

function BountyModal({
  from,
  seed,
  onClose,
  onDone,
}: {
  from: string;
  seed: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [targetHash, setTargetHash] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submit = async () => {
    setErr(null);
    const a = Number(amount);
    const d = Number(deadline);
    if (!targetHash.trim() || !Number.isFinite(a) || a <= 0 || !Number.isFinite(d)) {
      setErr("Provide target hash, amount and deadline (blocks/unix)");
      return;
    }
    setBusy(true);
    try {
      await api.createBounty({
        from,
        seed,
        target_hash: targetHash.trim(),
        amount: a,
        deadline: d,
      });
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bounty creation failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <ModalShell title="Create Bounty" onClose={onClose}>
      <input
        value={targetHash}
        onChange={(e) => setTargetHash(e.target.value)}
        placeholder="target_hash (SHA-256 hex)"
        className="mb-3 w-full rounded-md border border-border bg-background/60 p-3 font-mono text-xs outline-none focus:border-primary"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (HLC)"
        inputMode="decimal"
        className="mb-3 w-full rounded-md border border-border bg-background/60 p-3 font-mono text-xs outline-none focus:border-primary"
      />
      <input
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        placeholder="Deadline (block height or unix ts)"
        inputMode="numeric"
        className="w-full rounded-md border border-border bg-background/60 p-3 font-mono text-xs outline-none focus:border-primary"
      />
      {err && (
        <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-2 font-mono text-[11px] text-destructive">
          {err}
        </div>
      )}
      <button
        onClick={submit}
        disabled={busy}
        className="mt-4 w-full rounded-md bg-primary px-4 py-3 font-mono text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {busy ? "Broadcasting…" : "Create Bounty"}
      </button>
    </ModalShell>
  );
}
