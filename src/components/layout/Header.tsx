import logoAvanco from "@/assets/logo-avanco.png";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useApiStatus } from "@/hooks/useApiStatus";
import { useAlertCount } from "@/hooks/useAlertCount";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenu } from "./MobileMenu";
import { Clock, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenAlerts?: () => void;
  onRefresh?: () => void;
}

export const Header = ({ onOpenAlerts, onRefresh }: HeaderProps) => {
  const { time, dateShort, dayName } = useCurrentTime();
  const { isOnline, isLoading: statusLoading } = useApiStatus();
  const { highCount } = useAlertCount();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 w-full bg-secondary shadow-lg">
      <div className="container flex h-16 md:h-20 items-center justify-between px-3 md:px-6 gap-2">
        {/* Logo */}
        <img
          src={logoAvanco}
          alt="Grupo Avanço"
          className="h-10 sm:h-12 md:h-14 w-auto flex-shrink-0"
        />

        {/* Center info - hidden on very small screens */}
        <div className="hidden xs:flex items-center gap-2 md:gap-4 flex-1 justify-center">
          {/* Clock */}
          <div className="flex items-center gap-1.5 text-secondary-foreground/80">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px] md:text-xs font-mono tracking-wide">
              <span className="hidden sm:inline capitalize">{dayName} </span>
              {dateShort} <span className="text-secondary-foreground font-semibold">{time}</span>
            </span>
          </div>

          {/* API Status */}
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                statusLoading
                  ? "bg-muted-foreground animate-pulse"
                  : isOnline
                  ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                  : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
              )}
            />
            <span className="text-[9px] md:text-[10px] text-secondary-foreground/60 hidden md:inline">
              {statusLoading ? "..." : isOnline ? "API Online" : "API Offline"}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Alert badge */}
          {highCount > 0 && (
            <button
              onClick={onOpenAlerts}
              className="relative flex items-center justify-center h-9 w-9 rounded-lg bg-secondary-foreground/10 hover:bg-secondary-foreground/20 transition-colors"
              title={`${highCount} alertas de alta severidade`}
            >
              <AlertTriangle className="h-4 w-4 text-secondary-foreground" />
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-4 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold animate-pulse">
                {highCount}
              </span>
            </button>
          )}

          <h1 className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-wider md:tracking-widest text-secondary-foreground uppercase text-right leading-tight">
            Base<br className="sm:hidden" />
            <span className="hidden sm:inline"> - </span>Clima Tempo
          </h1>

          {/* Desktop: theme toggle | Mobile: hamburger menu */}
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
