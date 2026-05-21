import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Circle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ParticleBackground } from "@/components/ParticleBackground";

const Container = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`mx-auto w-full max-w-[1200px] px-5 md:px-8 ${className}`}>
    {children}
  </div>
);

const SectionHeading = ({
  eyebrow,
  title,
  livePulse = false,
}: {
  eyebrow?: string;
  title: string;
  livePulse?: boolean;
}) => (
  <div className="reveal mb-12 text-center md:mb-16">
    {eyebrow && (
      <div className="mb-3 inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
        {livePulse && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
        )}
        {eyebrow}
      </div>
    )}
    <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
  </div>
);

function TerminalAnimation({ lines }: { lines: string[] }) {
  const [shown, setShown] = useState<string[]>([]);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    let cancelled = false;
    let i = 0;
    let buf = "";
    let t: ReturnType<typeof setTimeout>;

    const typeNext = () => {
      if (cancelled) return;
      if (i >= lines.length) {
        t = setTimeout(() => {
          if (cancelled) return;
          setShown([]);
          setTyping("");
          buf = "";
          i = 0;
          typeNext();
        }, 2400);
        return;
      }
      const line = lines[i];
      if (buf.length < line.length) {
        buf = line.slice(0, buf.length + 1);
        setTyping(buf);
        t = setTimeout(typeNext, 22);
      } else {
        setShown((s) => [...s, line]);
        setTyping("");
        buf = "";
        i += 1;
        t = setTimeout(typeNext, 360);
      }
    };
    t = setTimeout(typeNext, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [lines]);

  return (
    <div className="glass mx-auto mt-12 max-w-2xl rounded-xl p-4 text-left font-mono text-xs md:text-sm">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          hashlatch@cipherspace
        </span>
      </div>
      <div className="min-h-[160px] space-y-1 text-primary/90">
        {shown.map((l, idx) => (
          <div key={idx} className="whitespace-pre-wrap break-all">
            {l}
          </div>
        ))}
        {typing && (
          <div className="whitespace-pre-wrap break-all">
            {typing}
            <span className="ml-0.5 inline-block h-3 w-1.5 -translate-y-px animate-pulse bg-primary align-middle" />
          </div>
        )}
      </div>
    </div>
  );
}

export function Hero() {
  const { hero, brand } = siteConfig;
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden pt-16"
    >
      <ParticleBackground />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_8%,transparent)_0%,transparent_60%)]"
      />
      <Container className="relative z-10 py-20 text-center">
        <div className="animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 font-mono text-xs text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            {brand.fullName} ({brand.ticker}) · {brand.tagline}
          </div>
          <h1 className="text-glow mx-auto max-w-5xl text-4xl font-extrabold tracking-tight text-primary md:text-7xl lg:text-8xl">
            {hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {hero.subtitle}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={hero.primaryCta.href}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
            >
              {hero.primaryCta.label} <ArrowRight size={16} />
            </a>
            <a
              href={hero.secondaryCta.href}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/50 px-7 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              {hero.secondaryCta.label}
            </a>
          </div>
          <TerminalAnimation lines={hero.terminalLines} />
        </div>
      </Container>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  );
}

