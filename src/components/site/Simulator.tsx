import { useEffect, useState } from "react";
import { Lock, Sparkles, RotateCcw } from "lucide-react";
import { sha256Hex } from "@/lib/hashlatch-api";

function randomHex(len: number): string {
  const arr = new Uint8Array(len / 2);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function Simulator() {
  const [step, setStep] = useState(1);

  // step 1
  const [secret, setSecret] = useState("");
  const [target, setTarget] = useState("");

  // step 2
  const [nonce, setNonce] = useState("");
  const [minerAddr, setMinerAddr] = useState("");
  const [commit, setCommit] = useState("");
  const [commitProgress, setCommitProgress] = useState(0);

  // step 3
  const [blocksLeft, setBlocksLeft] = useState(6);

  const reset = () => {
    setStep(1);
    setSecret("");
    setTarget("");
    setNonce("");
    setMinerAddr("");
    setCommit("");
    setCommitProgress(0);
    setBlocksLeft(6);
  };

  // live compute target hash as user types
  useEffect(() => {
    if (!secret) {
      setTarget("");
      return;
    }
    let cancelled = false;
    sha256Hex(secret).then((h) => {
      if (!cancelled) setTarget(h);
    });
    return () => {
      cancelled = true;
    };
  }, [secret]);

  // step 2: generate commit and animate broadcast
  useEffect(() => {
    if (step !== 2) return;
    const n = randomHex(16);
    const addr = "H" + randomHex(32);
    setNonce(n);
    setMinerAddr(addr);
    setCommit("");
    setCommitProgress(0);
    sha256Hex(secret + n + addr).then((h) => setCommit(h));

    let p = 0;
    const id = setInterval(() => {
      p += 10;
      setCommitProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => setStep(3), 600);
      }
    }, 180);
    return () => clearInterval(id);
  }, [step, secret]);

  // step 3: countdown blocks
  useEffect(() => {
    if (step !== 3) return;
    setBlocksLeft(6);
    let n = 6;
    const id = setInterval(() => {
      n -= 1;
      setBlocksLeft(n);
      if (n <= 0) {
        clearInterval(id);
        setTimeout(() => setStep(4), 500);
      }
    }, 700);
    return () => clearInterval(id);
  }, [step]);

  const stepMeta = [
    { n: 1, title: "Create Bounty" },
    { n: 2, title: "Commit Solution" },
    { n: 3, title: "Wait 6 Blocks" },
    { n: 4, title: "Reveal & Earn" },
  ];

  return (
    <div className="space-y-6">
      {/* progress nav */}
      <div className="grid grid-cols-4 gap-2">
        {stepMeta.map((s) => (
          <div
            key={s.n}
            className={`glass rounded-xl p-3 text-center transition-all ${
              step === s.n
                ? "border-primary/60 shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                : step > s.n
                  ? "border-emerald-400/40 opacity-90"
                  : "opacity-50"
            }`}
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              {step > s.n ? "✓" : `STEP ${String(s.n).padStart(2, "0")}`}
            </div>
            <div className="mt-1 text-xs font-semibold md:text-sm">
              {s.title}
            </div>
          </div>
        ))}
      </div>

      {/* main panel */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="mb-4 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            commit-reveal sim · step {String(step).padStart(2, "0")}
          </span>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div key="s1" className="animate-fade-in-up space-y-5">
            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-primary">
                $ enter a secret password
              </label>
              <input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="hunter2"
                className="w-full rounded-md border border-border bg-background/60 px-4 py-3 font-mono text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="rounded-md border border-border bg-background/40 p-4 font-mono text-xs">
              <div className="mb-1 text-muted-foreground">
                Target Hash · SHA256(secret)
              </div>
              <div className="break-all text-primary">
                {target || "—"}
              </div>
            </div>
            <button
              onClick={() => secret && setStep(2)}
              disabled={!secret}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-mono text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              <Lock size={16} className="animate-pulse" /> Lock Bounty
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div key="s2" className="animate-fade-in-up space-y-4 font-mono text-xs">
            <div className="text-muted-foreground">
              $ commit = sha256(solution || miner_addr || nonce)
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-primary">nonce</span> ={" "}
                <span className="text-foreground/80">{nonce}</span>
              </div>
              <div className="break-all">
                <span className="text-primary">miner</span> ={" "}
                <span className="text-foreground/80">{minerAddr}</span>
              </div>
              <div className="break-all">
                <span className="text-primary">commit</span> ={" "}
                <span className="text-emerald-300">{commit || "computing…"}</span>
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/40 p-4">
              <div className="mb-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>broadcasting OP_RETURN</span>
                <span>{commitProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border/60">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${commitProgress}%` }}
                />
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                {commitProgress < 100
                  ? "commit pending in mempool…"
                  : "✓ commit confirmed in mempool"}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div key="s3" className="animate-fade-in-up text-center">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Anti front-running delay
            </div>
            <div
              key={blocksLeft}
              className="my-6 animate-fade-in-up text-[88px] font-bold leading-none text-primary text-glow md:text-[120px]"
            >
              {blocksLeft}
            </div>
            <div className="font-mono text-sm text-foreground/80">
              {blocksLeft > 0
                ? `⛏ mining block ${7 - blocksLeft} of 6…`
                : "✓ commit fully confirmed"}
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-8 rounded-full ${
                    i < 6 - blocksLeft ? "bg-primary" : "bg-border/60"
                  }`}
                />
              ))}
            </div>
            <div className="mt-3 font-mono text-[10px] text-muted-foreground">
              Protecting against front-running…
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div
            key="s4"
            className="animate-fade-in-up rounded-xl border border-emerald-400/40 bg-emerald-400/5 p-6 text-center shadow-[0_0_60px_rgba(74,222,128,0.25)]"
          >
            <Sparkles
              size={42}
              className="mx-auto mb-3 text-emerald-300"
              aria-hidden
            />
            <div className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">
              $ hashlatch-cli reveal --solution
            </div>
            <h3 className="mt-2 text-2xl font-bold text-emerald-200 md:text-3xl">
              Bounty Solved!
            </h3>
            <div className="mt-4 rounded-md border border-border bg-background/40 p-4 font-mono text-xs">
              <div className="text-muted-foreground">solution revealed</div>
              <div className="mt-1 break-all text-emerald-300">{secret}</div>
              <div className="mt-3 text-muted-foreground">
                verify: SHA256(s) ==
              </div>
              <div className="break-all text-primary">{target}</div>
            </div>
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 rounded-md border border-primary/60 px-5 py-2.5 font-mono text-sm text-primary hover:bg-primary/10"
            >
              <RotateCcw size={14} /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
