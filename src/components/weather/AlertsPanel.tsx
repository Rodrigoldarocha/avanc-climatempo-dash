import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { AlertTriangle, Droplets, Percent, RefreshCw, ChevronRight } from "lucide-react";

import type { Location } from "@/data/locations";
import { locations } from "@/data/locations";
import { get15DayForecast, get72HourForecast } from "@/services/climatempo";
import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportAlertsPdfButton } from "@/components/weather/ExportAlertsPdfButton";

type TriggerType = "rain_mm_h" | "rain_probability";
type Severity = "high" | "moderate";

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

const RAIN_MM_H_THRESHOLD = 20;
const RAIN_PROB_THRESHOLD = 70;
const DAYS_WINDOW = 7;

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

const runWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = [];
  let idx = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }).map(async () => {
    while (idx < items.length) {
      const current = items[idx++];
      const res = await worker(current);
      results.push(res);
    }
  });

  await Promise.all(runners);
  return results;
};

const buildAlertsForLocation = async (location: Location): Promise<WeatherAlert[]> => {
  const [daily, hourly] = await Promise.all([
    get15DayForecast(location.climaTempoCod),
    get72HourForecast(location.climaTempoCod),
  ]);

  const now = new Date();
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + DAYS_WINDOW);

  const byKey = new Map<string, WeatherAlert>();

  const dailyDays = (daily.data ?? []).slice(0, DAYS_WINDOW);
  dailyDays.forEach((d, i) => {
    const prob = d?.rain?.probability;
    if (typeof prob !== "number") return;
    if (prob <= RAIN_PROB_THRESHOLD) return;

    const iso = toIso(d.date);
    const dt = safeParseToDate(iso);
    if (!dt) return;
    if (dt < now || dt > maxDate) return;

    const key = `${location.climaTempoCod}|${iso}`;
    const existing = byKey.get(key);
    const trigger = {
      type: "rain_probability" as const,
      value: prob,
      unit: "%",
      source: "daily" as const,
    };

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

  const hourBlocks = (hourly.data ?? []).flatMap((d) => {
    const date = d?.date;
    const hours = d?.hour_to_hour ?? [];
    if (!date || !Array.isArray(hours)) return [];
    return hours.map((h) => ({ date, hour: h?.hour, rain: h?.rain }));
  });

  hourBlocks.forEach((h) => {
    const mmh = h?.rain;
    if (typeof mmh !== "number") return;
    if (mmh <= RAIN_MM_H_THRESHOLD) return;

    const iso = toIso(h.date, h.hour);
    const dt = safeParseToDate(iso);
    if (!dt) return;
    if (dt < now || dt > maxDate) return;

    const key = `${location.climaTempoCod}|${iso}`;
    const existing = byKey.get(key);
    const trigger = {
      type: "rain_mm_h" as const,
      value: mmh,
      unit: "mm/h",
      source: "hourly" as const,
    };

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
        confidence: "Previsão horária (72h)",
      },
    });
  });

  return Array.from(byKey.values());
};

const mergeTriggers = (
  current: WeatherAlert["triggers"],
  incoming: WeatherAlert["triggers"][number],
) => {
  const exists = current.some((t) => t.type === incoming.type);
  if (exists) {
    return current.map((t) => (t.type === incoming.type ? incoming : t));
  }
  return [...current, incoming];
};

const formatDateTime = (isoLike: string) => {
  const d = safeParseToDate(isoLike);
  if (!d) return isoLike;
  return format(d, "dd/MM HH:mm");
};

const formatDateTimeFull = (isoLike: string) => {
  const d = safeParseToDate(isoLike);
  if (!d) return isoLike;
  return format(d, "dd/MM/yyyy HH:mm");
};

