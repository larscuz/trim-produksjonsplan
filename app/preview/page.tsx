// app/preview/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PlanPdf } from "@/components/PlanPdf";
import type { PlanDoc } from "@/lib/types";
import { makeDefaultPlan } from "@/lib/defaults";
import { loadPlan } from "@/lib/storage";

function normalizePlanFallback(input: any): PlanDoc {
  // Hvis localStorage er tom eller har gammel shape, bruk default
  try {
    if (!input || typeof input !== "object") return makeDefaultPlan("2026-06-01");
    // Vi lar app/page.tsx ha “full” normalisering; her trenger vi bare en trygg fallback:
    const deadline = input?.customer?.deadline || "2026-06-01";
    const base = makeDefaultPlan(deadline);
    return { ...base, ...input };
  } catch {
    return makeDefaultPlan("2026-06-01");
  }
}

export default function PreviewPage() {
  const [plan, setPlan] = useState<PlanDoc>(() => makeDefaultPlan("2026-06-01"));

  useEffect(() => {
    const p = loadPlan();
    if (p) setPlan(normalizePlanFallback(p));
  }, []);

  return (
    <div className="grid gap-4">
      <div className="card no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">Forhåndsvisning</div>
            <div className="muted mt-1">
              Bruk nettleserens utskrift for å lagre som PDF.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a className="btn btn-ghost" href="/">
              ← Tilbake til redigering
            </a>

            <button
              className="btn btn-primary"
              type="button"
              onClick={() => window.print()}
            >
              Last ned PDF (Print)
            </button>
          </div>
        </div>
      </div>

      <PlanPdf plan={plan} />
    </div>
  );
}
