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
        className="glass-card p-3"
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
        "glass-card w-full h-[118px] min-h-[118px] rounded-[22px] p-3 text-left transition-all duration-200 group",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]",
        isSelected
          ? "border-primary/60 ring-1 ring-primary/30"
          : "border-border/20"
      )}
      style={{
        animation: `fade-in 0.4s ease-out ${index * 40}ms both`,
        backgroundImage: !hasError ? getTempGradient(temp) : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-tight truncate">{location.city}</h3>
          <p className="text-[11px] text-muted-foreground/70 truncate">{location.state}</p>
        </div>
        <span className="text-xs rounded-full border border-border/30 bg-background/80 px-2 py-1 text-muted-foreground">
          {weather?.condition ?? "—"}
        </span>
      </div>

      {!hasError && weather ? (
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="rounded-2xl bg-background/10 p-2">
            <p className="text-[11px] uppercase tracking-[0.18em]">Temp.</p>
            <p className="mt-1 text-xl font-semibold text-foreground tabular-nums">{animatedTemp}°</p>
          </div>
          <div className="rounded-2xl bg-background/10 p-2">
            <p className="text-[11px] uppercase tracking-[0.18em]">Sensação</p>
            <p className="mt-1 text-xl font-semibold text-foreground tabular-nums">{Math.round(weather.sensation)}°</p>
          </div>
          <div className="rounded-2xl bg-background/10 p-2">
            <p className="text-[11px] uppercase tracking-[0.18em]">Umidade</p>
            <p className="mt-1 font-semibold text-foreground">{weather.humidity}%</p>
          </div>
          <div className="rounded-2xl bg-background/10 p-2">
            <p className="text-[11px] uppercase tracking-[0.18em]">Vento</p>
            <p className="mt-1 font-semibold text-foreground">{weather.wind_velocity} km/h</p>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-sm text-muted-foreground/70">Dados indisponíveis</span>
        </div>
      )}
    </button>
  );
};
