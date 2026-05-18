import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled ? "glass-strong" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-md border border-primary/40 font-mono text-[11px] font-bold leading-none text-primary"
            title="HashLatch"
          >
            0x
          </span>
          <span className="font-mono text-lg font-bold tracking-[0.18em] text-foreground">
            {siteConfig.brand.name}
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.links.map((l) => {
            const external = /^https?:\/\//.test(l.href);
            return (
              <a
                key={l.href}
                href={l.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={siteConfig.nav.cta.href}
            className="hidden rounded-md border border-primary/60 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_45%,transparent)] md:inline-flex"
          >
            {siteConfig.nav.cta.label}
          </a>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border border-border md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-5 py-4">
            {siteConfig.nav.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <a
              href={siteConfig.nav.cta.href}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md border border-primary/60 px-3 py-2 text-center text-sm font-medium text-primary"
            >
              {siteConfig.nav.cta.label}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
