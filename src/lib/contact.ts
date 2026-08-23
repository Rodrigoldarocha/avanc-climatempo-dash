export type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

export const validateContactForm = (values: ContactFormValues): ContactFormErrors => {
  const errors: ContactFormErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name) {
    errors.name = "Nome é obrigatório.";
  }

  if (!email) {
    errors.email = "E-mail é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!message) {
    errors.message = "Mensagem é obrigatória.";
  } else if (message.length < 20) {
    errors.message = "A mensagem deve ter pelo menos 20 caracteres.";
  }

  return errors;
};
