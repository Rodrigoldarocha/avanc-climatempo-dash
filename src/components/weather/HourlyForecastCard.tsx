import { useQuery } from "@tanstack/react-query";
import { get72HourForecast, formatTemperature } from "@/services/climatempo";
import { WeatherIcon } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Clock, Droplets, AlertCircle } from "lucide-react";
import type { Location } from "@/data/locations";

interface HourlyForecastCardProps {
  location: Location;
}

export const HourlyForecastCard = ({ location }: HourlyForecastCardProps) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["hourlyForecast", location.climaTempoCod],
    queryFn: () => get72HourForecast(location.climaTempoCod),
    retry: 2,
    staleTime: 30 * 60 * 1000,
  });

  if (isLoading) {
    return <HourlyForecastSkeleton />;
  }

  // Handle different API response structures
  let forecastData: Array<{ date?: string; date_br?: string; hour_to_hour?: any[]; hourly?: any[] }> = [];
  
  if (data?.data) {
    if (Array.isArray(data.data)) {
      forecastData = data.data;
    } else if (typeof data.data === 'object') {
      const dataObj = data.data as { hour_to_hour?: any[] };
      if (dataObj.hour_to_hour) {
        forecastData = [data.data as typeof forecastData[0]];
      }
    }
  }

  // Extract hourly data
  const allHours = forecastData.flatMap((day: any) => {
    if (!day) return [];
    const hours = day.hour_to_hour || day.hourly || [];
    if (!Array.isArray(hours)) return [];
    return hours.map((hour: any) => ({
      ...hour,
      date: day.date,
      date_br: day.date_br,
    }));
  });

  const hasData = allHours.length > 0;

  if (error || !hasData) {
    return (
      <div className="weather-card p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-display font-semibold">Previsão 72h</h3>
          </div>
          <button 
            onClick={() => refetch()}
            className="text-xs text-primary hover:underline"
          >
            Tentar novamente
          </button>
        </div>
        <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Previsão horária indisponível para esta localidade</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-card p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-display font-semibold">Próximas Horas</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {allHours.length}h disponíveis
        </span>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {allHours.slice(0, 24).map((hour: any, index: number) => (
            <div
              key={`${hour.date}-${hour.hour || index}-${index}`}
              className="flex flex-col items-center p-2 rounded-lg bg-secondary/20 border border-border/20 min-w-[56px] hover:bg-secondary/40 transition-colors"
            >
              <span className="text-[10px] text-muted-foreground font-medium">
                {hour.hour || `${index}h`}
              </span>
              <WeatherIcon condition={hour.icon || "1"} size="xs" className="my-1" />
              <span className="font-semibold text-xs tabular-nums">
                {Math.round(hour.temp || 0)}°
              </span>
              {(hour.rain !== undefined && hour.rain > 0) && (
                <div className="flex items-center gap-0.5 mt-1 text-[9px] text-sky-400">
                  <Droplets className="h-2.5 w-2.5" />
                  <span>{hour.rain}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Daily Summary - Compact */}
      {forecastData.length > 1 && (
        <div className="mt-3 pt-3 border-t border-border/20">
          <div className="grid grid-cols-3 gap-2">
            {forecastData.slice(0, 3).map((day: any, index: number) => {
              const hours = day?.hour_to_hour || [];
              if (!Array.isArray(hours) || hours.length === 0) return null;
              
              const temps = hours.map((h: any) => h.temp || 0);
              const minTemp = Math.min(...temps);
              const maxTemp = Math.max(...temps);

              return (
                <div
                  key={day.date || index}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                >
                  <WeatherIcon
                    condition={hours[12]?.icon || hours[0]?.icon || "1"}
                    size="xs"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] font-medium truncate">
                      {index === 0 ? "Hoje" : index === 1 ? "Amanhã" : day.date_br?.slice(0, 5)}
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      {Math.round(minTemp)}° / {Math.round(maxTemp)}°
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const HourlyForecastSkeleton = () => (
  <div className="weather-card p-4">
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-28" />
    </div>
    <div className="flex gap-2 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-14 rounded-lg flex-shrink-0" />
      ))}
    </div>
  </div>
);
