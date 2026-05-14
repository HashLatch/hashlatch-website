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
}: {
  eyebrow?: string;
  title: string;
}) => (
  <div className="reveal mb-12 text-center md:mb-16">
    {eyebrow && (
      <div className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </div>
    )}
    <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
  </div>
);

export function Hero() {
  const { hero } = siteConfig;
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            L1 Blockchain · Testnet incoming
          </div>
          <h1 className="text-glow mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-primary md:text-7xl lg:text-8xl">
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
        <div className="grid gap-6 md:grid-cols-3">
          {about.features.map((f) => (
            <div
              key={f.title}
              className="reveal glass group rounded-2xl p-8 transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-3xl">
                {f.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
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
        <SectionHeading eyebrow="Live Network" title={stats.heading} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.items.map((s) => (
            <div
              key={s.label}
              className="reveal glass rounded-2xl p-6 text-center"
            >
              <div className="text-2xl font-bold text-primary md:text-3xl">
                {s.value}
              </div>
              <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div className="reveal mt-6 text-center text-xs text-muted-foreground">
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
                <div className="mb-4 text-xs font-mono text-primary">
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
      </Container>
    </section>
  );
}

export function Tokenomics() {
  const { tokenomics } = siteConfig;
  return (
    <section id="wallet" className="py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="Economics" title={tokenomics.heading} />
        <div className="reveal mx-auto max-w-3xl">
          <div className="glass overflow-hidden rounded-2xl">
            {tokenomics.rows.map(([k, v], i) => (
              <div
                key={k}
                className={`flex items-center justify-between px-6 py-4 ${
                  i !== 0 ? "border-t border-border/30" : ""
                }`}
              >
                <span className="text-sm text-muted-foreground">{k}</span>
                <span className="font-mono text-sm font-semibold text-foreground">
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
                      <ul
                        className={`space-y-1.5 text-sm text-muted-foreground ${
                          left ? "md:list-inside" : ""
                        }`}
                      >
                        {p.items.map((it) => (
                          <li key={it} className="flex items-start gap-2">
                            {left ? (
                              <span className="md:order-2 md:ml-2 mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary md:ml-auto" />
                            ) : (
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                            )}
                            <span className="flex-1">{it}</span>
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
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <span className="grid h-7 w-7 place-items-center rounded-md border border-primary/40 text-primary">
                ◈
              </span>
              <span className="font-bold">{brand.name}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {footer.copyright}
            </p>
            <p className="mt-1 font-mono text-xs text-primary">
              {footer.motto}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {footer.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
