import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentWeather, get15DayForecast, get72HourForecast } from "@/services/climatempo";
import type { Location } from "@/data/locations";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";

interface ExportPdfButtonProps {
  location: Location;
}

export const ExportPdfButton = ({ location }: ExportPdfButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const { data: hourlyData } = useQuery({
    queryKey: ["hourlyForecast", location.climaTempoCod],
    queryFn: () => get72HourForecast(location.climaTempoCod),
    staleTime: 30 * 60 * 1000,
  });

  // Helper functions for PDF
  const drawRoundedRect = (pdf: jsPDF, x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string) => {
    if (fill) pdf.setFillColor(fill);
    if (stroke) pdf.setDrawColor(stroke);
    pdf.roundedRect(x, y, w, h, r, r, fill && stroke ? "FD" : fill ? "F" : "S");
  };

  const getConditionText = (code: string): string => {
    const conditions: Record<string, string> = {
      "1": "Céu Limpo",
      "1n": "Céu Limpo (Noite)",
      "2": "Parcialmente Nublado",
      "2n": "Parcialmente Nublado",
      "2r": "Pancadas de Chuva",
      "3": "Nublado",
      "4": "Chuva",
      "4r": "Chuva Forte",
      "4t": "Tempestade",
      "5": "Chuva Leve",
      "6": "Tempestade",
      "8": "Neve",
      "9": "Neblina",
    };
    return conditions[code] || "Variável";
  };

  const generatePdf = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Colors
      const primaryColor = "#D4E300"; // Lime
      const darkColor = "#1E2B33"; // Dark Navy
      const textColor = "#2D3E4A";
      const lightGray = "#F5F7FA";
      const mediumGray = "#8B9CAB";

      // === HEADER ===
      drawRoundedRect(pdf, margin, y, contentWidth, 35, 3, darkColor);
      
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(primaryColor);
      pdf.text("RELATÓRIO METEOROLÓGICO", pageWidth / 2, y + 14, { align: "center" });

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#FFFFFF");
      pdf.text(`${location.city}, ${location.state}`, pageWidth / 2, y + 23, { align: "center" });

      pdf.setFontSize(8);
      pdf.setTextColor(mediumGray);
      const generatedDate = new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      pdf.text(`Gerado em: ${generatedDate}`, pageWidth / 2, y + 31, { align: "center" });

      y += 42;

      // === LOCATION INFO ===
      drawRoundedRect(pdf, margin, y, contentWidth, 18, 2, lightGray);
      
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(textColor);
      pdf.text("INFORMAÇÕES DA LOCALIDADE", margin + 5, y + 6);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(`Local: ${location.local || location.city}`, margin + 5, y + 12);
      pdf.text(`Coordenadas: ${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`, margin + 5, y + 16);
      pdf.text(`Código Climatempo: ${location.climaTempoCod}`, pageWidth - margin - 40, y + 12);

      y += 24;

      // === CURRENT WEATHER ===
      if (currentData?.data) {
        const weather = currentData.data;

        drawRoundedRect(pdf, margin, y, contentWidth, 50, 3, "#FFFFFF", darkColor);
        pdf.setDrawColor(darkColor);
        pdf.setLineWidth(0.5);
        
        // Header bar
        drawRoundedRect(pdf, margin, y, contentWidth, 10, 3, darkColor);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor("#FFFFFF");
        pdf.text("☀️ CONDIÇÕES ATUAIS", margin + 5, y + 7);

        // Main temperature
        pdf.setFontSize(36);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(textColor);
        pdf.text(`${Math.round(weather.temperature)}°C`, margin + 20, y + 32);

        pdf.setFontSize(10);
        pdf.setTextColor(mediumGray);
        pdf.text(weather.condition || "N/A", margin + 20, y + 40);

        // Stats grid
        const statsX = margin + 70;
        const colWidth = 35;
        pdf.setFontSize(8);

        // Row 1
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(textColor);
        pdf.text("Sensação Térmica", statsX, y + 18);
        pdf.text("Umidade", statsX + colWidth, y + 18);
        pdf.text("Pressão", statsX + colWidth * 2, y + 18);

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(mediumGray);
        pdf.text(`${Math.round(weather.sensation)}°C`, statsX, y + 24);
        pdf.text(`${weather.humidity}%`, statsX + colWidth, y + 24);
        pdf.text(`${weather.pressure} hPa`, statsX + colWidth * 2, y + 24);

        // Row 2
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(textColor);
        pdf.text("Velocidade Vento", statsX, y + 34);
        pdf.text("Direção", statsX + colWidth, y + 34);
        pdf.text("Atualização", statsX + colWidth * 2, y + 34);

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(mediumGray);
        pdf.text(`${weather.wind_velocity} km/h`, statsX, y + 40);
        pdf.text(weather.wind_direction, statsX + colWidth, y + 40);
        const updateTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        pdf.text(updateTime, statsX + colWidth * 2, y + 40);

        y += 56;
      }

      // === HOURLY FORECAST (Next 24h) ===
      let allHours: Array<{ hour: string; temp: number; rain: number }> = [];
      
      if (hourlyData?.data && Array.isArray(hourlyData.data)) {
        allHours = hourlyData.data.slice(0, 24).map((item: any) => {
          const date = item.date || "";
          const hourMatch = date.match(/(\d{2}):\d{2}:\d{2}$/);
          const hour = hourMatch ? `${hourMatch[1]}h` : "";
          return {
            hour,
            temp: item.temperature?.temperature ?? item.temp ?? 0,
            rain: item.rain?.precipitation ?? (typeof item.rain === "number" ? item.rain : 0),
          };
        });
      }

      if (allHours.length > 0) {
        drawRoundedRect(pdf, margin, y, contentWidth, 38, 3, "#FFFFFF", darkColor);
        
        // Header bar
        drawRoundedRect(pdf, margin, y, contentWidth, 10, 3, darkColor);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor("#FFFFFF");
        pdf.text("⏰ PRÓXIMAS 24 HORAS", margin + 5, y + 7);

        // Hourly grid
        const hourWidth = contentWidth / 12;
        const hoursToShow = allHours.slice(0, 12);

        hoursToShow.forEach((h, i) => {
          const hx = margin + 5 + i * hourWidth;

          pdf.setFontSize(7);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(mediumGray);
          pdf.text(h.hour, hx, y + 18);

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(textColor);
          pdf.text(`${Math.round(h.temp)}°`, hx, y + 26);

          if (h.rain > 0) {
            pdf.setFontSize(6);
            pdf.setTextColor("#3B82F6");
            pdf.text(`${h.rain.toFixed(1)}mm`, hx, y + 32);
          }
        });

        y += 44;
      }

      // === 15-DAY FORECAST ===
      const forecastData = Array.isArray(dailyData?.data) ? dailyData.data : [];
      
      if (forecastData.length > 0) {
        // Check if we need a new page
        if (y + 120 > pageHeight - 30) {
          pdf.addPage();
          y = margin;
        }

        const tableHeight = Math.min(forecastData.length * 7 + 14, 120);
        drawRoundedRect(pdf, margin, y, contentWidth, tableHeight, 3, "#FFFFFF", darkColor);
        
        // Header bar
        drawRoundedRect(pdf, margin, y, contentWidth, 10, 3, darkColor);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor("#FFFFFF");
        pdf.text("📅 PREVISÃO 15 DIAS", margin + 5, y + 7);

        // Table header
        const tableY = y + 14;
        const cols = { date: margin + 5, condition: margin + 35, min: margin + 100, max: margin + 120, rain: margin + 145 };

        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(mediumGray);
        pdf.text("DATA", cols.date, tableY);
        pdf.text("CONDIÇÃO", cols.condition, tableY);
        pdf.text("MÍN", cols.min, tableY);
        pdf.text("MÁX", cols.max, tableY);
        pdf.text("CHUVA", cols.rain, tableY);

        // Table rows
        forecastData.slice(0, 15).forEach((day: any, index: number) => {
          const rowY = tableY + 6 + index * 7;
          const minTemp = day.temperature?.min ?? 0;
          const maxTemp = day.temperature?.max ?? 0;
          const rainProb = day.rain?.probability ?? 0;
          const icon = day.text_icon?.icon?.day || "1";

          // Date label
          let dateLabel = day.date || "-";
          if (index === 0) dateLabel = "Hoje";
          else if (index === 1) dateLabel = "Amanhã";
          else {
            try {
              const date = new Date(day.date);
              const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
              dateLabel = `${weekdays[date.getDay()]}, ${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
            } catch {
              // keep original
            }
          }

          pdf.setFontSize(8);
          pdf.setFont("helvetica", index < 2 ? "bold" : "normal");
          pdf.setTextColor(textColor);
          pdf.text(dateLabel, cols.date, rowY);

          pdf.setFont("helvetica", "normal");
          const conditionText = getConditionText(icon).substring(0, 25);
          pdf.text(conditionText, cols.condition, rowY);

          // Temperatures with color
          pdf.setTextColor("#3B82F6"); // Blue for min
          pdf.text(`${Math.round(minTemp)}°C`, cols.min, rowY);
          
          pdf.setTextColor("#F97316"); // Orange for max
          pdf.text(`${Math.round(maxTemp)}°C`, cols.max, rowY);

          // Rain probability
          pdf.setTextColor(rainProb > 50 ? "#3B82F6" : mediumGray);
          pdf.text(`${rainProb}%`, cols.rain, rowY);
        });

        y += tableHeight + 6;
      }

      // === STATISTICS SUMMARY ===
      if (forecastData.length > 0) {
        // Check if we need a new page
        if (y + 35 > pageHeight - 30) {
          pdf.addPage();
          y = margin;
        }

        const temps = forecastData.map((d: any) => ({
          min: d.temperature?.min ?? 0,
          max: d.temperature?.max ?? 0,
        }));
        const avgMin = temps.reduce((sum: number, t: any) => sum + t.min, 0) / temps.length;
        const avgMax = temps.reduce((sum: number, t: any) => sum + t.max, 0) / temps.length;
        const overallMin = Math.min(...temps.map((t: any) => t.min));
        const overallMax = Math.max(...temps.map((t: any) => t.max));
        const avgRain = forecastData.reduce((sum: number, d: any) => sum + (d.rain?.probability ?? 0), 0) / forecastData.length;

        drawRoundedRect(pdf, margin, y, contentWidth, 28, 3, lightGray);

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(textColor);
        pdf.text("📊 RESUMO ESTATÍSTICO DO PERÍODO", margin + 5, y + 8);

        const statWidth = contentWidth / 5;
        const statData = [
          { label: "Mín. Média", value: `${avgMin.toFixed(1)}°C`, color: "#3B82F6" },
          { label: "Máx. Média", value: `${avgMax.toFixed(1)}°C`, color: "#F97316" },
          { label: "Mínima Absoluta", value: `${overallMin.toFixed(0)}°C`, color: "#06B6D4" },
          { label: "Máxima Absoluta", value: `${overallMax.toFixed(0)}°C`, color: "#EF4444" },
          { label: "Prob. Chuva Média", value: `${avgRain.toFixed(0)}%`, color: "#3B82F6" },
        ];

        statData.forEach((stat, i) => {
          const sx = margin + 5 + i * statWidth;
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(mediumGray);
          pdf.text(stat.label, sx, y + 16);
          
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(stat.color);
          pdf.text(stat.value, sx, y + 24);
        });

        y += 34;
      }

      // === FOOTER ===
      const footerY = pageHeight - 12;
      pdf.setDrawColor(darkColor);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

      pdf.setFontSize(7);
      pdf.setTextColor(mediumGray);
      pdf.text("Dados fornecidos pela API Climatempo", margin, footerY);
      pdf.text("Grupo Avanço • Previsão do Tempo", pageWidth / 2, footerY, { align: "center" });
      pdf.text(`Página 1 de ${pdf.getNumberOfPages()}`, pageWidth - margin, footerY, { align: "right" });

      // Save PDF
      const fileName = `relatorio-meteorologico-${location.city.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      toast({
        title: "PDF gerado com sucesso!",
        description: `Relatório de ${location.city} foi baixado.`,
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
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
      className="h-8 gap-1.5 text-xs transition-all"
    >
      {isGenerating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : showSuccess ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <FileDown className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">{showSuccess ? "Baixado!" : "PDF"}</span>
    </Button>
  );
};
