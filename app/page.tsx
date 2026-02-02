// app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Section } from "@/components/Section";
import type { PlanDoc, WeekEntry, VideoPlan, GraphicPlan, ShootDay, PublishingPlan } from "@/lib/types";
import { makeDefaultPlan } from "@/lib/defaults";
import { downloadJson, importJsonFile, loadPlan, savePlan } from "@/lib/storage";

function nowISO() {
  return new Date().toISOString();
}

function uid() {
  return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
}

function s(x: any) {
  return typeof x === "string" ? x : "";
}

function defaultPublishing(): PublishingPlan {
  return {
    overallPlan: "",
    platforms: "Instagram Reels, TikTok, YouTube Shorts, nettside",
    cadence: "",
    approvals: "",
    roles: "",
    metrics: "",
    notes: "",
  };
}

function normalizePublishing(p: any): PublishingPlan {
  // Sikrer at UI alltid kan lese publishing.* uten crash
  const base = defaultPublishing();
  return {
    overallPlan: s(p?.overallPlan) || base.overallPlan,
    platforms: s(p?.platforms) || base.platforms,
    cadence: s(p?.cadence) || base.cadence,
    approvals: s(p?.approvals) || base.approvals,
    roles: s(p?.roles) || base.roles,
    metrics: s(p?.metrics) || base.metrics,
    notes: s(p?.notes) || base.notes,
  };
}

/**
 * Viktig: gammel localStorage / gamle JSON kan mangle nye felter.
 * Denne normaliserer til nyeste schema uten å miste eksisterende innhold.
 */
function normalizePlan(input: any): PlanDoc {
  const deadline = input?.customer?.deadline || "";
  const base = makeDefaultPlan(deadline);

  if (!input || typeof input !== "object") return base;

  // Forsøk å beholde mest mulig av input, men sikre at kritiske strukturer finnes
  const merged: PlanDoc = {
    ...base,
    ...input,

    meta: { ...base.meta, ...(input.meta || {}) },
    customer: { ...base.customer, ...(input.customer || {}) },
    strategy: { ...base.strategy, ...(input.strategy || {}) },
    logistics: { ...base.logistics, ...(input.logistics || {}) },
    equipment: {
      ...base.equipment,
      ...(input.equipment || {}),
      available: { ...base.equipment.available, ...(input.equipment?.available || {}) },
    },
    documentation: { ...base.documentation, ...(input.documentation || {}) },

    productions: {
      ...base.productions,
      ...(input.productions || {}),
      videos: Array.isArray(input?.productions?.videos) ? input.productions.videos : base.productions.videos,
      graphics: Array.isArray(input?.productions?.graphics) ? input.productions.graphics : base.productions.graphics,
    },

    weeks: Array.isArray(input?.weeks) ? input.weeks : base.weeks,
  };

  // Sikre minimum 1 av hver
  if (!Array.isArray(merged.productions.videos) || merged.productions.videos.length === 0) {
    merged.productions.videos = base.productions.videos;
  }
  if (!Array.isArray(merged.productions.graphics) || merged.productions.graphics.length === 0) {
    merged.productions.graphics = base.productions.graphics;
  }
  if (!Array.isArray(merged.weeks) || merged.weeks.length === 0) {
    merged.weeks = base.weeks;
  }

  // MIGRERING: hvis gammel schema har plan.publishing (helhet), bruk den som fallback inn i produksjoner
  const legacyPublishing = input?.publishing ? normalizePublishing(input.publishing) : null;

  merged.productions.videos = (merged.productions.videos || []).map((v: any) => {
    const vPub = v?.publishing ? normalizePublishing(v.publishing) : legacyPublishing || defaultPublishing();
    return { ...v, publishing: vPub };
  });

  merged.productions.graphics = (merged.productions.graphics || []).map((g: any) => {
    const gPub = g?.publishing ? normalizePublishing(g.publishing) : legacyPublishing || defaultPublishing();
    return { ...g, publishing: gPub };
  });

  return merged;
}

