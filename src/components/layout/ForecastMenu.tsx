import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Cloud, Clock, Calendar, History, Siren, Map, ChevronDown } from "lucide-react";

export type MenuOption = "current" | "hourly" | "daily" | "historical" | "alerts" | "map";

interface ForecastMenuProps {
  onSelect: (option: MenuOption) => void;
  currentOption?: MenuOption;
}

const menuItems = [
  { id: "current" as MenuOption, label: "Clima Atual", icon: Cloud, description: "Condições em tempo real" },
  { id: "hourly" as MenuOption, label: "Previsão 72h", icon: Clock, description: "Próximas 72 horas" },
  { id: "daily" as MenuOption, label: "Previsão 15 dias", icon: Calendar, description: "Próximos 15 dias" },
  { id: "historical" as MenuOption, label: "Histórico", icon: History, description: "Dados históricos" },
  { id: "alerts" as MenuOption, label: "Alertas", icon: Siren, description: "Alertas meteorológicos" },
  { id: "map" as MenuOption, label: "Mapa", icon: Map, description: "Visualização geográfica" },
];

export function ForecastMenu({ onSelect, currentOption }: ForecastMenuProps) {
  const currentItem = menuItems.find(item => item.id === currentOption) || menuItems[0];
  const CurrentIcon = currentItem.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentItem.label}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Menu de Previsões</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentOption === item.id;
          
          return (
            <DropdownMenuItem
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={isActive ? "bg-primary/10" : ""}
            >
              <Icon className={`h-4 w-4 mr-2 ${isActive ? "text-primary" : ""}`} />
              <div className="flex flex-col">
                <span className={isActive ? "text-primary font-medium" : ""}>{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
