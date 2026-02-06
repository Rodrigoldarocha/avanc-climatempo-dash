import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import type { WeatherAlert } from "@/components/weather/AlertsPanel";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface ExportAlertsDataButtonProps {
  alerts: WeatherAlert[];
}

const formatDate = (isoLike: string) => {
  const d = isoLike.includes("T") ? new Date(isoLike) : new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike;
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

export const ExportAlertsDataButton = ({ alerts }: ExportAlertsDataButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const buildRows = () =>
    alerts.map((a) => ({
      "Data/Hora": formatDate(a.dateTimeIso),
      "Local": a.location.local || "",
      "Cidade": a.location.city,
      "UF": a.location.state,
      "Uniorg": a.location.uniorg,
      "Parâmetro": a.triggers.map(t => t.type === "rain_mm_h" ? "Chuva" : "Probabilidade").join(" + "),
      "Valor": a.triggers.map(t => `${t.value}${t.unit}`).join(" | "),
      "Severidade": a.severity === "high" ? "Alta" : "Moderada",
      "Latitude": a.location.latitude,
      "Longitude": a.location.longitude,
    }));

  const downloadCSV = () => {
    const rows = buildRows();
    if (rows.length === 0) {
      toast({ title: "Sem alertas", description: "Nenhum alerta para exportar.", variant: "destructive" });
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(";"),
      ...rows.map(r => headers.map(h => String(r[h as keyof typeof r] ?? "")).join(";"))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alertas-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = () => {
    const rows = buildRows();
    if (rows.length === 0) {
      toast({ title: "Sem alertas", description: "Nenhum alerta para exportar.", variant: "destructive" });
      return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Alertas");
    XLSX.writeFile(wb, `alertas-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleExport = async (format: "csv" | "excel") => {
    setIsExporting(true);
    try {
      format === "csv" ? downloadCSV() : downloadExcel();
      toast({ title: "Exportado!", description: "Arquivo de alertas gerado." });
    } catch (e) {
      console.error("Erro ao exportar:", e);
      toast({ title: "Erro ao exportar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting || alerts.length === 0} className="h-8 w-8 p-0 sm:w-auto sm:px-3 sm:gap-1.5">
          {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline text-xs">Exportar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Exportar Alertas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
          <span>Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="h-4 w-4 mr-2" />
          <span>CSV (.csv)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