export function About() {
  const { about } = siteConfig;
  return (
    <section id="about" className="py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="The Protocol" title={about.heading} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {about.features.map((f) => (
            <div
              key={f.title}
              className="reveal glass group rounded-2xl p-7 transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-3xl">
                {f.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Stats() {
  const { stats } = siteConfig;
  return (
    <section id="mining" className="py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="Live Network" title={stats.heading} livePulse />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {stats.items.map((s) => (
            <div
              key={s.label}
              className="reveal glass rounded-2xl p-6 text-center"
            >
              <div className="font-mono text-2xl font-bold text-primary md:text-3xl text-glow">
                {s.value}
              </div>
              <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div className="reveal mt-6 text-center font-mono text-xs text-muted-foreground">
          {stats.note}
        </div>
      </Container>
    </section>
  );
}

export function Bounty() {
  const { bounty } = siteConfig;
  return (
    <section id="bounty" className="py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="Mechanism" title={bounty.heading} />
        <div className="grid gap-6 md:grid-cols-4">
          {bounty.steps.map((step, i) => (
            <div key={step.n} className="reveal relative">
              <div className="glass h-full rounded-2xl p-6">
                <div className="mb-4 font-mono text-xs text-primary">
                  STEP {step.n}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {i < bounty.steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 z-10 -translate-y-1/2 text-primary/60">
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="reveal mt-8 text-center font-mono text-xs text-muted-foreground">
          ⏱ {bounty.note}
        </div>
      </Container>
    </section>
  );
}

export function Tokenomics() {
  const { tokenomics } = siteConfig;
  return (
    <section id="tokenomics" className="py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="Economics" title={tokenomics.heading} />
        <div className="reveal mx-auto max-w-3xl">
          <div className="glass overflow-hidden rounded-2xl">
            {tokenomics.rows.map(([k, v], i) => (
              <div
                key={k}
                className={`flex items-center justify-between gap-4 px-6 py-4 ${
                  i !== 0 ? "border-t border-border/30" : ""
                }`}
              >
                <span className="text-sm text-muted-foreground">{k}</span>
                <span className="font-mono text-sm font-semibold text-foreground text-right">
                  {v}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              ✦ {tokenomics.badge}
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}

function StatusBadge({
  status,
  tone,
}: {
  status: string;
  tone: "done" | "active" | "planned";
}) {
  const styles =
    tone === "done"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : tone === "active"
        ? "border-primary/50 bg-primary/10 text-primary"
        : "border-border bg-muted/50 text-muted-foreground";
  const Icon =
    tone === "done" ? CheckCircle2 : tone === "active" ? Loader2 : Circle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${styles}`}
    >
      <Icon size={12} className={tone === "active" ? "animate-spin" : ""} />
      {status}
    </span>
  );
}

export function Roadmap() {
  const { roadmap } = siteConfig;
  return (
    <section id="roadmap" className="py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="Path Forward" title={roadmap.heading} />
        <div className="relative mx-auto max-w-4xl">
          <div
            aria-hidden
            className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent md:left-1/2"
          />
          <div className="space-y-10">
            {roadmap.phases.map((p, i) => {
              const left = i % 2 === 0;
              return (
                <div
                  key={p.phase}
                  className={`reveal relative flex flex-col gap-4 md:flex-row md:items-center ${
                    left ? "" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="absolute left-4 top-3 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background md:left-1/2" />
                  <div className="md:w-1/2 md:px-8">
                    <div
                      className={`glass rounded-2xl p-6 ml-10 md:ml-0 ${
                        left ? "md:text-right" : ""
                      }`}
                    >
                      <div
                        className={`mb-2 flex items-center gap-3 ${
                          left ? "md:justify-end" : ""
                        }`}
                      >
                        <span className="font-mono text-xs text-primary">
                          {p.phase}
                        </span>
                        <StatusBadge status={p.status} tone={p.statusTone} />
                      </div>
                      <h3 className="mb-3 text-lg font-semibold">{p.title}</h3>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {p.items.map((it) => (
                          <li key={it} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                            <span className="flex-1 text-left">{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Why() {
  const { why } = siteConfig;
  return (
    <section id="why" className="py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="The Edge" title={why.heading} />
        <div className="grid gap-6 md:grid-cols-3">
          {why.items.map((w) => (
            <div
              key={w.title}
              className="reveal glass rounded-2xl p-8 text-center transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-3xl">
                {w.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{w.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {w.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function WalletTeaser() {
  const { wallet } = siteConfig;
  return (
    <section id="wallet" className="py-24 md:py-32">
      <Container>
        <div className="reveal glass relative mx-auto max-w-4xl overflow-hidden rounded-3xl p-10 text-center md:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_15%,transparent)_0%,transparent_60%)]"
          />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
              ◇ Coming Soon
            </div>
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
              {wallet.heading}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground md:text-base">
              {wallet.description}
            </p>
            <a
              href={wallet.cta.href}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
            >
              {wallet.cta.label} <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Community() {
  const { community } = siteConfig;
  return (
    <section id="community" className="py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="Get Involved" title={community.heading} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {community.items.map((c) => (
            <a
              key={c.name}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="reveal glass group flex flex-col items-start gap-6 rounded-2xl p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
            >
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-3xl">
                {c.icon}
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="text-lg font-semibold">{c.name}</span>
                <span className="inline-flex items-center gap-1 text-sm text-primary transition-transform group-hover:translate-x-1">
                  Join <ArrowRight size={14} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Footer() {
  const { footer, brand } = siteConfig;
  return (
    <footer className="border-t border-border/30 py-12">
      <Container>
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <span className="grid h-7 w-7 place-items-center rounded-md border border-primary/40 font-mono text-xs text-primary">
                0x
              </span>
              <span className="font-mono font-bold tracking-widest">
                {brand.name}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {footer.copyright}
            </p>
            <p className="mt-1 font-mono text-xs text-primary">
              {footer.motto}
            </p>
          </div>
          <div className="flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end">
            <a href="https://discord.gg/patdHzX6V" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-primary">Discord</a>
            <a href="https://x.com/HashLatch" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-primary">Twitter/X</a>
            <a href="https://github.com/HashLatch" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-primary">GitHub</a>
            <a href="mailto:contact@hashlatch.online" className="text-sm text-muted-foreground transition-colors hover:text-primary">Email</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
