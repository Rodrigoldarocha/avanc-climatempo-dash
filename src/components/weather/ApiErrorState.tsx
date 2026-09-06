import { AlertTriangle, RefreshCw, Clock } from "lucide-react";
import { describeApiError, type ApiEndpoint } from "@/services/climatempo";
import { Button } from "@/components/ui/button";

interface ApiErrorStateProps {
  error: unknown;
  endpoint?: ApiEndpoint;
  onRetry?: () => void;
  isRetrying?: boolean;
}

/**
 * Estado de erro detalhado por endpoint, com botão de nova tentativa manual.
 * Nunca bloqueia o app: é sempre renderizado dentro do card correspondente.
 */
export const ApiErrorState = ({ error, endpoint, onRetry, isRetrying }: ApiErrorStateProps) => {
  const { title, detail, retryable, code } = describeApiError(error, endpoint);

  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-6 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        {code === "429" ? <Clock className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mx-auto max-w-sm text-xs text-muted-foreground">{detail}</p>
        {code && (
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            código: {code}
          </p>
        )}
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="h-11 gap-2"
        >
          <RefreshCw className={isRetrying ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {isRetrying ? "Tentando..." : retryable ? "Tentar novamente" : "Tentar mesmo assim"}
        </Button>
      )}
    </div>
  );
};
