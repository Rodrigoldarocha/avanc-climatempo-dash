import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useApiStatus } from "@/hooks/useApiStatus";
import { useAlertCount } from "@/hooks/useAlertCount";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenu } from "./MobileMenu";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-card/75 backdrop-blur-xl supports-[backdrop-filter]:bg-card/65">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary shadow-[0_10px_30px_rgba(212,227,0,0.18)] transition-transform duration-300 hover:scale-[1.02]">
            <CloudSun className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="data-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
              Clima Tempo
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground/75 truncate">
              <span className="font-semibold tracking-[0.02em] truncate">{dateShort}</span>
              <span className="text-muted-foreground/70">{time}</span>
            </div>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center gap-3 sm:flex">
          <ApiStatusIndicator />
          <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-primary shadow-sm">
            {highCount > 0 ? `${highCount} alertas críticos` : "Sem alertas críticos"}
          </div>
        </div>


        <div className="flex items-center gap-2">
          {!isMobile && highCount > 0 && (
            <button
              onClick={onOpenAlerts}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-secondary/20 text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-destructive/30 hover:bg-destructive/10"
              title={`${highCount} alertas de alta severidade`}
            >
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                {highCount}
              </span>
            </button>
          )}

          {isMobile ? (
            <MobileMenu onRefresh={onRefresh} />
          ) : (
            <>
              <GoogleAuthButton />
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
    </header>
  );
};
