import { useState, useMemo } from "react";
import { locations, getAllStates, type Location } from "@/data/locations";
import { LocationCard } from "./LocationCard";
import { LocationFilter } from "./LocationFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Thermometer, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";

interface LocationGridProps {
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
}

export const LocationGrid = ({ onLocationSelect, selectedLocation }: LocationGridProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: ["currentWeather"] });
  
  const states = getAllStates();
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["currentWeather"] });
    setLastRefreshTime(new Date());
    setTimeout(() => setIsRefreshing(false), 1500);
  };
  
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch = !searchQuery || 
        loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.state.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesState = !selectedState || loc.state === selectedState;
      
      return matchesSearch && matchesState;
    });
  }, [searchQuery, selectedState]);

  const locationsByState = useMemo(() => {
    const grouped: Record<string, Location[]> = {};
    filteredLocations.forEach((loc) => {
      if (!grouped[loc.state]) grouped[loc.state] = [];
      grouped[loc.state].push(loc);
    });
    return grouped;
  }, [filteredLocations]);

  const isCurrentlyFetching = isFetching > 0 || isRefreshing;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight">Locais</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-lg">
              Busque, filtre e acesse rapidamente as estações monitoradas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-2xl border border-border/20 bg-background/10 px-3 py-1 text-xs text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {locations.length} locais
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isCurrentlyFetching}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isCurrentlyFetching && "animate-spin")} />
              <span>{isCurrentlyFetching ? "Atualizando" : "Atualizar"}</span>
            </Button>
          </div>
        </div>

        <LocationFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedState={selectedState}
          onStateChange={setSelectedState}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredLocations.map((location, i) => (
          <LocationCard
            key={location.climaTempoCod}
            location={location}
            onClick={() => onLocationSelect(location)}
            isSelected={selectedLocation?.climaTempoCod === location.climaTempoCod}
            index={i}
          />
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma localidade encontrada</p>
        </div>
      )}
    </div>
  );
};
