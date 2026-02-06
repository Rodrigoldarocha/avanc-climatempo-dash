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
import { useQuery } from "@tanstack/react-query";
import { getCurrentWeather, get15DayForecast, get72HourForecast } from "@/services/climatempo";
import type { Location } from "@/data/locations";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface ExportDataButtonProps {
  location: Location;
}

export const ExportDataButton = ({ location }: ExportDataButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

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

  const buildCurrentRows = () => {
    const w = currentData?.data;
    if (!w) return [];
    return [{
      "Temperatura (°C)": Math.round(w.temperature),
      "Sensação (°C)": Math.round(w.sensation),
      "Umidade (%)": w.humidity,
      "Pressão (hPa)": w.pressure,
      "Vento (km/h)": w.wind_velocity,
      "Direção Vento": w.wind_direction,
      "Condição": w.condition || "N/A",
      "Data": w.date,
    }];
  };

  const buildHourlyRows = () => {
    if (!hourlyData?.data || !Array.isArray(hourlyData.data)) return [];
    return hourlyData.data.map((item: any) => ({
      "Data/Hora": item.date || "",
      "Temperatura (°C)": item.temperature?.temperature ?? item.temp ?? "",
      "Umidade (%)": item.humidity ?? "",
      "Chuva (mm)": item.rain?.precipitation ?? (typeof item.rain === "number" ? item.rain : ""),
      "Vento (km/h)": item.wind_velocity ?? "",
      "Direção Vento": item.wind_direction ?? "",
      "Condição": item.condition ?? "",
    }));
  };

  const buildDailyRows = () => {
    const days = Array.isArray(dailyData?.data) ? dailyData.data : [];
    return days.map((d: any) => ({
      "Data": d.date || "",
      "Mín (°C)": d.temperature?.min ?? "",
      "Máx (°C)": d.temperature?.max ?? "",
      "Prob. Chuva (%)": d.rain?.probability ?? "",
      "Precipitação (mm)": d.rain?.precipitation ?? "",
      "Vento Mín (km/h)": d.wind?.velocity_min ?? "",
      "Vento Máx (km/h)": d.wind?.velocity_max ?? "",
      "Umidade Mín (%)": d.humidity?.min ?? "",
      "Umidade Máx (%)": d.humidity?.max ?? "",
      "Nascer do Sol": d.sun?.sunrise ?? "",
      "Pôr do Sol": d.sun?.sunset ?? "",
    }));
  };

  const downloadCSV = (rows: Record<string, any>[], filename: string) => {
    if (rows.length === 0) {
      toast({ title: "Sem dados", description: "Nenhum dado disponível para exportar.", variant: "destructive" });
      return;
    }
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(";"),
      ...rows.map(row => headers.map(h => String(row[h] ?? "")).join(";"))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (filename: string) => {
    const wb = XLSX.utils.book_new();

    const currentRows = buildCurrentRows();
    if (currentRows.length > 0) {
      const ws1 = XLSX.utils.json_to_sheet(currentRows);
      XLSX.utils.book_append_sheet(wb, ws1, "Clima Atual");
    }

    const hourlyRows = buildHourlyRows();
    if (hourlyRows.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(hourlyRows);
      XLSX.utils.book_append_sheet(wb, ws2, "Previsão 72h");
    }

    const dailyRows = buildDailyRows();
    if (dailyRows.length > 0) {
      const ws3 = XLSX.utils.json_to_sheet(dailyRows);
      XLSX.utils.book_append_sheet(wb, ws3, "Previsão 15 dias");
    }

    if (wb.SheetNames.length === 0) {
      toast({ title: "Sem dados", description: "Nenhum dado disponível para exportar.", variant: "destructive" });
      return;
    }

    XLSX.writeFile(wb, filename);
  };

  const handleExport = async (format: "csv-current" | "csv-hourly" | "csv-daily" | "excel") => {
    setIsExporting(true);
    try {
      const citySlug = location.city.toLowerCase().replace(/\s+/g, "-");
      const date = new Date().toISOString().split("T")[0];

      switch (format) {
        case "csv-current":
          downloadCSV(buildCurrentRows(), `clima-atual-${citySlug}-${date}.csv`);
          break;
        case "csv-hourly":
          downloadCSV(buildHourlyRows(), `previsao-72h-${citySlug}-${date}.csv`);
          break;
        case "csv-daily":
          downloadCSV(buildDailyRows(), `previsao-15d-${citySlug}-${date}.csv`);
          break;
        case "excel":
          downloadExcel(`relatorio-completo-${citySlug}-${date}.xlsx`);
          break;
      }

      toast({ title: "Exportado!", description: `Arquivo gerado para ${location.city}.` });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({ title: "Erro ao exportar", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting} className="h-8 w-8 p-0 sm:w-auto sm:px-3 sm:gap-1.5">
          {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline text-xs">Exportar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Exportar Dados</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          <div className="flex flex-col">
            <span>Excel Completo</span>
            <span className="text-xs text-muted-foreground">Todas as abas em .xlsx</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv-current")}>
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>CSV - Clima Atual</span>
            <span className="text-xs text-muted-foreground">Condições atuais</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv-hourly")}>
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>CSV - Previsão 72h</span>
            <span className="text-xs text-muted-foreground">Dados horários</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv-daily")}>
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>CSV - Previsão 15 dias</span>
            <span className="text-xs text-muted-foreground">Dados diários</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
