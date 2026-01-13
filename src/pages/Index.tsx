import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation, type TabType } from "@/components/layout/Navigation";
import { LocationSelector } from "@/components/weather/LocationSelector";
import { CurrentWeatherCard } from "@/components/weather/CurrentWeatherCard";
import { HourlyForecastCard } from "@/components/weather/HourlyForecastCard";
import { DailyForecastCard } from "@/components/weather/DailyForecastCard";
import { HistoricalChart } from "@/components/weather/HistoricalChart";
import { locations, type Location } from "@/data/locations";
import { MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("current");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    locations[0] || null
  );
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    if (selectedLocation) {
      queryClient.invalidateQueries();
    }
  };

  const renderContent = () => {
    if (!selectedLocation) {
      return (
        <div className="weather-card p-12 text-center">
          <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-display font-semibold mb-2">
            Selecione uma Localidade
          </h2>
          <p className="text-muted-foreground">
            Escolha uma cidade para visualizar as informações meteorológicas.
          </p>
        </div>
      );
    }

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

        <main className="container px-4 md:px-6 py-6 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <LocationSelector
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
              />
              <Button variant="outline" size="icon" onClick={handleRefresh} title="Atualizar">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

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

          {renderContent()}
        </main>

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