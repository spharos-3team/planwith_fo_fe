import type {
  AiScheduleGeneratePayload,
  AiScheduleGenerateResult,
  ScheduleTransportation,
  ScheduleTravelStyle,
} from "@/features/schedule/types";

export const AI_APPLICATION_STEPS = 7;
export const AI_APPLICATION_PATH = "/schedules/ai/new";

const DRAFT_KEY = "planwith.aiScheduleApplication";
const DRAFT_PHASE_KEY = "planwith.aiScheduleDraftPhase";
const REQUEST_KEY = "planwith.aiScheduleGenerateRequest";

const draftListeners = new Set<() => void>();

function notifyDraftListeners(): void {
  draftListeners.forEach((listener) => {
    listener();
  });
}

export function subscribeAiApplicationDraft(
  onStoreChange: () => void
): () => void {
  draftListeners.add(onStoreChange);
  return () => {
    draftListeners.delete(onStoreChange);
  };
}

function draftPhase(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(DRAFT_PHASE_KEY);
}

export interface AiApplicationDate {
  year: number;
  month: number;
  day: number;
}

export interface AiApplicationValues {
  destination: string;
  includeFlight: boolean;
  departure: string;
  startDate: AiApplicationDate;
  endDate: AiApplicationDate;
  people: string;
  budget: string;
  transports: string[];
  styles: string[];
  request: string;
}

export interface AiApplicationDraft {
  step: number;
  values: AiApplicationValues;
}

export function emptyAiApplicationValues(): AiApplicationValues {
  return {
    destination: "",
    includeFlight: false,
    departure: "",
    startDate: { year: 2026, month: 8, day: 1 },
    endDate: { year: 2026, month: 8, day: 1 },
    people: "",
    budget: "",
    transports: [],
    styles: [],
    request: "",
  };
}

function isDateValue(value: unknown): value is AiApplicationDate {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const date = value as AiApplicationDate;
  return (
    Number.isInteger(date.year) &&
    Number.isInteger(date.month) &&
    Number.isInteger(date.day)
  );
}

let snapshotRaw: string | null = null;
let snapshotDraft: AiApplicationDraft | null = null;
let snapshotReady = false;

function rememberSnapshot(
  raw: string | null,
  draft: AiApplicationDraft | null
): AiApplicationDraft | null {
  snapshotReady = true;
  snapshotRaw = raw;
  snapshotDraft = draft;
  return draft;
}

function parseDraft(raw: string | null): AiApplicationDraft | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isDraft(value: unknown): value is AiApplicationDraft {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const draft = value as AiApplicationDraft;
  const values = draft.values;

  return (
    Number.isInteger(draft.step) &&
    typeof values === "object" &&
    values !== null &&
    typeof values.destination === "string" &&
    typeof values.includeFlight === "boolean" &&
    typeof values.departure === "string" &&
    isDateValue(values.startDate) &&
    isDateValue(values.endDate) &&
    typeof values.people === "string" &&
    typeof values.budget === "string" &&
    Array.isArray(values.transports) &&
    Array.isArray(values.styles) &&
    typeof values.request === "string"
  );
}

export function saveAiApplicationDraft(draft: AiApplicationDraft): void {
  if (typeof window === "undefined") {
    return;
  }

  const phase = draftPhase();
  if (phase === "completed" || phase === "generating") {
    return;
  }

  const step = Math.min(
    AI_APPLICATION_STEPS,
    Math.max(1, Math.trunc(draft.step))
  );
  const stored: AiApplicationDraft = { step, values: draft.values };
  const raw = JSON.stringify(stored);
  window.sessionStorage.setItem(DRAFT_PHASE_KEY, "in_progress");
  window.sessionStorage.setItem(DRAFT_KEY, raw);
  rememberSnapshot(raw, stored);
}

export function loadAiApplicationDraft(): AiApplicationDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (draftPhase() === "completed") {
    if (window.sessionStorage.getItem(DRAFT_KEY)) {
      window.sessionStorage.removeItem(DRAFT_KEY);
    }
    if (snapshotReady && snapshotRaw === null && snapshotDraft === null) {
      return null;
    }
    return rememberSnapshot(null, null);
  }

  const raw = window.sessionStorage.getItem(DRAFT_KEY);
  const draft =
    snapshotReady && raw === snapshotRaw
      ? snapshotDraft
      : rememberSnapshot(raw, parseDraft(raw));

  return discardConsumedDraft(draft);
}

export function clearAiApplicationDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(DRAFT_KEY);
  rememberSnapshot(null, null);
  notifyDraftListeners();
}

