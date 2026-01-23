import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { FileDown, Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { WeatherAlert } from "@/components/weather/AlertsPanel";
import { getTotalLocations } from "@/data/locations";
import logoAvanco from "@/assets/logo-avanco.png";

type ExportAlertsPdfButtonProps = {
  alerts: WeatherAlert[];
  rainMmhThreshold: number;
  rainProbThreshold: number;
  daysWindow: number;
};

const formatPtBr = (isoLike: string) => {
  const d = isoLike.includes("T") ? new Date(isoLike) : new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Convert image to base64 for jsPDF
const loadImageAsBase64 = async (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
};

export const ExportAlertsPdfButton = ({
  alerts,
  rainMmhThreshold,
  rainProbThreshold,
  daysWindow,
}: ExportAlertsPdfButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const sorted = useMemo(() => {
    return [...alerts].sort((a, b) => {
      const da = new Date(a.dateTimeIso).getTime();
      const db = new Date(b.dateTimeIso).getTime();
      return db - da;
    });
  }, [alerts]);

  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF({
        orientation: "landscape", // Landscape para mais espaço horizontal
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // PDF colors (branding / legibilidade)
      const darkColor = "#1E2B33";
      const primaryColor = "#D4E300";
      const textColor = "#2D3E4A";
      const mediumGray = "#8B9CAB";
      const lightGray = "#F5F7FA";
      const danger = "#EF4444";
      const warn = "#F59E0B";

      // Load logo
      let logoBase64: string | null = null;
      try {
        logoBase64 = await loadImageAsBase64(logoAvanco);
      } catch (e) {
        console.warn("Could not load logo for PDF:", e);
      }

      const drawRoundedRect = (
        x: number,
        yy: number,
        w: number,
        h: number,
        r: number,
        fill?: string,
        stroke?: string,
      ) => {
        if (fill) pdf.setFillColor(fill);
        if (stroke) pdf.setDrawColor(stroke);
        pdf.roundedRect(x, yy, w, h, r, r, fill && stroke ? "FD" : fill ? "F" : "S");
      };

      const addHeader = (pageNumber: number, totalPages: number) => {
        y = margin;
        
        // Header background
        drawRoundedRect(margin, y, contentWidth, 28, 3, darkColor);

        // Logo (large on the left)
        if (logoBase64) {
          const logoHeight = 18;
          const logoWidth = logoHeight * 3.5; // Aspect ratio aprox
          pdf.addImage(logoBase64, "PNG", margin + 6, y + 5, logoWidth, logoHeight);
        }

        // Title centered
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(primaryColor);
        pdf.text("RELATÓRIO DE ALERTAS METEOROLÓGICOS", pageWidth / 2 + 20, y + 10, { align: "center" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor("#FFFFFF");
        pdf.text(
          `Critérios: chuva > ${rainMmhThreshold} mm/h OU probabilidade > ${rainProbThreshold}% • Período: ${daysWindow} dias`,
          pageWidth / 2 + 20,
          y + 17,
          { align: "center" },
        );

        pdf.setTextColor(mediumGray);
        pdf.setFontSize(7);
        pdf.text(
          `Gerado em: ${new Date().toLocaleString("pt-BR", { 
            hour: "2-digit", 
            minute: "2-digit", 
            day: "2-digit", 
            month: "2-digit", 
            year: "numeric" 
          })} • ${getTotalLocations()} locais monitorados`,
          pageWidth / 2 + 20,
          y + 22,
          { align: "center" },
        );

        // Page indicator (right side)
        pdf.setTextColor(mediumGray);
        pdf.setFontSize(7);
        pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - margin - 4, y + 25, { align: "right" });

        y += 32;
      };

      const addFooter = () => {
        const footerY = pageHeight - 8;
        pdf.setDrawColor(darkColor);
        pdf.setLineWidth(0.25);
        pdf.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6);
        pdf.setTextColor(mediumGray);
        pdf.text("Dados fornecidos pela API Climatempo", margin, footerY);
        pdf.text("Grupo Avanço • Sistema de Monitoramento de Alertas", pageWidth / 2, footerY, { align: "center" });
        pdf.text("www.grupoavanco.com.br", pageWidth - margin, footerY, { align: "right" });
      };

      // Summary box on first page
      const addSummary = () => {
        drawRoundedRect(margin, y, contentWidth, 14, 2, lightGray);
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(textColor);
        pdf.text("RESUMO DO PERÍODO", margin + 4, y + 5);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(textColor);
        
        const highCount = sorted.filter(a => a.severity === "high").length;
        const modCount = sorted.filter(a => a.severity === "moderate").length;
        
        pdf.text(`Total de alertas: ${sorted.length}`, margin + 4, y + 10);
        pdf.setTextColor(danger);
        pdf.text(`Severidade Alta: ${highCount}`, margin + 50, y + 10);
        pdf.setTextColor(warn);
        pdf.text(`Severidade Moderada: ${modCount}`, margin + 100, y + 10);
        
        y += 18;
      };

      // Table setup - Landscape mode with better column distribution
      const rowH = 5.5;
      const headerH = 6.5;
      const maxY = pageHeight - 14;

      // Column positions (landscape A4: 297mm width, using ~277mm content)
      const col = {
        dt: margin + 2,
        local: margin + 38,
        city: margin + 95,
        trig: margin + 145,
        val: margin + 190,
        sev: margin + 230,
      };

      const colWidth = {
        dt: 34,
        local: 55,
        city: 48,
        trig: 43,
        val: 38,
        sev: 40,
      };

      const drawTableHeader = () => {
        drawRoundedRect(margin, y, contentWidth, headerH, 1.5, darkColor);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor("#FFFFFF");
        pdf.text("Data/Hora", col.dt, y + 4.2);
        pdf.text("Local", col.local, y + 4.2);
        pdf.text("Cidade/UF", col.city, y + 4.2);
        pdf.text("Parâmetro", col.trig, y + 4.2);
        pdf.text("Valor", col.val, y + 4.2);
        pdf.text("Severidade", col.sev, y + 4.2);
        y += headerH + 0.5;
      };

      // Calculate total pages
      const rowsPerPage = Math.floor((maxY - 50) / rowH);
      const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage) + 1);
      let pageNumber = 1;

      // Build first page
      addHeader(pageNumber, totalPages);
      addSummary();
      drawTableHeader();

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);

      for (let i = 0; i < sorted.length; i++) {
        const a = sorted[i];
        if (y + rowH > maxY) {
          addFooter();
          pdf.addPage();
          pageNumber += 1;
          addHeader(pageNumber, totalPages);
          drawTableHeader();
        }

        // Zebra striping
        if (i % 2 === 0) {
          drawRoundedRect(margin, y - 3.8, contentWidth, rowH, 0.5, "#FFFFFF");
        } else {
          drawRoundedRect(margin, y - 3.8, contentWidth, rowH, 0.5, lightGray);
        }

        // Format trigger and values
        const params = a.triggers
          .map((t) => (t.type === "rain_mm_h" ? "Chuva (mm/h)" : "Prob. (%)"))
          .join(" + ");
        const values = a.triggers.map((t) => `${t.value}${t.unit}`).join(" | ");
        const sevLabel = a.severity === "high" ? "ALTA" : "MODERADA";
        const sevColor = a.severity === "high" ? danger : warn;

        // Date/Time
        pdf.setTextColor(textColor);
        pdf.text(formatPtBr(a.dateTimeIso), col.dt, y);

        // Local (truncate if too long)
        const localText = a.location.local || "";
        const localTruncated = localText.length > 28 ? localText.substring(0, 26) + "..." : localText;
        pdf.text(localTruncated, col.local, y);

        // City/State
        const cityState = `${a.location.city}/${a.location.state}`;
        const cityTruncated = cityState.length > 24 ? cityState.substring(0, 22) + "..." : cityState;
        pdf.text(cityTruncated, col.city, y);

        // Parameter
        pdf.text(params, col.trig, y);

        // Value
        pdf.setFont("helvetica", "bold");
        pdf.text(values, col.val, y);
        pdf.setFont("helvetica", "normal");

        // Severity with color badge
        pdf.setTextColor(sevColor);
        pdf.setFont("helvetica", "bold");
        pdf.text(sevLabel, col.sev, y);
        pdf.setFont("helvetica", "normal");

        y += rowH;
      }

      addFooter();

      const fileName = `relatorio-alertas-${daysWindow}d-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      toast({
        title: "PDF gerado com sucesso!",
        description: `Relatório de alertas (${daysWindow} dias) foi baixado.`,
      });
    } catch (e) {
      console.error("Erro ao gerar PDF de alertas:", e);
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
      disabled={isGenerating || sorted.length === 0}
      className="h-8 gap-1.5 text-xs transition-all"
      title={sorted.length === 0 ? "Sem alertas para exportar" : "Baixar relatório de alertas (PDF)"}
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
