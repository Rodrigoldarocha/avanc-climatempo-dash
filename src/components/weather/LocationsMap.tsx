import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useQuery } from "@tanstack/react-query";
import { locations, type Location } from "@/data/locations";
import { getCurrentWeather, formatTemperature } from "@/services/climatempo";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
const defaultIcon = L.icon({
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

function PopupContent({ location, onSelect }: { location: Location; onSelect?: (loc: Location) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["currentWeather", location.climaTempoCod],
    queryFn: () => getCurrentWeather(location.climaTempoCod),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return "<div style='min-width:180px;padding:8px'>Carregando...</div>";

  const weather = data?.data;
  if (!weather) return "<div style='min-width:180px;padding:8px'>Dados indisponíveis</div>";

  return `
    <div style="min-width:200px;font-family:system-ui,sans-serif">
      <div style="font-weight:600;font-size:14px;margin-bottom:6px">${location.city} - ${location.state}</div>
      <div style="font-size:24px;font-weight:700;margin-bottom:6px">${formatTemperature(weather.temperature)}</div>
      <div style="font-size:12px;color:#666;line-height:1.6">
        Sensação: ${formatTemperature(weather.sensation)}<br/>
        Umidade: ${weather.humidity}%<br/>
        Vento: ${weather.wind_velocity} ${weather.wind_direction}
      </div>
    </div>
  `;
}

export function LocationsMap({ onLocationSelect }: LocationsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([-14.235, -51.925], 4);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const bounds = L.latLngBounds(
      locations.map((loc) => [loc.latitude, loc.longitude] as L.LatLngTuple)
    );

    const markers = locations.map((location) => {
      const marker = L.marker([location.latitude, location.longitude], { icon: defaultIcon }).addTo(map);

      marker.bindPopup(
        `<div style="min-width:180px;font-family:system-ui,sans-serif">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px">${location.city} - ${location.state}</div>
          <div style="font-size:12px;color:#666">Clique para ver detalhes</div>
        </div>`
      );

      marker.on("click", () => {
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      });

      return marker;
    });

    map.fitBounds(bounds, { padding: [20, 20] });

    // Force resize after mount
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isMounted, onLocationSelect]);

  if (!isMounted) {
    return (
      <div className="weather-card p-4 h-[400px] sm:h-[500px] flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="weather-card overflow-hidden">
      <div className="p-3 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Mapa de Locais</span>
        </div>
        <span className="text-xs text-muted-foreground">{locations.length} locais</span>
      </div>
      <div ref={mapRef} style={{ height: "400px", width: "100%" }} className="z-0" />
    </div>
  );
}
