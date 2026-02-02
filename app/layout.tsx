import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRiM – Produksjonsplan (mal)",
  description: "Planleggingsmal for video + KI (Freepik) frem til 1. juni.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>
        <div className="min-h-dvh bg-zinc-950 text-zinc-100">
          <header className="sticky top-0 z-10 border-b border-zinc-800/70 bg-zinc-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700/60" />
                <div className="leading-tight">
                  <div className="text-sm font-semibold">TRiM Produksjonsplan</div>
                  <div className="text-xs text-zinc-400">Video + KI (Freepik) • Mal for fagprøve</div>
                </div>
              </div>
              <nav className="flex items-center gap-2 text-sm">
                <a className="btn btn-ghost" href="/">Plan</a>
                <a className="btn btn-ghost" href="/preview">Forhåndsvisning</a>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

          <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-xs text-zinc-500">
            <div className="border-t border-zinc-800/70 pt-4">
              Lagring skjer lokalt i nettleseren (LocalStorage). Eksporter gjerne JSON eller PDF.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
