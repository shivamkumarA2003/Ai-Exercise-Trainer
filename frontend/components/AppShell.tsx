import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  ["Dashboard", "/dashboard"],
  ["Trainer", "/camera"],
  ["History", "/history"],
  ["Settings", "/settings"],
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="font-semibold tracking-tight text-ink">
            AI Exercise Trainer
          </Link>
          <div className="flex gap-2 text-sm">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-ink">
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
