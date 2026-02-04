import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import { useQuery } from "@tanstack/react-query";
import { locations, type Location } from "@/data/locations";
import { getCurrentWeather, formatTemperature } from "@/services/climatempo";
import { WeatherIcon } from "./WeatherIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { Thermometer, Droplets, Wind, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Custom marker icon
const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationsMapProps {
  onLocationSelect?: (location: Location) => void;
}

// Component to fit bounds to all markers
function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = new LatLngBounds(
        locations.map(loc => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [locations, map]);
  
  return null;
}

// Weather popup content component
function LocationPopup({ location, onSelect }: { location: Location; onSelect?: (loc: Location) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["currentWeather", location.climaTempoCod],
    queryFn: () => getCurrentWeather(location.climaTempoCod),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-2 min-w-[180px]">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
    );
  }

  const weather = data?.data;

  return (
    <div className="min-w-[200px]">
      <div className="flex items-center gap-1 mb-2">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold text-sm">{location.city}</span>
        <span className="text-xs text-muted-foreground">- {location.state}</span>
      </div>
      
      {weather ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <WeatherIcon condition={weather.icon} size="sm" />
            <span className="text-2xl font-bold">{formatTemperature(weather.temperature)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-1.5 text-xs mb-2">
            <div className="flex items-center gap-1">
              <Thermometer className="h-3 w-3 text-destructive" />
              <span>Sens: {formatTemperature(weather.sensation)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-primary" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <Wind className="h-3 w-3 text-muted-foreground" />
              <span>{weather.wind_velocity} {weather.wind_direction}</span>
            </div>
          </div>
          
          {onSelect && (
            <button
              onClick={() => onSelect(location)}
              className="w-full text-xs bg-primary text-primary-foreground py-1.5 px-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Ver detalhes
            </button>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">Dados indisponíveis</p>
      )}
    </div>
  );
}

export function LocationsMap({ onLocationSelect }: LocationsMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="weather-card p-4 h-[400px] sm:h-[500px] flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  }

  // Center of Brazil
  const centerLat = -14.235;
  const centerLng = -51.925;

  return (
    <div className="weather-card overflow-hidden">
      <div className="p-3 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Mapa de Locais</span>
        </div>
        <span className="text-xs text-muted-foreground">{locations.length} locais</span>
      </div>
      
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={4}
        style={{ height: "400px", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds locations={locations} />
        
        {locations.map((location) => (
          <Marker
            key={location.climaTempoCod}
            position={[location.latitude, location.longitude]}
            icon={customIcon}
          >
            <Popup>
              <LocationPopup location={location} onSelect={onLocationSelect} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
