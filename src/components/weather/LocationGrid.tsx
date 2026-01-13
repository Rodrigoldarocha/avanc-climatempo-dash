import { useState, useMemo } from "react";
import { locations, getAllStates, type Location } from "@/data/locations";
import { LocationCard } from "./LocationCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationGridProps {
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
}

export const LocationGrid = ({ onLocationSelect, selectedLocation }: LocationGridProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
  const states = getAllStates();
  
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch = !searchQuery || 
        loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.local.toLowerCase().includes(searchQuery.toLowerCase());
      
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Grid3X3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold">Todas as Localidades</h2>
          <p className="text-sm text-muted-foreground">
            {locations.length} estações meteorológicas monitoradas
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-border/50"
          />
        </div>
      </div>

      {/* State Filter Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedState === null ? "default" : "outline"}
          className={cn(
            "cursor-pointer transition-all",
            selectedState === null && "bg-primary text-primary-foreground"
          )}
          onClick={() => setSelectedState(null)}
        >
          Todos ({locations.length})
        </Badge>
        {states.map((state) => {
          const count = locations.filter((l) => l.state === state).length;
          return (
            <Badge
              key={state}
              variant={selectedState === state ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all",
                selectedState === state && "bg-primary text-primary-foreground"
              )}
              onClick={() => setSelectedState(selectedState === state ? null : state)}
            >
              {state} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Location Grid */}
      {Object.entries(locationsByState).map(([state, locs]) => (
        <div key={state} className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              {state} — {locs.length} {locs.length === 1 ? 'cidade' : 'cidades'}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma localidade encontrada</p>
        </div>
      )}
    </div>
  );
};