// Mobile-first Alert Card Component
const AlertCard = ({ alert }: { alert: WeatherAlert }) => {
  const isHigh = alert.severity === "high";
  
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-colors",
      isHigh 
        ? "bg-destructive/10 border-destructive/30" 
        : "bg-amber-500/10 border-amber-500/30"
    )}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{alert.location.local}</div>
          <div className="text-xs text-muted-foreground">
            {alert.location.city}/{alert.location.state}
          </div>
        </div>
        <Badge variant={isHigh ? "destructive" : "default"} className="shrink-0 text-[10px]">
          {isHigh ? "Alta" : "Moderada"}
        </Badge>
      </div>
      
      {/* Date/Time */}
      <div className="text-xs text-muted-foreground mb-2">
        📅 {formatDateTime(alert.dateTimeIso)}
      </div>
      
      {/* Triggers */}
      <div className="flex flex-wrap gap-2">
        {alert.triggers.map((t) => (
          <div 
            key={t.type} 
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50 text-xs"
          >
            {t.type === "rain_mm_h" ? (
              <Droplets className="h-3 w-3 text-sky-400" />
            ) : (
              <Percent className="h-3 w-3 text-amber-400" />
            )}
            <span className="font-semibold">{t.value}{t.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AlertsPanel = ({ selectedLocation }: { selectedLocation?: Location | null }) => {
  const query = useQuery({
    queryKey: ["alerts", "7d", RAIN_MM_H_THRESHOLD, RAIN_PROB_THRESHOLD],
    queryFn: async () => {
      const perLocation = await runWithConcurrency(locations, 6, buildAlertsForLocation);
      return perLocation.flat();
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const sortedAlerts = useMemo(() => {
    const list = query.data ?? [];
    return [...list].sort((a, b) => {
      const da = safeParseToDate(a.dateTimeIso)?.getTime() ?? 0;
      const db = safeParseToDate(b.dateTimeIso)?.getTime() ?? 0;
      return da - db;
    });
  }, [query.data]);

  const total = sortedAlerts.length;
  const highCount = sortedAlerts.filter(a => a.severity === "high").length;
  const modCount = sortedAlerts.filter(a => a.severity === "moderate").length;
  const isLoading = query.isLoading;

  return (
    <section className="space-y-3">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="h-4 w-4 text-foreground shrink-0" />
            <h2 className="font-display font-semibold text-sm sm:text-base truncate">
              Alertas (7 dias)
            </h2>
            <Badge variant={total > 0 ? "destructive" : "secondary"} className="text-[10px] shrink-0">
              {total}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1.5">
            <ExportAlertsPdfButton
              alerts={sortedAlerts}
              rainMmhThreshold={RAIN_MM_H_THRESHOLD}
              rainProbThreshold={RAIN_PROB_THRESHOLD}
              daysWindow={DAYS_WINDOW}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 sm:w-auto sm:px-3 sm:gap-2"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", query.isFetching && "animate-spin")} />
              <span className="hidden sm:inline text-xs">Atualizar</span>
            </Button>
          </div>
        </div>
        
        {/* Summary Stats - Mobile Optimized */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Chuva &gt;{RAIN_MM_H_THRESHOLD}mm/h</span>
          <span>•</span>
          <span>Prob &gt;{RAIN_PROB_THRESHOLD}%</span>
          {total > 0 && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-destructive">{highCount} alta</span>
              <span className="hidden sm:inline text-amber-500">{modCount} moderada</span>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Carregando alertas...
        </div>
      ) : query.isError ? (
        <div className="text-sm text-destructive py-8 text-center">
          Falha ao carregar. Tente novamente.
        </div>
      ) : total === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          ✅ Nenhum alerta crítico no período.
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {sortedAlerts.slice(0, 30).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
          
          {sortedAlerts.length > 30 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              + {sortedAlerts.length - 30} alertas adicionais
            </p>
          )}

          {/* Expandable Details */}
          <Accordion type="single" collapsible className="rounded-lg border border-border/30 mt-4">
            <AccordionItem value="details">
              <AccordionTrigger className="px-4 text-sm">
                <span className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Ver detalhes expandidos
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {sortedAlerts.slice(0, 20).map((alert) => (
                    <div key={`${alert.id}-detail`} className="p-3 rounded-md bg-secondary/20 border border-border/20">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-medium text-sm">{alert.location.local}</div>
                          <div className="text-xs text-muted-foreground">
                            {alert.location.city}/{alert.location.state} • {formatDateTimeFull(alert.dateTimeIso)}
                          </div>
                        </div>
                        <Badge variant={alert.severity === "high" ? "destructive" : "default"} className="text-[10px]">
                          {alert.severity === "high" ? "Alta" : "Moderada"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2 rounded bg-background/50">
                          <div className="text-muted-foreground mb-1">Uniorg</div>
                          <div className="font-medium">{alert.location.uniorg}</div>
                        </div>
                        <div className="p-2 rounded bg-background/50">
                          <div className="text-muted-foreground mb-1">Disparos</div>
                          {alert.triggers.map((t) => (
                            <div key={t.type} className="font-medium">
                              {t.type === "rain_mm_h" ? "Chuva" : "Prob."}: {t.value}{t.unit}
                            </div>
                          ))}
                        </div>
                        <div className="p-2 rounded bg-background/50">
                          <div className="text-muted-foreground mb-1">Fonte</div>
                          <div className="font-medium">{alert.context?.confidence ?? "Diária (7d)"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </section>
  );
};
