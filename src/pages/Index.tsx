import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation, type TabType } from "@/components/layout/Navigation";
import { ForecastMenu, type MenuOption } from "@/components/layout/ForecastMenu";
import { LocationGrid } from "@/components/weather/LocationGrid";
import { CurrentWeatherCard } from "@/components/weather/CurrentWeatherCard";
import { HourlyForecastCard } from "@/components/weather/HourlyForecastCard";
import { DailyForecastCard } from "@/components/weather/DailyForecastCard";
import { ExportPdfButton } from "@/components/weather/ExportPdfButton";
import { ExportDataButton } from "@/components/weather/ExportDataButton";
import { AlertsPanel } from "@/components/weather/AlertsPanel";
import { type Location, locations } from "@/data/locations";
import { MapPin, RefreshCw, ArrowLeft, Grid3X3, Siren } from "lucide-react";
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

  const handleOpenAlerts = () => {
    setSelectedLocation(null);
    setViewMode("detail");
    setActiveTab("alerts");
  };

  const handleBackToGrid = () => {
    setViewMode("grid");
    setSelectedLocation(null);
  };

  const handleMenuSelect = (option: MenuOption) => {
    if (option === "alerts") {
      handleOpenAlerts();
    } else {
      // Auto-select first location if none selected
      const loc = selectedLocation || locations[0];
      setSelectedLocation(loc);
      setActiveTab(option as TabType);
      setViewMode("detail");
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const renderDetailContent = () => {
    switch (activeTab) {
      case "alerts":
        return <AlertsPanel selectedLocation={selectedLocation} />;
      case "current":
        if (!selectedLocation) return null;
        return (
          <div className="space-y-4">
            <CurrentWeatherCard location={selectedLocation} />
            <HourlyForecastCard location={selectedLocation} />
          </div>
        );
      case "hourly":
        if (!selectedLocation) return null;
        return <HourlyForecastCard location={selectedLocation} />;
      case "daily":
        if (!selectedLocation) return null;
        return <DailyForecastCard location={selectedLocation} />;
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
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Locais monitorados</span>
                  <ForecastMenu onSelect={handleMenuSelect} />
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="gap-2" onClick={handleOpenAlerts}>
                    <Siren className="h-4 w-4" />
                    <span className="hidden sm:inline">Alertas</span>
                  </Button>
                </div>
              </div>
              <LocationGrid 
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
              />
            </div>
          ) : (
            <>
              {/* Compact Controls - Mobile First */}
              <div className="flex flex-col gap-3 mb-4">
                {/* Top Row - Back + Location + Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToGrid}
                    className="gap-1 h-8 px-2 shrink-0"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <Grid3X3 className="h-3.5 w-3.5 hidden sm:block" />
                  </Button>
                  
                  {/* Location Info - Mobile Inline */}
                  {selectedLocation && activeTab !== "alerts" && (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-display font-semibold text-sm truncate">
                        {selectedLocation.city}
                      </span>
                      <span className="text-[10px] text-muted-foreground hidden sm:inline">
                        {selectedLocation.state}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 ml-auto shrink-0">
                    {selectedLocation && activeTab !== "alerts" && (
                      <>
                        <ExportDataButton location={selectedLocation} />
                        <ExportPdfButton location={selectedLocation} />
                      </>
                    )}
                    <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-8 w-8">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                {/* Navigation - Full Width on Mobile */}
                <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
              </div>

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
