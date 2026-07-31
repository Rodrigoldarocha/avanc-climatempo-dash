import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useApiStatus } from "@/hooks/useApiStatus";
import { useAlertCount } from "@/hooks/useAlertCount";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenu } from "./MobileMenu";
import { CloudSun, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenAlerts?: () => void;
  onRefresh?: () => void;
}

export const Header = ({ onOpenAlerts, onRefresh }: HeaderProps) => {
  const { time, dateShort } = useCurrentTime();
  const { isOnline, isLoading: statusLoading } = useApiStatus();
  const { highCount } = useAlertCount();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary shadow-sm shadow-primary/20">
            <CloudSun className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="data-label text-muted-foreground/70">
              Clima Tempo
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground/75 truncate">
              <span className="font-semibold truncate">{dateShort}</span>
              <span className="text-muted-foreground/70">{time}</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 min-w-0 justify-center flex-1">
          <div className="rounded-full border border-white/5 bg-secondary/30 px-3 py-1.5 data-label text-muted-foreground">
            {statusLoading ? "Verificando API..." : isOnline ? "API Online" : "API Offline"}
          </div>
          <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 data-label text-primary">
            {highCount > 0 ? `${highCount} alertas críticos` : "Sem alertas críticos"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && highCount > 0 && (
            <button
              onClick={onOpenAlerts}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-secondary-foreground/10 text-secondary-foreground transition hover:bg-secondary-foreground/15"
              title={`${highCount} alertas de alta severidade`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive text-[9px] text-destructive-foreground font-bold px-1">
                {highCount}
              </span>
            </button>
          )}

          {isMobile ? (
            <MobileMenu onRefresh={onRefresh} />
          ) : (
            <ThemeToggle />
          )}
        </div>
      </div>
    </header>
  );
};
