import logoAvanco from "@/assets/logo-avanco.png";
import logoTools from "@/assets/logo-tools.jpg";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/95 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo Grupo Avanço - Left */}
        <div className="flex items-center">
          <img
            src={logoAvanco}
            alt="Grupo Avanço"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </div>

        {/* Title - Center */}
        <div className="flex flex-col items-center">
          <h1 className="text-lg md:text-xl font-display font-bold tracking-tight text-foreground">
            Panorama Geral
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Previsão do Tempo
          </p>
        </div>

        {/* Logo Tools - Right */}
        <div className="flex items-center">
          <img
            src={logoTools}
            alt="Tools Digital Services"
            className="h-8 md:h-10 w-auto object-contain rounded"
          />
        </div>
      </div>
    </header>
  );
};
