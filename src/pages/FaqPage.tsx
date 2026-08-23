import { Link } from "react-router-dom";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Seo } from "@/components/seo/Seo";

const faqItems = [
  {
    question: "Como funciona o painel meteorológico?",
    answer:
      "O painel reúne as principais informações de tempo em um só lugar: clima atual, previsões por hora e por 15 dias, além de alertas meteorológicos e locais monitorados.",
  },
  {
    question: "Quais cidades estão disponíveis?",
    answer:
      "O dashboard inclui cidades monitoradas por região, permitindo alternar entre localidades e visualizar previsão detalhada de cada cenário.",
  },
  {
    question: "Como sei se há alerta meteorológico ativo?",
    answer:
      "Os alertas de severidade alta aparecem no cabeçalho, na navegação e no painel de alertas, com indicação clara para priorizar a análise.",
  },
  {
    question: "Os dados são atualizados em tempo real?",
    answer:
      "O painel consulta fontes meteorológicas e mantém a interface atualizada ao recarregar ou ao navegar entre as seções de clima e alertas.",
  },
  {
    question: "Posso exportar ou compartilhar dados?",
    answer:
      "Sim. A interface oferece opções de exportação para dados e PDF, facilitando o compartilhamento de informações de previsão e alertas.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Seo
        title="Perguntas frequentes"
        description="Encontre respostas rápidas sobre o painel meteorológico, alertas, cidades monitoradas e exportação de dados."
        path="/faq"
      />

      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Perguntas frequentes" }]} />

      <section className="glass-card p-6 sm:p-8">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">FAQ</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Perguntas frequentes</h1>
          <p className="max-w-2xl text-muted-foreground">
            Respostas rápidas para a operação do painel, alertas e uso do clima no dia a dia.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-border/60 bg-background/50 p-5">
              <h2 className="text-lg font-semibold text-foreground">{item.question}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/" className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
            Voltar ao painel
          </Link>
          <Link to="/contato" className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary">
            Falar com a equipe
          </Link>
        </div>
      </section>
    </main>
  );
}
