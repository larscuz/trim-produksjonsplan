export type ShootDay = {
  date: string; // YYYY-MM-DD
  location: string;
  callTime: string; // e.g. 09:00
  notes: string;
};

export type ProductionStatus =
  | "idea"
  | "planned"
  | "in_progress"
  | "review"
  | "approved"
  | "published"
  | "done";

export type PublishingPlan = {
  overallPlan: string; // plan for denne produksjonen
  platforms: string; // f.eks. IG/TikTok/YT/Nettside
  cadence: string; // frekvens
  approvals: string; // godkjenningsflyt
  roles: string; // hvem gjør hva
  metrics: string; // hva måles
  notes: string;
};

export type VideoPlan = {
  id: string;
  title: string; // f.eks. "Intervju med lærer – 30 sek"
  goal: string; // hva skal videoen oppnå?
  deliverables: string; // leveranser/versjoner/format
  formats: string; // 9:16 / 16:9 / begge
  concept: string; // kort pitch
  hookIdeas: string; // 5–10 forslag
  structure: string; // hook → ...
  toneAndStyle: string; // visuell stil
  locations: string; // steder som gjelder for denne videoen
  shootDays: ShootDay[];
  interviewGuide: string;
  questions: string;
  cameraSetup: string;
  brollList: string;

  freepikImagePlan: string; // moodboard, thumbnails, overlays
  freepikVideoPlan: string; // ai b-roll, transitions, safety shots
  notes: string;

  publishing: PublishingPlan; // ✅ per video
  status: ProductionStatus;
};

export type GraphicPlan = {
  id: string;
  title: string; // f.eks. "Thumbnail-sett", "Plakat", "SoMe-grafikk"
  goal: string;
  deliverables: string; // filer/varianter
  formats: string; // f.eks. 1080x1920, 1920x1080, A4, etc.
  styleGuide: string; // tone, typografi, farger, brand
  assetsNeeded: string; // logo, bilder, fonter, etc.

  freepikImagePlan: string; // generering/iterasjoner
  freepikVideoPlan: string; // hvis motion/AI-video brukes
  notes: string;

  publishing: PublishingPlan; // ✅ per grafikk
  status: ProductionStatus;
};

/**
 * UKELOGG: Kandidaten oppretter en uke når de jobber.
 * Ikke auto-generert frem til deadline.
 */
export type WeekEntry = {
  id: string;
  weekStart: string; // YYYY-MM-DD (mandag)
  weekLabel: string; // f.eks. "Uke 6 (2.–8. feb)"

  focus: string;
  deliverables: string;

  customerAndApprovals: string; // møter/godkjenning/rettigheter
  productionWork: string; // opptak/redigering/designarbeid denne uka

  freepikImageWork: string; // prompts + resultater
  freepikVideoWork: string;

  shootDays: ShootDay[];
  risks: string;

  /**
   * Hvilke produksjoner jobbet dere på denne uka?
   * (video/grafikk ids)
   */
  linkedProductionIds: string[];
};

export type PlanDoc = {
  meta: {
    title: string;
    createdAt: string; // ISO
    updatedAt: string; // ISO
    ownerName: string; // kandidat/gruppe
  };

  /**
   * A) PLAN FOR KUNDEN (HELHET)
   */
  customer: {
    name: string;
    contact: string;
    projectName: string;
    deadline: string; // YYYY-MM-DD
    brief: string; // kundens ønsker
    successCriteria: string;
    targetAudience: string;
    channels: string; // plattformer/flater
  };

  /**
   * A) HELHETLIG STRATEGI
   */
  strategy: {
    concept: string;
    keyMessage: string;
    toneAndStyle: string;
    hookIdeas: string;
    structure: string;
    references: string;
  };

  /**
   * A) GENERELL LOGISTIKK (for oppdraget)
   */
  logistics: {
    mainLocation: string;
    contactsToClear: string;
    classroomOrRoom: string;
    teachersOrTalent: string;
    assistants: string;
    permissions: string;
  };

  /**
   * A) UTSTYR/TEKNISK (generelt)
   */
  equipment: {
    available: {
      iphone17ProMax: boolean;
      djiMics: boolean;
      djiGimbal: boolean;
      mobileLight: boolean;
    };
    extraToBring: string;
    preflightChecks: string;
  };

  /**
   * A) DOKUMENTASJON OG KVALITET
   */
  documentation: {
    logPlan: string;
    fileStructure: string;
    namingConventions: string;
    backupPlan: string;
  };

  /**
   * B) PRODUKSJONER (flere)
   */
  productions: {
    videos: VideoPlan[];
    graphics: GraphicPlan[];
  };

  /**
   * C) UKELOGG (bygges uke for uke)
   */
  weeks: WeekEntry[];
};

/**
 * Ny nøkkel fordi vi endrer schema.
 * (hindrer at gammel localStorage krasjer appen)
 */
export const STORAGE_KEY = "trim-plan-v2";
