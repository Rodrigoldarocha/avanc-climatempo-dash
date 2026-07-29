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
    <nav className="fixed bottom-3 left-3 right-3 z-50 rounded-3xl bg-secondary/90 backdrop-blur-xl border border-border/20 shadow-[var(--shadow-clay)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors touch-target",
                isActive ? "text-primary" : "text-secondary-foreground/50"
              )}
              aria-label={tab.label}
              role="tab"
              aria-selected={isActive}
            >
              <div className="relative">
                <div className={cn(
                  "flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200",
                  isActive ? "bg-primary/15" : "bg-transparent"
                )}>
                  <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                </div>
                {tab.id === "alerts" && alertCount > 0 && (
                  <span className="absolute -top-1.5 -right-1 flex items-center justify-center h-3.5 min-w-3.5 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold">
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
