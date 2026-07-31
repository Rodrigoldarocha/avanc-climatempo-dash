import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Grid3X3, Siren, Cloud, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarPage = "dashboard" | "grid" | "alerts" | "current" | "hourly" | "daily";

interface AppSidebarProps {
  current: SidebarPage;
  onSelect: (page: SidebarPage) => void;
  alertCount?: number;
}

const primary = [
  { id: "dashboard" as SidebarPage, label: "Painel", icon: LayoutDashboard },
  { id: "grid" as SidebarPage, label: "Locais", icon: Grid3X3 },
  { id: "alerts" as SidebarPage, label: "Alertas", icon: Siren },
];

const forecast = [
  { id: "current" as SidebarPage, label: "Clima Atual", icon: Cloud },
  { id: "hourly" as SidebarPage, label: "Previsão 72h", icon: Clock },
  { id: "daily" as SidebarPage, label: "Previsão 15 dias", icon: Calendar },
];

export function AppSidebar({ current, onSelect, alertCount = 0 }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const renderItem = (item: { id: SidebarPage; label: string; icon: any }) => {
    const Icon = item.icon;
    const isActive = current === item.id;
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          onClick={() => onSelect(item.id)}
          isActive={isActive}
          tooltip={item.label}
          className={cn(
            "gap-2 border-l-4 rounded-r-lg h-10 transition-all",
            isActive
              ? "border-primary bg-sidebar-accent text-sidebar-foreground font-medium"
              : "border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-0.5"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
          {!collapsed && item.id === "alerts" && alertCount > 0 && (
            <span className="ml-auto flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {alertCount}
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{primary.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Previsões</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{forecast.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}