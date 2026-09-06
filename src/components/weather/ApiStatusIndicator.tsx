import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useApiHealth } from "@/hooks/useApiStatus";
import { cn } from "@/lib/utils";

/**
 * Mostra o status online/offline do backend por endpoint (clima atual e 72h)
 * com botão de verificação manual.
 */
export const ApiStatusIndicator = ({ compact = false }: { compact?: boolean }) => {
  const { isOnline, isLoading, isChecking, endpoints, lastCheckedAt, recheck } = useApiHealth();

  const offline = endpoints.filter((e) => !e.isOnline);
  const allOnline = offline.length === 0;

  const label = isLoading
    ? "Verificando API..."
    : allOnline
      ? "API online"
      : isOnline
        ? `API parcial (${offline.map((e) => e.label).join(", ")} indisponível)`
        : "API offline";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-white/10 bg-secondary/20 px-3 py-1.5 shadow-sm",
        !isLoading && !allOnline && "border-destructive/30 bg-destructive/10"
      )}
      title={
        offline.length > 0
          ? offline.map((e) => `${e.label}: ${e.detail ?? "indisponível"}`).join(" • ")
          : lastCheckedAt
            ? `Última verificação: ${lastCheckedAt.toLocaleTimeString("pt-BR")}`
            : undefined
      }
    >
      {allOnline && !isLoading ? (
        <Wifi className="h-3.5 w-3.5 text-primary" />
      ) : (
        <WifiOff className={cn("h-3.5 w-3.5", isLoading ? "text-muted-foreground" : "text-destructive")} />
      )}
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-[0.18em]",
          allOnline || isLoading ? "text-muted-foreground" : "text-destructive"
        )}
      >
        {compact ? (allOnline ? "Online" : isLoading ? "..." : "Offline") : label}
      </span>
      <button
        type="button"
        onClick={recheck}
        aria-label="Verificar status da API novamente"
        className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
      >
        <RefreshCw className={cn("h-3 w-3", isChecking && "animate-spin")} />
      </button>
    </div>
  );
};
