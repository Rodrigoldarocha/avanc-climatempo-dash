import { useQuery } from "@tanstack/react-query";
import { getHistoricalData } from "@/services/climatempo";
import { Skeleton } from "@/components/ui/skeleton";
import { History, TrendingUp, TrendingDown, Droplets } from "lucide-react";
import type { Location } from "@/data/locations";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { format, parseISO, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoricalChartProps {
  location: Location;
}

export const HistoricalChart = ({ location }: HistoricalChartProps) => {
  const fromDate = format(subMonths(new Date(), 6), "yyyy-MM-dd");

  const { data, isLoading, error } = useQuery({
    queryKey: ["historicalData", location.climaTempoCod, fromDate],
    queryFn: () => getHistoricalData(location.climaTempoCod, fromDate),
    retry: 2,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  if (isLoading) {
    return <HistoricalChartSkeleton />;
  }

  if (error || !data?.data || data.data.length === 0) {
    return (
      <div className="weather-card p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-display font-semibold">
            Histórico Climático
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Não foi possível carregar o histórico climático.
          </p>
        </div>
      </div>
    );
  }

  const chartData = data.data.map((day) => ({
    date: day.date,
    dateLabel: format(parseISO(day.date), "dd/MM", { locale: ptBR }),
    min: day.temperature_min ?? 0,
    max: day.temperature_max ?? 0,
    rain: day.rain ?? 0,
    humidityMin: day.humidity_min ?? 0,
    humidityMax: day.humidity_max ?? 0,
  }));

  // Calculate stats with safe number handling
  const avgMax =
    chartData.reduce((sum, d) => sum + (Number(d.max) || 0), 0) / chartData.length;
  const avgMin =
    chartData.reduce((sum, d) => sum + (Number(d.min) || 0), 0) / chartData.length;
  const totalRain = chartData.reduce((sum, d) => sum + (Number(d.rain) || 0), 0);
  const maxTemp = Math.max(...chartData.map((d) => Number(d.max) || 0));
  const minTemp = Math.min(...chartData.map((d) => Number(d.min) || 0));

  return (
    <div className="weather-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-display font-semibold">
            Histórico Climático
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          Últimos {chartData.length} dias
        </span>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-muted-foreground">Máx. Média</span>
          </div>
          <div className="text-xl font-semibold">{avgMax.toFixed(1)}°C</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">Mín. Média</span>
          </div>
          <div className="text-xl font-semibold">{avgMin.toFixed(1)}°C</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">
              Precip. Total
            </span>
          </div>
          <div className="text-xl font-semibold">{totalRain.toFixed(1)}mm</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">Amplitude</span>
          </div>
          <div className="text-xl font-semibold">
            {minTemp.toFixed(0)}° - {maxTemp.toFixed(0)}°C
          </div>
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="chart-container mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">
          Temperatura (°C)
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="tempMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(15, 90%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(15, 90%, 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tempMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 25%)" />
            <XAxis
              dataKey="dateLabel"
              stroke="hsl(200, 10%, 50%)"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis stroke="hsl(200, 10%, 50%)" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(200, 25%, 14%)",
                border: "1px solid hsl(200, 20%, 25%)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(60, 20%, 95%)" }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="max"
              name="Máxima"
              stroke="hsl(15, 90%, 55%)"
              fill="url(#tempMax)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="min"
              name="Mínima"
              stroke="hsl(210, 80%, 55%)"
              fill="url(#tempMin)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Rain Chart */}
      <div className="chart-container">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">
          Precipitação (mm)
        </h4>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 25%)" />
            <XAxis
              dataKey="dateLabel"
              stroke="hsl(200, 10%, 50%)"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis stroke="hsl(200, 10%, 50%)" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(200, 25%, 14%)",
                border: "1px solid hsl(200, 20%, 25%)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(60, 20%, 95%)" }}
            />
            <Bar
              dataKey="rain"
              name="Precipitação"
              fill="hsl(210, 80%, 55%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const HistoricalChartSkeleton = () => (
  <div className="weather-card p-6">
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5 rounded-full" />
      <Skeleton className="h-6 w-48" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-64 rounded-xl" />
  </div>
);
