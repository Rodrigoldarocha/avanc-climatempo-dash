import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
}));