function nextMondayISO() {
  const d = new Date();
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diffToMon = (day === 0 ? 1 : 8 - day) % 7; // days until next Monday (0 if Monday)
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const yyyy = mon.getFullYear();
  const mm = String(mon.getMonth() + 1).padStart(2, "0");
  const dd = String(mon.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function emptyShootDay(): ShootDay {
  return { date: "", location: "", callTime: "", notes: "" };
}

function makeEmptyWeek(): WeekEntry {
  const weekStart = nextMondayISO();
  return {
    id: uid(),
    weekStart,
    weekLabel: "Ny uke (sett uke-label)",
    focus: "",
    deliverables: "",
    customerAndApprovals: "",
    productionWork: "",
    freepikImageWork: "",
    freepikVideoWork: "",
    shootDays: [],
    risks: "",
    linkedProductionIds: [],
  };
}

function makeEmptyVideo(): VideoPlan {
  return {
    id: uid(),
    title: "Ny video (skriv tittel)",
    goal: "",
    deliverables: "",
    formats: "9:16 + 16:9",
    concept: "",
    hookIdeas: "",
    structure: "Hook → presentasjon → hovedinnhold → b-roll → outro/logo → CTA",
    toneAndStyle: "",
    locations: "",
    shootDays: [],
    interviewGuide: "",
    questions: "",
    cameraSetup: "",
    brollList: "",
    freepikImagePlan: "",
    freepikVideoPlan: "",
    notes: "",
    publishing: defaultPublishing(),
    status: "planned",
  };
}

function makeEmptyGraphic(): GraphicPlan {
  return {
    id: uid(),
    title: "Ny grafikk (skriv tittel)",
    goal: "",
    deliverables: "",
    formats: "1080x1920",
    styleGuide: "",
    assetsNeeded: "",
    freepikImagePlan: "",
    freepikVideoPlan: "",
    notes: "",
    publishing: defaultPublishing(),
    status: "planned",
  };
}

export default function Page() {
  const [plan, setPlan] = useState<PlanDoc>(() => normalizePlan(makeDefaultPlan("")));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const p = loadPlan();
    if (p) setPlan(normalizePlan(p));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    savePlan(plan);
  }, [plan, loaded]);

  const lastUpdated = useMemo(() => {
    const d = new Date(plan.meta.updatedAt);
    return d.toISOString().slice(0, 16).replace("T", " ");
  }, [plan.meta.updatedAt]);

  function patch(fn: (p: PlanDoc) => PlanDoc) {
    setPlan((prev) => {
      const next = normalizePlan(fn(prev));
      next.meta.updatedAt = nowISO();
      return { ...next };
    });
  }

  // --- helpers for arrays ---
  function updateVideo(id: string, fn: (v: VideoPlan) => VideoPlan) {
    patch((p) => ({
      ...p,
      productions: {
        ...p.productions,
        videos: (p.productions?.videos || []).map((v) => (v.id === id ? normalizePlan({ ...p, productions: { ...p.productions, videos: [fn(v)] } }).productions.videos[0] : v)),
      },
    }));
  }

  function updateGraphic(id: string, fn: (g: GraphicPlan) => GraphicPlan) {
    patch((p) => ({
      ...p,
      productions: {
        ...p.productions,
        graphics: (p.productions?.graphics || []).map((g) => (g.id === id ? normalizePlan({ ...p, productions: { ...p.productions, graphics: [fn(g)] } }).productions.graphics[0] : g)),
      },
    }));
  }

  function updateWeek(id: string, fn: (w: WeekEntry) => WeekEntry) {
    patch((p) => ({
      ...p,
      weeks: (p.weeks || []).map((w) => (w.id === id ? fn(w) : w)),
    }));
  }

  const allProductionsForLinking = useMemo(() => {
    const vids = (plan.productions?.videos || []).map((v) => ({
      id: v.id,
      label: `🎬 Video: ${v.title || "Uten tittel"}`,
    }));
    const gfx = (plan.productions?.graphics || []).map((g) => ({
      id: g.id,
      label: `🖼️ Grafikk: ${g.title || "Uten tittel"}`,
    }));
    return [...vids, ...gfx];
  }, [plan.productions?.videos, plan.productions?.graphics]);

  return (
    <div className="grid gap-4">
      {/* HEADER */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">TRiM Produksjonsplan</h1>
            <p className="muted mt-1">
              Mal for fagprøve: tydelig kundeplan (helhet) + produksjoner (video/grafikk) + ukelog.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="pill">Deadline: {plan.customer.deadline || "—"}</span>
              <span className="pill">Sist lagret: {lastUpdated}</span>
              <span className="pill">Lagring: lokalt i nettleser</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost" type="button" onClick={() => downloadJson(plan)}>
              Eksporter JSON
            </button>

            <label className="btn btn-ghost cursor-pointer">
              Importer JSON
              <input
                className="hidden"
                type="file"
                accept="application/json"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const imported = await importJsonFile(f);
                  setPlan(normalizePlan(imported));
                  e.currentTarget.value = "";
                }}
              />
            </label>

            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                if (!confirm("Nullstill og start på nytt? (Dette sletter lokal lagring)")) return;
                const next = normalizePlan(makeDefaultPlan(plan.customer.deadline || "2026-06-01"));
                setPlan(next);
              }}
            >
              Nullstill
            </button>

            <a className="btn btn-primary" href="/preview">
              Forhåndsvisning + PDF
            </a>
          </div>
        </div>
      </div>

      {/* A/B/C layout */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT (A + B + C) */}
        <div className="grid gap-4 lg:col-span-2">
          {/* =======================
              A) KUNDEPLAN (HELHET)
          ======================= */}
          <Section
            title="A) Kundeplan – helhet (brief + strategi)"
            description="Dette er oppdraget som helhet: hva kunden vil, og hvordan dere løser det."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="label mb-1">Kunde (navn)</div>
                <input
                  className="input"
                  value={plan.customer.name}
                  onChange={(e) => patch((p) => ({ ...p, customer: { ...p.customer, name: e.target.value } }))}
                  placeholder="Skriv inn kunden"
                />
              </div>

              <div>
                <div className="label mb-1">Kontaktperson</div>
                <input
                  className="input"
                  value={plan.customer.contact}
                  onChange={(e) => patch((p) => ({ ...p, customer: { ...p.customer, contact: e.target.value } }))}
                  placeholder="Navn, e-post/telefon"
                />
              </div>

              <div>
                <div className="label mb-1">Prosjektnavn</div>
                <input
                  className="input"
                  value={plan.customer.projectName}
                  onChange={(e) => patch((p) => ({ ...p, customer: { ...p.customer, projectName: e.target.value } }))}
                  placeholder=""
                />
              </div>

              <div>
                <div className="label mb-1">Deadline</div>
                <input
                  className="input"
                  value={plan.customer.deadline}
                  onChange={(e) => patch((p) => ({ ...p, customer: { ...p.customer, deadline: e.target.value } }))}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            <div className="grid gap-3 mt-4">
              <div>
                <div className="label mb-1">Kundens ønsker (brief)</div>
                <textarea
                  className="textarea"
                  value={plan.customer.brief}
                  onChange={(e) => patch((p) => ({ ...p, customer: { ...p.customer, brief: e.target.value } }))}
                  placeholder="Hva vil kunden oppnå? Hva skal leveres? Format, tone/stil, krav/begrensninger…"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="label mb-1">Suksesskriterier</div>
                  <textarea
                    className="textarea"
                    value={plan.customer.successCriteria}
                    onChange={(e) =>
                      patch((p) => ({ ...p, customer: { ...p.customer, successCriteria: e.target.value } }))
                    }
                    placeholder="KPIer, forventninger, godkjenning…"
                  />
                </div>
                <div>
                  <div className="label mb-1">Målgruppe</div>
                  <textarea
                    className="textarea"
                    value={plan.customer.targetAudience}
                    onChange={(e) =>
                      patch((p) => ({ ...p, customer: { ...p.customer, targetAudience: e.target.value } }))
                    }
                    placeholder="Hvem er dette for?"
                  />
                </div>
              </div>

              <div>
                <div className="label mb-1">Kanaler / flater</div>
                <input
                  className="input"
                  value={plan.customer.channels}
                  onChange={(e) => patch((p) => ({ ...p, customer: { ...p.customer, channels: e.target.value } }))}
                  placeholder="Instagram Reels, TikTok, YouTube Shorts, nettside"
                />
              </div>
            </div>

            <div className="grid gap-3 mt-6">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="label mb-1">Konsept (helhet)</div>
                  <textarea
                    className="textarea"
                    value={plan.strategy.concept}
                    onChange={(e) => patch((p) => ({ ...p, strategy: { ...p.strategy, concept: e.target.value } }))}
                  />
                </div>
                <div>
                  <div className="label mb-1">Kjernebudskap</div>
                  <textarea
                    className="textarea"
                    value={plan.strategy.keyMessage}
                    onChange={(e) => patch((p) => ({ ...p, strategy: { ...p.strategy, keyMessage: e.target.value } }))}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="label mb-1">Tone og visuell stil</div>
                  <textarea
                    className="textarea"
                    value={plan.strategy.toneAndStyle}
                    onChange={(e) =>
                      patch((p) => ({ ...p, strategy: { ...p.strategy, toneAndStyle: e.target.value } }))
                    }
                  />
                </div>
                <div>
                  <div className="label mb-1">Hook-idéer (helhet)</div>
                  <textarea
                    className="textarea"
                    value={plan.strategy.hookIdeas}
                    onChange={(e) => patch((p) => ({ ...p, strategy: { ...p.strategy, hookIdeas: e.target.value } }))}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="label mb-1">Struktur (helhet)</div>
                  <textarea
                    className="textarea"
                    value={plan.strategy.structure}
                    onChange={(e) =>
                      patch((p) => ({ ...p, strategy: { ...p.strategy, structure: e.target.value } }))
                    }
                  />
                </div>
                <div>
                  <div className="label mb-1">Referanser (lenker)</div>
                  <textarea
                    className="textarea"
                    value={plan.strategy.references}
                    onChange={(e) =>
                      patch((p) => ({ ...p, strategy: { ...p.strategy, references: e.target.value } }))
                    }
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* =======================
              B) PRODUKSJONER
          ======================= */}
          <Section
            title="B) Produksjoner – video og grafikk"
            description="Her lager dere konkrete planer per leveranse. Hver produksjon har sin egen publiseringsplan."
          >
            <div className="grid gap-4">
              {/* VIDEOS */}
              <div className="card" style={{ background: "var(--panel-2)" }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="card-title">🎬 Video-planer</div>
                    <div className="muted">Én plan per video. Legg til flere ved behov.</div>
                  </div>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() =>
                      patch((p) => ({
                        ...p,
                        productions: { ...p.productions, videos: [...p.productions.videos, makeEmptyVideo()] },
                      }))
                    }
                  >
                    + Legg til video
                  </button>
                </div>

                <div className="grid gap-3 mt-3">
                  {plan.productions.videos.map((v, i) => (
                    <div className="card" key={v.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="card-title">Video {i + 1}</div>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => {
                            if (!confirm("Slette denne videoplanen?")) return;
                            patch((p) => ({
                              ...p,
                              productions: {
                                ...p.productions,
                                videos: p.productions.videos.filter((x) => x.id !== v.id),
                              },
                              weeks: p.weeks.map((w) => ({
                                ...w,
                                linkedProductionIds: (w.linkedProductionIds || []).filter((id) => id !== v.id),
                              })),
                            }));
                          }}
                        >
                          Slett
                        </button>
                      </div>

                      <div className="grid gap-3 mt-3 md:grid-cols-2">
                        <div>
                          <div className="label mb-1">Tittel</div>
                          <input
                            className="input"
                            value={v.title}
                            onChange={(e) => updateVideo(v.id, (x) => ({ ...x, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="label mb-1">Status</div>
                          <select
                            className="input"
                            value={v.status}
                            onChange={(e) => updateVideo(v.id, (x) => ({ ...x, status: e.target.value as any }))}
                          >
                            <option value="idea">idea</option>
                            <option value="planned">planned</option>
                            <option value="in_progress">in_progress</option>
                            <option value="review">review</option>
                            <option value="approved">approved</option>
                            <option value="published">published</option>
                            <option value="done">done</option>
                          </select>
                        </div>
                      </div>

                      {/* … resten av UI er identisk med det du har (inkl publishing-feltene) … */}
                      {/* Jeg lar det stå som “identisk” her for å ikke lage en vegg på 2000+ linjer i chat */}
                      {/* MEN: i ditt prosjekt skal du beholde alt under her uendret. */}
                      {/* Det viktige i denne filen er normalizePlan() + normalizePublishing() over, som stopper krasjet. */}
                    </div>
                  ))}
                </div>
              </div>

              {/* GRAPHICS */}
              <div className="card" style={{ background: "var(--panel-2)" }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="card-title">🖼️ Grafisk arbeid</div>
                    <div className="muted">Én plan per grafisk leveranse. Legg til flere ved behov.</div>
                  </div>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() =>
                      patch((p) => ({
                        ...p,
                        productions: { ...p.productions, graphics: [...p.productions.graphics, makeEmptyGraphic()] },
                      }))
                    }
                  >
                    + Legg til grafikk
                  </button>
                </div>

                {/* … resten av grafikk-UI er identisk med det du allerede har … */}
              </div>
            </div>
          </Section>

          {/* =======================
              C) UKELOGG
          ======================= */}
          <Section
            title="C) Ukelogg – fylles uke for uke"
            description="Ikke generert frem til juni. Kandidaten legger til uke når de jobber, og kobler uka til produksjoner."
          >
            {/* … identisk med din eksisterende ukelog-del … */}
          </Section>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="grid gap-4">
          {/* … identisk med din eksisterende sidebar … */}
        </div>
      </div>

      <div className="card">
        <div className="muted">
          Tips: Bruk ukeloggen som “produksjonslogikk”. Hver uke skal ha konkrete leveranser, selv om de er små:
          promptbibliotek, moodboard, godkjenning, shotlist, første klipp, første eksport, osv.
        </div>
      </div>
    </div>
  );
}
