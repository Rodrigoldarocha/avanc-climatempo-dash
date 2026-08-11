import { Menu, RefreshCw, Moon, Sun, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "@/components/theme/ThemeProvider";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { useApiStatus } from "@/hooks/useApiStatus";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MobileMenuProps {
  onRefresh?: () => void;
}

export function MobileMenu({ onRefresh }: MobileMenuProps) {
  const { theme, setTheme } = useTheme();
  const { isOnline } = useApiStatus();
  const { full } = useCurrentTime();
  const [open, setOpen] = useState(false);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-xl bg-secondary-foreground/10 hover:bg-secondary-foreground/20"
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4 text-secondary-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 p-0">
        <SheetHeader className="p-4 border-b border-border/30">
          <SheetTitle className="text-sm font-display">Menu</SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-4">
          {/* Clock */}
          <div className="text-xs text-muted-foreground capitalize">{full}</div>

          {/* API Status */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                isOnline
                  ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                  : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
              )}
            />
            <span>{isOnline ? "API Climatempo Online" : "API Offline"}</span>
          </div>

          <div className="border-t border-border/30" />

          {/* Actions */}
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="h-11 w-full justify-start gap-3 px-3"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? "Modo claro" : "Modo escuro"}
          </Button>

          {onRefresh && (
            <Button
              variant="ghost"
              onClick={() => {
                onRefresh();
                setOpen(false);
              }}
              className="h-11 w-full justify-start gap-3 px-3"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar dados
            </Button>
          )}

          <div className="border-t border-border/30" />

          <GoogleAuthButton variant="full" onDone={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
