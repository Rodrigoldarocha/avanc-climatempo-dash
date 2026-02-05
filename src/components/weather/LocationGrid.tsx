import { useState, useMemo } from "react";
import { locations, getAllStates, type Location } from "@/data/locations";
import { LocationCard } from "./LocationCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Thermometer, RefreshCw, Clock } from "lucide-react";
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
      {/* Header with Refresh - Mobile Optimized */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Thermometer className="h-5 w-5 text-primary shrink-0" />
            <h2 className="text-base sm:text-lg font-display font-bold truncate">Estações Meteorológicas</h2>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
              {locations.length}
            </Badge>
          </div>
          
          {/* Refresh Button - Always Visible */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isCurrentlyFetching}
            className="h-8 gap-1.5 text-xs shrink-0"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isCurrentlyFetching && "animate-spin")} />
            <span className="hidden sm:inline">{isCurrentlyFetching ? "Atualizando..." : "Atualizar"}</span>
          </Button>
        </div>
        
        {/* Search and Time - Mobile Stack */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-card/50 border-border/40"
            />
          </div>
          
          {/* Last Updated Time */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Atualizado: {lastRefreshTime.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às {lastRefreshTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>

      {/* State Filter - Horizontal Scroll */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin">
        <div className="flex gap-1 min-w-max bg-card/80 backdrop-blur-sm border border-border/40 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setSelectedState(null)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
              selectedState === null
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
            )}
          >
            Todos
          </button>
          {states.map((state) => (
            <button
              key={state}
              onClick={() => setSelectedState(selectedState === state ? null : state)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
                selectedState === state
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
            >
              {state}
            </button>
          ))}
        </div>
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
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
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
