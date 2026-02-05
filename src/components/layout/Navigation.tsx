import { cn } from "@/lib/utils";
import { Cloud, Clock, Calendar, Siren } from "lucide-react";

export type TabType = "current" | "hourly" | "daily" | "alerts";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "current" as TabType, label: "Agora", icon: Cloud },
  { id: "hourly" as TabType, label: "72h", icon: Clock },
  { id: "daily" as TabType, label: "15d", icon: Calendar },
  { id: "alerts" as TabType, label: "Alertas", icon: Siren },
];

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <nav className="flex items-center gap-0.5 p-0.5 bg-muted/40 rounded-lg border border-border/20 w-full overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center justify-center gap-1 px-2.5 py-2 rounded-md text-xs font-medium transition-all flex-1 min-w-0 whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
