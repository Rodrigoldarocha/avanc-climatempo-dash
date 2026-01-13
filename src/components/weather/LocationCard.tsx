import { useQuery } from "@tanstack/react-query";
import { getCurrentWeather, formatTemperature } from "@/services/climatempo";
import { WeatherIcon } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import type { Location } from "@/data/locations";
import { cn } from "@/lib/utils";

interface LocationCardProps {
  location: Location;
  onClick: () => void;
  isSelected?: boolean;
}

export const LocationCard = ({ location, onClick, isSelected }: LocationCardProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["currentWeather", location.climaTempoCod],
    queryFn: () => getCurrentWeather(location.climaTempoCod),
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border/30 animate-pulse">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
    );
  }

  const weather = data?.data;
  const hasError = error || !weather;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl border transition-all duration-200 text-left group",
        "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10",
        isSelected 
          ? "bg-primary/20 border-primary shadow-lg shadow-primary/20" 
          : "bg-card/80 border-border/30 hover:border-primary/50 hover:bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <h3 className="font-semibold text-sm truncate">{location.city}</h3>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {location.state}
          </p>
        </div>
        
        {!hasError && weather && (
          <div className="flex items-center gap-2">
            <WeatherIcon condition={weather.icon} size="sm" />
            <span className="text-xl font-bold font-display">
              {formatTemperature(weather.temperature)}
            </span>
          </div>
        )}
        
        {hasError && (
          <span className="text-xs text-muted-foreground">--°C</span>
        )}
      </div>
      
      {!hasError && weather && (
        <div className="mt-2 pt-2 border-t border-border/20 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>💧 {weather.humidity}%</span>
          <span>💨 {weather.wind_velocity} km/h</span>
        </div>
      )}
    </button>
  );
};
