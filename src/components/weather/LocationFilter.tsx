import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllStates } from "@/data/locations";

interface LocationFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedState: string | null;
  onStateChange: (state: string | null) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

export const LocationFilter = ({
  searchQuery,
  onSearchChange,
  selectedState,
  onStateChange,
  showSearch = true,
  searchPlaceholder = "Buscar cidade...",
}: LocationFilterProps) => {
  const states = getAllStates();

  return (
    <div className="space-y-2">
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm bg-card/50 border-border/40"
          />
        </div>
      )}

      <div className="overflow-x-auto pb-1 -mx-4 px-4 scrollbar-thin">
        <div className="flex gap-1 min-w-max bg-card/80 backdrop-blur-sm border border-border/40 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => onStateChange(null)}
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
              onClick={() => onStateChange(selectedState === state ? null : state)}
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
    </div>
  );
};
