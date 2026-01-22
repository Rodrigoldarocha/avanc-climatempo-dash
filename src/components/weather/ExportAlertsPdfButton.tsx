import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { FileDown, Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { WeatherAlert } from "@/components/weather/AlertsPanel";

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
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
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
        drawRoundedRect(margin, y, contentWidth, 24, 3, darkColor);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(primaryColor);
        pdf.text("RELATÓRIO DE ALERTAS (7 DIAS)", pageWidth / 2, y + 10, { align: "center" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor("#FFFFFF");
        pdf.text(
          `Critérios: chuva > ${rainMmhThreshold} mm/h OU probabilidade > ${rainProbThreshold}% • Janela: ${daysWindow} dias`,
          pageWidth / 2,
          y + 16,
          { align: "center" },
        );

        pdf.setTextColor(mediumGray);
        pdf.text(
          `Gerado em: ${new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}`,
          pageWidth / 2,
          y + 21,
          { align: "center" },
        );

        // Page indicator
        pdf.setTextColor(mediumGray);
        pdf.setFontSize(7);
        pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - margin, y + 26.5, { align: "right" });

        y += 30;
      };

      const addFooter = () => {
        const footerY = pageHeight - 10;
        pdf.setDrawColor(darkColor);
        pdf.setLineWidth(0.25);
        pdf.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(mediumGray);
        pdf.text("Dados fornecidos pela API Climatempo", margin, footerY);
        pdf.text("Grupo Avanço • Monitoramento de alertas", pageWidth / 2, footerY, { align: "center" });
      };

      // First page summary
      drawRoundedRect(margin, y, contentWidth, 16, 2, lightGray);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(textColor);
      pdf.text("RESUMO", margin + 4, y + 6);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(textColor);
      pdf.text(`Total de alertas no período: ${sorted.length}`, margin + 4, y + 12);
      y += 20;

      // Table setup
      const rowH = 6;
      const headerH = 7;
      const maxY = pageHeight - 18; // leave space for footer

      // Columns
      const col = {
        dt: margin + 1,
        local: margin + 34,
        trig: margin + 98,
        val: margin + 132,
        sev: margin + 162,
      };

      const drawTableHeader = () => {
        drawRoundedRect(margin, y, contentWidth, headerH, 2, darkColor);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor("#FFFFFF");
        pdf.text("Data/Hora", col.dt, y + 4.6);
        pdf.text("Local", col.local, y + 4.6);
        pdf.text("Parâmetro", col.trig, y + 4.6);
        pdf.text("Valor", col.val, y + 4.6);
        pdf.text("Sev.", col.sev, y + 4.6);
        y += headerH + 1;
      };

      const totalPages = Math.max(1, Math.ceil((sorted.length + 1) / 28));
      let pageNumber = 1;

      // Build pages
      addHeader(pageNumber, totalPages);
      drawTableHeader();

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);

      for (let i = 0; i < sorted.length; i++) {
        const a = sorted[i];
        if (y + rowH > maxY) {
          addFooter();
          pdf.addPage();
          pageNumber += 1;
          addHeader(pageNumber, totalPages);
          drawTableHeader();
        }

        // zebra
        if (i % 2 === 0) {
          drawRoundedRect(margin, y - 4.5, contentWidth, rowH, 1, "#FFFFFF");
        } else {
          drawRoundedRect(margin, y - 4.5, contentWidth, rowH, 1, lightGray);
        }

        const params = a.triggers
          .map((t) => (t.type === "rain_mm_h" ? "Chuva" : "Prob."))
          .join(" + ");
        const values = a.triggers.map((t) => `${t.value}${t.unit}`).join(" | ");
        const sevLabel = a.severity === "high" ? "Alta" : "Mod.";
        const sevColor = a.severity === "high" ? danger : warn;

        pdf.setTextColor(textColor);
        pdf.text(formatPtBr(a.dateTimeIso), col.dt, y);

        const localShort = `${a.location.local || a.location.city} (${a.location.state})`;
        pdf.text(localShort.substring(0, 32), col.local, y);

        pdf.setTextColor(textColor);
        pdf.text(params, col.trig, y);
        pdf.text(values.substring(0, 18), col.val, y);

        pdf.setTextColor(sevColor);
        pdf.setFont("helvetica", "bold");
        pdf.text(sevLabel, col.sev, y);
        pdf.setFont("helvetica", "normal");

        y += rowH;
      }

      addFooter();

      const fileName = `relatorio-alertas-7d-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      toast({
        title: "PDF gerado com sucesso!",
        description: "Relatório de alertas (7 dias) foi baixado.",
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
