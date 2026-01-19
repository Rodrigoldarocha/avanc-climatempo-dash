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
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* Title - Center */}
        <h1 className="text-sm md:text-base font-display font-bold tracking-widest text-muted-foreground uppercase">
          Previsão do Tempo
        </h1>

        {/* Logo Tools - Right */}
        <div className="flex items-center">
          <div className="bg-[#F5C518] rounded px-2 py-1">
            <img
              src={logoTools}
              alt="Tools Digital Services"
              className="h-5 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
