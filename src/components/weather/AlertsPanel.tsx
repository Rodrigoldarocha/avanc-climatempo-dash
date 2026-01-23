import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { AlertTriangle, Droplets, Percent, RefreshCw } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  // Defensive parsing: the API may return different formats.
  // Prefer ISO if it already looks like one.
  if (!hour) return date;

  const safeHour = hour.includes(":") ? hour : `${hour}:00`;
  // If date already contains time, keep it.
  if (date.includes("T") || date.includes(" ")) return date;
  return `${date}T${safeHour}`;
};

const safeParseToDate = (isoLike: string): Date | null => {
  try {
    // parseISO expects ISO; if it's not, Date fallback.
    const d = isoLike.includes("T") ? parseISO(isoLike) : new Date(isoLike);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const severityFromTriggers = (triggers: WeatherAlert["triggers"]): Severity => {
  const prob = triggers.find((t) => t.type === "rain_probability")?.value;
  const mmh = triggers.find((t) => t.type === "rain_mm_h")?.value;

  // Regra simples e visual:
  // - high: prob >= 90% OU chuva >= 40 mm/h
  // - moderate: acima dos limiares base
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
      // eslint-disable-next-line no-await-in-loop
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

  // Daily probability alerts (7 days)
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

  // Hourly rain volume alerts (72h subset within 7 days)
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
  return format(d, "dd/MM/yyyy HH:mm");
};

export const AlertsPanel = ({ selectedLocation }: { selectedLocation?: Location | null }) => {
  const query = useQuery({
    queryKey: ["alerts", "7d", RAIN_MM_H_THRESHOLD, RAIN_PROB_THRESHOLD],
    queryFn: async () => {
      // 55 locais => limitar concorrência para não estourar rate-limit.
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
      return da - db; // ordem crescente (mais próximos primeiro)
    });
  }, [query.data]);

  const total = sortedAlerts.length;

  const isLoading = query.isLoading;

  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-foreground" />
            <h2 className="font-display font-semibold">Resumo de alertas (próximos 7 dias)</h2>
          </div>
          <Badge variant={total > 0 ? "destructive" : "secondary"} className="ml-1">
            {total} alerta{total === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <ExportAlertsPdfButton
            alerts={sortedAlerts}
            rainMmhThreshold={RAIN_MM_H_THRESHOLD}
            rainProbThreshold={RAIN_PROB_THRESHOLD}
            daysWindow={DAYS_WINDOW}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw className={cn("h-4 w-4", query.isFetching && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Critérios: chuva &gt; {RAIN_MM_H_THRESHOLD} mm/h (janela 72h) <span className="mx-1">OU</span> probabilidade &gt; {RAIN_PROB_THRESHOLD}% (7 dias).
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando alertas para todos os locais…</div>
      ) : query.isError ? (
        <div className="text-sm text-destructive">Falha ao carregar alertas. Tente novamente.</div>
      ) : total === 0 ? (
        <div className="text-sm text-muted-foreground">Nenhum alerta crítico encontrado no período.</div>
      ) : (
        <div className="rounded-lg border border-border/30 bg-card/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Data/Hora</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Parâmetro(s)</TableHead>
                <TableHead className="w-[150px]">Valor(es)</TableHead>
                <TableHead className="w-[120px]">Severidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAlerts.slice(0, 250).map((alert) => {
                const isHigh = alert.severity === "high";
                const badgeVariant = isHigh ? "destructive" : "default";

                return (
                  <TableRow key={alert.id} className="align-top">
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDateTime(alert.dateTimeIso)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium leading-tight">{alert.location.local}</div>
                      <div className="text-[11px] text-muted-foreground">{alert.location.city} • {alert.location.state}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {alert.triggers.map((t) => (
                          <Badge key={t.type} variant="outline" className="gap-1">
                            {t.type === "rain_mm_h" ? (
                              <Droplets className="h-3 w-3" />
                            ) : (
                              <Percent className="h-3 w-3" />
                            )}
                            <span>
                              {t.type === "rain_mm_h" ? "Chuva" : "Prob."}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {alert.triggers.map((t) => (
                          <div key={t.type} className="text-sm font-semibold">
                            {t.value}{t.unit}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant}>
                        {isHigh ? "Alta" : "Moderada"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detalhes expansíveis (visão resumida + contexto) */}
      {total > 0 && (
        <Accordion type="single" collapsible className="rounded-lg border border-border/30">
          {sortedAlerts.slice(0, 50).map((alert) => (
            <AccordionItem key={`${alert.id}-details`} value={alert.id}>
              <AccordionTrigger className="px-4">
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="text-left">
                    <div className="font-medium">
                      {alert.location.local} — {formatDateTime(alert.dateTimeIso)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {alert.location.city}/{alert.location.state} • disparo por {alert.triggers.map((t) => (t.type === "rain_mm_h" ? "chuva" : "probabilidade")).join(" + ")}
                    </div>
                  </div>
                  <Badge variant={alert.severity === "high" ? "destructive" : "default"} className="shrink-0">
                    {alert.severity === "high" ? "Alta" : "Moderada"}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-md border border-border/30 p-3">
                    <div className="text-xs text-muted-foreground mb-1">Identificação</div>
                    <div className="font-medium">Uniorg: {alert.location.uniorg}</div>
                    <div className="text-muted-foreground text-xs">ID Climatempo: {alert.location.climaTempoCod}</div>
                  </div>

                  <div className="rounded-md border border-border/30 p-3">
                    <div className="text-xs text-muted-foreground mb-1">Disparo</div>
                    <div className="space-y-1">
                      {alert.triggers.map((t) => (
                        <div key={t.type} className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">
                            {t.type === "rain_mm_h" ? "Chuva (mm/h)" : "Probabilidade (%)"}
                          </span>
                          <span className="font-semibold">{t.value}{t.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border border-border/30 p-3">
                    <div className="text-xs text-muted-foreground mb-1">Contexto</div>
                    <div className="text-xs text-muted-foreground">
                      {alert.context?.confidence ?? "Previsão diária (7 dias)"}
                    </div>
                    <div className="mt-2 space-y-1">
                      {alert.context?.adjacent?.prev && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">{alert.context.adjacent.prev.label}</span>
                          <span className="font-medium">{alert.context.adjacent.prev.value}{alert.context.adjacent.prev.unit}</span>
                        </div>
                      )}
                      {alert.context?.adjacent?.next && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">{alert.context.adjacent.next.label}</span>
                          <span className="font-medium">{alert.context.adjacent.next.value}{alert.context.adjacent.next.unit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </section>
  );
};
