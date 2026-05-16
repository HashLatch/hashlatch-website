import { useState } from "react";

const steps = [
  {
    n: "01",
    title: "Create Bounty",
    cmd: "$ hashlatch-cli createbounty --target=<sha256> --amount=100",
    desc: "User locks HLC in a P2SH escrow with target hash and timelock.",
  },
  {
    n: "02",
    title: "Commit Solution",
    cmd: "$ commit = sha256(solution || miner_addr || nonce)",
    desc: "Miner broadcasts a commit hash via OP_RETURN. Solution stays hidden.",
  },
  {
    n: "03",
    title: "Wait 6 Blocks",
    cmd: "$ awaiting confirmations [#####.] 5/6",
    desc: "Anti-frontrun delay. After 6 confirmations the commit is locked in.",
  },
  {
    n: "04",
    title: "Reveal & Earn",
    cmd: "$ hashlatch-cli reveal --commit=<id> --solution=<preimage>",
    desc: "Miner publishes the preimage. Nodes verify SHA256(s) == target → HLC released.",
  },
];

export function Simulator() {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((s, i) => (
          <button
            key={s.n}
            onClick={() => setActive(i)}
            className={`glass rounded-xl p-4 text-left transition-all ${
              i === active
                ? "border-primary/60 shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              STEP {s.n}
            </div>
            <div className="mt-1 text-sm font-semibold">{s.title}</div>
          </button>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            commit-reveal sim · step {steps[active].n}
          </span>
        </div>
        <div
          key={active}
          className="animate-fade-in-up font-mono text-sm text-primary"
        >
          <div className="break-all">{steps[active].cmd}</div>
          <div className="mt-3 text-foreground/80">{steps[active].desc}</div>
          <div className="mt-1 inline-block h-3 w-1.5 animate-pulse bg-primary align-middle" />
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <button
            onClick={() => setActive((i) => Math.max(0, i - 1))}
            disabled={active === 0}
            className="rounded-md border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            onClick={() => setActive((i) => Math.min(steps.length - 1, i + 1))}
            disabled={active === steps.length - 1}
            className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
