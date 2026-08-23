import { Link } from "react-router-dom";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Seo } from "@/components/seo/Seo";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Seo
        title="Política de privacidade"
        description="Conheça como o Grupo Avanço coleta, usa e protege as informações do painel meteorológico e do contato comercial."
        path="/politica-de-privacidade"
      />

      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Política de privacidade" }]} />

      <article className="glass-card p-6 sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Política de privacidade</h1>

        <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
          <p>
            Esta página explica como as informações capturadas no painel meteorológico e em formulários de contato são coletadas, tratadas e protegidas.
          </p>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">1. Informações coletadas</h2>
            <p>
              Podemos coletar dados como nome, e-mail, assunto e mensagem enviados por meio do formulário de contato, além de informações técnicas necessárias para melhorar a experiência de uso da plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">2. Uso das informações</h2>
            <p>
              Os dados são utilizados para responder solicitações, melhorar o atendimento, reforçar a qualidade do serviço e otimizar a experiência de navegação e monitoramento meteorológico.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">3. Armazenamento e segurança</h2>
            <p>
              As informações são armazenadas em ambientes seguros e acessíveis apenas por pessoas autorizadas, seguindo boas práticas de proteção e confidencialidade.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">4. Cookies e tecnologias</h2>
            <p>
              O site pode utilizar tecnologias de navegação para lembrar preferências visuais e melhorar o desempenho. O uso pode variar conforme o navegador e as configurações do usuário.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">5. Direitos do usuário</h2>
            <p>
              O titular dos dados pode solicitar acesso, correção, exclusão ou esclarecimentos sobre o tratamento das informações, conforme a legislação aplicável.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/" className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
            Voltar ao painel
          </Link>
          <Link to="/contato" className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary">
            Entre em contato
          </Link>
        </div>
      </article>
    </main>
  );
}
