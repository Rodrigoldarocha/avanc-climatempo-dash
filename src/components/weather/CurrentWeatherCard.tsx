import { useQuery } from "@tanstack/react-query";
import { getCurrentWeather, formatTemperature } from "@/services/climatempo";
import { WeatherIcon, WeatherStat } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Thermometer, Droplets, Wind, Gauge } from "lucide-react";
import type { Location } from "@/data/locations";

interface CurrentWeatherCardProps {
  location: Location;
}

export const CurrentWeatherCard = ({ location }: CurrentWeatherCardProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["currentWeather", location.climaTempoCod],
    queryFn: () => getCurrentWeather(location.climaTempoCod),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 2,
  });

  if (isLoading) {
    return <CurrentWeatherSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="weather-card p-6 animate-fade-in">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Não foi possível carregar os dados do clima.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Verifique sua conexão e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  const weather = data.data;

  return (
    <div className="weather-card p-6 animate-fade-in">
      {/* Location Header */}
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-xl font-display font-semibold">
            {location.city}
          </h2>
          <p className="text-sm text-muted-foreground">
            {location.state} • Agora
          </p>
        </div>
      </div>

      {/* Main Temperature Display */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <WeatherIcon condition={weather.icon} size="xl" />
          <div>
            <div className="temperature-display text-6xl">
              {formatTemperature(weather.temperature)}
            </div>
            <p className="text-muted-foreground capitalize mt-1">
              {weather.condition}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Thermometer className="h-4 w-4" />
            <span>Sensação</span>
          </div>
          <div className="text-2xl font-semibold">
            {formatTemperature(weather.sensation)}
          </div>
        </div>
      </div>

      {/* Weather Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">Umidade</span>
          </div>
          <div className="text-lg font-semibold">{weather.humidity}%</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Wind className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-muted-foreground">Vento</span>
          </div>
          <div className="text-lg font-semibold">
            {weather.wind_velocity} km/h
          </div>
          <div className="text-xs text-muted-foreground">
            {weather.wind_direction}
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="h-4 w-4 text-green-400" />
            <span className="text-xs text-muted-foreground">Pressão</span>
          </div>
          <div className="text-lg font-semibold">{weather.pressure} hPa</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-muted-foreground">Sensação</span>
          </div>
          <div className="text-lg font-semibold">
            {formatTemperature(weather.sensation)}
          </div>
        </div>
      </div>
    </div>
  );
};

const CurrentWeatherSkeleton = () => (
  <div className="weather-card p-6">
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5 rounded-full" />
      <div>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24 mt-1" />
      </div>
    </div>
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div>
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  </div>
);
