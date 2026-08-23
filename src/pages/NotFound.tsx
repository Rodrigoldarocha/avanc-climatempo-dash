import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Seo } from "@/components/seo/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Seo
        title="Página não encontrada"
        description="A página solicitada não foi encontrada no painel do Grupo Avanço."
        path={location.pathname}
      />

      <div className="glass-card max-w-lg p-8 text-center sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Erro 404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Página não encontrada</h1>
        <p className="mt-4 text-base text-muted-foreground">
          A rota <span className="font-medium text-foreground">{location.pathname}</span> não existe ou foi movida.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Voltar para o início
          </Link>
          <Link
            to="/contato"
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
          >
            Falar com a equipe
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
