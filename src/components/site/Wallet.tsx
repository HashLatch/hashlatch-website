import { useCallback, useEffect, useState } from "react";
import { Copy, Check, Loader2, Lock, LogOut, RefreshCw } from "lucide-react";
import { api } from "@/lib/hashlatch-api";

type WalletData = { address: string; seed: string };
const LS_KEY = "hashlatch_wallet";

function loadWallet(): WalletData | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as WalletData) : null;
  } catch {
    return null;
  }
}

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground hover:border-primary/60 hover:text-primary"
      aria-label="Copy"
    >
      {done ? <Check size={12} /> : <Copy size={12} />}
      {done ? "copied" : "copy"}
    </button>
  );
}

export function Wallet() {
  // screen: "landing" | "create-reveal" | "login-seed" | "dashboard" | "locked"
  const [screen, setScreen] = useState<
    "landing" | "create-reveal" | "login-seed" | "dashboard" | "locked"
  >("landing");
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [seedInput, setSeedInput] = useState("");

  // balance state
  const [balance, setBalance] = useState<string>("—");
  const [balErr, setBalErr] = useState<string | null>(null);
  const [balLoading, setBalLoading] = useState(false);

  useEffect(() => {
    const w = loadWallet();
    if (w) {
      setWallet(w);
      setScreen("locked");
    }
  }, []);

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

  useEffect(() => {
    if (screen !== "dashboard" || !wallet) return;
    fetchBalance(wallet.address);
    const id = setInterval(() => fetchBalance(wallet.address), 30_000);
    return () => clearInterval(id);
  }, [screen, wallet, fetchBalance]);

  const createWallet = async () => {
    setBusy(true);
    setErr(null);
    try {
      const d = await api.getSeedPhrase();
      const w: WalletData = {
        address: d.address,
        seed: d.seed_phrase ?? (d as Record<string, unknown>).seed as string,
      };
      localStorage.setItem(LS_KEY, JSON.stringify(w));
      setWallet(w);
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

  const loginSeed = () => {
    setErr(null);
    const normalized = seedInput.trim().toLowerCase().split(/\s+/).join(" ");
    const words = normalized.split(" ");
    if (words.length !== 12) {
      setErr("Seed phrase must be exactly 12 words");
      return;
    }
    const stored = loadWallet();
    if (!stored || stored.seed.trim().toLowerCase() !== normalized) {
      setErr("Invalid seed phrase");
      return;
    }
    setWallet(stored);
    setSeedInput("");
    setScreen("dashboard");
  };

  const lock = () => {
    setBalance("—");
    setScreen("locked");
  };

  const logout = () => {
    localStorage.removeItem(LS_KEY);
    setWallet(null);
    setSeedInput("");
    setScreen("landing");
  };

  // ─────────── LANDING ───────────
  if (screen === "landing") {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            $ hashlatch-cli wallet --new
          </div>
          <h2 className="mb-2 text-2xl font-bold">Create a New Wallet</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Generates a fresh address and 12-word seed phrase on the testnet.
          </p>
          <button
            onClick={createWallet}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md border-2 border-primary bg-background px-8 py-3 font-mono text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_45%,transparent)] disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating…
              </>
            ) : (
              "Create New Wallet"
            )}
          </button>
          {err && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
              {err}
              <button
                onClick={createWallet}
                className="ml-2 underline hover:text-destructive-foreground"
              >
                retry
              </button>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setErr(null);
              setScreen("login-seed");
            }}
            className="font-mono text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
          >
            Already have a wallet? →
          </button>
        </div>
      </div>
    );
  }

  // ─────────── CREATE REVEAL ───────────
  if (screen === "create-reveal" && wallet) {
    const words = wallet.seed.trim().split(/\s+/);
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="glass rounded-2xl border-primary/40 p-6">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-primary">
            wallet · address
          </div>
          <div className="flex items-start justify-between gap-3">
            <code className="break-all font-mono text-xs text-foreground/90 md:text-sm">
              {wallet.address}
            </code>
            <CopyBtn value={wallet.address} />
          </div>
        </div>

        <div className="glass rounded-2xl border-primary/40 p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              wallet · seed phrase (12 words)
            </div>
            <CopyBtn value={wallet.seed} />
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
            ⚠ Save this seed phrase. It cannot be recovered.
          </div>
        </div>

        <button
          onClick={() => setScreen("dashboard")}
          className="w-full rounded-md bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground hover:shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
        >
          I've Saved My Seed Phrase →
        </button>
      </div>
    );
  }

  // ─────────── LOGIN (seed) ───────────
  if (screen === "login-seed" || screen === "locked") {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="glass rounded-2xl p-8">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            $ hashlatch-cli wallet --restore
          </div>
          <h2 className="mb-4 text-xl font-bold">
            {screen === "locked" ? "Wallet Locked" : "Login with Seed Phrase"}
          </h2>
          <textarea
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            placeholder="word1 word2 word3 ... word12"
            rows={3}
            className="w-full rounded-md border border-border bg-background/60 p-3 font-mono text-sm outline-none focus:border-primary"
          />
          <button
            onClick={loginSeed}
            className="mt-3 w-full rounded-md bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground hover:shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
          >
            Login
          </button>
          {err && (
            <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
              {err}
            </div>
          )}
          <button
            onClick={logout}
            className="mt-4 w-full font-mono text-[11px] text-muted-foreground underline hover:text-destructive"
          >
            Forget this wallet (clear local storage)
          </button>
        </div>

        {screen !== "locked" && (
          <div className="text-center">
            <button
              onClick={() => {
                setErr(null);
                setScreen("landing");
              }}
              className="font-mono text-xs text-muted-foreground underline hover:text-primary"
            >
              ← Back to create wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─────────── DASHBOARD ───────────
  if (screen === "dashboard" && wallet) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="glass rounded-2xl p-6">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-primary">
            address
          </div>
          <div className="flex items-start justify-between gap-3">
            <code className="break-all font-mono text-xs text-foreground/90 md:text-sm">
              {wallet.address}
            </code>
            <CopyBtn value={wallet.address} />
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              balance · auto-refresh 30s
            </div>
            <button
              onClick={() => fetchBalance(wallet.address)}
              disabled={balLoading}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground hover:text-primary"
            >
              <RefreshCw size={12} className={balLoading ? "animate-spin" : ""} />
              refresh
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
                onClick={() => fetchBalance(wallet.address)}
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
      </div>
    );
  }

  return null;
}
