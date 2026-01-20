import { useQuery } from "@tanstack/react-query";
import { getCurrentWeather, formatTemperature } from "@/services/climatempo";
import { WeatherIcon } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { Thermometer, Droplets, Wind, Gauge } from "lucide-react";
import type { Location } from "@/data/locations";

interface CurrentWeatherCardProps {
  location: Location;
}

export const CurrentWeatherCard = ({ location }: CurrentWeatherCardProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["currentWeather", location.climaTempoCod],
    queryFn: () => getCurrentWeather(location.climaTempoCod),
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return <CurrentWeatherSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="weather-card p-4 animate-fade-in">
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">Dados indisponíveis</p>
        </div>
      </div>
    );
  }

  const weather = data.data;

  return (
    <div className="weather-card p-4 sm:p-5 animate-fade-in">
      {/* Main Temperature */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <WeatherIcon condition={weather.icon} size="lg" />
          <div>
            <div className="temperature-display text-4xl sm:text-5xl">
              {formatTemperature(weather.temperature)}
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {weather.condition}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Thermometer className="h-3.5 w-3.5" />
            <span>Sensação</span>
          </div>
          <div className="text-xl sm:text-2xl font-semibold font-display">
            {formatTemperature(weather.sensation)}
          </div>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-4 gap-2">
        <StatItem icon={<Droplets className="h-4 w-4 text-sky-400" />} label="Umidade" value={`${weather.humidity}%`} />
        <StatItem icon={<Wind className="h-4 w-4 text-slate-400" />} label="Vento" value={`${weather.wind_velocity}`} />
        <StatItem icon={<Gauge className="h-4 w-4 text-emerald-400" />} label="Pressão" value={`${weather.pressure}`} />
        <StatItem icon={<span className="text-xs font-medium">{weather.wind_direction}</span>} label="Direção" value="" />
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="p-2 rounded-md bg-secondary/20 border border-border/15">
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    {value && <div className="text-sm font-semibold">{value}</div>}
  </div>
);

const CurrentWeatherSkeleton = () => (
  <div className="weather-card p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-2.5 w-14 mt-1" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-4 gap-1.5">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-10 rounded-md" />
      ))}
    </div>
  </div>
);
