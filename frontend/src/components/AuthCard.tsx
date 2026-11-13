import type { ReactNode } from "react";
import { Logo } from "./Logo";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Shown under the card, e.g. a link to the other auth page. */
  footer: ReactNode;
}

/** Shared layout for the login and register pages. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Logo />
      <section className="mt-8 w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.18)]">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </section>
      <p className="mt-6 text-sm text-muted">{footer}</p>
    </main>
  );
}