export function markAiApplicationCompleted(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DRAFT_PHASE_KEY, "completed");
  window.sessionStorage.removeItem(DRAFT_KEY);
  rememberSnapshot(null, null);
  notifyDraftListeners();
}

export function beginAiApplicationDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (draftPhase() === "completed") {
    window.sessionStorage.setItem(DRAFT_PHASE_KEY, "in_progress");
  }
}

export function markAiApplicationGenerating(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DRAFT_PHASE_KEY, "generating");
}

export function resumeAiApplicationDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (draftPhase() === "generating") {
    window.sessionStorage.setItem(DRAFT_PHASE_KEY, "in_progress");
  }
}

export function saveAiGenerateRequest(
  payload: AiScheduleGeneratePayload
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(REQUEST_KEY, JSON.stringify(payload));
}

const RESULT_KEY = "planwith.aiScheduleResult";

const TRANSPORT_BY_ID: Record<string, ScheduleTransportation> = {
  public: "TRAIN_PUBLIC_TRANSIT",
  ferry: "SHIP_FERRY",
  rental: "RENTAL_CAR",
  walk: "WALKING",
  other: "OTHER",
};

const STYLE_BY_ID: Record<string, ScheduleTravelStyle> = {
  landmark: "TOUR_LANDMARK",
  healing: "RELAXATION_HEALING",
  food: "FOOD_TOUR",
  activity: "ACTIVITY",
};

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

export function isoFromApplicationDate(date: AiApplicationDate): string {
  return `${date.year}-${padDatePart(date.month)}-${padDatePart(date.day)}`;
}

export function toAiGeneratePayload(
  values: AiApplicationValues
): AiScheduleGeneratePayload {
  const transportation = values.transports
    .map((id) => TRANSPORT_BY_ID[id])
    .find((item) => item);
  const travelStyle = values.styles
    .map((id) => STYLE_BY_ID[id])
    .find((item) => item);

  return {
    destination: values.destination.trim(),
    startDate: isoFromApplicationDate(values.startDate),
    endDate: isoFromApplicationDate(values.endDate),
    participantCount: Math.max(1, Number(values.people) || 1),
    estimatedBudget: Math.max(0, Number(values.budget) || 0),
    transportation,
    travelStyle,
    additionalRequest: values.request.trim() || undefined,
  };
}

function storedResultPayload(): AiScheduleGeneratePayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(RESULT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as {
      payload?: AiScheduleGeneratePayload;
    };
    return parsed.payload ?? null;
  } catch {
    return null;
  }
}

function discardConsumedDraft(
  draft: AiApplicationDraft | null
): AiApplicationDraft | null {
  if (!draft || draftPhase() === "generating") {
    return draft;
  }

  if (draft.step !== AI_APPLICATION_STEPS) {
    return draft;
  }

  const payload = storedResultPayload();
  if (
    !payload ||
    payload.destination !== draft.values.destination.trim() ||
    payload.startDate !== isoFromApplicationDate(draft.values.startDate) ||
    payload.endDate !== isoFromApplicationDate(draft.values.endDate)
  ) {
    return draft;
  }

  window.sessionStorage.setItem(DRAFT_PHASE_KEY, "completed");
  window.sessionStorage.removeItem(DRAFT_KEY);
  return rememberSnapshot(null, null);
}

export function saveAiGenerateResult(
  generationId: string,
  result: AiScheduleGenerateResult,
  payload: AiScheduleGeneratePayload
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    RESULT_KEY,
    JSON.stringify({ generationId, result, payload })
  );
}

export function loadAiGenerateResult(
  generationId: string
): AiScheduleGenerateResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(RESULT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as {
      generationId?: string;
      result?: AiScheduleGenerateResult;
    };
    if (parsed.generationId !== generationId || !parsed.result) {
      return null;
    }
    return parsed.result;
  } catch {
    return null;
  }
}

export function loadAiGeneratePayload(): AiScheduleGeneratePayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const requestRaw = window.sessionStorage.getItem(REQUEST_KEY);
  if (requestRaw) {
    try {
      const request = JSON.parse(requestRaw) as AiScheduleGeneratePayload;
      if (request.destination && request.startDate && request.endDate) {
        return request;
      }
    } catch {
      window.sessionStorage.removeItem(REQUEST_KEY);
    }
  }

  const draft = loadAiApplicationDraft();
  if (draft) {
    return toAiGeneratePayload(draft.values);
  }

  return storedResultPayload();
}
