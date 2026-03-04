import { cn } from "@/lib/utils";
import { LayoutDashboard, Grid3X3, Siren, Map } from "lucide-react";

export type BottomNavTab = "dashboard" | "grid" | "alerts" | "map";

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  alertCount?: number;
}

const tabs = [
  { id: "dashboard" as BottomNavTab, label: "Painel", icon: LayoutDashboard },
  { id: "grid" as BottomNavTab, label: "Locais", icon: Grid3X3 },
  { id: "alerts" as BottomNavTab, label: "Alertas", icon: Siren },
  { id: "map" as BottomNavTab, label: "Mapa", icon: Map },
];

export const BottomNav = ({ activeTab, onTabChange, alertCount = 0 }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-secondary/90 backdrop-blur-xl border-t border-border/20 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-secondary-foreground/50"
              )}
              aria-label={tab.label}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary animate-scale-in" />
              )}
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                {tab.id === "alerts" && alertCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center h-3.5 min-w-3.5 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold">
                    {alertCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
