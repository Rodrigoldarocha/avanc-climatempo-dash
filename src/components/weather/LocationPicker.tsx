import { useState, useMemo } from "react";
import { locations, getAllStates, type Location } from "@/data/locations";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MapPin, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LocationPickerProps {
  selectedLocation: Location;
  onLocationChange: (location: Location) => void;
}

export const LocationPicker = ({ selectedLocation, onLocationChange }: LocationPickerProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const states = getAllStates();

  const filtered = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch = !searchQuery ||
        loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.local.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesState = !selectedState || loc.state === selectedState;
      return matchesSearch && matchesState;
    });
  }, [searchQuery, selectedState]);

  const handleSelect = (loc: Location) => {
    onLocationChange(loc);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 max-w-[200px]">
          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate text-xs">{selectedLocation.city}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2 z-50 bg-popover" align="start">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-7 text-xs"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedState(null)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition-colors",
                !selectedState
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              Todos
            </button>
            {states.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedState(selectedState === s ? null : s)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition-colors",
                  selectedState === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <ScrollArea className="h-48">
            <div className="space-y-0.5">
              {filtered.map((loc) => (
                <button
                  key={loc.climaTempoCod}
                  onClick={() => handleSelect(loc)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded text-xs transition-colors",
                    loc.climaTempoCod === selectedLocation.climaTempoCod
                      ? "bg-primary/15 text-primary font-medium"
                      : "hover:bg-accent"
                  )}
                >
                  <span>{loc.city}</span>
                  <span className="text-muted-foreground ml-1">({loc.state})</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum resultado</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
