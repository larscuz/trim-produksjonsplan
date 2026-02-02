// components/PlanPdf.tsx
"use client";

import React, { useMemo, useRef } from "react";
import type { PlanDoc, VideoPlan, GraphicPlan, PublishingPlan } from "@/lib/types";

function safeStr(v: any) {
  return typeof v === "string" ? v : "";
}

function linesToBullets(text: string): string[] {
  const t = safeStr(text).trim();
  if (!t) return [];
  return t
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^[-•]\s*/, ""));
}

function bullets(text: string) {
  const items = linesToBullets(text);
  if (!items.length) return <div className="muted">—</div>;
  return (
    <ul className="list">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

function field(label: string, value: string) {
  const v = safeStr(value).trim();
  return (
    <div className="row">
      <div className="label">{label}</div>
      <div className="value">
        {v ? <div className="pre">{v}</div> : <div className="muted">—</div>}
      </div>
    </div>
  );
}

function smallField(label: string, value: string) {
  const v = safeStr(value).trim();
  return (
    <div className="pill">
      <strong>{label}:</strong> {v || "—"}
    </div>
  );
}

function sectionTitle(t: string) {
  return <div className="section-title">{t}</div>;
}

function safePublishing(p: any): PublishingPlan {
  // Defensive for gammel JSON / manglende felt
  return {
    overallPlan: safeStr(p?.overallPlan),
    platforms: safeStr(p?.platforms),
    cadence: safeStr(p?.cadence),
    approvals: safeStr(p?.approvals),
    roles: safeStr(p?.roles),
    metrics: safeStr(p?.metrics),
    notes: safeStr(p?.notes),
  };
}

function publishingBlock(publishing: PublishingPlan, title: string) {
  const pub = safePublishing(publishing);

  return (
    <>
      <div className="divider" />
      <div className="card-subtitle">{title}</div>

      <div className="grid-2">
        {field("Plattformer", pub.platforms)}
        {field("Frekvens (cadence)", pub.cadence)}
      </div>

      <div className="grid-2">
        {field("Godkjenning", pub.approvals)}
        {field("Roller", pub.roles)}
      </div>

      <div className="grid-2">
        {field("Måling / metrics", pub.metrics)}
        {field("Notater", pub.notes)}
      </div>

      {field("Overordnet plan", pub.overallPlan)}
    </>
  );
}

export function PlanPdf({ plan }: { plan: PlanDoc }) {
  // Defensive: aldri anta at productions finnes (ved import/gammel JSON)
  const videos: VideoPlan[] = (plan as any)?.productions?.videos ?? [];
  const graphics: GraphicPlan[] = (plan as any)?.productions?.graphics ?? [];

  // Print/PDF
  const printRef = useRef<HTMLDivElement | null>(null);

  const created = useMemo(() => {
    const v = safeStr(plan?.meta?.createdAt);
    return v ? v.slice(0, 16).replace("T", " ") : "—";
  }, [plan?.meta?.createdAt]);

  const updated = useMemo(() => {
    const v = safeStr(plan?.meta?.updatedAt);
    return v ? v.slice(0, 16).replace("T", " ") : "—";
  }, [plan?.meta?.updatedAt]);

  return (
    <div className="pdf-root">
      <div className="pdf-actions no-print">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            window.print();
          }}
        >
          Last ned PDF (Print)
        </button>
      </div>

      <div ref={printRef} className="pdf">
        {/* HEADER */}
        <div className="pdf-header">
          <div>
            <h1 className="pdf-title">{safeStr(plan?.meta?.title) || "TRiM Produksjonsplan"}</h1>
            <div className="pdf-sub">
              <span>
                <strong>Kandidat:</strong> {safeStr(plan?.meta?.ownerName) || "—"}
              </span>
              <span>
                <strong>Opprettet:</strong> {created}
              </span>
              <span>
                <strong>Sist oppdatert:</strong> {updated}
              </span>
            </div>
          </div>

          <div className="pdf-pills">
            {smallField("Deadline", safeStr(plan?.customer?.deadline))}
            {smallField("Kunde", safeStr(plan?.customer?.name))}
            {smallField("Prosjekt", safeStr(plan?.customer?.projectName))}
          </div>
        </div>

        {/* A) KUNDEPLAN */}
        {sectionTitle("A) Kundeplan – helhet")}
        <div className="card">
          {field("Kunde (navn)", safeStr(plan?.customer?.name))}
          {field("Kontaktperson", safeStr(plan?.customer?.contact))}
          {field("Prosjektnavn", safeStr(plan?.customer?.projectName))}
          {field("Deadline", safeStr(plan?.customer?.deadline))}
          {field("Kanaler / flater", safeStr(plan?.customer?.channels))}
          <div className="divider" />
          {field("Kundens ønsker (brief)", safeStr(plan?.customer?.brief))}
          {field("Suksesskriterier", safeStr(plan?.customer?.successCriteria))}
          {field("Målgruppe", safeStr(plan?.customer?.targetAudience))}
        </div>

        {/* STRATEGI */}
        {sectionTitle("A) Strategi – helhet")}
        <div className="card">
          {field("Konsept", safeStr(plan?.strategy?.concept))}
          {field("Kjernebudskap", safeStr(plan?.strategy?.keyMessage))}
          {field("Tone og visuell stil", safeStr(plan?.strategy?.toneAndStyle))}
          {field("Hook-idéer", safeStr(plan?.strategy?.hookIdeas))}
          {field("Struktur", safeStr(plan?.strategy?.structure))}
          {field("Referanser (lenker)", safeStr(plan?.strategy?.references))}
        </div>

        {/* LOGISTIKK */}
        {sectionTitle("A) Logistikk – helhet")}
        <div className="card">
          {field("Hovedlokasjon", safeStr(plan?.logistics?.mainLocation))}
          {field("Rom/klasserom", safeStr(plan?.logistics?.classroomOrRoom))}
          {field("Kontakter å avklare", safeStr(plan?.logistics?.contactsToClear))}
          {field("Lærere/talent", safeStr(plan?.logistics?.teachersOrTalent))}
          {field("Assistenter", safeStr(plan?.logistics?.assistants))}
          {field("Tillatelser", safeStr(plan?.logistics?.permissions))}
        </div>

        {/* UTSTYR */}
        {sectionTitle("A) Utstyr og teknikk – helhet")}
        <div className="card">
          <div className="grid-2">
            <div className="checkbox">
              <strong>iPhone 17 Pro Max:</strong> {plan?.equipment?.available?.iphone17ProMax ? "Ja" : "Nei"}
            </div>
            <div className="checkbox">
              <strong>DJI mikrofoner:</strong> {plan?.equipment?.available?.djiMics ? "Ja" : "Nei"}
            </div>
            <div className="checkbox">
              <strong>DJI gimbal:</strong> {plan?.equipment?.available?.djiGimbal ? "Ja" : "Nei"}
            </div>
            <div className="checkbox">
              <strong>Mobilt lys:</strong> {plan?.equipment?.available?.mobileLight ? "Ja" : "Nei"}
            </div>
          </div>
          <div className="divider" />
          {field("Ekstra å ta med", safeStr(plan?.equipment?.extraToBring))}
          {field("Tekniske sjekker (preflight)", safeStr(plan?.equipment?.preflightChecks))}
        </div>

        {/* DOKUMENTASJON */}
        {sectionTitle("A) Dokumentasjon og kvalitet – helhet")}
        <div className="card">
          {field("Loggplan", safeStr(plan?.documentation?.logPlan))}
          {field("Filstruktur", safeStr(plan?.documentation?.fileStructure))}
          {field("Navngiving", safeStr(plan?.documentation?.namingConventions))}
          {field("Backup-plan", safeStr(plan?.documentation?.backupPlan))}
        </div>

        {/* B) PRODUKSJONER */}
        {sectionTitle("B) Produksjoner – video")}
        {videos.length === 0 ? (
          <div className="card muted">Ingen videoplaner.</div>
        ) : (
          videos.map((v, idx) => (
            <div key={v.id} className="card">
              <div className="card-h">
                <div className="card-title">
                  🎬 Video {idx + 1}: {safeStr(v.title) || "Uten tittel"}
                </div>
                <div className="muted">Status: {v.status || "—"}</div>
              </div>

              <div className="grid-2">
                {field("Mål", safeStr(v.goal))}
                {field("Leveranser", safeStr(v.deliverables))}
              </div>

              <div className="grid-2">
                {field("Formater", safeStr(v.formats))}
                {field("Locations", safeStr(v.locations))}
              </div>

              {field("Konsept", safeStr(v.concept))}
              <div className="grid-2">
                {field("Hook-idéer", safeStr(v.hookIdeas))}
                {field("Struktur", safeStr(v.structure))}
              </div>
              {field("Tone / visuell stil", safeStr(v.toneAndStyle))}

              {/* Intervju (per video) */}
              <div className="divider" />
              <div className="card-subtitle">Intervju (per video)</div>
              <div className="grid-2">
                <div>
                  <div className="label">Guide</div>
                  {bullets(safeStr(v.interviewGuide))}
                </div>
                <div>
                  <div className="label">Spørsmål</div>
                  {bullets(safeStr(v.questions))}
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <div className="label">Kameraoppsett</div>
                  {bullets(safeStr(v.cameraSetup))}
                </div>
                <div>
                  <div className="label">B-roll-liste</div>
                  {bullets(safeStr(v.brollList))}
                </div>
              </div>

              {/* Shoot days */}
              <div className="divider" />
              <div className="card-subtitle">Shoot-dager (kun denne videoen)</div>
              {Array.isArray(v.shootDays) && v.shootDays.length ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Dato</th>
                      <th>Location</th>
                      <th>Calltime</th>
                      <th>Notat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.shootDays.map((sd, i2) => (
                      <tr key={i2}>
                        <td>{sd?.date || "—"}</td>
                        <td>{sd?.location || "—"}</td>
                        <td>{sd?.callTime || "—"}</td>
                        <td>{sd?.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="muted">—</div>
              )}

              {/* Freepik per video */}
              <div className="divider" />
              <div className="grid-2">
                {field("Freepik – bilde (plan)", safeStr(v.freepikImagePlan))}
                {field("Freepik – video (plan)", safeStr(v.freepikVideoPlan))}
              </div>
              {field("Notater", safeStr(v.notes))}

              {/* ✅ Publiseringsplan UNDER hver video */}
              {publishingBlock((v as any)?.publishing, "Publiseringsplan (for denne videoen)")}
            </div>
          ))
        )}

        {sectionTitle("B) Produksjoner – grafisk arbeid")}
        {graphics.length === 0 ? (
          <div className="card muted">Ingen grafikk-planer.</div>
        ) : (
          graphics.map((g, idx) => (
            <div key={g.id} className="card">
              <div className="card-h">
                <div className="card-title">
                  🖼️ Grafikk {idx + 1}: {safeStr(g.title) || "Uten tittel"}
                </div>
                <div className="muted">Status: {g.status || "—"}</div>
              </div>

              <div className="grid-2">
                {field("Mål", safeStr(g.goal))}
                {field("Leveranser", safeStr(g.deliverables))}
              </div>

              <div className="grid-2">
                {field("Formater", safeStr(g.formats))}
                {field("Assets som trengs", safeStr(g.assetsNeeded))}
              </div>

              {field("Stil / brandguide", safeStr(g.styleGuide))}
              {field("Notater", safeStr(g.notes))}

              <div className="divider" />
              <div className="grid-2">
                {field("Freepik – bilde (plan)", safeStr(g.freepikImagePlan))}
                {field("Freepik – video (plan)", safeStr(g.freepikVideoPlan))}
              </div>

              {/* ✅ Publiseringsplan UNDER hver grafikk */}
              {publishingBlock((g as any)?.publishing, "Publiseringsplan (for dette grafiske arbeidet)")}
            </div>
          ))
        )}

        {/* C) UKELOGG */}
        {sectionTitle("C) Ukelogg")}
        {Array.isArray(plan?.weeks) && plan.weeks.length ? (
          plan.weeks.map((w, idx) => (
            <div key={w.id} className="card">
              <div className="card-h">
                <div className="card-title">
                  Uke {idx + 1}: {safeStr(w.weekLabel) || "—"}
                </div>
                <div className="muted">Uke-start: {safeStr(w.weekStart) || "—"}</div>
              </div>

              <div className="grid-2">
                {field("Fokus", safeStr(w.focus))}
                {field("Leveranser", safeStr(w.deliverables))}
              </div>

              <div className="grid-2">
                {field("Kunde / avklaringer / godkjenning", safeStr(w.customerAndApprovals))}
                {field("Produksjon / redigering / design", safeStr(w.productionWork))}
              </div>

              <div className="grid-2">
                {field("Freepik – bilde (ukearbeid)", safeStr(w.freepikImageWork))}
                {field("Freepik – video (ukearbeid)", safeStr(w.freepikVideoWork))}
              </div>

              <div className="divider" />
              <div className="card-subtitle">Shoot-dager (denne uka)</div>
              {Array.isArray(w.shootDays) && w.shootDays.length ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Dato</th>
                      <th>Location</th>
                      <th>Calltime</th>
                      <th>Notat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {w.shootDays.map((sd, i2) => (
                      <tr key={i2}>
                        <td>{sd?.date || "—"}</td>
                        <td>{sd?.location || "—"}</td>
                        <td>{sd?.callTime || "—"}</td>
                        <td>{sd?.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="muted">—</div>
              )}

              {field("Risiko / tiltak", safeStr(w.risks))}
            </div>
          ))
        ) : (
          <div className="card muted">Ingen uker lagt til.</div>
        )}

        <div className="pdf-footer muted">
          Tips: Loggfør alltid hva som er KI-generert og hva som er filmet/designet. Lagre prompts + resultater.
        </div>
      </div>

      {/* Minimal styling – bruker dine globale klasser, men PDF trenger litt basis */}
      <style jsx>{`
        .pdf-root {
          display: grid;
          gap: 12px;
        }
        .pdf-actions {
          display: flex;
          justify-content: flex-end;
        }
        .pdf {
          background: white;
          color: #111;
          padding: 18px;
          border-radius: 12px;
        }
        .pdf-header {
          display: grid;
          gap: 10px;
          margin-bottom: 14px;
        }
        .pdf-title {
          font-size: 22px;
          line-height: 1.2;
          margin: 0;
        }
        .pdf-sub {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12px;
          margin-top: 6px;
        }
        .pdf-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .section-title {
          margin: 16px 0 8px;
          font-weight: 700;
          font-size: 14px;
        }
        .card {
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 12px;
          margin: 0 0 10px;
        }
        .card-h {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .card-title {
          font-weight: 700;
        }
        .card-subtitle {
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .grid-2 {
          display: grid;
          gap: 10px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 700px) {
          .grid-2 {
            grid-template-columns: 1fr 1fr;
          }
        }
        .row {
          display: grid;
          gap: 6px;
          grid-template-columns: 160px 1fr;
          align-items: start;
          padding: 6px 0;
        }
        .label {
          font-size: 12px;
          font-weight: 700;
        }
        .value {
          font-size: 12px;
        }
        .pre {
          white-space: pre-wrap;
        }
        .muted {
          opacity: 0.7;
          font-size: 12px;
        }
        .divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.08);
          margin: 10px 0;
        }
        .pill {
          display: inline-flex;
          gap: 6px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
        }
        .list {
          margin: 0;
          padding-left: 16px;
          font-size: 12px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .table th,
        .table td {
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 6px 8px;
          text-align: left;
          vertical-align: top;
        }
        .pdf-footer {
          margin-top: 14px;
          font-size: 12px;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .pdf {
            border-radius: 0;
            padding: 0;
          }
          .card {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
