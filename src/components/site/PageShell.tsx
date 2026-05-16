import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Sections";
import { useReveal } from "@/hooks/use-reveal";

export function PageShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  useReveal();
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hex-grid-bg" />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto w-full max-w-[1100px] px-5 pb-12 pt-32 md:px-8 md:pt-40">
          {title && (
            <header className="mb-12 text-center">
              {eyebrow && (
                <div className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary">
                  {eyebrow}
                </div>
              )}
              <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
                  {subtitle}
                </p>
              )}
            </header>
          )}
          {children}
        </div>
        <Footer />
      </div>
    </main>
  );
}
