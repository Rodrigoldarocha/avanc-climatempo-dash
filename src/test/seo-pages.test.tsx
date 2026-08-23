import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect } from "vitest";
import App from "../App";
import NotFound from "../pages/NotFound";

describe("SEO and static pages", () => {
  it("renders the contact page through the app router", () => {
    window.history.pushState({}, "", "/contato");

    render(<App />);

    expect(screen.getByRole("heading", { name: /contato/i })).toBeInTheDocument();
  });

  it("shows a useful 404 page with back home action", () => {
    render(
      <MemoryRouter initialEntries={["/rota-inexistente"]}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /página não encontrada/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar para o início/i })).toBeInTheDocument();
  });
});
