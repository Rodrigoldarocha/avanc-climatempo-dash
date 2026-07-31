import type { ReactNode } from "react";
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
          <p className="text-sm font-medium">Dados indisponíveis</p>
          <p className="text-xs opacity-75 max-w-[200px]">Não foi possível carregar as condições atuais de {location.local}</p>
          <p className="text-[10px] text-destructive/80 mt-2">{error instanceof Error ? error.message : "Erro desconhecido"}</p>
        </div>
      </div>
    );
  }

  const weather = data.data;

  return (
    <div className="weather-card p-5 sm:p-7 animate-fade-in relative overflow-hidden">
      {/* Atmospheric glow */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="relative z-10">
        {/* Main Temperature Hero */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <WeatherIcon condition={weather.icon} size="lg" />
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10" />
            </div>
            <div>
              <div className="temperature-display text-6xl sm:text-[84px] leading-none sm:leading-[84px]">
                {formatTemperature(weather.temperature)}
              </div>
              <p className="text-xl font-display font-semibold text-primary mt-1">
                {weather.condition}
              </p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-2xl min-w-[140px] shrink-0">
            <div className="flex items-center gap-2 data-label text-muted-foreground mb-1">
              <Thermometer className="h-4 w-4" />
              Sensação
            </div>
            <div className="text-2xl sm:text-3xl font-display font-semibold">
              {formatTemperature(weather.sensation)}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <StatItem icon={<Droplets className="h-4 w-4 text-sky-400" />} label="Umidade" value={`${weather.humidity}%`} />
          <StatItem icon={<Wind className="h-4 w-4 text-slate-400" />} label="Vento" value={`${weather.wind_velocity}`} />
          <StatItem icon={<Gauge className="h-4 w-4 text-emerald-400" />} label="Pressão" value={`${weather.pressure}`} />
          <StatItem icon={<span className="data-label">{weather.wind_direction}</span>} label="Direção" value="" />
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-3 flex flex-col gap-1.5 hover:bg-white/[0.07] transition-colors">
    <div className="flex items-center gap-1.5 data-label text-muted-foreground">
      {icon}
      {label}
    </div>
    {value && <div className="text-lg font-display font-semibold">{value}</div>}
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
