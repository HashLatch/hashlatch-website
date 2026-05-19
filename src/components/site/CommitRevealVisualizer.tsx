import { useEffect, useState } from "react";
import { sha256Hex } from "@/lib/hashlatch-api";

const STEPS = [
  {
    label: "01 · INPUT",
    line: "> user solves bounty: solution = \"correct_horse_battery_staple\"",
  },
  {
    label: "02 · HASH",
    line: "> commit = sha256(solution + nonce)  // computed locally in browser",
  },
  {
    label: "03 · BROADCAST",
    line: "> tx → BLOCKCHAIN  ████████████████░░░░  commit accepted",
  },
  {
    label: "04 · REVEAL",
    line: "> +10 blocks → reveal(solution, nonce) → escrow unlocked ✓",
  },
];

export function CommitRevealVisualizer() {
  const [step, setStep] = useState(0);
  const [hash, setHash] = useState("…");

  useEffect(() => {
    sha256Hex("correct_horse_battery_staple" + "42").then((h) =>
      setHash(h.slice(0, 48) + "…"),
    );
  }, []);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto mt-12 max-w-2xl">
      <div className="glass rounded-2xl border-primary/30 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-primary">
            How Commit-Reveal Protects You
          </h3>
          <span className="font-mono text-[10px] text-muted-foreground">
            live · client-side
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {STEPS.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <div
                key={i}
                className={`rounded-md border px-3 py-2 transition-all ${
                  active
                    ? "border-primary/70 bg-primary/10 text-primary shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                    : done
                      ? "border-emerald-400/30 bg-emerald-400/5 text-emerald-300/80"
                      : "border-border bg-background/40 text-muted-foreground"
                }`}
              >
                <div className="text-[10px] uppercase tracking-widest opacity-80">
                  {s.label}
                </div>
                <div className="mt-1 break-all">{s.line}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-md border border-primary/20 bg-black/50 p-3 font-mono text-[11px] text-primary">
          commit hash: <span className="break-all text-foreground/80">{hash}</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The commit hides your answer until it's safely buried under blocks.
          Then the reveal proves you knew it first — no front-running, no
          stolen rewards.
        </p>
      </div>
    </section>
  );
}
