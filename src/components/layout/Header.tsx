import logoAvanco from "@/assets/logo-avanco.png";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-secondary shadow-lg">
      <div className="container flex h-24 md:h-32 items-center justify-between px-3 md:px-6 gap-3">
        <img 
          src={logoAvanco} 
          alt="Grupo Avanço" 
          className="h-20 sm:h-24 md:h-28 w-auto flex-shrink-0"
        />
        <div className="flex items-center gap-3">
          <h1 className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-wider md:tracking-widest text-secondary-foreground uppercase text-right leading-tight">
            Base<br className="sm:hidden" />
            <span className="hidden sm:inline"> - </span>Clima Tempo
          </h1>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
