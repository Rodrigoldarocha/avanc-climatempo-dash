import { useQuery } from "@tanstack/react-query";
import { get72HourForecast, formatTemperature } from "@/services/climatempo";
import { WeatherIcon } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Clock, Droplets, Wind } from "lucide-react";
import type { Location } from "@/data/locations";

interface HourlyForecastCardProps {
  location: Location;
}

export const HourlyForecastCard = ({ location }: HourlyForecastCardProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["hourlyForecast", location.climaTempoCod],
    queryFn: () => get72HourForecast(location.climaTempoCod),
    retry: 2,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  if (isLoading) {
    return <HourlyForecastSkeleton />;
  }

  if (error || !data?.data) {
    return (
      <div className="weather-card p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-display font-semibold">Previsão 72h</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Não foi possível carregar a previsão horária.
          </p>
        </div>
      </div>
    );
  }

  // Flatten all hourly data
  const allHours = data.data.flatMap((day) =>
    day.hour_to_hour.map((hour) => ({
      ...hour,
      date: day.date,
      date_br: day.date_br,
    }))
  );

  return (
    <div className="weather-card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-display font-semibold">Próximas 72 Horas</h3>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-4">
          {allHours.slice(0, 24).map((hour, index) => (
            <div
              key={`${hour.date}-${hour.hour}-${index}`}
              className="flex flex-col items-center p-3 rounded-xl bg-secondary/30 border border-border/30 min-w-[80px] hover:bg-secondary/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground font-medium">
                {hour.hour}
              </span>
              <WeatherIcon condition={hour.icon} size="sm" className="my-2" />
              <span className="font-semibold text-sm">
                {formatTemperature(hour.temp)}
              </span>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Droplets className="h-3 w-3 text-blue-400" />
                <span>{hour.rain}mm</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Wind className="h-3 w-3" />
                <span>{hour.wind_velocity}</span>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Daily Summary */}
      {data.data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Resumo por Dia
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.data.map((day, index) => {
              const temps = day.hour_to_hour.map((h) => h.temp);
              const minTemp = Math.min(...temps);
              const maxTemp = Math.max(...temps);
              const totalRain = day.hour_to_hour.reduce(
                (sum, h) => sum + h.rain,
                0
              );

              return (
                <div
                  key={day.date}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <WeatherIcon
                      condition={day.hour_to_hour[12]?.icon || "1"}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium text-sm">
                        {index === 0
                          ? "Hoje"
                          : index === 1
                          ? "Amanhã"
                          : day.date_br}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTemperature(minTemp)} /{" "}
                        {formatTemperature(maxTemp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-400">
                    <Droplets className="h-3 w-3" />
                    <span>{totalRain.toFixed(1)}mm</span>
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
  <div className="weather-card p-6">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-5 w-5 rounded-full" />
      <Skeleton className="h-6 w-40" />
    </div>
    <div className="flex gap-3 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-20 rounded-xl flex-shrink-0" />
      ))}
    </div>
  </div>
);
