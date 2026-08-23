import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Seo } from "@/components/seo/Seo";

const initialForm = { name: "", email: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setStatus("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setStatus("error");
      return;
    }

    if (trimmedMessage.length < 20) {
      setStatus("error");
      return;
    }

    setStatus("success");
    setForm(initialForm);
    navigate("/obrigado");
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Seo
        title="Contato"
        description="Entre em contato com a equipe do Grupo Avanço para dúvidas, sugestões e informações sobre o painel meteorológico."
        path="/contato"
      />

      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Contato" }]} />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Contato</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Contato</h1>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Fale com a nossa equipe</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Tem dúvidas sobre as previsões, alertas ou uso do painel? Envie sua mensagem e nossa equipe retornará em breve.
          </p>

          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">E-mail:</strong> atendimento@grupoavanco.com.br</p>
            <p><strong className="text-foreground">Atendimento:</strong> Segunda a sexta, das 8h às 18h</p>
          </div>

          <div className="mt-8">
            <Link to="/faq" className="text-sm font-medium text-primary hover:underline">
              Ver perguntas frequentes →
            </Link>
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">Nome</label>
              <input
                id="name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-primary"
                placeholder="Seu nome"
                aria-label="Nome"
                maxLength={80}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">E-mail</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-primary"
                placeholder="seu@email.com"
                aria-label="E-mail"
                maxLength={120}
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-foreground">Mensagem</label>
              <textarea
                id="message"
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                className="min-h-[140px] w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-primary"
                placeholder="Descreva sua dúvida, sugestão ou pedido"
                aria-label="Mensagem"
                maxLength={500}
              />
            </div>

            {status === "error" && (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Verifique os campos. Nome, e-mail e mensagem são obrigatórios, e a mensagem precisa ter ao menos 20 caracteres.
              </p>
            )}

            {status === "success" && (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
                Mensagem enviada com sucesso. Nossa equipe responderá em breve.
              </p>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Enviar mensagem
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
