import { Cloud, Sun } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/90 backdrop-blur-md">
      <div className="container flex h-12 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sun className="h-6 w-6 text-primary" />
            <Cloud className="h-3.5 w-3.5 text-muted-foreground absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold tracking-tight">
              <span className="gradient-text">Clima</span>
              <span className="text-foreground">Dashboard</span>
            </h1>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider leading-none">
              Grupo Avanço
            </p>
          </div>
        </div>

        <a
          href="https://www.grupoavanco.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:block"
        >
          <img
            src="https://www.grupoavanco.com.br/themes/default/assets/images/logo.svg"
            alt="Grupo Avanço"
            className="h-5 brightness-0 invert opacity-50 hover:opacity-80 transition-opacity"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </a>
      </div>
    </header>
  );
};
