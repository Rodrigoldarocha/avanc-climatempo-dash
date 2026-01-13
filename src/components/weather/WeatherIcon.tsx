import { 
  Sun, 
  Moon, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  CloudFog,
  CloudSun,
  CloudMoon,
  Droplets,
  Wind
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherIconProps {
  condition: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

export const WeatherIcon = ({ condition, size = "md", className }: WeatherIconProps) => {
  const iconClass = cn(sizeClasses[size], className);
  
  // Map Climatempo icon codes to Lucide icons
  const getIcon = () => {
    const code = condition?.toLowerCase() || "";
    
    if (code.includes("1n") || code === "1n") {
      return <Moon className={cn(iconClass, "text-yellow-300")} />;
    }
    if (code === "1" || code.includes("sol") || code.includes("clear")) {
      return <Sun className={cn(iconClass, "text-yellow-400")} />;
    }
    if (code.includes("2n") || code.includes("parcialmente") && code.includes("noite")) {
      return <CloudMoon className={cn(iconClass, "text-slate-400")} />;
    }
    if (code.includes("2") || code.includes("parcialmente") || code.includes("nublado parcial")) {
      return <CloudSun className={cn(iconClass, "text-yellow-400")} />;
    }
    if (code.includes("4t") || code.includes("6") || code.includes("trovoada") || code.includes("tempest")) {
      return <CloudLightning className={cn(iconClass, "text-purple-400")} />;
    }
    if (code.includes("4") || code.includes("5") || code.includes("chuva") || code.includes("rain")) {
      return <CloudRain className={cn(iconClass, "text-blue-400")} />;
    }
    if (code.includes("8") || code.includes("neve") || code.includes("snow")) {
      return <CloudSnow className={cn(iconClass, "text-blue-200")} />;
    }
    if (code.includes("9") || code.includes("neblina") || code.includes("fog")) {
      return <CloudFog className={cn(iconClass, "text-gray-400")} />;
    }
    if (code.includes("3") || code.includes("nublado") || code.includes("cloud")) {
      return <Cloud className={cn(iconClass, "text-slate-400")} />;
    }
    
    return <Sun className={cn(iconClass, "text-yellow-400")} />;
  };

  return (
    <div className="flex items-center justify-center animate-fade-in">
      {getIcon()}
    </div>
  );
};

interface WeatherStatProps {
  icon: "droplets" | "wind" | "cloud";
  label: string;
  value: string;
  className?: string;
}

export const WeatherStat = ({ icon, label, value, className }: WeatherStatProps) => {
  const icons = {
    droplets: <Droplets className="h-4 w-4 text-blue-400" />,
    wind: <Wind className="h-4 w-4 text-slate-400" />,
    cloud: <Cloud className="h-4 w-4 text-slate-400" />,
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {icons[icon]}
      <div className="text-sm">
        <span className="text-muted-foreground">{label}:</span>{" "}
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
};
