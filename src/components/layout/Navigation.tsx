import { cn } from "@/lib/utils";
import { Cloud, Clock, Calendar, History } from "lucide-react";

export type TabType = "current" | "hourly" | "daily" | "historical";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "current" as TabType, label: "Agora", icon: Cloud },
  { id: "hourly" as TabType, label: "72 Horas", icon: Clock },
  { id: "daily" as TabType, label: "15 Dias", icon: Calendar },
  { id: "historical" as TabType, label: "Histórico", icon: History },
];

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <nav className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-border/30">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
