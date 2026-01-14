import { useQuery } from "@tanstack/react-query";
import { getCurrentWeather } from "@/services/climatempo";
import { WeatherIcon } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
import type { Location } from "@/data/locations";
import { cn } from "@/lib/utils";
import { Droplets, Wind } from "lucide-react";

interface LocationCardProps {
  location: Location;
  onClick: () => void;
  isSelected?: boolean;
}

export const LocationCard = ({ location, onClick, isSelected }: LocationCardProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["currentWeather", location.climaTempoCod],
    queryFn: () => getCurrentWeather(location.climaTempoCod),
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-3 rounded-lg bg-card/60 border border-border/20 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    );
  }

  const weather = data?.data;
  const hasError = error || !weather;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 rounded-lg border transition-all duration-150 text-left group",
        "hover:scale-[1.02] active:scale-[0.98]",
        isSelected 
          ? "bg-primary/15 border-primary/60 shadow-sm shadow-primary/20" 
          : "bg-card/50 border-border/20 hover:border-primary/40 hover:bg-card/80"
      )}
    >
      {/* City & State */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <h3 className="font-medium text-xs truncate leading-tight flex-1">{location.city}</h3>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide shrink-0">
          {location.state}
        </span>
      </div>
      
      {!hasError && weather ? (
        <>
          {/* Main Weather */}
          <div className="flex items-center gap-2 mb-2">
            <WeatherIcon condition={weather.icon} size="sm" />
            <div>
              <span className="text-xl font-bold font-display tabular-nums">
                {Math.round(weather.temperature)}°
              </span>
              <span className="text-[10px] text-muted-foreground ml-1">
                ST {Math.round(weather.sensation)}°
              </span>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-blue-400" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="h-3 w-3 text-cyan-400" />
              <span>{weather.wind_velocity} km/h</span>
            </div>
          </div>
          
          {/* Condition */}
          <p className="text-[9px] text-muted-foreground/80 mt-1.5 truncate">
            {weather.condition}
          </p>
        </>
      ) : (
        <div className="py-2 text-center">
          <span className="text-lg text-muted-foreground/40">--°</span>
          <p className="text-[9px] text-muted-foreground/50 mt-1">Indisponível</p>
        </div>
      )}
    </button>
  );
};
