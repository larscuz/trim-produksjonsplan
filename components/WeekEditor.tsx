"use client";

import type { WeekPlan, ShootDay } from "@/lib/types";

function newShootDay(): ShootDay {
  return { date: "", location: "", callTime: "09:00", notes: "" };
}

export function WeekEditor({
  week,
  onChange,
  onRemove,
}: {
  week: WeekPlan;
  onChange: (patch: Partial<WeekPlan>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{week.weekLabel}</div>
          <div className="text-xs text-zinc-500">Start: {week.weekStart}</div>
        </div>
        {onRemove ? (
          <button type="button" className="btn btn-danger" onClick={onRemove}>
            Slett uke
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <div className="label mb-1">Fokus denne uken</div>
          <input
            className="input"
            value={week.focus}
            onChange={(e) => onChange({ focus: e.target.value })}
            placeholder="F.eks. konseptering + godkjenning av brief"
          />
        </div>

        <div>
          <div className="label mb-1">Leveranser</div>
          <input
            className="input"
            value={week.deliverables}
            onChange={(e) => onChange({ deliverables: e.target.value })}
            placeholder="F.eks. 9:16 v1, 16:9 v1, thumbnails, tekst"
          />
        </div>

        <div>
          <div className="label mb-1">Kunde / avklaringer</div>
          <textarea
            className="textarea"
            value={week.customerTasks}
            onChange={(e) => onChange({ customerTasks: e.target.value })}
            placeholder="Møter, godkjenninger, innhenting av info, rettigheter, deadlines…"
          />
        </div>

        <div>
          <div className="label mb-1">Produksjon / redigering</div>
          <textarea
            className="textarea"
            value={week.productionTasks}
            onChange={(e) => onChange({ productionTasks: e.target.value })}
            placeholder="Plan, opptak, b-roll, redigering, lyd, farge, teksting, eksport…"
          />
        </div>

        <div>
          <div className="label mb-1">Freepik – bilde (KI)</div>
          <textarea
            className="textarea"
            value={week.freepikImageTasks}
            onChange={(e) => onChange({ freepikImageTasks: e.target.value })}
            placeholder="Prompts, moodboard, stills, thumbnails, overlays, generativ fyll…"
          />
        </div>

        <div>
          <div className="label mb-1">Freepik – video (KI)</div>
          <textarea
            className="textarea"
            value={week.freepikVideoTasks}
            onChange={(e) => onChange({ freepikVideoTasks: e.target.value })}
            placeholder="B-roll erstatning, transitions, AI-shot, iterasjoner, eksport…"
          />
        </div>

        <div className="md:col-span-2">
          <div className="label mb-2">Shoot-dager (dato, sted, calltime, notat)</div>
          <div className="grid gap-2">
            {week.shootDays.length ? (
              week.shootDays.map((sd, idx) => (
                <div
                  key={idx}
                  className="grid gap-2 rounded-xl border border-zinc-800/70 bg-zinc-950/30 p-3 md:grid-cols-4"
                >
                  <input
                    className="input"
                    type="date"
                    value={sd.date}
                    onChange={(e) => {
                      const next = [...week.shootDays];
                      next[idx] = { ...sd, date: e.target.value };
                      onChange({ shootDays: next });
                    }}
                  />
                  <input
                    className="input"
                    value={sd.location}
                    onChange={(e) => {
                      const next = [...week.shootDays];
                      next[idx] = { ...sd, location: e.target.value };
                      onChange({ shootDays: next });
                    }}
                    placeholder="Location"
                  />
                  <input
                    className="input"
                    value={sd.callTime}
                    onChange={(e) => {
                      const next = [...week.shootDays];
                      next[idx] = { ...sd, callTime: e.target.value };
                      onChange({ shootDays: next });
                    }}
                    placeholder="09:00"
                  />
                  <div className="flex gap-2">
                    <input
                      className="input"
                      value={sd.notes}
                      onChange={(e) => {
                        const next = [...week.shootDays];
                        next[idx] = { ...sd, notes: e.target.value };
                        onChange({ shootDays: next });
                      }}
                      placeholder="Notat"
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        const next = week.shootDays.filter((_, i) => i !== idx);
                        onChange({ shootDays: next });
                      }}
                      title="Fjern"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-500">Ingen shoot-dager lagt til ennå.</div>
            )}

            <div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onChange({ shootDays: [...week.shootDays, newShootDay()] })}
              >
                + Legg til shoot-dag
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="label mb-1">Risiko / tiltak (hva kan gå galt?)</div>
          <textarea
            className="textarea"
            value={week.risks}
            onChange={(e) => onChange({ risks: e.target.value })}
            placeholder="Backup-plan, alternative locations, ekstra utstyr, tidsbuffer, tillatelser…"
          />
        </div>
      </div>
    </div>
  );
}
