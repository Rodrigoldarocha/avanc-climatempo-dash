import { useQuery } from "@tanstack/react-query";
import { getCurrentWeather } from "@/services/climatempo";
import { WeatherIcon } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
import type { Location } from "@/data/locations";
import { cn } from "@/lib/utils";
import { Droplets, Wind } from "lucide-react";
import { useEffect, useState } from "react";

interface LocationCardProps {
  location: Location;
  onClick: () => void;
  isSelected?: boolean;
  index?: number;
}

/** Returns a subtle gradient class based on temperature */
function getTempGradient(temp: number): string {
  if (temp >= 35) return "from-orange-500/15 to-red-500/10";
  if (temp >= 30) return "from-orange-400/12 to-amber-400/8";
  if (temp >= 25) return "from-amber-300/10 to-yellow-300/6";
  if (temp >= 20) return "from-emerald-300/8 to-teal-300/5";
  if (temp >= 15) return "from-sky-300/10 to-blue-300/8";
  return "from-blue-400/12 to-indigo-400/10";
}

/** Animated counter hook */
function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

export const LocationCard = ({ location, onClick, isSelected, index = 0 }: LocationCardProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["currentWeather", location.climaTempoCod],
    queryFn: () => getCurrentWeather(location.climaTempoCod),
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });

  const weather = data?.data;
  const hasError = error || !weather;
  const temp = weather?.temperature ?? 0;
  const animatedTemp = useCountUp(hasError ? 0 : Math.round(temp));

  if (isLoading) {
    return (
      <div
        className="p-3 rounded-lg bg-card/60 border border-border/20"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 rounded-lg border transition-all duration-200 text-left group bg-gradient-to-br",
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        "active:scale-[0.97]",
        !hasError ? getTempGradient(temp) : "from-card/50 to-card/50",
        isSelected
          ? "border-primary/60 shadow-md shadow-primary/20 ring-1 ring-primary/30"
          : "border-border/20 hover:border-primary/40"
      )}
      style={{
        animation: `fade-in 0.4s ease-out ${index * 40}ms both`,
      }}
    >
      {/* City & State */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <h3 className="font-semibold text-sm truncate leading-tight flex-1">{location.city}</h3>
        <span className="text-xs text-muted-foreground uppercase tracking-wide shrink-0">
          {location.state}
        </span>
      </div>

      {!hasError && weather ? (
        <>
          {/* Main Weather */}
          <div className="flex items-center gap-2 mb-2">
            <WeatherIcon condition={weather.icon} size="sm" />
            <div>
              <span className="text-2xl font-bold font-display tabular-nums">
                {animatedTemp}°
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                ST {Math.round(weather.sensation)}°
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-weather-rain" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="h-3.5 w-3.5 text-weather-cloud" />
              <span>{weather.wind_velocity} km/h</span>
            </div>
          </div>

          {/* Condition */}
          <p className="text-xs text-muted-foreground/80 mt-1.5 truncate">
            {weather.condition}
          </p>
        </>
      ) : (
        <div className="py-2 text-center">
          <span className="text-xl text-muted-foreground/40">--°</span>
          <p className="text-xs text-muted-foreground/50 mt-1">Indisponível</p>
        </div>
      )}
    </button>
  );
};
