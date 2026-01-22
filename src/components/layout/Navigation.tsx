import { cn } from "@/lib/utils";
import { Cloud, Clock, Calendar, History, Siren } from "lucide-react";

export type TabType = "current" | "hourly" | "daily" | "historical" | "alerts";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "current" as TabType, label: "Agora", icon: Cloud },
  { id: "hourly" as TabType, label: "72h", icon: Clock },
  { id: "daily" as TabType, label: "15d", icon: Calendar },
  { id: "alerts" as TabType, label: "Alertas", icon: Siren },
  { id: "historical" as TabType, label: "Hist", icon: History },
];

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <nav className="flex items-center gap-0.5 p-0.5 bg-muted/40 rounded-lg border border-border/20 w-full sm:w-auto overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 sm:flex-none whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
