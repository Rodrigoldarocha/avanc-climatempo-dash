import { cn } from "@/lib/utils";
import { LayoutDashboard, Grid3X3, Bell } from "lucide-react";

export type BottomNavTab = "dashboard" | "grid" | "alerts";

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  alertCount?: number;
}

const tabs = [
  { id: "dashboard" as BottomNavTab, label: "Painel", icon: LayoutDashboard },
  { id: "grid" as BottomNavTab, label: "Locais", icon: Grid3X3 },
  { id: "alerts" as BottomNavTab, label: "Alertas", icon: Bell },
];

export const BottomNav = ({ activeTab, onTabChange, alertCount = 0 }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 rounded-[24px] bg-secondary/95 backdrop-blur-xl border border-border/20 shadow-[0_20px_45px_rgba(0,0,0,0.25)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[72px] px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors duration-200 touch-target",
                isActive ? "text-primary" : "text-secondary-foreground/60"
              )}
              aria-label={tab.label}
              role="tab"
              aria-selected={isActive}
            >
              <div className={cn(
                "flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200",
                isActive ? "bg-primary/15 shadow-[inset_0_0_0_1px_rgba(232,255,26,0.28)]" : "bg-transparent"
              )}>
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              </div>
              <span className={cn("text-[11px] font-medium", isActive && "font-semibold")}>{tab.label}</span>
              {tab.id === "alerts" && alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[1rem] rounded-full bg-destructive text-[9px] text-destructive-foreground font-semibold px-1">
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
