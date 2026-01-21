import logoAvanco from "@/assets/logo-avanco.png";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-secondary">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <img 
          src={logoAvanco} 
          alt="Grupo Avanço" 
          className="h-10 md:h-12 w-auto"
        />
      </div>
    </header>
  );
};
