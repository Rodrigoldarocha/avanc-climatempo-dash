import logoAvanco from "@/assets/logo-avanco.png";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-secondary shadow-lg">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <img 
          src={logoAvanco} 
          alt="Grupo Avanço" 
          className="h-12 md:h-14 w-auto"
        />
        <h1 className="text-xs md:text-sm font-semibold tracking-widest text-secondary-foreground uppercase">
          Dashboard Previsão - Clima Tempo
        </h1>
      </div>
    </header>
  );
};
