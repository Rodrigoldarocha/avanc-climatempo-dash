import { Cloud, Sun } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sun className="h-8 w-8 text-primary animate-pulse-slow" />
            <Cloud className="h-5 w-5 text-muted-foreground absolute -bottom-1 -right-1" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold tracking-tight">
              <span className="gradient-text">Clima</span>
              <span className="text-foreground">Tempo</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Grupo Avanço
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://www.grupoavanco.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <img
              src="https://www.grupoavanco.com.br/themes/default/assets/images/logo.svg"
              alt="Grupo Avanço"
              className="h-6 brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </a>
        </div>
      </div>
    </header>
  );
};
