import type { PlanDoc } from "./types";
import { STORAGE_KEY } from "./types";

export function loadPlan(): PlanDoc | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlanDoc;
  } catch {
    return null;
  }
}

export function savePlan(plan: PlanDoc) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // ignore
  }
}

export function downloadJson(plan: PlanDoc) {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trim-produksjonsplan.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function importJsonFile(file: File): Promise<PlanDoc> {
  const text = await file.text();
  return JSON.parse(text) as PlanDoc;
}
