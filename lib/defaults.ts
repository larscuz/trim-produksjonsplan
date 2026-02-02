import type { PlanDoc, WeekEntry, VideoPlan, GraphicPlan, PublishingPlan } from "./types";
import { buildWeeksUntil, toISODate } from "./date";

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

function makeDefaultVideo(): VideoPlan {
  return {
    id: uid(),
    title: "Video 1 – (skriv tittel)",
    goal: "",
    deliverables: "9:16 v1, 16:9 v1 (om relevant), thumbnail, tekst",
    formats: "9:16 + 16:9",
    concept: "",
    hookIdeas: "",
    structure: "Hook → presentasjon → hovedinnhold → b-roll → outro/logo → CTA",
    toneAndStyle: "",
    locations: "",
    shootDays: [],
    interviewGuide:
      "Rekkefølge: 1) Hook (1 setning) 2) Presentasjon 3) 3–5 korte svar 4) Cutaways/småprat 5) Avslutning/CTA",
    questions:
      "• Hva ønsker dere at publikum skal føle?\n• Hva er den viktigste grunnen til å møte opp/kjøpe/engasjere seg?\n• Hvis du må beskrive dette med ett ord – hvilket?\n• Hva er det mest overraskende ved prosjektet?",
    cameraSetup:
      "Vinkel 1: Close-up (fra siden) • Vinkel 2: Medium close-up (forfra) • Rolige bevegelser • Naturlig lys + ett punktlys",
    brollList:
      "Intervju-nær: hender, notater, kaffekopp, justering før take.\nUndervisning/event: aktiviteter, mennesker i arbeid, detaljer.\nMiljø: skilt, rom, inngang, stemning, teksturer.",
    freepikImagePlan:
      "Moodboard, thumbnails, overlays, generative fills, stiltester (noter prompts + resultat).",
    freepikVideoPlan:
      "AI-b-roll, alternative takes, transitions, safety shots (noter prompts + eksport).",
    notes: "",
    publishing: defaultPublishing(), // ✅ per video
    status: "planned",
  };
}

function makeDefaultGraphic(): GraphicPlan {
  return {
    id: uid(),
    title: "Grafikk 1 – (skriv tittel)",
    goal: "",
    deliverables: "1–3 varianter + eksport (PNG/JPG/MP4 hvis motion)",
    formats: "1080x1920 (Story/Reels), 1080x1350 (feed) – juster ved behov",
    styleGuide: "Bruk kundens brandguide. Noter typografi, farger, tone, grid.",
    assetsNeeded: "Logo, fonter, bilder, tekst, eventuelle lenker/CTA.",
    freepikImagePlan:
      "Generer varianter, bakgrunner, teksturer, elementer. Loggfør prompts + valg.",
    freepikVideoPlan:
      "Hvis motion/AI-video: korte loops, bakgrunner, overganger (loggfør prompts).",
    notes: "",
    publishing: defaultPublishing(), // ✅ per grafikk
    status: "planned",
  };
}

function makeFirstWeek(deadlineISO: string): WeekEntry {
  // Vi bruker eksisterende uke-bygger, men tar kun første uke
  const weeks = buildWeeksUntil(deadlineISO);
  const w0 = weeks[0];

  return {
    id: uid(),
    weekLabel: w0?.label ?? "Uke (start)",
    weekStart: toISODate(w0?.weekStart ?? new Date()),
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

export function makeDefaultPlan(deadlineISO = "2026-06-01"): PlanDoc {
  const now = new Date().toISOString();

  return {
    meta: {
      title: "TRiM Produksjonsplan – Video + KI (Freepik)",
      createdAt: now,
      updatedAt: now,
      ownerName: "",
    },

    // A) Kundeplan (helhet)
    customer: {
      name: "",
      contact: "",
      projectName: "",
      deadline: deadlineISO,
      brief: "",
      successCriteria: "",
      targetAudience: "",
      channels: "Instagram Reels, TikTok, YouTube Shorts, nettside",
    },

    strategy: {
      concept: "",
      keyMessage: "",
      toneAndStyle: "",
      hookIdeas: "",
      structure: "Hook → presentasjon → hovedinnhold → b-roll → outro/logo → CTA",
      references: "",
    },

    logistics: {
      mainLocation: "Bjørnholt VGS",
      classroomOrRoom: "",
      contactsToClear: "",
      teachersOrTalent: "",
      assistants: "",
      permissions: "Samtykke • filming • musikkrettigheter • logo/brandguide • dato",
    },

    equipment: {
      available: {
        iphone17ProMax: true,
        djiMics: true,
        djiGimbal: true,
        mobileLight: true,
      },
      extraToBring:
        "Powerbank, ekstra ladekabler, teip, hvit papp/reflektor, minnekort (hvis relevant).",
      preflightChecks:
        "100% batteri • Rydd lagring • Test lyd (DJI mic) • Test lys • Sjekk gimbal • Sjekk fokus/eksponering • Flymodus (om mulig) • Backup-opptak",
    },

    documentation: {
      logPlan:
        "Hver uke: hva ble gjort, hva gjenstår, beslutninger, filer/lenker, læring, risiko/tiltak.",
      fileStructure:
        "/footage/YYYY-MM-DD/ • /audio/ • /project/ • /exports/9x16/ og /exports/16x9/ • /ai/freepik/images/ og /ai/freepik/video/",
      namingConventions:
        "Kunde_Prosjekt_Dato_V1 (f.eks. Bjornholt_Intervju_2026-02-02_V1). Bruk samme navn i Freepik-promptlogg.",
      backupPlan:
        "Lagre råfiler samme dag (lokalt + sky). Ha minst 2 kopier før sletting fra telefon.",
    },

    // B) Produksjoner (starter med 1 + 1)
    productions: {
      videos: [makeDefaultVideo()],
      graphics: [makeDefaultGraphic()],
    },

    // C) Ukelogg (starter med 1 uke)
    weeks: [makeFirstWeek(deadlineISO)],
  };
}
