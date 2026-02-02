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

  // Sikre minimum 1 av hver (som du ba om)
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
  const legacyPublishing = input?.publishing;

  merged.productions.videos = (merged.productions.videos || []).map((v: any) => ({
    ...v,
    publishing: v?.publishing || legacyPublishing || defaultPublishing(),
  }));

  merged.productions.graphics = (merged.productions.graphics || []).map((g: any) => ({
    ...g,
    publishing: g?.publishing || legacyPublishing || defaultPublishing(),
  }));

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
        videos: (p.productions?.videos || []).map((v) => (v.id === id ? fn(v) : v)),
      },
    }));
  }

  function updateGraphic(id: string, fn: (g: GraphicPlan) => GraphicPlan) {
    patch((p) => ({
      ...p,
      productions: {
        ...p.productions,
        graphics: (p.productions?.graphics || []).map((g) => (g.id === id ? fn(g) : g)),
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

                      <div className="grid gap-3 mt-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <div className="label mb-1">Mål (hva skal videoen oppnå?)</div>
                            <textarea
                              className="textarea"
                              value={v.goal}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, goal: e.target.value }))}
                            />
                          </div>
                          <div>
                            <div className="label mb-1">Leveranser (versjoner, format, teksting, etc.)</div>
                            <textarea
                              className="textarea"
                              value={v.deliverables}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, deliverables: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <div className="label mb-1">Formater</div>
                            <input
                              className="input"
                              value={v.formats}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, formats: e.target.value }))}
                            />
                          </div>
                          <div>
                            <div className="label mb-1">Locations (for denne videoen)</div>
                            <input
                              className="input"
                              value={v.locations}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, locations: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <div className="label mb-1">Konsept</div>
                            <textarea
                              className="textarea"
                              value={v.concept}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, concept: e.target.value }))}
                            />
                          </div>
                          <div>
                            <div className="label mb-1">Tone / visuell stil</div>
                            <textarea
                              className="textarea"
                              value={v.toneAndStyle}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, toneAndStyle: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <div className="label mb-1">Hook-idéer</div>
                            <textarea
                              className="textarea"
                              value={v.hookIdeas}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, hookIdeas: e.target.value }))}
                            />
                          </div>
                          <div>
                            <div className="label mb-1">Struktur</div>
                            <textarea
                              className="textarea"
                              value={v.structure}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, structure: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <div className="label mb-1">Intervjuguide</div>
                            <textarea
                              className="textarea"
                              value={v.interviewGuide}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, interviewGuide: e.target.value }))}
                            />
                          </div>
                          <div>
                            <div className="label mb-1">Spørsmål</div>
                            <textarea
                              className="textarea"
                              value={v.questions}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, questions: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <div className="label mb-1">Kameraoppsett</div>
                            <textarea
                              className="textarea"
                              value={v.cameraSetup}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, cameraSetup: e.target.value }))}
                            />
                          </div>
                          <div>
                            <div className="label mb-1">B-roll-liste</div>
                            <textarea
                              className="textarea"
                              value={v.brollList}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, brollList: e.target.value }))}
                            />
                          </div>
                        </div>

                        {/* Shoot days for this video */}
                        <div className="card" style={{ background: "var(--panel-2)" }}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="card-title">Shoot-dager (kun denne videoen)</div>
                            <button
                              className="btn btn-ghost"
                              type="button"
                              onClick={() =>
                                updateVideo(v.id, (x) => ({ ...x, shootDays: [...x.shootDays, emptyShootDay()] }))
                              }
                            >
                              + Legg til shoot-dag
                            </button>
                          </div>

                          <div className="grid gap-3 mt-3">
                            {v.shootDays.length === 0 ? (
                              <div className="muted">Ingen shoot-dager lagt til ennå.</div>
                            ) : (
                              v.shootDays.map((sd, idx) => (
                                <div key={idx} className="grid gap-2 md:grid-cols-4">
                                  <input
                                    className="input"
                                    placeholder="Dato (YYYY-MM-DD)"
                                    value={sd.date}
                                    onChange={(e) =>
                                      updateVideo(v.id, (x) => {
                                        const arr = [...x.shootDays];
                                        arr[idx] = { ...arr[idx], date: e.target.value };
                                        return { ...x, shootDays: arr };
                                      })
                                    }
                                  />
                                  <input
                                    className="input"
                                    placeholder="Location"
                                    value={sd.location}
                                    onChange={(e) =>
                                      updateVideo(v.id, (x) => {
                                        const arr = [...x.shootDays];
                                        arr[idx] = { ...arr[idx], location: e.target.value };
                                        return { ...x, shootDays: arr };
                                      })
                                    }
                                  />
                                  <input
                                    className="input"
                                    placeholder="Calltime (09:00)"
                                    value={sd.callTime}
                                    onChange={(e) =>
                                      updateVideo(v.id, (x) => {
                                        const arr = [...x.shootDays];
                                        arr[idx] = { ...arr[idx], callTime: e.target.value };
                                        return { ...x, shootDays: arr };
                                      })
                                    }
                                  />
                                  <div className="flex gap-2">
                                    <input
                                      className="input"
                                      placeholder="Notat"
                                      value={sd.notes}
                                      onChange={(e) =>
                                        updateVideo(v.id, (x) => {
                                          const arr = [...x.shootDays];
                                          arr[idx] = { ...arr[idx], notes: e.target.value };
                                          return { ...x, shootDays: arr };
                                        })
                                      }
                                    />
                                    <button
                                      className="btn btn-ghost"
                                      type="button"
                                      onClick={() =>
                                        updateVideo(v.id, (x) => ({
                                          ...x,
                                          shootDays: x.shootDays.filter((_, j) => j !== idx),
                                        }))
                                      }
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <div className="label mb-1">Freepik – bilde (plan)</div>
                            <textarea
                              className="textarea"
                              value={v.freepikImagePlan}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, freepikImagePlan: e.target.value }))}
                            />
                          </div>
                          <div>
                            <div className="label mb-1">Freepik – video (plan)</div>
                            <textarea
                              className="textarea"
                              value={v.freepikVideoPlan}
                              onChange={(e) => updateVideo(v.id, (x) => ({ ...x, freepikVideoPlan: e.target.value }))}
                            />
                          </div>
                        </div>

                        {/* ✅ Publishing per video */}
                        <div className="card" style={{ background: "var(--panel-2)" }}>
                          <div className="card-title">Publiseringsplan (for denne videoen)</div>

                          <div className="grid gap-3 mt-3">
                            <div>
                              <div className="label mb-1">Overordnet plan</div>
                              <textarea
                                className="textarea"
                                value={v.publishing.overallPlan}
                                onChange={(e) =>
                                  updateVideo(v.id, (x) => ({
                                    ...x,
                                    publishing: { ...x.publishing, overallPlan: e.target.value },
                                  }))
                                }
                              />
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <div className="label mb-1">Plattformer</div>
                                <input
                                  className="input"
                                  value={v.publishing.platforms}
                                  onChange={(e) =>
                                    updateVideo(v.id, (x) => ({
                                      ...x,
                                      publishing: { ...x.publishing, platforms: e.target.value },
                                    }))
                                  }
                                />
                              </div>
                              <div>
                                <div className="label mb-1">Frekvens (cadence)</div>
                                <input
                                  className="input"
                                  value={v.publishing.cadence}
                                  onChange={(e) =>
                                    updateVideo(v.id, (x) => ({
                                      ...x,
                                      publishing: { ...x.publishing, cadence: e.target.value },
                                    }))
                                  }
                                />
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <div className="label mb-1">Godkjenning</div>
                                <textarea
                                  className="textarea"
                                  value={v.publishing.approvals}
                                  onChange={(e) =>
                                    updateVideo(v.id, (x) => ({
                                      ...x,
                                      publishing: { ...x.publishing, approvals: e.target.value },
                                    }))
                                  }
                                />
                              </div>
                              <div>
                                <div className="label mb-1">Roller</div>
                                <textarea
                                  className="textarea"
                                  value={v.publishing.roles}
                                  onChange={(e) =>
                                    updateVideo(v.id, (x) => ({
                                      ...x,
                                      publishing: { ...x.publishing, roles: e.target.value },
                                    }))
                                  }
                                />
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <div className="label mb-1">Måling / metrics</div>
                                <textarea
                                  className="textarea"
                                  value={v.publishing.metrics}
                                  onChange={(e) =>
                                    updateVideo(v.id, (x) => ({
                                      ...x,
                                      publishing: { ...x.publishing, metrics: e.target.value },
                                    }))
                                  }
                                />
                              </div>
                              <div>
                                <div className="label mb-1">Notater</div>
                                <textarea
                                  className="textarea"
                                  value={v.publishing.notes}
                                  onChange={(e) =>
                                    updateVideo(v.id, (x) => ({
                                      ...x,
                                      publishing: { ...x.publishing, notes: e.target.value },
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="label mb-1">Notater</div>
                          <textarea
                            className="textarea"
                            value={v.notes}
                            onChange={(e) => updateVideo(v.id, (x) => ({ ...x, notes: e.target.value }))}
                          />
                        </div>
                      </div>
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

                <div className="grid gap-3 mt-3">
                  {plan.productions.graphics.map((g, i) => (
                    <div className="card" key={g.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="card-title">Grafikk {i + 1}</div>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => {
                            if (!confirm("Slette denne grafikk-planen?")) return;
                            patch((p) => ({
                              ...p,
                              productions: {
                                ...p.productions,
                                graphics: p.productions.graphics.filter((x) => x.id !== g.id),
                              },
                              weeks: p.weeks.map((w) => ({
                                ...w,
                                linkedProductionIds: (w.linkedProductionIds || []).filter((id) => id !== g.id),
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
                            value={g.title}
                            onChange={(e) => updateGraphic(g.id, (x) => ({ ...x, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="label mb-1">Status</div>
                          <select
                            className="input"
                            value={g.status}
                            onChange={(e) => updateGraphic(g.id, (x) => ({ ...x, status: e.target.value as any }))}
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

                      <div className="grid gap-3 mt-3 md:grid-cols-2">
                        <div>
                          <div className="label mb-1">Mål</div>
                          <textarea
                            className="textarea"
                            value={g.goal}
                            onChange={(e) => updateGraphic(g.id, (x) => ({ ...x, goal: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="label mb-1">Leveranser</div>
                          <textarea
                            className="textarea"
                            value={g.deliverables}
                            onChange={(e) => updateGraphic(g.id, (x) => ({ ...x, deliverables: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 mt-3 md:grid-cols-2">
                        <div>
                          <div className="label mb-1">Formater</div>
                          <input
                            className="input"
                            value={g.formats}
                            onChange={(e) => updateGraphic(g.id, (x) => ({ ...x, formats: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="label mb-1">Assets som trengs</div>
                          <input
                            className="input"
                            value={g.assetsNeeded}
                            onChange={(e) => updateGraphic(g.id, (x) => ({ ...x, assetsNeeded: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 mt-3 md:grid-cols-2">
                        <div>
                          <div className="label mb-1">Stil / brandguide</div>
                          <textarea
                            className="textarea"
                            value={g.styleGuide}
                            onChange={(e) => updateGraphic(g.id, (x) => ({ ...x, styleGuide: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="label mb-1">Notater</div>
                          <textarea
                            className="textarea"
                            value={g.notes}
                            onChange={(e) => updateGraphic(g.id, (x) => ({ ...x, notes: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 mt-3 md:grid-cols-2">
                        <div>
                          <div className="label mb-1">Freepik – bilde (plan)</div>
                          <textarea
                            className="textarea"
                            value={g.freepikImagePlan}
                            onChange={(e) => updateGraphic(g.id, (x) => ({ ...x, freepikImagePlan: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="label mb-1">Freepik – video (plan)</div>
                          <textarea
                            className="textarea"
                            value={g.freepikVideoPlan}
                            onChange={(e) => updateGraphic(g.id, (x) => ({ ...x, freepikVideoPlan: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* ✅ Publishing per grafikk */}
                      <div className="card" style={{ background: "var(--panel-2)" }}>
                        <div className="card-title">Publiseringsplan (for denne grafikken)</div>

                        <div className="grid gap-3 mt-3">
                          <div>
                            <div className="label mb-1">Overordnet plan</div>
                            <textarea
                              className="textarea"
                              value={g.publishing.overallPlan}
                              onChange={(e) =>
                                updateGraphic(g.id, (x) => ({
                                  ...x,
                                  publishing: { ...x.publishing, overallPlan: e.target.value },
                                }))
                              }
                            />
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <div className="label mb-1">Plattformer</div>
                              <input
                                className="input"
                                value={g.publishing.platforms}
                                onChange={(e) =>
                                  updateGraphic(g.id, (x) => ({
                                    ...x,
                                    publishing: { ...x.publishing, platforms: e.target.value },
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <div className="label mb-1">Frekvens (cadence)</div>
                              <input
                                className="input"
                                value={g.publishing.cadence}
                                onChange={(e) =>
                                  updateGraphic(g.id, (x) => ({
                                    ...x,
                                    publishing: { ...x.publishing, cadence: e.target.value },
                                  }))
                                }
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <div className="label mb-1">Godkjenning</div>
                              <textarea
                                className="textarea"
                                value={g.publishing.approvals}
                                onChange={(e) =>
                                  updateGraphic(g.id, (x) => ({
                                    ...x,
                                    publishing: { ...x.publishing, approvals: e.target.value },
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <div className="label mb-1">Roller</div>
                              <textarea
                                className="textarea"
                                value={g.publishing.roles}
                                onChange={(e) =>
                                  updateGraphic(g.id, (x) => ({
                                    ...x,
                                    publishing: { ...x.publishing, roles: e.target.value },
                                  }))
                                }
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <div className="label mb-1">Måling / metrics</div>
                              <textarea
                                className="textarea"
                                value={g.publishing.metrics}
                                onChange={(e) =>
                                  updateGraphic(g.id, (x) => ({
                                    ...x,
                                    publishing: { ...x.publishing, metrics: e.target.value },
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <div className="label mb-1">Notater</div>
                              <textarea
                                className="textarea"
                                value={g.publishing.notes}
                                onChange={(e) =>
                                  updateGraphic(g.id, (x) => ({
                                    ...x,
                                    publishing: { ...x.publishing, notes: e.target.value },
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="muted">Start med én uke. Legg til ny uke hver gang dere planlegger/leverer.</div>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => patch((p) => ({ ...p, weeks: [...p.weeks, makeEmptyWeek()] }))}
              >
                + Legg til uke
              </button>
            </div>

            <div className="grid gap-3 mt-3">
              {plan.weeks.map((w, idx) => (
                <div className="card" key={w.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="card-title">Uke {idx + 1}</div>
                      <div className="muted">Opprett og fyll ut når dere faktisk jobber denne uka.</div>
                    </div>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => {
                        if (!confirm("Slette denne uka?")) return;
                        patch((p) => ({ ...p, weeks: p.weeks.filter((x) => x.id !== w.id) }));
                      }}
                    >
                      Slett uke
                    </button>
                  </div>

                  <div className="grid gap-3 mt-3 md:grid-cols-2">
                    <div>
                      <div className="label mb-1">Uke-label</div>
                      <input
                        className="input"
                        value={w.weekLabel}
                        onChange={(e) => updateWeek(w.id, (x) => ({ ...x, weekLabel: e.target.value }))}
                        placeholder="F.eks. Uke 6 (2.–8. feb)"
                      />
                    </div>

                    <div>
                      <div className="label mb-1">Uke-start (mandag)</div>
                      <input
                        className="input"
                        value={w.weekStart}
                        onChange={(e) => updateWeek(w.id, (x) => ({ ...x, weekStart: e.target.value }))}
                        placeholder="YYYY-MM-DD"
                      />
                    </div>
                  </div>

                  {/* Link to productions */}
                  <div className="mt-3">
                    <div className="label mb-2">Koble uka til produksjoner (hva jobbet dere med?)</div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {allProductionsForLinking.map((p2) => {
                        const checked = (w.linkedProductionIds || []).includes(p2.id);
                        return (
                          <label key={p2.id} className="pill" style={{ justifyContent: "space-between", gap: 10 }}>
                            <span>{p2.label}</span>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const on = e.target.checked;
                                updateWeek(w.id, (x) => ({
                                  ...x,
                                  linkedProductionIds: on
                                    ? Array.from(new Set([...(x.linkedProductionIds || []), p2.id]))
                                    : (x.linkedProductionIds || []).filter((id) => id !== p2.id),
                                }));
                              }}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-3 mt-3 md:grid-cols-2">
                    <div>
                      <div className="label mb-1">Fokus denne uken</div>
                      <textarea
                        className="textarea"
                        value={w.focus}
                        onChange={(e) => updateWeek(w.id, (x) => ({ ...x, focus: e.target.value }))}
                        placeholder="F.eks. konseptering + godkjenning av brief"
                      />
                    </div>
                    <div>
                      <div className="label mb-1">Leveranser</div>
                      <textarea
                        className="textarea"
                        value={w.deliverables}
                        onChange={(e) => updateWeek(w.id, (x) => ({ ...x, deliverables: e.target.value }))}
                        placeholder="F.eks. 9:16 v1, 16:9 v1, thumbnails, tekst"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 mt-3 md:grid-cols-2">
                    <div>
                      <div className="label mb-1">Kunde / avklaringer / godkjenning</div>
                      <textarea
                        className="textarea"
                        value={w.customerAndApprovals}
                        onChange={(e) => updateWeek(w.id, (x) => ({ ...x, customerAndApprovals: e.target.value }))}
                        placeholder="Møter, rettigheter, innhenting av info, godkjenninger…"
                      />
                    </div>
                    <div>
                      <div className="label mb-1">Produksjon / redigering / design</div>
                      <textarea
                        className="textarea"
                        value={w.productionWork}
                        onChange={(e) => updateWeek(w.id, (x) => ({ ...x, productionWork: e.target.value }))}
                        placeholder="Opptak, b-roll, klipp, farge, lyd, teksting, grafikk…"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 mt-3 md:grid-cols-2">
                    <div>
                      <div className="label mb-1">Freepik – bilde (ukearbeid)</div>
                      <textarea
                        className="textarea"
                        value={w.freepikImageWork}
                        onChange={(e) => updateWeek(w.id, (x) => ({ ...x, freepikImageWork: e.target.value }))}
                        placeholder="Prompts + resultater, moodboard, thumbnails, overlays…"
                      />
                    </div>
                    <div>
                      <div className="label mb-1">Freepik – video (ukearbeid)</div>
                      <textarea
                        className="textarea"
                        value={w.freepikVideoWork}
                        onChange={(e) => updateWeek(w.id, (x) => ({ ...x, freepikVideoWork: e.target.value }))}
                        placeholder="AI-b-roll, transitions, safety shots, iterasjoner…"
                      />
                    </div>
                  </div>

                  {/* Shoot days inside week */}
                  <div className="card mt-3" style={{ background: "var(--panel-2)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="card-title">Shoot-dager (denne uka)</div>
                      <button
                        className="btn btn-ghost"
                        type="button"
                        onClick={() =>
                          updateWeek(w.id, (x) => ({ ...x, shootDays: [...x.shootDays, emptyShootDay()] }))
                        }
                      >
                        + Legg til shoot-dag
                      </button>
                    </div>

                    <div className="grid gap-3 mt-3">
                      {w.shootDays.length === 0 ? (
                        <div className="muted">Ingen shoot-dager lagt til ennå.</div>
                      ) : (
                        w.shootDays.map((sd, j) => (
                          <div key={j} className="grid gap-2 md:grid-cols-4">
                            <input
                              className="input"
                              placeholder="Dato (YYYY-MM-DD)"
                              value={sd.date}
                              onChange={(e) =>
                                updateWeek(w.id, (x) => {
                                  const arr = [...x.shootDays];
                                  arr[j] = { ...arr[j], date: e.target.value };
                                  return { ...x, shootDays: arr };
                                })
                              }
                            />
                            <input
                              className="input"
                              placeholder="Location"
                              value={sd.location}
                              onChange={(e) =>
                                updateWeek(w.id, (x) => {
                                  const arr = [...x.shootDays];
                                  arr[j] = { ...arr[j], location: e.target.value };
                                  return { ...x, shootDays: arr };
                                })
                              }
                            />
                            <input
                              className="input"
                              placeholder="Calltime (09:00)"
                              value={sd.callTime}
                              onChange={(e) =>
                                updateWeek(w.id, (x) => {
                                  const arr = [...x.shootDays];
                                  arr[j] = { ...arr[j], callTime: e.target.value };
                                  return { ...x, shootDays: arr };
                                })
                              }
                            />
                            <div className="flex gap-2">
                              <input
                                className="input"
                                placeholder="Notat"
                                value={sd.notes}
                                onChange={(e) =>
                                  updateWeek(w.id, (x) => {
                                    const arr = [...x.shootDays];
                                    arr[j] = { ...arr[j], notes: e.target.value };
                                    return { ...x, shootDays: arr };
                                  })
                                }
                              />
                              <button
                                className="btn btn-ghost"
                                type="button"
                                onClick={() =>
                                  updateWeek(w.id, (x) => ({ ...x, shootDays: x.shootDays.filter((_, k) => k !== j) }))
                                }
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 mt-3 md:grid-cols-2">
                    <div>
                      <div className="label mb-1">Risiko / tiltak</div>
                      <textarea
                        className="textarea"
                        value={w.risks}
                        onChange={(e) => updateWeek(w.id, (x) => ({ ...x, risks: e.target.value }))}
                        placeholder="Hva kan gå galt? Hva gjør dere hvis det skjer?"
                      />
                    </div>
                    <div>
                      <div className="label mb-1">Husk sporbarhet</div>
                      <div className="muted">
                        Noter alltid hva som er KI-generert og hva som er filmet/designet. Lagre prompts + resultater.
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="grid gap-4">
          <Section title="Kandidat" description="Hvem fyller ut planen? Skriv navn / gruppe. (Kommer med i PDF)">
            <div className="grid gap-3">
              <div>
                <div className="label mb-1">Kandidat/gruppe</div>
                <input
                  className="input"
                  value={plan.meta.ownerName}
                  onChange={(e) => patch((p) => ({ ...p, meta: { ...p.meta, ownerName: e.target.value } }))}
                  placeholder="Navn / gruppe"
                />
              </div>

              <div>
                <div className="label mb-1">Tittel på dokumentet</div>
                <input
                  className="input"
                  value={plan.meta.title}
                  onChange={(e) => patch((p) => ({ ...p, meta: { ...p.meta, title: e.target.value } }))}
                />
              </div>
            </div>
          </Section>

          <Section title="Utstyr og teknikk" description="Dere har iPhone 17 Pro Max, DJI-mikrofoner, DJI gimbal og mobilt lys.">
            <div className="grid gap-3">
              <label className="pill">
                <span>iPhone 17 Pro Max tilgjengelig</span>
                <input
                  type="checkbox"
                  checked={plan.equipment.available.iphone17ProMax}
                  onChange={(e) =>
                    patch((p) => ({
                      ...p,
                      equipment: {
                        ...p.equipment,
                        available: { ...p.equipment.available, iphone17ProMax: e.target.checked },
                      },
                    }))
                  }
                />
              </label>

              <label className="pill">
                <span>DJI mikrofoner tilgjengelig</span>
                <input
                  type="checkbox"
                  checked={plan.equipment.available.djiMics}
                  onChange={(e) =>
                    patch((p) => ({
                      ...p,
                      equipment: { ...p.equipment, available: { ...p.equipment.available, djiMics: e.target.checked } },
                    }))
                  }
                />
              </label>

              <label className="pill">
                <span>DJI gimbal tilgjengelig</span>
                <input
                  type="checkbox"
                  checked={plan.equipment.available.djiGimbal}
                  onChange={(e) =>
                    patch((p) => ({
                      ...p,
                      equipment: {
                        ...p.equipment,
                        available: { ...p.equipment.available, djiGimbal: e.target.checked },
                      },
                    }))
                  }
                />
              </label>

              <label className="pill">
                <span>Mobilt lys tilgjengelig</span>
                <input
                  type="checkbox"
                  checked={plan.equipment.available.mobileLight}
                  onChange={(e) =>
                    patch((p) => ({
                      ...p,
                      equipment: {
                        ...p.equipment,
                        available: { ...p.equipment.available, mobileLight: e.target.checked },
                      },
                    }))
                  }
                />
              </label>

              <div>
                <div className="label mb-1">Ekstra å ta med</div>
                <textarea
                  className="textarea"
                  value={plan.equipment.extraToBring}
                  onChange={(e) =>
                    patch((p) => ({ ...p, equipment: { ...p.equipment, extraToBring: e.target.value } }))
                  }
                />
              </div>

              <div>
                <div className="label mb-1">Tekniske sjekker (preflight)</div>
                <textarea
                  className="textarea"
                  value={plan.equipment.preflightChecks}
                  onChange={(e) =>
                    patch((p) => ({ ...p, equipment: { ...p.equipment, preflightChecks: e.target.value } }))
                  }
                />
              </div>
            </div>
          </Section>

          <Section
            title="Dokumentasjon og kvalitet"
            description="Logg, filstruktur, navngiving og backup – for fagprøve og sporbarhet."
          >
            <div className="grid gap-3">
              <div>
                <div className="label mb-1">Loggplan</div>
                <textarea
                  className="textarea"
                  value={plan.documentation.logPlan}
                  onChange={(e) =>
                    patch((p) => ({ ...p, documentation: { ...p.documentation, logPlan: e.target.value } }))
                  }
                />
              </div>

              <div>
                <div className="label mb-1">Filstruktur</div>
                <textarea
                  className="textarea"
                  value={plan.documentation.fileStructure}
                  onChange={(e) =>
                    patch((p) => ({ ...p, documentation: { ...p.documentation, fileStructure: e.target.value } }))
                  }
                />
              </div>

              <div>
                <div className="label mb-1">Navngiving</div>
                <textarea
                  className="textarea"
                  value={plan.documentation.namingConventions}
                  onChange={(e) =>
                    patch((p) => ({ ...p, documentation: { ...p.documentation, namingConventions: e.target.value } }))
                  }
                />
              </div>

              <div>
                <div className="label mb-1">Backup-plan</div>
                <textarea
                  className="textarea"
                  value={plan.documentation.backupPlan}
                  onChange={(e) =>
                    patch((p) => ({ ...p, documentation: { ...p.documentation, backupPlan: e.target.value } }))
                  }
                />
              </div>
            </div>
          </Section>
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
