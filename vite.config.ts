import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    'process.env': {
      CLIMATEMPO_FORECAST_TOKEN: JSON.stringify(process.env.CLIMATEMPO_FORECAST_TOKEN),
      CLIMATEMPO_HISTORY_TOKEN: JSON.stringify(process.env.CLIMATEMPO_HISTORY_TOKEN),
    },
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.jpg", "apple-touch-icon.jpg"],
      manifest: {
        name: "Clima Dashboard | Grupo Avanço",
        short_name: "Clima Avanço",
        description: "Dashboard de previsão meteorológica do Grupo Avanço",
        theme_color: "#1E2B33",
        background_color: "#1E2B33",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        icons: [
          {
            src: "/favicon.jpg",
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src: "/favicon.jpg",
            sizes: "512x512",
            type: "image/jpeg",
          },
          {
            src: "/favicon.jpg",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,jpg,png,svg,woff2}"],
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/apiadvisor\.climatempo\.com\.br\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "climatempo-api",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 300, // 5 min
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],
          "vendor-charts": ["recharts"],
          "vendor-utils": [
            "clsx",
            "tailwind-merge",
            "class-variance-authority",
            "date-fns",
            "zod",
            "lucide-react",
          ],
          "vendor-forms": [
            "react-hook-form",
            "@hookform/resolvers",
            "@tanstack/react-query",
          ],
          "vendor-pdf": ["jspdf", "html2canvas"],
          "vendor-other": [
            "embla-carousel-react",
            "input-otp",
            "cmdk",
            "vaul",
            "next-themes",
            "sonner",
            "react-resizable-panels",
            "react-day-picker",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
