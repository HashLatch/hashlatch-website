import { ArrowRight, CheckCircle2, Loader2, Circle } from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function SpecTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="glass overflow-hidden rounded-xl">
      {rows.map(([k, v], i) => (
        <div
          key={k}
          className={`grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[200px_1fr] sm:gap-6 ${
            i !== 0 ? "border-t border-border/30" : ""
          }`}
        >
          <span className="font-mono text-xs uppercase tracking-wider text-primary">
            {k}
          </span>
          <span className="text-sm text-foreground/90">{v}</span>
        </div>
      ))}
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 mb-5 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
      {children}
    </h2>
  );
}

export function Whitepaper() {
  const { whitepaper } = siteConfig;
  const s = whitepaper.sections;

  return (
    <section className="relative pt-28 pb-24 md:pt-36 md:pb-32">
      <div className="mx-auto w-full max-w-[860px] px-5 md:px-8">
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-primary">
            ◇ Whitepaper · v0.9
          </div>
          <h1 className="text-glow text-4xl font-extrabold tracking-tight text-primary md:text-6xl">
            {whitepaper.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            {whitepaper.subtitle}
          </p>
        </div>

        <article className="glass mt-10 rounded-2xl p-6 md:p-12 leading-relaxed">
          {/* Section 1 */}
          <H2>{s.vision.heading}</H2>
          <p className="text-foreground/85">{s.vision.body}</p>
          <h3 className="mt-8 mb-4 text-lg font-semibold text-primary">
            {s.vision.principlesTitle}
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {s.vision.principles.map((p) => (
              <li
                key={p.title}
                className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4"
              >
                <div className="font-mono text-xs uppercase tracking-wider text-primary">
                  {p.title}
                </div>
                <div className="mt-1.5 text-sm text-muted-foreground">
                  {p.description}
                </div>
              </li>
            ))}
          </ul>

          {/* Section 2 */}
          <H2>{s.architecture.heading}</H2>
          <SpecTable rows={s.architecture.rows} />

          {/* Section 3 */}
          <H2>{s.software.heading}</H2>
          <div className="glass overflow-hidden rounded-xl">
            <div className="hidden grid-cols-[260px_1fr] gap-6 border-b border-border/30 bg-primary/[0.04] px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-primary sm:grid">
              <span>Component</span>
              <span>Description</span>
            </div>
            {s.software.rows.map(([k, v], i) => (
              <div
                key={k}
                className={`grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[260px_1fr] sm:gap-6 ${
                  i !== 0 ? "border-t border-border/30" : ""
                }`}
              >
                <span className="font-mono text-sm font-semibold text-foreground">
                  {k}
                </span>
                <span className="text-sm text-muted-foreground">{v}</span>
              </div>
            ))}
          </div>

          {/* Section 4 */}
          <H2>{s.bounties.heading}</H2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {s.bounties.items.map((b) => (
              <li
                key={b.title}
                className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4"
              >
                <div className="font-semibold text-foreground">{b.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {b.description}
                </div>
              </li>
            ))}
          </ul>

          {/* Section 5 */}
          <H2>{s.tokenomics.heading}</H2>
          <SpecTable rows={s.tokenomics.rows} />

          {/* Section 6 */}
          <H2>{s.roadmap.heading}</H2>
          <ol className="relative space-y-4 border-l border-primary/30 pl-6">
            {s.roadmap.phases.map((p) => {
              const Icon =
                p.tone === "done"
                  ? CheckCircle2
                  : p.tone === "active"
                    ? Loader2
                    : Circle;
              const color =
                p.tone === "done"
                  ? "text-emerald-300 border-emerald-400/40 bg-emerald-400/10"
                  : p.tone === "active"
                    ? "text-primary border-primary/50 bg-primary/10"
                    : "text-muted-foreground border-border bg-muted/40";
              return (
                <li key={p.phase} className="relative">
                  <span className="absolute -left-[33px] top-1 grid h-5 w-5 place-items-center rounded-full border border-primary/40 bg-background font-mono text-[10px] text-primary">
                    {p.mark}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${color}`}
                    >
                      <Icon
                        size={11}
                        className={p.tone === "active" ? "animate-spin" : ""}
                      />
                      {p.phase}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {p.title}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Section 7 */}
          <H2>{s.faq.heading}</H2>
          <Accordion type="single" collapsible className="w-full">
            {s.faq.items.map((it, i) => (
              <AccordionItem
                key={it.q}
                value={`q-${i}`}
                className="border-border/40"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                  <span className="flex items-start gap-3">
                    <span className="font-mono text-xs text-primary mt-1">
                      Q{i + 1}.
                    </span>
                    <span>{it.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-9 text-sm leading-relaxed text-muted-foreground">
                  {it.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Section 8 */}
          <H2>{s.summary.heading}</H2>
          <p className="text-foreground/85">{s.summary.body}</p>
        </article>

        <div className="mt-10 text-center">
          <a
            href={whitepaper.cta.href}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
          >
            {whitepaper.cta.label} <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
