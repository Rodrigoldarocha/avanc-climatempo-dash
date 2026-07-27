import { useState, useMemo } from "react";
import { MapPin, ChevronDown, Search } from "lucide-react";
import { locations, getAllStates, getLocationsByState, type Location } from "@/data/locations";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LocationSelectorProps {
  selectedLocation: Location | null;
  onLocationChange: (location: Location) => void;
  className?: string;
}

export const LocationSelector = ({
  selectedLocation,
  onLocationChange,
  className,
}: LocationSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const states = getAllStates();

  const filteredLocations = useMemo(() => {
    if (!searchQuery) return locations;
    const query = searchQuery.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.city.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query) ||
        loc.local.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedLocations = useMemo(() => {
    const groups: Record<string, Location[]> = {};
    filteredLocations.forEach((loc) => {
      if (!groups[loc.state]) {
        groups[loc.state] = [];
      }
      groups[loc.state].push(loc);
    });
    return groups;
  }, [filteredLocations]);

  return (
    <div className={cn("relative", className)}>
      <Select
        value={selectedLocation?.climaTempoCod.toString()}
        onValueChange={(value) => {
          const location = locations.find(
            (loc) => loc.climaTempoCod.toString() === value
          );
          if (location) onLocationChange(location);
        }}
      >
        <SelectTrigger className="w-full min-w-[280px] h-12 bg-card border-border/50 hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <SelectValue placeholder="Selecione uma localidade">
              {selectedLocation ? (
                <span className="font-medium">
                  {selectedLocation.city}, {selectedLocation.state}
                </span>
              ) : (
                "Selecione uma localidade"
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[400px] bg-popover border-border">
          <div className="p-2 sticky top-0 bg-popover z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cidade ou estado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
          </div>
          {Object.entries(groupedLocations).map(([state, locs]) => (
            <SelectGroup key={state}>
              <SelectLabel className="text-xs font-semibold text-primary uppercase tracking-wider px-2 py-1.5">
                {state}
              </SelectLabel>
              {locs.map((loc) => (
                <SelectItem
                  key={loc.climaTempoCod}
                  value={loc.climaTempoCod.toString()}
                  className="cursor-pointer hover:bg-accent/50"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{loc.city}</span>
                    <span className="text-xs text-muted-foreground">
                      {loc.local}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
          {Object.keys(groupedLocations).length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma localidade encontrada
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
