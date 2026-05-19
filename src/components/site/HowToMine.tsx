import { Copy, Check, Wallet, Download, Cpu } from "lucide-react";
import { useState } from "react";
import { STRATUM_HOST, STRATUM_PORT } from "@/config/api";

const MINER_CMD = `miner.exe --algo kawpow --server ${STRATUM_HOST} --port ${STRATUM_PORT} --user YOUR_ADDRESS.rig1 --pass x`;

function Copyable({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-md border border-primary/30 bg-black/70 p-4 pr-12 font-mono text-[11px] leading-relaxed text-primary md:text-xs">
        <code>{text}</code>
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        }}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-border bg-background/80 px-2 py-1 font-mono text-[10px] text-muted-foreground hover:text-primary"
      >
        {ok ? <Check size={12} /> : <Copy size={12} />}
        {ok ? "copied" : "copy"}
      </button>
    </div>
  );
}

export function HowToMine() {
  const steps = [
    {
      icon: Wallet,
      title: "Get a Wallet",
      body: (
        <>
          Generate a HashLatch address in seconds. You'll need it as your miner
          username.
          <div className="mt-4">
            <a
              href="/wallet"
              className="inline-flex items-center gap-2 rounded-md border border-primary px-4 py-2 font-mono text-xs text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Open Wallet →
            </a>
          </div>
        </>
      ),
    },
    {
      icon: Download,
      title: "Download Miner",
      body: (
        <>
          Use any KawPow miner. We recommend:
          <ul className="mt-3 space-y-1 font-mono text-xs">
            <li>
              <a
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
                href="https://github.com/develsoftware/GMinerRelease/releases"
              >
                ↗ GMiner (NVIDIA/AMD)
              </a>
            </li>
            <li>
              <a
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
                href="https://github.com/trexminer/T-Rex/releases"
              >
                ↗ T-Rex (NVIDIA)
              </a>
            </li>
          </ul>
        </>
      ),
    },
    {
      icon: Cpu,
      title: "Connect & Mine",
      body: (
        <>
          Point your miner at the HashLatch stratum and replace{" "}
          <code className="font-mono text-primary">YOUR_ADDRESS</code> with the
          address from step 1.
        </>
      ),
    },
  ];

  return (
    <section id="how-to-mine" className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <div className="reveal mb-12 text-center md:mb-16">
          <div className="mb-3 inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            ⛏ GPU Mining
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Start Mining HashLatch
          </h2>
          <p className="mt-3 font-mono text-sm text-muted-foreground">
            Connect your GPU and earn HLC today
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="reveal glass rounded-2xl p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
                    <Icon size={18} />
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
                    Step 0{i + 1}
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </div>
              </div>
            );
          })}
        </div>

        <div className="reveal mt-10 rounded-2xl border border-primary/30 bg-black/40 p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-primary">
            $ stratum connection
          </div>
          <Copyable text={MINER_CMD} />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://github.com/HashLatch/PoWH/raw/master/miners"
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-primary px-4 py-3 font-mono text-xs text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Download size={14} /> Download Windows .bat
            </a>
            <a
              href="https://github.com/HashLatch/PoWH/raw/master/miners"
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-primary px-4 py-3 font-mono text-xs text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Download size={14} /> Download Linux .sh
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

