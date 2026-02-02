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
import { useIsMobile } from "@/hooks/use-mobile";

interface HistoricalChartProps {
  location: Location;
}

export const HistoricalChart = ({ location }: HistoricalChartProps) => {
  const isMobile = useIsMobile();
  const fromDate = format(subMonths(new Date(), 6), "yyyy-MM-dd");

  const { data, isLoading, error } = useQuery({
    queryKey: ["historicalData", location.climaTempoCod, fromDate],
    queryFn: () => getHistoricalData(location.climaTempoCod, fromDate),
    retry: 2,
    staleTime: 24 * 60 * 60 * 1000,
  });

  if (isLoading) {
    return <HistoricalChartSkeleton />;
  }

  if (error || !data?.data || data.data.length === 0) {
    return (
      <div className="weather-card p-4 sm:p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="text-sm sm:text-lg font-display font-semibold">
            Histórico Climático
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            Não foi possível carregar o histórico.
          </p>
        </div>
      </div>
    );
  }

  const chartData = data.data.map((day) => {
    const rainValue = typeof day.rain === 'object' && day.rain !== null 
      ? (day.rain as { precipitation?: number }).precipitation ?? 0
      : (day.rain ?? 0);
    
    return {
      date: day.date,
      dateLabel: format(parseISO(day.date), isMobile ? "dd" : "dd/MM", { locale: ptBR }),
      min: Number(day.temperature_min) || 0,
      max: Number(day.temperature_max) || 0,
      rain: Number(rainValue) || 0,
      humidityMin: Number(day.humidity_min) || 0,
      humidityMax: Number(day.humidity_max) || 0,
    };
  });

  const avgMax = chartData.reduce((sum, d) => sum + d.max, 0) / chartData.length;
  const avgMin = chartData.reduce((sum, d) => sum + d.min, 0) / chartData.length;
  const totalRain = chartData.reduce((sum, d) => sum + d.rain, 0);
  const maxTemp = Math.max(...chartData.map((d) => d.max));
  const minTemp = Math.min(...chartData.map((d) => d.min));

  return (
    <div className="weather-card p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="text-sm sm:text-lg font-display font-semibold">
            Histórico Climático
          </h3>
        </div>
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          {chartData.length} dias
        </span>
      </div>

      {/* Stats Summary - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 mb-4 sm:mb-6">
        <div className="stat-card p-2.5 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Máx. Média</span>
          </div>
          <div className="text-base sm:text-xl font-semibold">{avgMax.toFixed(1)}°</div>
        </div>
        <div className="stat-card p-2.5 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Mín. Média</span>
          </div>
          <div className="text-base sm:text-xl font-semibold">{avgMin.toFixed(1)}°</div>
        </div>
        <div className="stat-card p-2.5 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Droplets className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Precip.</span>
          </div>
          <div className="text-base sm:text-xl font-semibold">{totalRain.toFixed(0)}mm</div>
        </div>
        <div className="stat-card p-2.5 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Amplitude</span>
          </div>
          <div className="text-base sm:text-xl font-semibold">
            {minTemp.toFixed(0)}°-{maxTemp.toFixed(0)}°
          </div>
        </div>
      </div>

      {/* Temperature Chart - Mobile Responsive */}
      <div className="chart-container mb-4 sm:mb-6 p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4">
          Temperatura (°C)
        </h4>
        <ResponsiveContainer width="100%" height={isMobile ? 180 : 250}>
          <AreaChart data={chartData} margin={{ left: isMobile ? -20 : 0, right: 5 }}>
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
              tick={{ fontSize: isMobile ? 8 : 10 }}
              interval={isMobile ? "preserveStartEnd" : "preserveStartEnd"}
              tickMargin={5}
            />
            <YAxis 
              stroke="hsl(200, 10%, 50%)" 
              tick={{ fontSize: isMobile ? 8 : 10 }} 
              width={isMobile ? 30 : 40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(200, 25%, 14%)",
                border: "1px solid hsl(200, 20%, 25%)",
                borderRadius: "8px",
                fontSize: isMobile ? 10 : 12,
              }}
              labelStyle={{ color: "hsl(60, 20%, 95%)" }}
            />
            {!isMobile && <Legend />}
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
        {isMobile && (
          <div className="flex justify-center gap-4 mt-2 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-400" /> Máx
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Mín
            </span>
          </div>
        )}
      </div>

      {/* Rain Chart - Mobile Responsive */}
      <div className="chart-container p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4">
          Precipitação (mm)
        </h4>
        <ResponsiveContainer width="100%" height={isMobile ? 120 : 180}>
          <BarChart data={chartData} margin={{ left: isMobile ? -20 : 0, right: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 25%)" />
            <XAxis
              dataKey="dateLabel"
              stroke="hsl(200, 10%, 50%)"
              tick={{ fontSize: isMobile ? 8 : 10 }}
              interval={isMobile ? "preserveStartEnd" : "preserveStartEnd"}
              tickMargin={5}
            />
            <YAxis 
              stroke="hsl(200, 10%, 50%)" 
              tick={{ fontSize: isMobile ? 8 : 10 }} 
              width={isMobile ? 30 : 40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(200, 25%, 14%)",
                border: "1px solid hsl(200, 20%, 25%)",
                borderRadius: "8px",
                fontSize: isMobile ? 10 : 12,
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
  <div className="weather-card p-4 sm:p-6">
    <div className="flex items-center gap-2 mb-4 sm:mb-6">
      <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full" />
      <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 mb-4 sm:mb-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-16 sm:h-20 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-48 sm:h-64 rounded-xl" />
  </div>
);
