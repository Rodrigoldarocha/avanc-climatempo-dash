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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-secondary/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_24px_rgba(0,0,0,0.2)] rounded-t-xl pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[68px] px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-full transition-all duration-200 touch-target",
                isActive
                  ? "bg-primary/15 text-primary scale-105"
                  : "text-secondary-foreground/60 hover:text-primary"
              )}
              aria-label={tab.label}
              role="tab"
              aria-selected={isActive}
            >
              <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              <span className={cn("text-[11px]", isActive && "font-semibold")}>{tab.label}</span>
              {tab.id === "alerts" && alertCount > 0 && (
                <span className="absolute -top-1 right-1/4 flex items-center justify-center h-4 min-w-[1rem] rounded-full bg-destructive text-[9px] text-destructive-foreground font-semibold px-1">
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
