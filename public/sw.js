// Service worker de limpeza (legado).
//
// O app antigo usava PWA (vite-plugin-pwa) e instalou um service worker que
// serve uma versão antiga (quebrada) do app a partir do cache, causando tela
// vazia persistente mesmo após deploys corrigidos. Este script substitui o
// service worker antigo (bytes diferentes forçam a atualização no navegador),
// apaga todos os caches e se auto-desregistra, deixando o site sem service
// worker — o navegador passa a buscar sempre a versão mais recente.
self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    (async function () {
      try {
        if (self.clients && self.clients.claim) {
          await self.clients.claim();
        }
        if (self.caches && self.caches.keys) {
          var keys = await self.caches.keys();
          await Promise.all(
            keys.map(function (key) {
              return self.caches.delete(key);
            })
          );
        }
        if (self.registration) {
          await self.registration.unregister();
        }
      } catch (err) {
        // Falha de limpeza não deve impedir o navegador de seguir em frente.
      }
    })()
  );
});
