import { useQuery } from "@tanstack/react-query";
import { get15DayForecast, formatTemperature } from "@/services/climatempo";
import { WeatherIcon } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Droplets, Wind, Sunrise, Sunset } from "lucide-react";
import type { Location } from "@/data/locations";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyForecastCardProps {
  location: Location;
}

export const DailyForecastCard = ({ location }: DailyForecastCardProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dailyForecast", location.climaTempoCod],
    queryFn: () => get15DayForecast(location.climaTempoCod),
    retry: 2,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  if (isLoading) {
    return <DailyForecastSkeleton />;
  }

  const forecastData = Array.isArray(data?.data) ? data.data : [];
  const hasData = forecastData.length > 0;

  if (error || !hasData) {
    return (
      <div className="weather-card p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-display font-semibold">Previsão 15 Dias</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Não foi possível carregar a previsão de 15 dias.
          </p>
        </div>
      </div>
    );
  }

  const getDayLabel = (dateStr: string, index: number) => {
    if (index === 0) return "Hoje";
    if (index === 1) return "Amanhã";
    try {
      const date = parseISO(dateStr);
      return format(date, "EEEE, dd/MM", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="weather-card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-display font-semibold">
          Previsão para 15 Dias
        </h3>
      </div>

      <div className="space-y-3">
        {forecastData.map((day, index) => (
          <div
            key={day.date || index}
            className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/20 hover:bg-secondary/40 transition-colors"
          >
            {/* Day & Icon */}
            <div className="flex items-center gap-4 min-w-[200px]">
              <WeatherIcon
                condition={day.text_icon?.icon?.day || "1"}
                size="md"
              />
              <div>
                <div className="font-medium capitalize">
                  {getDayLabel(day.date, index)}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1 max-w-[150px]">
                  {day.text_icon?.text?.pt || ""}
                </div>
              </div>
            </div>

            {/* Temperature Range */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-sm">
                  {formatTemperature(day.temperature?.min ?? 0)}
                </span>
                <div className="w-16 h-2 rounded-full bg-gradient-to-r from-blue-400 via-yellow-400 to-orange-400 opacity-60" />
                <span className="text-orange-400 text-sm font-medium">
                  {formatTemperature(day.temperature?.max ?? 0)}
                </span>
              </div>
            </div>

            {/* Rain & Wind */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-400" />
                <div className="text-sm">
                  <span className="font-medium">
                    {day.rain?.probability ?? 0}%
                  </span>
                  <span className="text-muted-foreground text-xs ml-1">
                    ({day.rain?.precipitation ?? 0}mm)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-slate-400" />
                <span className="text-sm">
                  {day.wind?.velocity_max ?? 0} km/h
                </span>
              </div>
            </div>

            {/* Sunrise/Sunset */}
            <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Sunrise className="h-3 w-3 text-orange-400" />
                <span>{day.sun?.sunrise || "--:--"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Sunset className="h-3 w-3 text-purple-400" />
                <span>{day.sun?.sunset || "--:--"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DailyForecastSkeleton = () => (
  <div className="weather-card p-6">
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5 rounded-full" />
      <Skeleton className="h-6 w-48" />
    </div>
    <div className="space-y-3">
      {[...Array(7)].map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  </div>
);
