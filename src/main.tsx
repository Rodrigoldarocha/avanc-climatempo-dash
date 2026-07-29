import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Renderizar algo 100% mínimo ANTES de carregar App
// Se isso aparecer, o problema está em App ou seus imports
const root = document.getElementById("root");
if (root) {
  root.innerHTML = `<div style="padding:40px;font-family:sans-serif">
    <h2>🔄 Carregando...</h2>
    <div id="app-mount-point"></div>
  </div>`;
}

// Carregar App dinamicamente para capturar erro de módulo
try {
  const mountPoint = document.getElementById("app-mount-point") || root;

  createRoot(mountPoint!).render(<App />);

  // Se chegou aqui, App carregou — remove loading text
  const loadingEl = document.querySelector("h2");
  if (loadingEl) loadingEl.remove();
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  const stack = e instanceof Error ? e.stack : "";
  root!.innerHTML = `<div style="padding:40px;font-family:monospace;color:red">
    <h2>Erro ao carregar App</h2>
    <pre style="white-space:pre-wrap">${msg}</pre>
    <pre style="font-size:12px;margin-top:16px;white-space:pre-wrap">${stack}</pre>
  </div>`;
}
