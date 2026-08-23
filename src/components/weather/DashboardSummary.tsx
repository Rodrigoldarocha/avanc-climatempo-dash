import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { locations, getAllStates } from "@/data/locations";
import { getCurrentWeather } from "@/services/climatempo";
import { useAlertCount } from "@/hooks/useAlertCount";
import { useAlerts } from "@/hooks/useAlerts";
import { useApiStatus } from "@/hooks/useApiStatus";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Thermometer,
  Droplets,
  MapPin,
  CloudRain,
  Activity,
  TrendingUp,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DashboardSummaryProps {
  onOpenAlerts: () => void;
  onLocationSelect: (location: (typeof locations)[0]) => void;
}

export const DashboardSummary = ({ onOpenAlerts, onLocationSelect }: DashboardSummaryProps) => {
  const { highCount, totalCount } = useAlertCount();
  const { isOnline } = useApiStatus();

  // Current weather is fetched for every monitored location so the KPIs
  // reflect the whole network, not an arbitrary sample.
  const sampleLocations = locations;

  const weatherQueries = useQueries({
    queries: sampleLocations.map((loc) => ({
      queryKey: ["currentWeather", loc.climaTempoCod],
      queryFn: () => getCurrentWeather(loc.climaTempoCod),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })),
  });

  const weatherData = weatherQueries
    .filter((q) => q.data?.data)
    .map((q) => q.data!);

  const isLoading = weatherQueries.some((q) => q.isLoading);

  const stats = useMemo(() => {
    if (weatherData.length === 0) return null;

    const temps = weatherData.map((w) => w.data.temperature);
    const humidities = weatherData.map((w) => w.data.humidity);
    const winds = weatherData.map((w) => w.data.wind_velocity);

    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const avgWind = winds.reduce((a, b) => a + b, 0) / winds.length;

    const hottest = weatherData.find((w) => w.data.temperature === maxTemp);
    const coldest = weatherData.find((w) => w.data.temperature === minTemp);

    return { avgTemp, maxTemp, minTemp, avgHumidity, avgWind, hottest, coldest };
  }, [weatherData]);

  // Single source of truth for alerts (same query as the badge and the Alerts screen)
  const { data: alerts = [] } = useAlerts();

  const alertsByState = useMemo(() => {
    const byState: Record<string, { total: number; high: number }> = {};
    alerts.forEach((a: any) => {
      const st = a.location?.state;
      if (!st) return;
      if (!byState[st]) byState[st] = { total: 0, high: 0 };
      byState[st].total++;
      if (a.severity === "high") byState[st].high++;
    });
    return Object.entries(byState)
      .map(([state, counts]) => ({ state, ...counts }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);
  }, [alerts]);

  const states = getAllStates();

  return (
    <div className="space-y-4 animate-rise">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-4 w-4 text-primary shrink-0" />
        <span>{isOnline ? "Dados atualizados • API online" : "Sem conexão com a API"}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={onOpenAlerts}
          className="metric-card h-28 flex flex-col justify-between p-3 text-left transition-all duration-300 hover:border-destructive/40"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Alertas</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-[-0.05em] text-destructive">{totalCount || "—"}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {highCount > 0 ? `${highCount} alta severidade` : "Nenhum crítico"}
            </div>
          </div>
        </button>

        <div className="metric-card h-28 flex flex-col justify-between p-3">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-weather-hot" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Temperatura</span>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div>
              <div className="text-3xl font-bold tracking-[-0.05em]">{stats ? `${Math.round(stats.avgTemp)}°` : "—"}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {stats ? `${Math.round(stats.minTemp)}° • ${Math.round(stats.maxTemp)}°` : ""}
              </div>
            </div>
          )}
        </div>

        <div className="metric-card h-28 flex flex-col justify-between p-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-weather-rain" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Umidade</span>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div>
              <div className="text-3xl font-bold tracking-[-0.05em]">{stats ? `${Math.round(stats.avgHumidity)}%` : "—"}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Média geral</div>
            </div>
          )}
        </div>

        <div className="metric-card h-28 flex flex-col justify-between p-3">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-weather-cloud" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Vento</span>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div>
              <div className="text-3xl font-bold tracking-[-0.05em]">{stats ? `${Math.round(stats.avgWind)}` : "—"}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">km/h médio</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="metric-card h-24 flex flex-col justify-between p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Locais</span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-[-0.05em]">{locations.length}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{states.length} estados</div>
          </div>
        </div>
      </div>

      {stats?.hottest && stats?.coldest && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="metric-card flex items-center gap-3 p-3">
            <TrendingUp className="h-5 w-5 text-weather-hot shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Mais quente</div>
              <div className="text-sm font-semibold truncate">
                {stats.hottest.name} — {Math.round(stats.maxTemp)}°C
              </div>
            </div>
          </div>
          <div className="metric-card flex items-center gap-3 p-3">
            <TrendingUp className="h-5 w-5 text-weather-cold shrink-0 rotate-180" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Mais frio</div>
              <div className="text-sm font-semibold truncate">
                {stats.coldest.name} — {Math.round(stats.minTemp)}°C
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Distribution Chart */}
      {alertsByState.length > 0 && (
        <div className="chart-container">
          <h3 className="text-sm font-display font-semibold mb-3 flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-primary" />
            Distribuição de Alertas por Estado
          </h3>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertsByState} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <XAxis
                  dataKey="state"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === "high" ? "Alta" : "Total",
                  ]}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Total">
                  {alertsByState.map((entry, i) => (
                    <Cell
                      key={entry.state}
                      fill={
                        entry.high > 0
                          ? "hsl(var(--destructive))"
                          : "hsl(var(--primary))"
                      }
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
                <Bar dataKey="high" radius={[4, 4, 0, 0]} fill="hsl(var(--destructive))" name="Alta" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
