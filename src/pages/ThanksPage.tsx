import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";

export default function ThanksPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <Seo
        title="Obrigado"
        description="Mensagem enviada com sucesso. Agradecemos o contato e retornaremos em breve."
        path="/obrigado"
      />

      <section className="glass-card w-full p-8 text-center sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Sucesso</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Obrigado pelo contato</h1>
        <p className="mt-4 text-muted-foreground">
          Sua mensagem foi recebida com sucesso. Nossa equipe entrará em contato em breve.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
            Voltar ao início
          </Link>
          <Link to="/faq" className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary">
            Ver FAQ
          </Link>
        </div>
      </section>
    </main>
  );
}
