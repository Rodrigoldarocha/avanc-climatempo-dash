import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation, type TabType } from "@/components/layout/Navigation";
import { LocationSelector } from "@/components/weather/LocationSelector";
import { LocationGrid } from "@/components/weather/LocationGrid";
import { CurrentWeatherCard } from "@/components/weather/CurrentWeatherCard";
import { HourlyForecastCard } from "@/components/weather/HourlyForecastCard";
import { DailyForecastCard } from "@/components/weather/DailyForecastCard";
import { HistoricalChart } from "@/components/weather/HistoricalChart";
import { locations, type Location } from "@/data/locations";
import { MapPin, RefreshCw, ArrowLeft, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

type ViewMode = "grid" | "detail";

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<TabType>("current");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const queryClient = useQueryClient();

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setViewMode("detail");
    setActiveTab("current");
  };

  const handleBackToGrid = () => {
    setViewMode("grid");
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const renderDetailContent = () => {
    if (!selectedLocation) return null;

    switch (activeTab) {
      case "current":
        return (
          <div className="grid gap-4 lg:grid-cols-2">
            <CurrentWeatherCard location={selectedLocation} />
            <HourlyForecastCard location={selectedLocation} />
          </div>
        );
      case "hourly":
        return <HourlyForecastCard location={selectedLocation} />;
      case "daily":
        return <DailyForecastCard location={selectedLocation} />;
      case "historical":
        return <HistoricalChart location={selectedLocation} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 weather-gradient-bg opacity-40 pointer-events-none" />

      <div className="relative z-10">
        <Header />

        <main className="container px-4 md:px-6 py-4 max-w-7xl mx-auto">
          {viewMode === "grid" ? (
            <LocationGrid 
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
          ) : (
            <>
              {/* Compact Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToGrid}
                    className="gap-1.5 h-8 px-2"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </Button>
                  <LocationSelector
                    selectedLocation={selectedLocation}
                    onLocationChange={handleLocationSelect}
                    className="hidden sm:block"
                  />
                  <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-8 w-8">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
              </div>

              {/* Compact Location Bar */}
              {selectedLocation && (
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-secondary/15 border border-border/20">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <h2 className="font-display font-semibold text-sm truncate">
                      {selectedLocation.city}, {selectedLocation.state}
                    </h2>
                    <p className="text-[10px] text-muted-foreground truncate">{selectedLocation.local}</p>
                  </div>
                </div>
              )}

              {renderDetailContent()}
            </>
          )}
        </main>

        {/* Compact Footer */}
        <footer className="border-t border-border/20 mt-8 py-4">
          <div className="container px-4 text-center text-[10px] text-muted-foreground">
            <a href="https://www.climatempo.com.br" target="_blank" className="hover:text-primary">Climatempo</a>
            {" • "}
            <a href="https://www.grupoavanco.com.br" target="_blank" className="hover:text-primary">Grupo Avanço</a>
            {" • "}{new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
