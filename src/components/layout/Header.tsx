export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/95 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-center px-4 md:px-6">
        <h1 className="text-sm md:text-base font-display font-bold tracking-widest text-muted-foreground uppercase">
          Previsão do Tempo
        </h1>
      </div>
    </header>
  );
};
