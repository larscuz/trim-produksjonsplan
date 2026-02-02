"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { PlanPdf } from "@/components/PlanPdf";
import type { PlanDoc } from "@/lib/types";
import { makeDefaultPlan } from "@/lib/defaults";
import { loadPlan } from "@/lib/storage";

/**
 * PDFDownloadLink må lastes kun i browser.
 * Dette unngår Next.js runtime-feil i SSR/Vercel.
 */
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
);

export default function PreviewPage() {
  const [plan, setPlan] = useState<PlanDoc>(() =>
    makeDefaultPlan("2026-06-01")
  );

  useEffect(() => {
    const p = loadPlan();
    if (p) setPlan(p);
  }, []);

  const filename = useMemo(() => {
    const base = (plan.customer.name || "kunde").replace(/\s+/g, "_");
    const proj = (plan.customer.projectName || "prosjekt").replace(
      /\s+/g,
      "_"
    );

    return `TRiM_Produksjonsplan_${base}_${proj}.pdf`.slice(0, 120);
  }, [plan.customer.name, plan.customer.projectName]);

  return (
    <div className="grid gap-4">
      {/* HEADER */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Forhåndsvisning</h1>

            <p className="muted mt-1">
              Last ned PDF og legg ved i fagprøve-dokumentasjon. Husk å fylle ut
              ukeplanen i detalje.
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="pill">
                Kunde: {plan.customer.name || "—"}
              </span>
              <span className="pill">
                Prosjekt: {plan.customer.projectName || "—"}
              </span>
              <span className="pill">
                Deadline: {plan.customer.deadline || "—"}
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-2">
            <a className="btn btn-ghost" href="/">
              ← Tilbake til redigering
            </a>

            <PDFDownloadLink
              document={<PlanPdf plan={plan} />}
              fileName={filename}
              className="btn btn-primary"
            >
              {({ loading }) => (
                <span suppressHydrationWarning>
                  {loading ? "Bygger PDF…" : "Last ned PDF"}
                </span>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="card">
        <h2 className="card-title">Hva PDF-en inneholder</h2>

        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Brief: kundens ønsker, mål, målgruppe og kanaler</li>
          <li>Konsept og strategi: hook, struktur, stil, referanser</li>
          <li>Logistikk: locations, avklaringer, medvirkende, tillatelser</li>
          <li>Utstyr og tekniske sjekker</li>
          <li>Intervjuguide, kameravinkler og full B-roll-liste</li>
          <li>
            Ukeplan frem til deadline (inkl. Freepik bilde/video, shoot-dager og
            risiko)
          </li>
        </ul>
      </div>

      {/* TIPS */}
      <div className="card">
        <h2 className="card-title">Tips før levering</h2>

        <div className="mt-2 grid gap-2 text-sm">
          <div>
            • Skriv alltid “Ikke oppgitt” bevisst hvis noe mangler – ikke la felt
            være tomme.
          </div>
          <div>
            • Noter hva som er KI-generert og hva som er filmet (sporbarhet).
          </div>
          <div>• Legg inn minst én konkret leveranse per uke.</div>
        </div>
      </div>
    </div>
  );
}
