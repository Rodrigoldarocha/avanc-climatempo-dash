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
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
      return da - db; // ordem crescente
    });
  }, [alerts]);

  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const darkColor = "#1E2B33";
      const primaryColor = "#D4E300";
      const textColor = "#2D3E4A";
      const mediumGray = "#8B9CAB";
      const lightGray = "#F5F7FA";
      const danger = "#EF4444";
      const warn = "#F59E0B";

      let logoBase64: string | null = null;
      try {
        logoBase64 = await loadImageAsBase64(logoAvanco);
      } catch (e) {
        console.warn("Could not load logo:", e);
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

      // Calculate pages first
      const rowH = 5;
      const headerH = 6;
      const usableHeight = pageHeight - 45; // header + footer space
      const rowsPerPage = Math.floor(usableHeight / rowH);
      const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
      let pageNumber = 1;

      const addHeader = () => {
        y = margin;
        
        drawRoundedRect(margin, y, contentWidth, 22, 2, darkColor);

        if (logoBase64) {
          const logoHeight = 14;
          const logoWidth = logoHeight * 3.5;
          pdf.addImage(logoBase64, "PNG", margin + 4, y + 4, logoWidth, logoHeight);
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(primaryColor);
        pdf.text("RELATÓRIO DE ALERTAS METEOROLÓGICOS", pageWidth / 2 + 15, y + 8, { align: "center" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor("#FFFFFF");
        pdf.text(
          `Chuva > ${rainMmhThreshold} mm/h OU Probabilidade > ${rainProbThreshold}% • Período: ${daysWindow} dias`,
          pageWidth / 2 + 15,
          y + 14,
          { align: "center" },
        );

        pdf.setTextColor(mediumGray);
        pdf.setFontSize(6);
        pdf.text(
          `Gerado: ${new Date().toLocaleString("pt-BR", { 
            hour: "2-digit", 
            minute: "2-digit", 
            day: "2-digit", 
            month: "2-digit", 
            year: "numeric" 
          })} • ${getTotalLocations()} locais • Pág ${pageNumber}/${totalPages}`,
          pageWidth / 2 + 15,
          y + 18,
          { align: "center" },
        );

        y += 26;
      };

      const addSummary = () => {
        drawRoundedRect(margin, y, contentWidth, 10, 1.5, lightGray);
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(textColor);
        pdf.text("RESUMO", margin + 4, y + 4);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        
        const highCount = sorted.filter(a => a.severity === "high").length;
        const modCount = sorted.filter(a => a.severity === "moderate").length;
        
        pdf.text(`Total: ${sorted.length}`, margin + 30, y + 4);
        pdf.setTextColor(danger);
        pdf.text(`Alta: ${highCount}`, margin + 55, y + 4);
        pdf.setTextColor(warn);
        pdf.text(`Moderada: ${modCount}`, margin + 80, y + 4);
        
        y += 14;
      };

      const addFooter = () => {
        const footerY = pageHeight - 6;
        pdf.setDrawColor(darkColor);
        pdf.setLineWidth(0.2);
        pdf.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(5);
        pdf.setTextColor(mediumGray);
        pdf.text("Dados: API Climatempo", margin, footerY);
        pdf.text("Grupo Avanço • Sistema de Monitoramento", pageWidth / 2, footerY, { align: "center" });
        pdf.text("www.grupoavanco.com.br", pageWidth - margin, footerY, { align: "right" });
      };

      // Column positions - optimized for landscape
      const col = {
        dt: margin + 2,
        local: margin + 32,
        city: margin + 82,
        trig: margin + 125,
        val: margin + 168,
        sev: margin + 205,
      };

      const drawTableHeader = () => {
        drawRoundedRect(margin, y, contentWidth, headerH, 1, darkColor);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6);
        pdf.setTextColor("#FFFFFF");
        pdf.text("Data/Hora", col.dt, y + 4);
        pdf.text("Local", col.local, y + 4);
        pdf.text("Cidade/UF", col.city, y + 4);
        pdf.text("Parâmetro", col.trig, y + 4);
        pdf.text("Valor", col.val, y + 4);
        pdf.text("Severidade", col.sev, y + 4);
        y += headerH + 1;
      };

      // First page
      addHeader();
      addSummary();
      drawTableHeader();

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);

      const maxY = pageHeight - 12;

      for (let i = 0; i < sorted.length; i++) {
        const a = sorted[i];
        
        if (y + rowH > maxY) {
          addFooter();
          pdf.addPage();
          pageNumber += 1;
          addHeader();
          drawTableHeader();
        }

        // Zebra striping
        if (i % 2 === 1) {
          drawRoundedRect(margin, y - 3.5, contentWidth, rowH, 0.5, lightGray);
        }

        const params = a.triggers
          .map((t) => (t.type === "rain_mm_h" ? "Chuva" : "Prob."))
          .join(" + ");
        const values = a.triggers.map((t) => `${t.value}${t.unit}`).join(" | ");
        const sevLabel = a.severity === "high" ? "ALTA" : "MODERADA";
        const sevColor = a.severity === "high" ? danger : warn;

        pdf.setTextColor(textColor);
        pdf.text(formatPtBr(a.dateTimeIso), col.dt, y);

        const localText = a.location.local || "";
        const localTruncated = localText.length > 26 ? localText.substring(0, 24) + "..." : localText;
        pdf.text(localTruncated, col.local, y);

        const cityState = `${a.location.city}/${a.location.state}`;
        const cityTruncated = cityState.length > 22 ? cityState.substring(0, 20) + "..." : cityState;
        pdf.text(cityTruncated, col.city, y);

        pdf.text(params, col.trig, y);

        pdf.setFont("helvetica", "bold");
        pdf.text(values, col.val, y);
        pdf.setFont("helvetica", "normal");

        pdf.setTextColor(sevColor);
        pdf.setFont("helvetica", "bold");
        pdf.text(sevLabel, col.sev, y);
        pdf.setFont("helvetica", "normal");

        y += rowH;
      }

      addFooter();

      const fileName = `alertas-${daysWindow}d-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      toast({
        title: "PDF gerado!",
        description: `Relatório de alertas baixado.`,
      });
    } catch (e) {
      console.error("Erro ao gerar PDF:", e);
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
      disabled={isGenerating || sorted.length === 0}
      className="h-8 w-8 p-0 sm:w-auto sm:px-3 sm:gap-1.5 transition-all"
      title={sorted.length === 0 ? "Sem alertas" : "Baixar PDF"}
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
