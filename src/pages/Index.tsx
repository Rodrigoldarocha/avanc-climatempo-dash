import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { AppSidebar, type SidebarPage } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RefreshCw, ArrowLeft, Grid3X3, Siren, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAlertCount } from "@/hooks/useAlertCount";

type ViewMode = "dashboard" | "grid" | "detail";

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [activeTab, setActiveTab] = useState<string>("current");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(locations[0]);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { highCount } = useAlertCount();
  const timeOfDay = useTimeOfDay();

  // Bug fix: keep scroll position from carrying over between views on mobile
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewMode, activeTab]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setViewMode("detail");
    setActiveTab("current");
  };

  const handleOpenAlerts = () => {
    // Alerts are global: opening them must not stay filtered by the last location
    setSelectedLocation(null);
    setViewMode("detail");
    setActiveTab("alerts");
  };

  const handleBackToGrid = () => {
    setViewMode(activeTab === "alerts" ? "dashboard" : "grid");
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

  const handleSidebarSelect = (page: SidebarPage) => {
    if (page === "dashboard") {
      setViewMode("dashboard");
      setSelectedLocation(null);
    } else if (page === "grid") {
      setViewMode("grid");
      setSelectedLocation(null);
    } else if (page === "alerts") {
      handleOpenAlerts();
    } else {
      const loc = selectedLocation || locations[0];
      setSelectedLocation(loc);
      setActiveTab(page);
      setViewMode("detail");
    }
  };

  const currentSidebarPage: SidebarPage =
    viewMode === "dashboard"
      ? "dashboard"
      : viewMode === "grid"
      ? "grid"
      : (activeTab as SidebarPage);

  const currentBottomTab: BottomNavTab =
    viewMode === "dashboard"
      ? "dashboard"
      : viewMode === "grid"
      ? "grid"
      : activeTab === "alerts"
      ? "alerts"
      : "grid";

  const renderDetailContent = () => {
    const effectiveLocation = selectedLocation || locations[0];

    switch (activeTab) {
      case "alerts":
        return <AlertsPanel selectedLocation={selectedLocation} />;
      case "current":
        return (
          <div className="space-y-4">
            <CurrentWeatherCard location={effectiveLocation} />
            <HourlyForecastCard location={effectiveLocation} />
          </div>
        );
      case "hourly":
        return <HourlyForecastCard location={effectiveLocation} />;
      case "daily":
        return <DailyForecastCard location={effectiveLocation} />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-dvh flex w-full bg-background">
        <div className={`fixed inset-0 weather-gradient-bg time-${timeOfDay} opacity-40 pointer-events-none`} />

        {!isMobile && (
          <AppSidebar
            current={currentSidebarPage}
            onSelect={handleSidebarSelect}
            alertCount={highCount}
          />
        )}

        <div className="relative z-10 flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-1">
            {!isMobile && <SidebarTrigger className="ml-2 shrink-0" />}
            <div className="flex-1 min-w-0">
              <Header onOpenAlerts={handleOpenAlerts} onRefresh={handleRefresh} />
            </div>
          </div>

          <main className={`w-full px-3 py-3 sm:px-4 sm:py-4 md:container md:px-6 max-w-7xl mx-auto ${isMobile ? "pb-24" : ""}`}>
          {viewMode === "dashboard" ? (
            <section className="space-y-4 animate-rise" key="dashboard">
              <div className="premium-hero p-4 sm:p-6 lg:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl space-y-4">
                    <span className="premium-pill">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Monitoramento meteorológico
                    </span>
                    <div className="space-y-3">
                      <h1 className="text-4xl font-black tracking-[-0.06em] text-foreground sm:text-5xl lg:text-6xl">
                        Painel de clima
                        <span className="block text-primary">estratégico</span>
                      </h1>
                      <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                        Resumo executivo das condições, alertas e variáveis críticas em uma visão clara, elegante e pronta para decisão.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <Link to="/faq" className="inline-flex items-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(212,227,0,0.25)]">
                        Ver FAQ
                      </Link>
                      <Link to="/contato" className="inline-flex items-center rounded-full border border-border/70 bg-background/40 px-4 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary">
                        Falar com a equipe
                      </Link>
                    </div>
                  </div>

                  {!isMobile && (
                    <div className="grid w-full max-w-sm gap-3 sm:grid-cols-2">
                      <div className="premium-panel p-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cobertura</p>
                        <p className="mt-2 text-2xl font-black tracking-[-0.05em]">{locations.length}</p>
                        <p className="text-xs text-muted-foreground">locais monitorados</p>
                      </div>
                      <div className="premium-panel p-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Alertas</p>
                        <p className="mt-2 text-2xl font-black tracking-[-0.05em] text-destructive">{highCount}</p>
                        <p className="text-xs text-muted-foreground">alta severidade</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Visão geral</p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-foreground">Resumo operacional</h2>
                  </div>
                  {!isMobile && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-2 transition-all duration-300 hover:-translate-y-0.5" onClick={() => setViewMode("grid")}>
                        <Grid3X3 className="h-4 w-4" />
                        <span>Locais</span>
                      </Button>
                      <Button size="sm" className="gap-2 transition-all duration-300 hover:-translate-y-0.5" onClick={handleOpenAlerts}>
                        <Siren className="h-4 w-4" />
                        <span>Alertas</span>
                      </Button>
                    </div>
                  )}
                </div>

                <DashboardSummary
                  onOpenAlerts={handleOpenAlerts}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </section>
          ) : viewMode === "grid" ? (
            <section className="space-y-4 animate-fade-in" key="grid">
              <div className="glass-card p-5 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="ghost" className="gap-1 h-11 px-2" onClick={() => setViewMode("dashboard")} aria-label="Voltar ao painel">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <LayoutDashboard className="h-3.5 w-3.5 hidden sm:block" />
                  </Button>
                  <span className="text-sm font-medium">Locais monitorados</span>
                  <ForecastMenu onSelect={handleMenuSelect} />
                </div>
                {!isMobile && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="gap-2" onClick={handleOpenAlerts}>
                      <Siren className="h-4 w-4" />
                      <span>Alertas</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <LocationGrid
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
          </section>
          ) : (
             <div className={activeTab === "alerts" ? "animate-fade-in" : "glass-card p-4 sm:p-5 animate-fade-in"} key="detail">
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
                  <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-11 w-11" aria-label="Atualizar dados">
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
              <Link to="/" className="hover:text-primary">Início</Link>
              {" • "}
              <Link to="/faq" className="hover:text-primary">FAQ</Link>
              {" • "}
              <Link to="/contato" className="hover:text-primary">Contato</Link>
              {" • "}
              <Link to="/politica-de-privacidade" className="hover:text-primary">Privacidade</Link>
              {" • "}
              <a href="https://www.climatempo.com.br" target="_blank" rel="noreferrer" className="hover:text-primary">Climatempo</a>
              {" • "}
              <a href="https://www.grupoavanco.com.br" target="_blank" rel="noreferrer" className="hover:text-primary">Grupo Avanço</a>
              {" • "}{new Date().getFullYear()}
            </div>
          </footer>
        )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
