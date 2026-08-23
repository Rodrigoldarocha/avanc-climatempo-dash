import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Seo } from "@/components/seo/Seo";
import { validateContactForm, type ContactFormValues } from "@/lib/contact";

const initialForm: ContactFormValues = { name: "", email: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormValues>(initialForm);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const navigate = useNavigate();

  const errors = useMemo(() => validateContactForm(form), [form]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateContactForm(form);
    if (Object.keys(nextErrors).length > 0) {
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
                className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary ${
                  errors.name ? "border-destructive" : "border-border"
                }`}
                placeholder="Seu nome"
                aria-label="Nome"
                maxLength={80}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">E-mail</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary ${
                  errors.email ? "border-destructive" : "border-border"
                }`}
                placeholder="seu@email.com"
                aria-label="E-mail"
                maxLength={120}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-foreground">Mensagem</label>
              <textarea
                id="message"
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                className={`min-h-[140px] w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary ${
                  errors.message ? "border-destructive" : "border-border"
                }`}
                placeholder="Descreva sua dúvida, sugestão ou pedido"
                aria-label="Mensagem"
                maxLength={500}
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
            </div>

            {status === "error" && Object.keys(errors).length > 0 && (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Corrija os campos destacados antes de enviar a mensagem.
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
