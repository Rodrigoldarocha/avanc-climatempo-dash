# 🌦️ Clima Dashboard — Grupo Avanço

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss\&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Instalável-5A0FC8?logo=pwa\&logoColor=white)

Dashboard meteorológico do **Grupo Avanço** para monitoramento de **55 localidades em 19 estados brasileiros**.

A aplicação centraliza clima atual, previsões, alertas meteorológicos, histórico e localização das unidades em uma interface responsiva para **web e dispositivos móveis**.

---

## ✨ Funcionalidades

* 📊 Dashboard com indicadores meteorológicos
* 🌡️ Clima atual
* 🕐 Previsão horária de até 72h
* 📅 Previsão diária de até 15 dias
* 🚨 Alertas meteorológicos do INMET
* 📈 Histórico climático
* 🗺️ Mapa interativo com as localidades
* 🔎 Filtros por estado e cidade
* 📤 Exportação para Excel e PDF
* 🌓 Tema claro e escuro
* 📱 Interface responsiva
* 📲 Instalação como PWA
* 💾 Cache de dados para melhorar a disponibilidade

---

## 🛠️ Tecnologias

* **React 18**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **shadcn/ui**
* **TanStack Query**
* **Recharts**
* **Leaflet**
* **date-fns**
* **jsPDF**
* **SheetJS (XLSX)**

### APIs

* **Climatempo API** — dados meteorológicos
* **INMET** — alertas meteorológicos
* **OpenStreetMap** — mapas

---

## 📁 Estrutura

```text
src/
├── components/
│   ├── layout/
│   ├── theme/
│   ├── ui/
│   └── weather/
├── data/
│   └── locations.ts
├── hooks/
├── pages/
├── services/
│   └── climatempo.ts
├── lib/
├── App.tsx
└── main.tsx
```

---

## 🚀 Instalação

### Requisitos

* Node.js 18+
* npm ou Bun
* Token da API Climatempo

### Configuração

```bash
git clone https://github.com/Rodrigoldarocha/avanc-climatempo-dash.git
cd avanc-climatempo-dash

npm install
cp .env.example .env
```

Configure o `.env`:

```env
VITE_CLIMATEMPO_FORECAST_TOKEN=seu_token
VITE_CLIMATEMPO_HISTORY_TOKEN=seu_token
```

> ⚠️ Variáveis `VITE_*` ficam disponíveis no frontend. Para produção, credenciais que precisam ser privadas devem ser protegidas por um backend/proxy.

---

## ▶️ Executando

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Testes

```bash
npm run test
```

### Lint

```bash
npm run lint
```

---

## 📍 Localidades

O sistema monitora **55 unidades em 19 estados**:

**AC · AL · AM · AP · BA · CE · DF · GO · MA · MS · MT · PA · PB · PE · PI · RN · RO · SE · TO**

As localidades são configuradas em:

```text
src/data/locations.ts
```

---

## 📱 PWA

O dashboard pode ser instalado como aplicativo em dispositivos compatíveis.

* **Android:** Chrome → Menu → Instalar aplicativo
* **iOS:** Safari → Compartilhar → Adicionar à Tela de Início

A aplicação utiliza cache para melhorar a experiência em conexões instáveis.

---

## 🔐 Segurança

Não versionar arquivos `.env` ou credenciais no Git.

Utilize `.env.example` para documentar as variáveis necessárias.

Para ambientes de produção, recomenda-se utilizar um **backend/API proxy** para proteger tokens e controlar as requisições à API meteorológica.

> 🔒 Este projeto já inclui uma **Supabase Edge Function** (`supabase/functions/climatempo-proxy/`) que atua como proxy server-side, mantendo os tokens da Climatempo fora do frontend.

---

## 👨‍💻 Autor

**Rodrigo Rocha** — [GitHub](https://github.com/Rodrigoldarocha) · [LinkedIn](https://www.linkedin.com/in/rodrigo-rocha-19249170/)

---

## 📄 Licença e Créditos

**Desenvolvido para:** Grupo Avanço
**Projeto:** Clima Dashboard
**Período:** 2024–2026

Dados meteorológicos: **Climatempo**
Alertas: **INMET**
Mapas: **OpenStreetMap + Leaflet**

---

<p align="center">
  <strong>Grupo Avanço</strong> · Dashboard Meteorológico
</p>
