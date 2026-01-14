import { useQuery } from "@tanstack/react-query";
import { getCurrentWeather, formatTemperature } from "@/services/climatempo";
import { WeatherIcon } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
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
    refetchInterval: 10 * 60 * 1000,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-2.5 rounded-lg bg-card/60 border border-border/20 animate-pulse">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-5 w-10" />
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
        "w-full p-2.5 rounded-lg border transition-all duration-150 text-left group",
        "hover:scale-[1.02] active:scale-[0.98]",
        isSelected 
          ? "bg-primary/15 border-primary/60 shadow-sm shadow-primary/20" 
          : "bg-card/50 border-border/20 hover:border-primary/40 hover:bg-card/80"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-xs truncate leading-tight">{location.city}</h3>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
            {location.state}
          </span>
        </div>
        
        {!hasError && weather && (
          <div className="flex items-center gap-1.5">
            <WeatherIcon condition={weather.icon} size="xs" />
            <span className="text-sm font-bold font-display tabular-nums">
              {Math.round(weather.temperature)}°
            </span>
          </div>
        )}
        
        {hasError && (
          <span className="text-[10px] text-muted-foreground/60">--°</span>
        )}
      </div>
    </button>
  );
};
