import { describe, it, expect } from "vitest";
import { validateContactForm } from "@/lib/contact";

describe("Contact form validation", () => {
  it("accepts valid data", () => {
    const errors = validateContactForm({
      name: "Maria Souza",
      email: "maria@email.com",
      message: "Gostaria de saber mais sobre os alertas meteorológicos.",
    });

    expect(errors).toEqual({});
  });

  it("rejects empty fields", () => {
    const errors = validateContactForm({
      name: "",
      email: "",
      message: "",
    });

    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.message).toBeTruthy();
  });

  it("requires a valid email and a minimum message length", () => {
    const errors = validateContactForm({
      name: "Maria",
      email: "maria@",
      message: "curta",
    });

    expect(errors.email).toBe("Informe um e-mail válido.");
    expect(errors.message).toBe("A mensagem deve ter pelo menos 20 caracteres.");
  });
});
