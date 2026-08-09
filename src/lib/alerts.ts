import { parseISO } from "date-fns";
import type { Location } from "@/data/locations";
import { get15DayForecast, get72HourForecast } from "@/services/climatempo";

export const RAIN_MM_H_THRESHOLD = 20;
export const RAIN_PROB_THRESHOLD = 70;
export const DAYS_WINDOW = 7;

export type TriggerType = "rain_mm_h" | "rain_probability";
export type Severity = "high" | "moderate";

export type WeatherAlert = {
  id: string;
  dateTimeIso: string;
  location: Location;
  triggers: Array<{
    type: TriggerType;
    value: number;
    unit: string;
    source: "hourly" | "daily";
  }>;
  severity: Severity;
  context?: {
    adjacent?: {
      prev?: { label: string; value: number; unit: string };
      next?: { label: string; value: number; unit: string };
    };
    confidence?: string;
  };
};

const toIso = (date: string, hour?: string) => {
  if (!hour) return date;
  const safeHour = hour.includes(":") ? hour : `${hour}:00`;
  if (date.includes("T") || date.includes(" ")) return date;
  return `${date}T${safeHour}`;
};

const safeParseToDate = (isoLike: string): Date | null => {
  try {
    const d = isoLike.includes("T") ? parseISO(isoLike) : new Date(isoLike);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const severityFromTriggers = (triggers: WeatherAlert["triggers"]): Severity => {
  const prob = triggers.find((t) => t.type === "rain_probability")?.value;
  const mmh = triggers.find((t) => t.type === "rain_mm_h")?.value;
  if ((prob ?? 0) >= 90 || (mmh ?? 0) >= 40) return "high";
  return "moderate";
};

const mergeTriggers = (
  current: WeatherAlert["triggers"],
  incoming: WeatherAlert["triggers"][number],
) => {
  const exists = current.some((t) => t.type === incoming.type);
  if (exists) return current.map((t) => (t.type === incoming.type ? incoming : t));
  return [...current, incoming];
};

export const runWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let idx = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }).map(async () => {
    while (idx < items.length) {
      const current = idx++;
      results[current] = await worker(items[current]);
    }
  });
  await Promise.all(runners);
  return results;
};

export const buildAlertsForLocation = async (location: Location): Promise<WeatherAlert[]> => {
  // A failure in a single location must not break the whole alert list
  const [dailyRes, hourlyRes] = await Promise.allSettled([
    get15DayForecast(location.climaTempoCod),
    get72HourForecast(location.climaTempoCod),
  ]);
  const daily: any = dailyRes.status === "fulfilled" ? dailyRes.value : { data: [] };
  const hourly: any = hourlyRes.status === "fulfilled" ? hourlyRes.value : { data: [] };

  const now = new Date();
  // Daily entries are dated at midnight, so today's alerts must not be discarded
  const minDate = new Date(now);
  minDate.setHours(0, 0, 0, 0);
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + DAYS_WINDOW);

  const byKey = new Map<string, WeatherAlert>();

  const dailyDays = (daily.data ?? []).slice(0, DAYS_WINDOW);
  dailyDays.forEach((d: any, i: number) => {
    const prob = d?.rain?.probability;
    if (typeof prob !== "number") return;
    if (prob <= RAIN_PROB_THRESHOLD) return;

    const iso = toIso(d.date);
    const dt = safeParseToDate(iso);
    if (!dt) return;
    if (dt < minDate || dt > maxDate) return;

    const key = `${location.climaTempoCod}|${iso}`;
    const existing = byKey.get(key);
    const trigger = { type: "rain_probability" as const, value: prob, unit: "%", source: "daily" as const };
    const prev = dailyDays[i - 1]?.rain?.probability;
    const next = dailyDays[i + 1]?.rain?.probability;

    if (existing) {
      existing.triggers = mergeTriggers(existing.triggers, trigger);
      existing.severity = severityFromTriggers(existing.triggers);
      return;
    }

    byKey.set(key, {
      id: key,
      dateTimeIso: iso,
      location,
      triggers: [trigger],
      severity: severityFromTriggers([trigger]),
      context: {
        adjacent: {
          prev: typeof prev === "number" ? { label: "Dia anterior", value: prev, unit: "%" } : undefined,
          next: typeof next === "number" ? { label: "Dia seguinte", value: next, unit: "%" } : undefined,
        },
      },
    });
  });

  const hourBlocks = (hourly.data ?? []).flatMap((d: any) => {
    const date = d?.date;
    const hours = d?.hour_to_hour ?? [];
    if (!date || !Array.isArray(hours)) return [];
    return hours.map((h: any) => ({ date, hour: h?.hour, rain: h?.rain }));
  });

  hourBlocks.forEach((h: any) => {
    const mmh = h?.rain;
    if (typeof mmh !== "number") return;
    if (mmh <= RAIN_MM_H_THRESHOLD) return;

    const iso = toIso(h.date, h.hour);
    const dt = safeParseToDate(iso);
    if (!dt) return;
    if (dt < minDate || dt > maxDate) return;

    const key = `${location.climaTempoCod}|${iso}`;
    const existing = byKey.get(key);
    const trigger = { type: "rain_mm_h" as const, value: mmh, unit: "mm/h", source: "hourly" as const };

    if (existing) {
      existing.triggers = mergeTriggers(existing.triggers, trigger);
      existing.severity = severityFromTriggers(existing.triggers);
      return;
    }

    byKey.set(key, {
      id: key,
      dateTimeIso: iso,
      location,
      triggers: [trigger],
      severity: severityFromTriggers([trigger]),
      context: { confidence: "Previsão horária (72h)" },
    });
  });

  return Array.from(byKey.values());
};