import { useState } from "react";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { Header } from "@/components/layout/Header";
import { ForecastMenu, type MenuOption } from "@/components/layout/ForecastMenu";
import { LocationGrid } from "@/components/weather/LocationGrid";
import { CurrentWeatherCard } from "@/components/weather/CurrentWeatherCard";
import { HourlyForecastCard } from "@/components/weather/HourlyForecastCard";
import { DailyForecastCard } from "@/components/weather/DailyForecastCard";
import { DashboardSummary } from "@/components/weather/DashboardSummary";
import { ExportPdfButton } from "@/components/weather/ExportPdfButton";
import { ExportDataButton } from "@/components/weather/ExportDataButton";
import { AlertsPanel } from "@/components/weather/AlertsPanel";
import { type Location, locations } from "@/data/locations";
import { LocationPicker } from "@/components/weather/LocationPicker";
import { BottomNav, type BottomNavTab } from "@/components/layout/BottomNav";
import { RefreshCw, ArrowLeft, Grid3X3, Siren, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAlertCount } from "@/hooks/useAlertCount";

type ViewMode = "dashboard" | "grid" | "detail";

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("detail");
  const [activeTab, setActiveTab] = useState<string>("alerts");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { highCount } = useAlertCount();
  const timeOfDay = useTimeOfDay();

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setViewMode("detail");
    setActiveTab("current");
  };

  const handleOpenAlerts = () => {
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
      const loc = selectedLocation || locations[0];
      setSelectedLocation(loc);
      setActiveTab(option);
      setViewMode("detail");
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["currentWeather"] });
  };

  const handleBottomNav = (tab: BottomNavTab) => {
    if (tab === "dashboard") {
      setViewMode("dashboard");
      setSelectedLocation(null);
    } else if (tab === "grid") {
      setViewMode("grid");
      setSelectedLocation(null);
    } else if (tab === "alerts") {
      handleOpenAlerts();
    }
  };

  const currentBottomTab: BottomNavTab =
    viewMode === "dashboard"
      ? "dashboard"
      : viewMode === "grid"
      ? "grid"
      : activeTab === "alerts"
      ? "alerts"
      : "grid";

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
      <div className={`fixed inset-0 weather-gradient-bg time-${timeOfDay} opacity-40 pointer-events-none`} />

      <div className="relative z-10">
        <Header onOpenAlerts={handleOpenAlerts} onRefresh={handleRefresh} />

        <main className={`container px-4 md:px-6 py-4 max-w-7xl mx-auto ${isMobile ? "pb-20" : ""}`}>
          {viewMode === "dashboard" ? (
            <div className="space-y-3 animate-fade-in" key="dashboard">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Painel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setViewMode("grid")}>
                    <Grid3X3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Locais</span>
                  </Button>
                  <Button size="sm" className="gap-2" onClick={handleOpenAlerts}>
                    <Siren className="h-4 w-4" />
                    <span className="hidden sm:inline">Alertas</span>
                  </Button>
                </div>
              </div>
              <DashboardSummary
                onOpenAlerts={handleOpenAlerts}
                onLocationSelect={handleLocationSelect}
              />
            </div>
          ) : viewMode === "grid" ? (
            <div className="space-y-3 animate-fade-in" key="grid">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="gap-1 h-8 px-2" onClick={() => setViewMode("dashboard")}>
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <LayoutDashboard className="h-3.5 w-3.5 hidden sm:block" />
                  </Button>
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
            <div className="animate-fade-in" key="detail">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToGrid}
                  className="gap-1.5 h-9 px-3 shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-xs">Voltar</span>
                </Button>

                {selectedLocation && activeTab !== "alerts" && (
                  <LocationPicker
                    selectedLocation={selectedLocation}
                    onLocationChange={(loc) => setSelectedLocation(loc)}
                  />
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

              {renderDetailContent()}
            </div>
          )}
        </main>

        {/* Bottom Nav for Mobile */}
        {isMobile && (
          <BottomNav
            activeTab={currentBottomTab}
            onTabChange={handleBottomNav}
            alertCount={highCount}
          />
        )}

        {/* Footer - hidden on mobile (bottom nav replaces it) */}
        {!isMobile && (
          <footer className="border-t border-border/20 mt-8 py-4">
            <div className="container px-4 text-center text-[10px] text-muted-foreground">
              <a href="https://www.climatempo.com.br" target="_blank" className="hover:text-primary">Climatempo</a>
              {" • "}
              <a href="https://www.grupoavanco.com.br" target="_blank" className="hover:text-primary">Grupo Avanço</a>
              {" • "}{new Date().getFullYear()}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Index;
