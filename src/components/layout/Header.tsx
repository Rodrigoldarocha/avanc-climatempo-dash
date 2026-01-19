import logoAvanco from "@/assets/logo-avanco.png";
import logoTools from "@/assets/logo-tools.jpg";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo Grupo Avanço - Left */}
        <div className="flex items-center min-w-[120px] md:min-w-[180px]">
          <img
            src={logoAvanco}
            alt="Grupo Avanço"
            className="h-12 md:h-14 w-auto object-contain"
          />
        </div>

        {/* Title - Center */}
        <div className="flex flex-col items-center flex-1">
          <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-foreground">
            Panorama Geral
          </h1>
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">
            Previsão do Tempo
          </p>
        </div>

        {/* Logo Tools - Right */}
        <div className="flex items-center justify-end min-w-[120px] md:min-w-[180px]">
          <div className="bg-[#F5C518] rounded px-3 py-1.5">
            <img
              src={logoTools}
              alt="Tools Digital Services"
              className="h-6 md:h-8 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
