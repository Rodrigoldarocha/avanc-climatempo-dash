import { useQuery } from "@tanstack/react-query";
import { get15DayForecast } from "@/services/climatempo";
import { WeatherIcon } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Droplets, Wind, AlertCircle } from "lucide-react";
import type { Location } from "@/data/locations";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyForecastCardProps {
  location: Location;
}

export const DailyForecastCard = ({ location }: DailyForecastCardProps) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dailyForecast", location.climaTempoCod],
    queryFn: () => get15DayForecast(location.climaTempoCod),
    retry: 2,
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) {
    return <DailyForecastSkeleton />;
  }

  const forecastData = Array.isArray(data?.data) ? data.data : [];
  const hasData = forecastData.length > 0;

  if (error || !hasData) {
    return (
      <div className="weather-card p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-display font-semibold">15 Dias</h3>
          </div>
          <button onClick={() => refetch()} className="text-xs text-primary hover:underline">
            Tentar novamente
          </button>
        </div>
        <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Previsão indisponível</p>
        </div>
      </div>
    );
  }

  const getDayLabel = (dateStr: string, index: number) => {
    if (index === 0) return "Hoje";
    if (index === 1) return "Amanhã";
    try {
      return format(parseISO(dateStr), "EEE, dd", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="weather-card p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-display font-semibold">Próximos 15 Dias</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">{forecastData.length}d</span>
      </div>

      <div className="space-y-1">
        {forecastData.map((day, index) => {
          const minTemp = day.temperature?.min ?? 0;
          const maxTemp = day.temperature?.max ?? 0;
          const rainProb = day.rain?.probability ?? 0;
          const windMax = day.wind?.velocity_max ?? 0;
          const icon = day.text_icon?.icon?.day || "1";

          return (
            <div
              key={day.date || index}
              className="flex items-center gap-2 p-2 rounded-md bg-secondary/15 border border-border/10 hover:bg-secondary/25 transition-colors"
            >
              <WeatherIcon condition={icon} size="xs" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-medium capitalize truncate">
                  {getDayLabel(day.date, index)}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-sky-400 tabular-nums">{Math.round(minTemp)}°</span>
                <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-sky-400 to-orange-400 opacity-50" />
                <span className="text-[9px] text-orange-400 font-medium tabular-nums">{Math.round(maxTemp)}°</span>
              </div>
              <div className="flex items-center gap-0.5 min-w-[32px]">
                <Droplets className="h-2.5 w-2.5 text-sky-400" />
                <span className="text-[9px] text-muted-foreground tabular-nums">{rainProb}%</span>
              </div>
              <div className="hidden sm:flex items-center gap-0.5 min-w-[36px]">
                <Wind className="h-2.5 w-2.5 text-slate-400" />
                <span className="text-[9px] text-muted-foreground tabular-nums">{windMax}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DailyForecastSkeleton = () => (
  <div className="weather-card p-4">
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-28" />
    </div>
    <div className="space-y-1">
      {[...Array(7)].map((_, i) => (
        <Skeleton key={i} className="h-9 rounded-md" />
      ))}
    </div>
  </div>
);
