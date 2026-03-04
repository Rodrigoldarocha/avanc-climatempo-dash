# 🌦️ Clima Dashboard — Grupo Avanço

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Instalável-5A0FC8?logo=pwa&logoColor=white)

Dashboard meteorológico do **Grupo Avanço** para monitoramento em tempo real de **55 localidades** distribuídas em **19 estados brasileiros**. Integrado à API Climatempo, oferece previsões atuais, horárias e diárias, alertas do INMET, histórico climático e muito mais.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Execução](#-instalação-e-execução)
- [API Climatempo](#-api-climatempo)
- [PWA — Instalação no Celular](#-pwa--instalação-no-celular)
- [Localidades Monitoradas](#-localidades-monitoradas)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Licença e Créditos](#-licença-e-créditos)

---

## 🌍 Sobre o Projeto

O **Clima Dashboard** é uma aplicação web progressiva (PWA) desenvolvida para o Grupo Avanço, permitindo que equipes de campo e gestores acompanhem as condições climáticas nas regiões de operação da empresa.

O painel exibe dados meteorológicos consolidados de 55 unidades em 19 estados, com foco em:

- Tomada de decisão operacional baseada no clima
- Monitoramento de alertas meteorológicos severos (INMET)
- Visão geral rápida via dashboard resumo
- Acesso mobile offline via PWA

---

## ✨ Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| **Dashboard Resumo** | Visão consolidada com métricas-chave: temperatura média, umidade, localidades com alerta, status da API |
| **Clima Atual** | Temperatura, sensação térmica, umidade, vento, pressão e condição do céu em tempo real |
| **Previsão Horária** | Previsão hora a hora para as próximas 72 horas com gráficos interativos |
| **Previsão Diária** | Previsão para os próximos 15 dias com temperaturas mín/máx e probabilidade de chuva |
| **Alertas INMET** | Painel de alertas meteorológicos ativos com severidade e descrição |
| **Histórico Climático** | Gráficos de temperatura e precipitação histórica por localidade |
| **Mapa Interativo** | Mapa Leaflet com todas as 55 localidades georreferenciadas |
| **Exportação de Dados** | Exportação em Excel (XLSX) e PDF dos dados de previsão e alertas |
| **Filtro por Estado/Cidade** | Seleção rápida por UF ou busca por nome da cidade |
| **Tema Claro/Escuro** | Alternância de tema com persistência em `localStorage` |
| **Relógio em Tempo Real** | Hora atual no header, atualizada a cada segundo |
| **Status da API** | Indicador visual online/offline baseado nas queries do cache |
| **Badge de Alertas** | Contador de alertas ativos visível no menu de navegação |
| **PWA** | Instalável como app nativo no celular, com cache offline via Service Worker |
| **Menu Mobile** | Menu hamburger responsivo com navegação completa |

---

## 🛠️ Tecnologias

### Frontend
- **[React 18](https://react.dev/)** — Biblioteca de UI com hooks e componentes funcionais
- **[TypeScript 5](https://www.typescriptlang.org/)** — Tipagem estática
- **[Vite 5](https://vitejs.dev/)** — Build tool ultrarrápida com HMR
- **[Tailwind CSS 3](https://tailwindcss.com/)** — Estilização utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** — Componentes acessíveis baseados em Radix UI

### Dados e Visualização
- **[TanStack Query 5](https://tanstack.com/query)** — Gerenciamento de estado assíncrono e cache
- **[Recharts](https://recharts.org/)** — Gráficos interativos (temperatura, precipitação)
- **[Leaflet](https://leafletjs.com/)** — Mapa interativo com marcadores
- **[date-fns](https://date-fns.org/)** — Manipulação e formatação de datas

### Exportação
- **[jsPDF](https://github.com/parallax/jsPDF)** — Geração de relatórios em PDF
- **[SheetJS (xlsx)](https://sheetjs.com/)** — Exportação de dados em Excel

### PWA
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** — Service Worker com Workbox, cache offline e manifest

### API
- **[Climatempo API](https://advisor.climatempo.com.br/)** — Fonte de dados meteorológicos

---

## 📁 Estrutura do Projeto

```
src/
├── assets/                  # Logos e imagens estáticas
├── components/
│   ├── layout/              # Header, Navigation, MobileMenu, ForecastMenu
│   ├── theme/               # ThemeProvider, ThemeToggle
│   ├── ui/                  # Componentes shadcn/ui (button, card, dialog, etc.)
│   └── weather/             # Componentes meteorológicos
│       ├── AlertsPanel.tsx          # Painel de alertas INMET
│       ├── CurrentWeatherCard.tsx   # Card de clima atual
│       ├── DailyForecastCard.tsx    # Previsão diária (15 dias)
│       ├── DashboardSummary.tsx     # Dashboard resumo com métricas
│       ├── ExportDataButton.tsx     # Exportação Excel
│       ├── ExportPdfButton.tsx      # Exportação PDF
│       ├── HistoricalChart.tsx      # Gráfico histórico
│       ├── HourlyForecastCard.tsx   # Previsão horária (72h)
│       ├── LocationCard.tsx         # Card de localidade no grid
│       ├── LocationFilter.tsx       # Filtro por estado
│       ├── LocationGrid.tsx         # Grid de localidades
│       ├── LocationPicker.tsx       # Seletor de localidade
│       ├── LocationSelector.tsx     # Dropdown de seleção
│       ├── LocationsMap.tsx         # Mapa Leaflet
│       └── WeatherIcon.tsx          # Ícones de condição climática
├── data/
│   └── locations.ts         # 55 localidades com coordenadas e códigos Climatempo
├── hooks/
│   ├── useAlertCount.ts     # Contagem de alertas ativos
│   ├── useApiStatus.ts      # Status online/offline da API
│   ├── useCurrentTime.ts    # Relógio em tempo real
│   └── use-mobile.tsx       # Detecção de viewport mobile
├── pages/
│   ├── Index.tsx            # Página principal (dashboard/grid/detalhe)
│   └── NotFound.tsx         # Página 404
├── services/
│   └── climatempo.ts        # Funções de chamada à API Climatempo
├── lib/
│   └── utils.ts             # Utilitários (cn, formatação)
├── index.css                # Design tokens e tema (HSL)
├── App.tsx                  # Rotas e providers
└── main.tsx                 # Ponto de entrada
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- **Node.js** 18+ ([instalar via nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **npm** ou **bun**

### Passo a passo

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>

# 2. Instale as dependências
npm install
# ou
bun install

# 3. Inicie o servidor de desenvolvimento
npm run dev
# ou
bun dev
```

O app estará disponível em `http://localhost:8080`.

---

## 🔌 API Climatempo

O dashboard consome a **API Advisor da Climatempo** para obter dados meteorológicos.

### Endpoints utilizados

| Endpoint | Descrição |
|----------|-----------|
| `/api/v1/weather/locale/{id}/current` | Condições atuais (temperatura, umidade, vento) |
| `/api/v1/forecast/locale/{id}/hours/72` | Previsão horária para 72 horas |
| `/api/v1/forecast/locale/{id}/days/15` | Previsão diária para 15 dias |
| `/api/v1/forecast/locale/{id}/history` | Dados históricos climáticos |
| `/api/v1/alerts/locale/{id}` | Alertas meteorológicos INMET |

### Autenticação

As chamadas utilizam um **token de API** passado como query parameter `?token=SEU_TOKEN`. Os tokens estão configurados no arquivo `src/services/climatempo.ts`.

> ⚠️ **Nota:** A API Climatempo pode apresentar restrições de CORS em chamadas diretas do navegador. O sistema utiliza cache via TanStack Query com estratégia `NetworkFirst` no Service Worker para mitigar isso.

---

## 📱 PWA — Instalação no Celular

O Clima Dashboard é um **Progressive Web App** e pode ser instalado como aplicativo nativo:

### Android (Chrome)
1. Acesse o dashboard no Chrome
2. Toque no menu (⋮) → **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**
3. Confirme a instalação

### iOS (Safari)
1. Acesse o dashboard no Safari
2. Toque no ícone de compartilhar (⬆️)
3. Selecione **"Adicionar à Tela de Início"**
4. Confirme

### Funcionalidades offline
- Dados consultados recentemente ficam em cache por **5 minutos**
- Fontes do Google Fonts ficam em cache por **1 ano**
- A navegação funciona offline com dados em cache

---

## 📍 Localidades Monitoradas

**55 unidades** em **19 estados**:

| UF | Cidades |
|----|---------|
| **AC** | Cruzeiro do Sul, Rio Branco |
| **AL** | Arapiraca |
| **AM** | Manaus |
| **AP** | Macapá |
| **BA** | Feira de Santana, Vitória da Conquista |
| **CE** | Crato, Fortaleza, Sobral |
| **DF** | Brasília |
| **GO** | Goiânia, Luziânia, Rio Verde, Valparaíso de Goiás |
| **MA** | Bacabal, Balsas, Timon |
| **MS** | Dourados, Paranaíba, Ponta Porã, Rio Brilhante |
| **MT** | Alta Floresta, Primavera do Leste, Sapezal, Sorriso, Tangará da Serra |
| **PA** | Abaetetuba, Belém, Bragança, Canaã dos Carajás, Paragominas, Redenção, Santarém |
| **PB** | Cabedelo, Patos |
| **PE** | Arcoverde, Belo Jardim, Limoeiro, Ouricuri, Petrolina, Recife, Salgueiro, Sta. Maria da Boa Vista |
| **PI** | Picos, Teresina |
| **RN** | Caicó, Mossoró, Natal |
| **RO** | Ariquemes, Jaru, Vilhena |
| **SE** | Aracaju, Lagarto |
| **TO** | Palmas |

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com HMR (porta 8080) |
| `npm run build` | Build de produção otimizado |
| `npm run build:dev` | Build em modo desenvolvimento |
| `npm run preview` | Preview do build de produção |
| `npm run test` | Executa testes com Vitest |
| `npm run test:watch` | Testes em modo watch |
| `npm run lint` | Linting com ESLint |

---

## 📄 Licença e Créditos

- **Desenvolvido para:** Grupo Avanço
- **Dados meteorológicos:** [Climatempo API Advisor](https://advisor.climatempo.com.br/)
- **Alertas:** INMET (Instituto Nacional de Meteorologia)
- **UI:** [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Mapas:** [OpenStreetMap](https://www.openstreetmap.org/) via Leaflet

---

<p align="center">
  <strong>Grupo Avanço</strong> · Dashboard Meteorológico · 2024–2026
</p>
