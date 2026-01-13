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
import { MapPin, RefreshCw, ArrowLeft, Home } from "lucide-react";
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
    if (selectedLocation) {
      queryClient.invalidateQueries();
    }
  };

  const renderDetailContent = () => {
    if (!selectedLocation) return null;

    switch (activeTab) {
      case "current":
        return (
          <div className="space-y-6 animate-fade-in">
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
      <div className="fixed inset-0 weather-gradient-bg opacity-50 pointer-events-none" />

      <div className="relative z-10">
        <Header />

        <main className="container px-4 md:px-6 py-6 max-w-7xl mx-auto">
          {viewMode === "grid" ? (
            /* Grid View - All Locations */
            <LocationGrid 
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
          ) : (
            /* Detail View - Single Location */
            <>
              {/* Top Controls */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToGrid}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <Home className="h-4 w-4" />
                    Todas Cidades
                  </Button>
                  <LocationSelector
                    selectedLocation={selectedLocation}
                    onLocationChange={handleLocationSelect}
                  />
                  <Button variant="outline" size="icon" onClick={handleRefresh} title="Atualizar">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
              </div>

              {/* Location Info Bar */}
              {selectedLocation && (
                <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-secondary/20 border border-border/30">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <h2 className="font-display font-semibold text-lg">
                      {selectedLocation.city}, {selectedLocation.state}
                    </h2>
                    <p className="text-sm text-muted-foreground">{selectedLocation.local}</p>
                  </div>
                </div>
              )}

              {/* Main Content */}
              {renderDetailContent()}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/30 mt-12 py-6">
          <div className="container px-4 text-center text-sm text-muted-foreground">
            <p>
              Dados por{" "}
              <a href="https://www.climatempo.com.br" target="_blank" className="text-primary hover:underline">
                Climatempo
              </a>{" "}
              • © {new Date().getFullYear()}{" "}
              <a href="https://www.grupoavanco.com.br" target="_blank" className="text-primary hover:underline">
                Grupo Avanço
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;