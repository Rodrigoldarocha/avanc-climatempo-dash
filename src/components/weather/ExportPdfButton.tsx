import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentWeather, get15DayForecast, get72HourForecast } from "@/services/climatempo";
import type { Location } from "@/data/locations";
import jsPDF from "jspdf";

interface ExportPdfButtonProps {
  location: Location;
}

export const ExportPdfButton = ({ location }: ExportPdfButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: currentData } = useQuery({
    queryKey: ["currentWeather", location.climaTempoCod],
    queryFn: () => getCurrentWeather(location.climaTempoCod),
    staleTime: 5 * 60 * 1000,
  });

  const { data: dailyData } = useQuery({
    queryKey: ["dailyForecast", location.climaTempoCod],
    queryFn: () => get15DayForecast(location.climaTempoCod),
    staleTime: 60 * 60 * 1000,
  });

  const generatePdf = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Relatório Meteorológico", pageWidth / 2, y, { align: "center" });
      y += 10;

      // Location Info
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${location.city}, ${location.state}`, pageWidth / 2, y, { align: "center" });
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(location.local || "", pageWidth / 2, y, { align: "center" });
      y += 5;
      
      pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, pageWidth / 2, y, { align: "center" });
      pdf.setTextColor(0);
      y += 15;

      // Current Weather Section
      if (currentData?.data) {
        const weather = currentData.data;
        
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Condições Atuais", 20, y);
        y += 8;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        
        const currentInfo = [
          `Temperatura: ${Math.round(weather.temperature)}°C`,
          `Sensação Térmica: ${Math.round(weather.sensation)}°C`,
          `Condição: ${weather.condition}`,
          `Umidade: ${weather.humidity}%`,
          `Vento: ${weather.wind_velocity} km/h (${weather.wind_direction})`,
          `Pressão: ${weather.pressure} hPa`,
        ];

        currentInfo.forEach((info) => {
          pdf.text(info, 25, y);
          y += 6;
        });
        y += 10;
      }

      // Daily Forecast Section
      const forecastData = Array.isArray(dailyData?.data) ? dailyData.data : [];
      if (forecastData.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Previsão 15 Dias", 20, y);
        y += 8;

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        
        // Table Header
        pdf.text("Data", 25, y);
        pdf.text("Mín", 65, y);
        pdf.text("Máx", 85, y);
        pdf.text("Chuva", 105, y);
        pdf.text("Condição", 130, y);
        y += 6;

        pdf.setFont("helvetica", "normal");

        forecastData.forEach((day: any, index: number) => {
          if (y > 270) {
            pdf.addPage();
            y = 20;
          }

          const minTemp = day.temperature?.min ?? 0;
          const maxTemp = day.temperature?.max ?? 0;
          const rainProb = day.rain?.probability ?? 0;
          const condition = day.text_icon?.text?.phrase?.reduced || day.text || "-";
          
          let dateLabel = day.date || "-";
          if (index === 0) dateLabel = "Hoje";
          else if (index === 1) dateLabel = "Amanhã";
          else {
            try {
              const date = new Date(day.date);
              dateLabel = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
            } catch {
              // keep original
            }
          }

          pdf.text(dateLabel, 25, y);
          pdf.text(`${Math.round(minTemp)}°C`, 65, y);
          pdf.text(`${Math.round(maxTemp)}°C`, 85, y);
          pdf.text(`${rainProb}%`, 105, y);
          
          // Truncate condition if too long
          const maxConditionLength = 40;
          const conditionText = condition.length > maxConditionLength 
            ? condition.substring(0, maxConditionLength) + "..." 
            : condition;
          pdf.text(conditionText, 130, y);
          
          y += 5;
        });
      }

      // Footer
      y = pdf.internal.pageSize.getHeight() - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(128);
      pdf.text("Dados: Climatempo | Grupo Avanço", pageWidth / 2, y, { align: "center" });

      // Save PDF
      const fileName = `previsao-${location.city.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generatePdf}
      disabled={isGenerating}
      className="h-8 gap-1.5 text-xs"
    >
      {isGenerating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileDown className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">PDF</span>
    </Button>
  );
};

