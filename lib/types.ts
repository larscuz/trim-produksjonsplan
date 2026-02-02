// lib/types.ts

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

/**
 * Publiseringsplan per produksjon
 * (ikke helhetlig i PlanDoc lenger)
 */
export type PublishingPlan = {
  overallPlan: string; // plan for denne produksjonen
  platforms: string; // f.eks. IG/TikTok/YT/Nettside
  cadence: string; // frekvens
  approvals: string; // godkjenningsflyt
  roles: string; // hvem gjør hva
  metrics: string; // hva måles
  notes: string;
};

/**
 * VIDEO-PLAN (én per video)
 */
export type VideoPlan = {
  id: string;
  title: string;

  goal: string;
  deliverables: string;
  formats: string;

  concept: string;
  hookIdeas: string;
  structure: string;
  toneAndStyle: string;

  locations: string;
  shootDays: ShootDay[];

  interviewGuide: string;
  questions: string;
  cameraSetup: string;
  brollList: string;

  freepikImagePlan: string;
  freepikVideoPlan: string;

  notes: string;

  /** ✅ Publisering per video */
  publishing: PublishingPlan;

  status: ProductionStatus;
};

/**
 * GRAFISK PLAN (én per grafikk-leveranse)
 */
export type GraphicPlan = {
  id: string;
  title: string;

  goal: string;
  deliverables: string;
  formats: string;

  styleGuide: string;
  assetsNeeded: string;

  freepikImagePlan: string;
  freepikVideoPlan: string;

  notes: string;

  /** ✅ Publisering per grafikk */
  publishing: PublishingPlan;

  status: ProductionStatus;
};

/**
 * UKELOGG: Kandidaten oppretter en uke når de jobber.
 * Ikke auto-generert frem til deadline.
 */
export type WeekEntry = {
  id: string;
  weekStart: string; // YYYY-MM-DD (mandag)
  weekLabel: string;

  focus: string;
  deliverables: string;

  customerAndApprovals: string;
  productionWork: string;

  freepikImageWork: string;
  freepikVideoWork: string;

  shootDays: ShootDay[];
  risks: string;

  /**
   * Hvilke produksjoner jobbet dere på denne uka?
   * (video/grafikk ids)
   */
  linkedProductionIds: string[];
};

/**
 * HOVEDDOKUMENT
 */
export type PlanDoc = {
  meta: {
    title: string;
    createdAt: string;
    updatedAt: string;
    ownerName: string;
  };

  /**
   * A) PLAN FOR KUNDEN (HELHET)
   */
  customer: {
    name: string;
    contact: string;
    projectName: string;
    deadline: string;
    brief: string;
    successCriteria: string;
    targetAudience: string;
    channels: string;
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
   * A) GENERELL LOGISTIKK
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
   * A) UTSTYR / TEKNISK
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
   * B) PRODUKSJONER
   */
  productions: {
    videos: VideoPlan[];
    graphics: GraphicPlan[];
  };

  /**
   * C) UKELOGG
   */
  weeks: WeekEntry[];
};

/**
 * Ny nøkkel fordi vi endrer schema.
 */
export const STORAGE_KEY = "trim-plan-v2";
