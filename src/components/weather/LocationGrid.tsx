import { useState, useMemo } from "react";
import { locations, getAllStates, type Location } from "@/data/locations";
import { LocationCard } from "./LocationCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Thermometer, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface LocationGridProps {
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
}

export const LocationGrid = ({ onLocationSelect, selectedLocation }: LocationGridProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  const states = getAllStates();
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["currentWeather"] });
    setTimeout(() => setIsRefreshing(false), 1000);
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

  return (
    <div className="space-y-4">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-display font-bold">Estações Meteorológicas</h2>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {locations.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Atualizar
          </Button>
          
          {/* Search */}
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-card/50 border-border/40"
            />
          </div>
        </div>
      </div>

      {/* State Filter */}
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={selectedState === null ? "default" : "outline"}
          className={cn(
            "cursor-pointer text-[10px] px-2 py-0.5 transition-all",
            selectedState === null && "bg-primary text-primary-foreground"
          )}
          onClick={() => setSelectedState(null)}
        >
          Todos
        </Badge>
        {states.map((state) => (
          <Badge
            key={state}
            variant={selectedState === state ? "default" : "outline"}
            className={cn(
              "cursor-pointer text-[10px] px-2 py-0.5 transition-all",
              selectedState === state && "bg-primary text-primary-foreground"
            )}
            onClick={() => setSelectedState(selectedState === state ? null : state)}
          >
            {state}
          </Badge>
        ))}
      </div>

      {/* Grid by State */}
      <div className="space-y-5">
        {Object.entries(locationsByState).map(([state, locs]) => (
          <div key={state}>
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {state}
              </span>
              <span className="text-[9px] text-muted-foreground/60">({locs.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {locs.map((location) => (
                <LocationCard
                  key={location.climaTempoCod}
                  location={location}
                  onClick={() => onLocationSelect(location)}
                  isSelected={selectedLocation?.climaTempoCod === location.climaTempoCod}
                />
              ))}
            </div>
          </div>
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
