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
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Colors
      const primaryColor = "#D4E300";
      const darkColor = "#1E2B33";
      const textColor = "#2D3E4A";
      const lightGray = "#F5F7FA";
      const mediumGray = "#8B9CAB";

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 20) {
          pdf.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // === HEADER ===
      drawRoundedRect(pdf, margin, y, contentWidth, 30, 3, darkColor);
      
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(primaryColor);
      pdf.text("RELATÓRIO METEOROLÓGICO", pageWidth / 2, y + 12, { align: "center" });

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("#FFFFFF");
      pdf.text(`${location.city}, ${location.state}`, pageWidth / 2, y + 20, { align: "center" });

      pdf.setFontSize(7);
      pdf.setTextColor(mediumGray);
      const generatedDate = new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      pdf.text(`Gerado em: ${generatedDate}`, pageWidth / 2, y + 27, { align: "center" });

      y += 36;

      // === LOCATION INFO ===
      drawRoundedRect(pdf, margin, y, contentWidth, 14, 2, lightGray);
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(textColor);
      pdf.text("INFORMAÇÕES", margin + 4, y + 5);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(`Local: ${location.local || location.city}`, margin + 4, y + 10);
      pdf.text(`Coord: ${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`, margin + 80, y + 10);

      y += 18;

      // === CURRENT WEATHER ===
      if (currentData?.data) {
        const weather = currentData.data;

        checkPageBreak(42);
        drawRoundedRect(pdf, margin, y, contentWidth, 40, 3, "#FFFFFF", darkColor);
        
        drawRoundedRect(pdf, margin, y, contentWidth, 8, 2, darkColor);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor("#FFFFFF");
        pdf.text("CONDIÇÕES ATUAIS", margin + 4, y + 5.5);

        pdf.setFontSize(28);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(textColor);
        pdf.text(`${Math.round(weather.temperature)}°C`, margin + 15, y + 26);

        pdf.setFontSize(9);
        pdf.setTextColor(mediumGray);
        pdf.text(weather.condition || "N/A", margin + 15, y + 33);

        const statsX = margin + 60;
        const colW = 32;
        pdf.setFontSize(7);

        const stats = [
          { label: "Sensação", value: `${Math.round(weather.sensation)}°C` },
          { label: "Umidade", value: `${weather.humidity}%` },
          { label: "Pressão", value: `${weather.pressure} hPa` },
          { label: "Vento", value: `${weather.wind_velocity} km/h` },
        ];

        stats.forEach((stat, i) => {
          const sx = statsX + (i % 2) * colW;
          const sy = y + 16 + Math.floor(i / 2) * 10;
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(textColor);
          pdf.text(stat.label, sx, sy);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(mediumGray);
          pdf.text(stat.value, sx, sy + 4);
        });

        y += 46;
      }

      // === HOURLY FORECAST (Next 12h) ===
      let allHours: Array<{ hour: string; temp: number; rain: number }> = [];
      
      if (hourlyData?.data && Array.isArray(hourlyData.data)) {
        allHours = hourlyData.data.slice(0, 12).map((item: any) => {
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
        checkPageBreak(32);
        drawRoundedRect(pdf, margin, y, contentWidth, 30, 3, "#FFFFFF", darkColor);
        
        drawRoundedRect(pdf, margin, y, contentWidth, 8, 2, darkColor);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor("#FFFFFF");
        pdf.text("PRÓXIMAS 12 HORAS", margin + 4, y + 5.5);

        const hourWidth = contentWidth / 12;
        allHours.forEach((h, i) => {
          const hx = margin + 4 + i * hourWidth;

          pdf.setFontSize(6);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(mediumGray);
          pdf.text(h.hour, hx, y + 15);

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(textColor);
          pdf.text(`${Math.round(h.temp)}°`, hx, y + 21);

          if (h.rain > 0) {
            pdf.setFontSize(5);
            pdf.setTextColor("#3B82F6");
            pdf.text(`${h.rain.toFixed(1)}mm`, hx, y + 26);
          }
        });

        y += 36;
      }

      // === 15-DAY FORECAST ===
      const forecastData = Array.isArray(dailyData?.data) ? dailyData.data : [];
      
      if (forecastData.length > 0) {
        checkPageBreak(100);
        
        const rowHeight = 5.5;
        const tableHeight = Math.min(forecastData.length, 15) * rowHeight + 12;
        
        drawRoundedRect(pdf, margin, y, contentWidth, tableHeight, 3, "#FFFFFF", darkColor);
        
        drawRoundedRect(pdf, margin, y, contentWidth, 8, 2, darkColor);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor("#FFFFFF");
        pdf.text("PREVISÃO 15 DIAS", margin + 4, y + 5.5);

        const tableY = y + 12;
        const cols = { 
          date: margin + 4, 
          condition: margin + 35, 
          min: margin + 95, 
          max: margin + 115, 
          rain: margin + 140 
        };

        pdf.setFontSize(6);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(mediumGray);
        pdf.text("DATA", cols.date, tableY);
        pdf.text("CONDIÇÃO", cols.condition, tableY);
        pdf.text("MÍN", cols.min, tableY);
        pdf.text("MÁX", cols.max, tableY);
        pdf.text("CHUVA", cols.rain, tableY);

        forecastData.slice(0, 15).forEach((day: any, index: number) => {
          const rowY = tableY + 5 + index * rowHeight;
          const minTemp = day.temperature?.min ?? 0;
          const maxTemp = day.temperature?.max ?? 0;
          const rainProb = day.rain?.probability ?? 0;
          const icon = day.text_icon?.icon?.day || "1";

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

          pdf.setFontSize(7);
          pdf.setFont("helvetica", index < 2 ? "bold" : "normal");
          pdf.setTextColor(textColor);
          pdf.text(dateLabel, cols.date, rowY);

          pdf.setFont("helvetica", "normal");
          const conditionText = getConditionText(icon).substring(0, 22);
          pdf.text(conditionText, cols.condition, rowY);

          pdf.setTextColor("#3B82F6");
          pdf.text(`${Math.round(minTemp)}°C`, cols.min, rowY);
          
          pdf.setTextColor("#F97316");
          pdf.text(`${Math.round(maxTemp)}°C`, cols.max, rowY);

          pdf.setTextColor(rainProb > 50 ? "#3B82F6" : mediumGray);
          pdf.text(`${rainProb}%`, cols.rain, rowY);
        });

        y += tableHeight + 6;
      }

      // === STATISTICS SUMMARY ===
      if (forecastData.length > 0) {
        checkPageBreak(24);

        const temps = forecastData.map((d: any) => ({
          min: d.temperature?.min ?? 0,
          max: d.temperature?.max ?? 0,
        }));
        const avgMin = temps.reduce((sum: number, t: any) => sum + t.min, 0) / temps.length;
        const avgMax = temps.reduce((sum: number, t: any) => sum + t.max, 0) / temps.length;
        const overallMin = Math.min(...temps.map((t: any) => t.min));
        const overallMax = Math.max(...temps.map((t: any) => t.max));
        const avgRain = forecastData.reduce((sum: number, d: any) => sum + (d.rain?.probability ?? 0), 0) / forecastData.length;

        drawRoundedRect(pdf, margin, y, contentWidth, 22, 3, lightGray);

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(textColor);
        pdf.text("RESUMO ESTATÍSTICO", margin + 4, y + 6);

        const statWidth = contentWidth / 5;
        const statData = [
          { label: "Mín. Média", value: `${avgMin.toFixed(1)}°C`, color: "#3B82F6" },
          { label: "Máx. Média", value: `${avgMax.toFixed(1)}°C`, color: "#F97316" },
          { label: "Mín. Absoluta", value: `${overallMin.toFixed(0)}°C`, color: "#06B6D4" },
          { label: "Máx. Absoluta", value: `${overallMax.toFixed(0)}°C`, color: "#EF4444" },
          { label: "Prob. Chuva", value: `${avgRain.toFixed(0)}%`, color: "#3B82F6" },
        ];

        statData.forEach((stat, i) => {
          const sx = margin + 4 + i * statWidth;
          pdf.setFontSize(6);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(mediumGray);
          pdf.text(stat.label, sx, y + 12);
          
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(stat.color);
          pdf.text(stat.value, sx, y + 18);
        });

        y += 28;
      }

      // === FOOTER (on each page) ===
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        const footerY = pageHeight - 8;
        pdf.setDrawColor(darkColor);
        pdf.setLineWidth(0.3);
        pdf.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

        pdf.setFontSize(6);
        pdf.setTextColor(mediumGray);
        pdf.text("Dados: API Climatempo", margin, footerY);
        pdf.text("Grupo Avanço • Previsão do Tempo", pageWidth / 2, footerY, { align: "center" });
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, footerY, { align: "right" });
      }

      const fileName = `relatorio-${location.city.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      toast({
        title: "PDF gerado!",
        description: `Relatório de ${location.city} baixado.`,
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente.",
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
      className="h-8 w-8 p-0 sm:w-auto sm:px-3 sm:gap-1.5 transition-all"
    >
      {isGenerating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : showSuccess ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <FileDown className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline text-xs">{showSuccess ? "OK!" : "PDF"}</span>
    </Button>
  );
};
