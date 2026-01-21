import { useQuery } from "@tanstack/react-query";
import { get72HourForecast } from "@/services/climatempo";
import { WeatherIcon } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Clock, Droplets, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Location } from "@/data/locations";

interface HourlyForecastCardProps {
  location: Location;
}

export const HourlyForecastCard = ({ location }: HourlyForecastCardProps) => {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["hourlyForecast", location.climaTempoCod],
    queryFn: () => get72HourForecast(location.climaTempoCod),
    retry: 2,
    staleTime: 30 * 60 * 1000,
  });

  if (isLoading) {
    return <HourlyForecastSkeleton />;
  }

  // Parse the API response - it can come in different formats
  let allHours: Array<{
    date: string;
    date_br: string;
    hour: string;
    temp: number;
    humidity: number;
    rain: number;
    wind_direction: string;
    wind_velocity: number;
  }> = [];

  if (data?.data && Array.isArray(data.data)) {
    // New format: flat array with nested objects
    allHours = data.data.map((item: any) => {
      const date = item.date || "";
      const dateBr = item.date_br || "";
      // Extract hour from date string like "2026-01-19 14:00:00"
      const hourMatch = date.match(/(\d{2}):\d{2}:\d{2}$/);
      const hour = hourMatch ? `${hourMatch[1]}h` : "";
      
      // Handle rain which can be object or number
      let rainValue = 0;
      if (typeof item.rain === 'object' && item.rain !== null) {
        rainValue = item.rain.precipitation ?? 0;
      } else if (typeof item.rain === 'number') {
        rainValue = item.rain;
      }
      
      // Handle humidity which can be object or number
      let humidityValue = 0;
      if (typeof item.humidity === 'object' && item.humidity !== null) {
        humidityValue = item.humidity.humidity ?? 0;
      } else if (typeof item.humidity === 'number') {
        humidityValue = item.humidity;
      }
      
      return {
        date,
        date_br: dateBr,
        hour,
        temp: item.temperature?.temperature ?? item.temp ?? 0,
        humidity: humidityValue,
        rain: rainValue,
        wind_direction: item.wind?.direction ?? item.wind_direction ?? "",
        wind_velocity: item.wind?.velocity ?? item.wind_velocity ?? 0,
      };
    });
  } else if (data?.data && typeof data.data === 'object') {
    // Old format: object with hour_to_hour array
    const dataObj = data.data as { hour_to_hour?: any[]; date?: string; date_br?: string };
    if (dataObj.hour_to_hour && Array.isArray(dataObj.hour_to_hour)) {
      allHours = dataObj.hour_to_hour.map((hour: any) => ({
        date: dataObj.date || "",
        date_br: dataObj.date_br || "",
        hour: hour.hour || "",
        temp: hour.temp ?? 0,
        humidity: hour.humidity ?? 0,
        rain: hour.rain ?? 0,
        wind_direction: hour.wind_direction ?? "",
        wind_velocity: hour.wind_velocity ?? 0,
      }));
    }
  }

  const hasData = allHours.length > 0;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  if (error || !hasData) {
    return (
      <div className="weather-card p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-display font-semibold">Previsão 72h</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-6 text-xs gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Tentar novamente
          </Button>
        </div>
        <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Previsão horária indisponível para esta localidade</p>
        </div>
      </div>
    );
  }

  // Group hours by day for the summary
  const hoursByDay: Record<string, typeof allHours> = {};
  allHours.forEach((hour) => {
    const dayKey = hour.date.split(" ")[0];
    if (!hoursByDay[dayKey]) hoursByDay[dayKey] = [];
    hoursByDay[dayKey].push(hour);
  });
  const days = Object.entries(hoursByDay).slice(0, 3);

  return (
    <div className="weather-card p-4 sm:p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-base font-display font-semibold">Próximas Horas</h3>
          <span className="text-xs text-muted-foreground">
            {allHours.length}h disponíveis
          </span>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Atualizado: {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {allHours.slice(0, 24).map((hour, index) => (
            <div
              key={`${hour.date}-${index}`}
              className="flex flex-col items-center p-2.5 rounded-lg bg-secondary/20 border border-border/20 min-w-[64px] hover:bg-secondary/40 transition-colors"
            >
              <span className="text-xs text-muted-foreground font-medium">
                {hour.hour || `${index}h`}
              </span>
              <span className="font-semibold text-base tabular-nums my-1">
                {Math.round(hour.temp)}°
              </span>
              {Number(hour.rain) > 0 ? (
                <div className="flex items-center gap-0.5 text-xs text-sky-400">
                  <Droplets className="h-3 w-3" />
                  <span>{Number(hour.rain).toFixed(1)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Droplets className="h-3 w-3" />
                  <span>{Math.round(Number(hour.humidity) || 0)}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Daily Summary */}
      {days.length > 1 && (
        <div className="mt-4 pt-4 border-t border-border/20">
          <div className="grid grid-cols-3 gap-2">
            {days.map(([dayKey, hours], index) => {
              const temps = hours.map((h) => h.temp);
              const minTemp = Math.min(...temps);
              const maxTemp = Math.max(...temps);
              const dateParts = dayKey.split("-");
              const dayLabel = index === 0 ? "Hoje" : index === 1 ? "Amanhã" : `${dateParts[2]}/${dateParts[1]}`;

              return (
                <div
                  key={dayKey}
                  className="flex items-center gap-2 p-2.5 rounded-md bg-muted/30"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {dayLabel}
                    </div>
                    <div className="text-xs text-muted-foreground">
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
