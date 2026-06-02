import { useState, useEffect, useRef } from "react";

type Page = "bounties" | "wallet" | "history" | "settings";

const BOUNTIES = [
  { type: "ZIP password", icon: "🗜️", reward: 10, hash: "cafdd066ac3799f1411b36335d8ee8dfddb08e090a28d329688d0f924f350203", days: 8, password: "Summer2019!" },
  { type: "Bitcoin seed phrase", icon: "₿", reward: 50, hash: "ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae", days: 12, password: "abandon board cake..." },
  { type: "Email password", icon: "✉️", reward: 5, hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", days: 3, password: "password" },
];

export function SolverPreview() {
  const [page, setPage] = useState<Page>("bounties");
  const [solving, setSolving] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [found, setFound] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [balance, setBalance] = useState(797.36);
  const [logLines, setLogLines] = useState<{ text: string; type: string }[]>([]);
  const [stats, setStats] = useState({ speed: "0 MH/s", tried: "0", eta: "—" });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLines]);

  function startSolving(idx: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setSolving(idx);
    setProgress(0);
    setFound(null);
    setClaimed(false);
    setLogLines([{ text: "Initializing GPU...", type: "info" }]);

    const steps = [
      { at: 600, text: "Loading wordlist (rockyou.txt)...", type: "" },
      { at: 1200, text: "GPU ready — 2.4 GH/s", type: "info" },
      { at: 1800, text: "Trying passwords...", type: "" },
      { at: 2600, text: "Progress: 1.2M checked", type: "" },
      { at: 3400, text: "Progress: 3.8M checked", type: "" },
      { at: 4200, text: "Match found!", type: "success" },
    ];
    const start = Date.now();
    const addedSteps = new Set<number>();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, elapsed / 45);
      setProgress(pct);
      const tried = Math.floor(pct * 140000);
      setStats({
        speed: "2.4 MH/s",
        tried: tried.toLocaleString(),
        eta: pct < 100 ? Math.ceil((100 - pct) / 2.2) + "s" : "0s",
      });
      steps.forEach((s) => {
        if (elapsed >= s.at && !addedSteps.has(s.at)) {
          addedSteps.add(s.at);
          setLogLines((prev) => [...prev, { text: `[${new Date().toLocaleTimeString()}] ${s.text}`, type: s.type }]);
        }
      });
      if (elapsed >= 4200) {
        clearInterval(timerRef.current!);
        setFound(BOUNTIES[idx].password);
      }
    }, 50);
  }

  function claim() {
    setClaimed(true);
    setBalance((b) => +(b + (BOUNTIES[solving!]?.reward ?? 0)).toFixed(2));
  }

  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: "bounties", label: "Browse bounties", icon: "☰" },
    { id: "wallet", label: "My wallet", icon: "◈" },
    { id: "history", label: "History", icon: "◷" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <span className="flex-1 text-center font-mono text-xs text-muted-foreground">HashLatch Solver</span>
      </div>

      <div className="flex min-h-[520px]">
        {/* Sidebar */}
        <div className="flex w-44 flex-col gap-1 border-r border-border p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                page === item.id
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {page === "bounties" && (
            <div>
              {/* Wallet bar */}
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="flex-1 font-mono text-[11px] text-muted-foreground">ckzN9xYZnC...6PQCkA</span>
                <span className="text-xs font-medium">{balance.toFixed(2)} HLC</span>
              </div>

              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Active bounties</p>

              {BOUNTIES.map((b, i) => (
                <div key={i} className={`mb-2 rounded-xl border p-3 transition-colors ${solving === i ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <span>{b.icon}</span> {b.type}
                    </span>
                    <span className="text-sm font-semibold text-primary">+{b.reward} HLC</span>
                  </div>
                  <div className="mb-2 truncate rounded bg-muted/50 px-2 py-1 font-mono text-[10px] text-muted-foreground">{b.hash}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">⏱ {b.days} days left</span>
                    <button
                      onClick={() => startSolving(i)}
                      className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[11px] font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                    >
                      ▶ Start solving
                    </button>
                  </div>
                </div>
              ))}

              {/* Progress */}
              {solving !== null && (
                <div className="mt-4 rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Cracking {BOUNTIES[solving].type}...</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${found ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-400"}`}>
                      {found ? "Done" : "Running"}
                    </span>
                  </div>
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress.toFixed(1)}%` }} />
                  </div>
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {[["Speed", stats.speed], ["Tried", stats.tried], ["ETA", stats.eta]].map(([l, v]) => (
                      <div key={l} className="rounded-lg bg-muted/50 p-2">
                        <div className="text-[10px] text-muted-foreground">{l}</div>
                        <div className="font-mono text-xs font-medium">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div ref={logRef} className="h-20 overflow-y-auto rounded-lg bg-black/40 p-2 font-mono text-[10px]">
                    {logLines.map((l, i) => (
                      <div key={i} className={`mb-0.5 ${l.type === "success" ? "text-green-400" : l.type === "info" ? "text-blue-400" : "text-muted-foreground"}`}>
                        {l.text}
                      </div>
                    ))}
                  </div>

                  {found && !claimed && (
                    <div className="mt-3 rounded-xl border border-green-500/30 bg-green-500/10 p-3">
                      <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-green-500">✓ Password found!</p>
                      <div className="mb-3 rounded-lg border border-border bg-background px-3 py-2 text-center font-mono text-base font-semibold">{found}</div>
                      <button onClick={claim} className="w-full rounded-lg border border-green-500/40 bg-green-500/20 py-2 text-xs font-semibold text-green-500 transition-all hover:bg-green-500 hover:text-white">
                        💰 Claim reward automatically
                      </button>
                    </div>
                  )}
                  {claimed && (
                    <div className="mt-3 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-center text-sm font-semibold text-green-500">
                      ✓ +{BOUNTIES[solving].reward} HLC claimed! Check your wallet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {page === "wallet" && (
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Connect wallet</p>
              <p className="mb-4 text-sm text-muted-foreground">Enter your HashLatch seed phrase. Rewards are paid directly to your wallet.</p>
              <textarea
                placeholder="word1 word2 word3 ... word12"
                className="mb-3 w-full resize-none rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                rows={4}
              />
              <button onClick={() => setPage("bounties")} className="w-full rounded-lg border border-primary/40 bg-primary/10 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                Connect wallet
              </button>
            </div>
          )}

          {page === "history" && (
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Solved bounties</p>
              <div className="rounded-xl border border-border p-3 mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">🗜️ ZIP password</span>
                  <span className="text-sm font-semibold text-green-500">+10 HLC</span>
                </div>
                <div className="text-[11px] text-muted-foreground">Solved 2 days ago · txid: 1db42c2d...</div>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-8">More bounties coming soon</p>
            </div>
          )}

          {page === "settings" && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Settings</p>
              {[
                { label: "Wordlist", sub: "rockyou.txt (14M passwords)", btn: "Change" },
                { label: "GPU", sub: "Auto-detect", btn: "Configure" },
                { label: "Auto-claim", sub: "Submit solution automatically when found", btn: null },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground">{s.sub}</div>
                  </div>
                  {s.btn ? (
                    <button className="rounded-md border border-border px-3 py-1 text-xs hover:bg-muted transition-colors">{s.btn}</button>
                  ) : (
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
