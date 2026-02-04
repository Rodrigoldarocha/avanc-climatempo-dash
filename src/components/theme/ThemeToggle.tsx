import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const isDark = theme === "dark" || 
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-lg bg-secondary-foreground/10 hover:bg-secondary-foreground/20"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-secondary-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-secondary-foreground" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
