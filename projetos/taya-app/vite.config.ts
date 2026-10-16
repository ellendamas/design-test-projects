import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Dev-server-only: deixa /benchmark/a/... e /benchmark/b/... acessíveis direto por URL (sem
// precisar passar por /benchmark.html primeiro). Sem isso, o dev server do Vite só conhece
// index.html como raiz e cai nele pra qualquer caminho sem extensão — reescreve a requisição
// pra servir benchmark.html nesses casos; o navegador mantém a URL real na barra de endereço, e
// o BrowserRouter de BenchmarkApp.tsx lê `window.location` normalmente a partir daí.
function benchmarkDevFallback(): Plugin {
  return {
    name: "benchmark-dev-fallback",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        if (url.startsWith("/benchmark") && !url.startsWith("/benchmark.html") && !url.includes(".")) {
          req.url = "/benchmark.html";
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), benchmarkDevFallback()],
  server: {
    port: 4173,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        benchmark: path.resolve(__dirname, "benchmark.html"),
      },
    },
  },
});
